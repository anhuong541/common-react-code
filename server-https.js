const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'dev.youpage.info';
const port = 3000;

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/**
 * HTTPS Options Configuration
 * This is where we define our SSL certificate paths
 */

const httpsOptions = {
  // Path to your private key file
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
  // Path to your certificate file
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem')),
  // Additional security options
  secureProtocol: 'TLSv1_2_method',
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384',
  ].join(':'),
  honorCipherOrder: true,
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // Add security headers
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Handle CORS preflight requests
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', `https://${hostname}:${port}`);
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie'
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');
        res.statusCode = 200;
        res.end();
        return;
      }

      // Add CORS headers to all responses
      res.setHeader('Access-Control-Allow-Origin', `https://${hostname}:${port}`);
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error('HTTPS Server Error:', err);
      process.exit(1);
    })
    .listen(port, hostname, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        throw err;
      }
      console.log(`> Ready on https://${hostname}:${port}`);
      console.log('> SSL certificates loaded successfully');
      console.log('> CORS and security headers configured');
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
