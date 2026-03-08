// src/routes/auth.ts
import { Router } from 'express';
import { ConfidentialClientApplication } from '@azure/msal-node';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

dotenv.config();

const router = Router();

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);
const redirectUri = process.env.REDIRECT_URI!;

// Redirect to Microsoft login
router.get('/login', (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  };

  cca.getAuthCodeUrl(authCodeUrlParameters)
    .then((authUrl) => res.redirect(authUrl))
    .catch((err) => {
      console.error('Error generating MS login URL', err);
      res.status(500).send('SSO login failed');
    });
});

// Handle redirect from Microsoft
router.get('/redirect', async (req, res) => {
  const tokenRequest = {
    code: req.query.code as string,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  };

  try {
    const response = await cca.acquireTokenByCode(tokenRequest);
    if (!response || !response.account) {
      return res.status(401).send('SSO authentication failed');
    }

    const email = response.account.username;

    // Check if this email belongs to a registered IBC member
    const result = await pool.query(`
      SELECT u.email, u.name
      FROM users u
      INNER JOIN consultants c ON u.user_id = c.user_id
      WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
    `, [email]);

    if (result.rows.length === 0) {
      return res.redirect('http://localhost:5500/platform/login.html?error=unauthorized');
    }

    const appToken = jwt.sign(
      { email: result.rows[0].email, name: result.rows[0].name },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.redirect(`http://localhost:5500/platform/index.html?token=${appToken}`);
  } catch (err) {
    console.error('Error in auth redirect', err);
    res.status(500).send('SSO token exchange failed');
  }
});

export default router;