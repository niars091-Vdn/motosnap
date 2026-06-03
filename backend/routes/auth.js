const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const sign = (userId, secret, expiresIn) =>
  jwt.sign({ userId }, secret, { expiresIn });

// ── POST /auth/register ──
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*\d)/),
  body('name').trim().isLength({ min: 2, max: 100 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;
  try {
    // Check email exists
    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email già registrata' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, role, plan`,
      [email, hash, name]
    );
    const user = result.rows[0];

    // Create settings row
    await query('INSERT INTO user_settings (user_id) VALUES ($1)', [user.id]);

    const accessToken  = sign(user.id, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
    const refreshToken = sign(user.id, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, refreshToken]
    );

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
});

// ── POST /auth/login ──
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const result = await query(
      'SELECT id, email, name, role, plan, password_hash, is_banned FROM users WHERE email = $1',
      [email]
    );
    if (!result.rows.length) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const user = result.rows[0];
    if (user.is_banned) return res.status(403).json({ error: 'Account sospeso' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenziali non valide' });

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const accessToken  = sign(user.id, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
    const refreshToken = sign(user.id, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, refreshToken]
    );

    delete user.password_hash;
    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Errore login' });
  }
});

// ── POST /auth/refresh ──
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token mancante' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const result = await query(
      'SELECT id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Token non valido' });

    const accessToken = sign(decoded.userId, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token scaduto' });
  }
});

// ── POST /auth/logout ──
router.post('/logout', authenticate, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }
  res.json({ message: 'Logout effettuato' });
});

// ── GET /auth/me ──
router.get('/me', authenticate, async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.email, u.name, u.role, u.plan, u.scan_count, u.quiz_streak, u.created_at,
            s.dark_mode, s.notif_maintenance, s.notif_offers, s.notif_news
     FROM users u
     LEFT JOIN user_settings s ON s.user_id = u.id
     WHERE u.id = $1`,
    [req.user.id]
  );
  res.json(rows[0]);
});

// ── PUT /auth/password ──
router.put('/password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*\d)/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { currentPassword, newPassword } = req.body;
  try {
    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Password attuale non corretta' });

    const hash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    // Invalida tutti i refresh token
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Password aggiornata' });
  } catch (err) {
    res.status(500).json({ error: 'Errore aggiornamento password' });
  }
});

module.exports = router;
