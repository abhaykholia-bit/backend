const { Router } = require('express');
const { HttpError } = require('../middleware/errors');

const COOKIE_NAME = 'lifewheel_session';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function cookieValue(req) {
  const cookie = req.headers.cookie
    ?.split(';')
    .find((item) => item.trim().startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return undefined;
  try {
    return decodeURIComponent(cookie.split('=').slice(1).join('='));
  } catch {
    throw new HttpError(400, 'Invalid session cookie.');
  }
}

function createAuthRouter(getService, config) {
  const router = Router();
  const production = config.nodeEnv === 'production';
  const cookieOptions = {
    httpOnly: true,
    sameSite: production ? 'none' : 'lax',
    secure: production,
    path: '/',
  };
  function body(req) {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
      throw new HttpError(400, 'A JSON object body is required.');
    return req.body;
  }
  router.post('/request-otp', async (req, res) => {
    const payload = body(req);
    res.status(201).json(await getService().requestOtp(payload));
  });
  router.post('/verify-otp', async (req, res) => {
    const payload = body(req);
    const result = await getService().verifyOtp(payload);
    if (result.sessionToken && result.user) {
      res.cookie(COOKIE_NAME, result.sessionToken, {
        ...cookieOptions,
        maxAge: THIRTY_DAYS,
      });
      return res.status(201).json({ user: result.user });
    }
    res.status(201).json(result);
  });
  router.post('/signup', async (req, res) => {
    const payload = body(req);
    const result = await getService().signup(payload);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(201).json(result);
  });
  router.get('/session', async (req, res) => {
    const token = cookieValue(req);
    res.json(await getService().getSession(token));
  });
  router.post('/logout', async (req, res) => {
    const token = cookieValue(req);
    const result = await getService().logout(token);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(201).json(result);
  });
  return router;
}
module.exports = { createAuthRouter };
