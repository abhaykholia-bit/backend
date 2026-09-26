const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { createApp } = require('../src/app');
const { AuthService } = require('../src/auth/services/auth.service');
const { HttpError } = require('../src/middleware/errors');

const config = {
  nodeEnv: 'production',
  corsOrigin: 'https://livewheel-frontend.vercel.app',
  auth: { otpSecret: 'test-secret', otpConsoleEnabled: true },
};
async function serve(t, options) {
  const server = createApp(options).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/api/v1`;
}

test('CORS preflight, rejected origins, JSON errors and missing routes', async (t) => {
  const base = await serve(t, { config });
  const response = await fetch(`${base}/auth/request-otp`, {
    method: 'OPTIONS',
    headers: {
      Origin: config.corsOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    config.corsOrigin,
  );
  assert.equal(
    response.headers.get('access-control-allow-credentials'),
    'true',
  );
  assert.equal(
    (
      await fetch(`${base}/landing/faithkart`, {
        headers: { Origin: 'https://untrusted.example' },
      })
    ).status,
    403,
  );
  const invalid = await fetch(`${base}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), {
    message: 'Invalid JSON body.',
    error: 'Bad Request',
    statusCode: 400,
  });
  assert.equal(
    (await fetch(`${base}/auth/request-otp`, { method: 'POST' })).status,
    400,
  );
  assert.equal((await fetch(`${base}/unknown`)).status, 404);
});

test('auth routes preserve payloads, status codes, cookies and token privacy', async (t) => {
  const user = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
  };
  const service = {
    async requestOtp(body) {
      assert.equal(body.email, user.email);
      return { challengeId: 'challenge-1', expiresIn: 300 };
    },
    async verifyOtp() {
      return { user, sessionToken: 'private-session-token' };
    },
    async signup() {
      return { user };
    },
    async getSession(token) {
      if (!token) throw new HttpError(401, 'Sign in required.');
      assert.equal(token, 'private-session-token');
      return { user };
    },
    async logout(token) {
      assert.equal(token, 'private-session-token');
      return { success: true };
    },
  };
  const base = await serve(t, { config, authService: service });
  const post = (route, body, headers = {}) =>
    fetch(`${base}/auth/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  assert.equal(
    (await post('request-otp', { email: user.email, mode: 'login' })).status,
    201,
  );
  const login = await post('verify-otp', {
    challengeId: 'challenge-1',
    otp: '123456',
    email: user.email,
    mode: 'login',
  });
  assert.equal(login.status, 201);
  assert.deepEqual(await login.json(), { user });
  const cookie = login.headers.get('set-cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=None', 'Path=/'])
    assert.ok(cookie.includes(flag));
  assert.equal((await fetch(`${base}/auth/session`)).status, 401);
  assert.deepEqual(
    await (
      await fetch(`${base}/auth/session`, {
        headers: { Cookie: 'lifewheel_session=private-session-token' },
      })
    ).json(),
    { user },
  );
  assert.equal(
    (
      await fetch(`${base}/auth/session`, {
        headers: { Cookie: 'lifewheel_session=%XX' },
      })
    ).status,
    400,
  );
  const logout = await post(
    'logout',
    {},
    { Cookie: 'lifewheel_session=private-session-token' },
  );
  assert.equal(logout.status, 201);
  assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
  const signup = await post('signup', {
    email: user.email,
    fullName: 'Test User',
    challengeId: 'challenge-1',
  });
  assert.equal(signup.status, 201);
  assert.deepEqual(await signup.json(), { user });
});

test('health reports database availability', async (t) => {
  const healthy = await serve(t, {
    config,
    prisma: { $queryRaw: async () => [{ '?column?': 1 }] },
  });
  const response = await fetch(`${healthy}/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');
  const unhealthy = await serve(t, {
    config,
    prisma: {
      $queryRaw: async () => {
        throw Error('unavailable');
      },
    },
  });
  const failure = await fetch(`${unhealthy}/health`);
  assert.equal(failure.status, 503);
  assert.equal((await failure.json()).status, 'error');
});

test('OTP signup/login service keeps hashing, verification, session and logout behavior', async () => {
  let user = null;
  let challenge;
  let session;
  const prisma = {
    user: {
      findUnique: async () => user,
      create: async ({ data }) => (user = { id: 'user-1', ...data }),
    },
    otpChallenge: {
      findFirst: async () => null,
      create: async ({ data }) =>
        (challenge = { id: 'challenge-1', attempts: 0, ...data }),
      update: async ({ data }) => {
        if (data.attempts) challenge.attempts += data.attempts.increment;
        else Object.assign(challenge, data);
        return challenge;
      },
      findUnique: async () => challenge,
    },
    session: {
      create: async ({ data }) => (session = { id: 'session-1', ...data }),
      findUnique: async () => (session ? { ...session, user } : null),
      deleteMany: async () => {
        session = null;
      },
      delete: async () => {
        session = null;
      },
    },
  };
  const service = new AuthService(prisma, config);
  await assert.rejects(
    () => service.requestOtp({ email: {}, mode: 'signup' }),
    { status: 400 },
  );
  await assert.rejects(
    () => service.requestOtp({ email: 'new@example.com', mode: 'login' }),
    { status: 404 },
  );
  const signup = await service.requestOtp({
    email: ' NEW@example.com ',
    mode: 'signup',
  });
  assert.match(signup.consoleOtp, /^\d{6}$/);
  assert.notEqual(challenge.codeHash, signup.consoleOtp);
  await assert.rejects(
    () =>
      service.verifyOtp({
        email: 'new@example.com',
        mode: 'signup',
        challengeId: challenge.id,
        otp: '000000',
      }),
    { status: 401 },
  );
  assert.equal(challenge.attempts, 1);
  await service.verifyOtp({
    email: 'new@example.com',
    mode: 'signup',
    challengeId: challenge.id,
    otp: signup.consoleOtp,
  });
  const created = await service.signup({
    email: 'new@example.com',
    fullName: 'New User',
    challengeId: challenge.id,
  });
  assert.equal(created.user.email, 'new@example.com');
  await assert.rejects(
    () => service.requestOtp({ email: 'new@example.com', mode: 'signup' }),
    { status: 409 },
  );
  const login = await service.requestOtp({
    email: 'new@example.com',
    mode: 'login',
  });
  const verified = await service.verifyOtp({
    email: 'new@example.com',
    mode: 'login',
    challengeId: challenge.id,
    otp: login.consoleOtp,
  });
  assert.equal(
    session.tokenHash,
    createHash('sha256').update(verified.sessionToken).digest('hex'),
  );
  assert.deepEqual(await service.getSession(verified.sessionToken), { user });
  await assert.rejects(
    () =>
      service.verifyOtp({
        email: 'new@example.com',
        mode: 'login',
        challengeId: challenge.id,
        otp: login.consoleOtp,
      }),
    { status: 401 },
  );
  await service.logout(verified.sessionToken);
  await assert.rejects(() => service.getSession(verified.sessionToken), {
    status: 401,
  });
});

test('expired OTPs, attempt limit and request cooldown remain enforced', async () => {
  const challenge = {
    id: 'c',
    email: 'user@example.com',
    mode: 'login',
    expiresAt: new Date(Date.now() - 1000),
    attempts: 0,
  };
  const prisma = {
    user: { findUnique: async () => ({ id: 'user' }) },
    otpChallenge: {
      findUnique: async () => challenge,
      findFirst: async () => ({ createdAt: new Date() }),
    },
  };
  const service = new AuthService(prisma, config);
  const body = {
    email: challenge.email,
    mode: 'login',
    otp: '123456',
    challengeId: 'c',
  };
  await assert.rejects(() => service.verifyOtp(body), {
    status: 401,
    message: 'Your verification code has expired.',
  });
  challenge.expiresAt = new Date(Date.now() + 60000);
  challenge.attempts = 5;
  await assert.rejects(() => service.verifyOtp(body), {
    status: 401,
    message: 'Too many attempts. Request a new code.',
  });
  await assert.rejects(() => service.requestOtp(body), {
    status: 400,
    message: 'Please wait 30 seconds before requesting another code.',
  });
});
