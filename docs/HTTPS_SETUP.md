# HTTPS Development Setup

## Current Implementation (Active)

The project is currently configured with a custom HTTPS server using Node.js.

### Quick Start

1. **Generate certificates** (if not already present):

   ```bash
   npm run certs:generate
   ```

2. **Start HTTPS development server**:

   ```bash
   npm run dev:https
   ```

3. **Access the application**:
   ```
   https://dev.your-domain.com:3000
   ```

### Current Configuration

The project uses a custom Node.js HTTPS server (`server-https.js`) with:

- **Hostname**: `dev.youpage.info`
- **Port**: `3000`
- **Certificates**: Located in `certificates/` directory
  - `localhost.pem` (certificate)
  - `localhost-key.pem` (private key)
- **TLS Version**: TLSv1.2
- **Security**: Enhanced cipher suites for better security

### Certificate Trust Setup

**Windows:**

1. Double-click `certificates/localhost.pem`
2. Click "Install Certificate..."
3. Select "Current User" → "Next"
4. Choose "Place all certificates in the following store"
5. Click "Browse" → Select "Trusted Root Certification Authorities"
6. Click "OK" → "Next" → "Finish"

**Alternative Methods (For Reference Only)**

### Install mkcert on Windows

1. **Using Chocolatey:**

   ```powershell
   choco install mkcert
   ```

2. **Using Scoop:**

   ```powershell
   scoop bucket add extras
   scoop install mkcert
   ```

3. **Manual installation:**
   - Download from: https://github.com/FiloSottile/mkcert/releases
   - Add to PATH

### Setup certificates with mkcert

```bash
# Install local CA
mkcert -install

# Generate certificates for localhost
mkcert localhost 127.0.0.1 ::1

# This creates:
# - localhost+2.pem (certificate)
# - localhost+2-key.pem (private key)
```

### Update package.json

Add this script to your package.json:

```json
"dev:https": "HTTPS=true SSL_CRT_FILE=localhost+2.pem SSL_KEY_FILE=localhost+2-key.pem next dev"
```

## Option 2: Using custom server (Current setup)

1. Generate certificates:

   ```bash
   npm run certs:generate
   ```

2. Trust the certificate:

   - Double-click `certificates/localhost.pem`
   - Install to "Trusted Root Certification Authorities"

3. Run HTTPS development server:
   ```bash
   npm run dev:https
   ```

## Option 3: Using Next.js experimental HTTPS

Add to your next.config.mjs:

```javascript
experimental: {
  https: {
    key: './certificates/localhost-key.pem',
    cert: './certificates/localhost.pem',
  },
}
```

## Troubleshooting

- If you get certificate warnings, make sure to trust the certificate in your browser
- For Chrome: Visit `chrome://flags/#allow-insecure-localhost` and enable it
- Clear browser cache after installing certificates
