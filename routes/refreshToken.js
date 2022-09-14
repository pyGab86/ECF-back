import express from 'express';
const router = express.Router();
import { authenticateRefreshToken } from '../security/authenticateToken.js';
import refreshToken from '../controllers/refreshToken.js';

// Refresh token flow: 
// 1. Valider la refresh token (middleware)
// 2. Generer une nouvelle token 
// 3. La renvoyer au client
router.post('/api/auth/refreshtoken', authenticateRefreshToken, (req, res) => {
    refreshToken.post(req, res);
});

export default router;