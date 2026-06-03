const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// ── Verifica access token ──
const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, email, name, role, plan, is_banned FROM users WHERE id = $1',
      [decoded.userId]
    );
    if (!rows.length) return res.status(401).json({ error: 'Utente non trovato' });
    if (rows[0].is_banned) return res.status(403).json({ error: 'Account sospeso' });
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token scaduto', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token non valido' });
  }
};

// ── Richiede ruolo admin ──
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso riservato agli admin' });
  }
  next();
};

// ── Richiede piano pro ──
const requirePro = (req, res, next) => {
  if (req.user?.plan === 'free') {
    return res.status(403).json({ error: 'Funzione riservata al piano Pro', code: 'UPGRADE_REQUIRED' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requirePro };
