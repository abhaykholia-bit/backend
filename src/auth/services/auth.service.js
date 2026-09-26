const { createHash, randomBytes, randomInt } = require('node:crypto');
const { HttpError } = require('../../middleware/errors');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
class AuthService {
  prisma;
  config;
  constructor(prisma, config) {
    this.prisma = prisma;
    this.config = config;
  }
  normalizeEmail(email) {
    const normalized =
      typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new HttpError(400, 'Enter a valid email address.');
    }
    return normalized;
  }
  validateMode(mode) {
    if (mode !== 'login' && mode !== 'signup') {
      throw new HttpError(400, 'Mode must be login or signup.');
    }
  }
  hashOtp(challengeId, otp) {
    const secret = this.config.auth.otpSecret;
    if (!secret) throw new HttpError(503, 'OTP service is not configured.');
    return createHash('sha256')
      .update(`${challengeId}:${otp}:${secret}`)
      .digest('hex');
  }
  hashSessionToken(token) {
    return createHash('sha256').update(token).digest('hex');
  }
  async createSession(userId) {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.session.create({
      data: {
        tokenHash: this.hashSessionToken(token),
        userId,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    return token;
  }
  async requestOtp(body) {
    const email = this.normalizeEmail(body.email);
    this.validateMode(body.mode);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (body.mode === 'login' && !user) {
      throw new HttpError(404, 'No account found. Please sign up first.');
    }
    if (body.mode === 'signup' && user) {
      throw new HttpError(
        409,
        'This email is already registered. Please sign in.',
      );
    }
    const recent = await this.prisma.otpChallenge.findFirst({
      where: { email, mode: body.mode },
      orderBy: { createdAt: 'desc' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < 30_000) {
      throw new HttpError(
        400,
        'Please wait 30 seconds before requesting another code.',
      );
    }
    const challenge = await this.prisma.otpChallenge.create({
      data: {
        email,
        mode: body.mode,
        codeHash: 'pending',
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });
    const otp = randomInt(100000, 1000000).toString();
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { codeHash: this.hashOtp(challenge.id, otp) },
    });
    const otpConsoleEnabled = this.config.auth.otpConsoleEnabled;
    return {
      challengeId: challenge.id,
      expiresIn: OTP_TTL_MS / 1000,
      ...(otpConsoleEnabled ? { consoleOtp: otp } : {}),
    };
  }
  async verifyOtp(body) {
    const email = this.normalizeEmail(body.email);
    this.validateMode(body.mode);
    if (!/^\d{6}$/.test(body.otp)) {
      throw new HttpError(400, 'Enter the complete 6-digit code.');
    }
    if (typeof body.challengeId !== 'string' || !body.challengeId) {
      throw new HttpError(400, 'A challengeId is required.');
    }
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: body.challengeId },
    });
    if (
      !challenge ||
      challenge.email !== email ||
      challenge.mode !== body.mode
    ) {
      throw new HttpError(401, 'Please request a new verification code.');
    }
    if (challenge.consumedAt || challenge.verifiedAt) {
      throw new HttpError(401, 'This verification code has already been used.');
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      throw new HttpError(401, 'Your verification code has expired.');
    }
    if (challenge.attempts >= 5) {
      throw new HttpError(401, 'Too many attempts. Request a new code.');
    }
    if (challenge.codeHash !== this.hashOtp(challenge.id, body.otp)) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new HttpError(401, 'Incorrect verification code.');
    }
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { verifiedAt: new Date() },
    });
    if (body.mode === 'signup')
      return { verified: true, challengeId: challenge.id };
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(404, 'Account not found.');
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return { user, sessionToken: await this.createSession(user.id) };
  }
  async signup(body) {
    const email = this.normalizeEmail(body.email);
    const fullName =
      typeof body.fullName === 'string' ? body.fullName.trim() : '';
    if (!fullName || fullName.length < 2) {
      throw new HttpError(400, 'Enter your full name.');
    }
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: body.challengeId },
    });
    if (
      !challenge ||
      challenge.email !== email ||
      challenge.mode !== 'signup' ||
      !challenge.verifiedAt ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() < Date.now()
    ) {
      throw new HttpError(401, 'Email verification is invalid or expired.');
    }
    const user = await this.prisma.user.create({ data: { email, fullName } });
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return { user };
  }
  async getSession(token) {
    if (!token) throw new HttpError(401, 'Sign in required.');
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.hashSessionToken(token) },
      include: { user: true },
    });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session)
        await this.prisma.session.delete({ where: { id: session.id } });
      throw new HttpError(401, 'Session expired. Please sign in again.');
    }
    return { user: session.user };
  }
  async logout(token) {
    if (token) {
      await this.prisma.session.deleteMany({
        where: { tokenHash: this.hashSessionToken(token) },
      });
    }
    return { success: true };
  }
}

module.exports = { AuthService };
