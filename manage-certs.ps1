# SSL Certificate Management Script for Windows
# PowerShell version of the certificate management script

param(
    [Parameter(Position=0)]
    [ValidateSet("check", "generate", "install", "info", "help")]
    [string]$Command = "check"
)

$CertDir = ".\certificates"
$Domain = "dev.youpage.info"
$KeyFile = "$CertDir\localhost-key.pem"
$CertFile = "$CertDir\localhost.pem"

Write-Host "SSL Certificate Management for Development" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Create certificates directory if it doesn't exist
if (!(Test-Path $CertDir)) {
    Write-Host "Creating certificates directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $CertDir -Force | Out-Null
}

function Generate-Certificates {
    Write-Host "Generating SSL certificates..." -ForegroundColor Yellow
    
    # Check if OpenSSL is available
    try {
        openssl version | Out-Null
    }
    catch {
        Write-Host "OpenSSL not found! Please install OpenSSL first." -ForegroundColor Red
        Write-Host "Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Blue
        return $false
    }
    
    # Create certificate configuration
    $configContent = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
CN=$Domain

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $Domain
DNS.2 = localhost
DNS.3 = *.youpage.info
IP.1 = 127.0.0.1
IP.2 = ::1
"@
    
    $configFile = "$CertDir\cert.conf"
    $configContent | Out-File -FilePath $configFile -Encoding ASCII
    
    try {
        # Generate private key
        & openssl genpkey -algorithm RSA -out $KeyFile -pkcs8 2>$null
        
        # Generate certificate signing request
        & openssl req -new -key $KeyFile -out "$CertDir\cert.csr" -config $configFile 2>$null
        
        # Generate self-signed certificate
        & openssl x509 -req -in "$CertDir\cert.csr" -signkey $KeyFile -out $CertFile -days 365 -extensions v3_req -extfile $configFile 2>$null
        
        # Clean up temporary files
        Remove-Item "$CertDir\cert.csr" -ErrorAction SilentlyContinue
        Remove-Item $configFile -ErrorAction SilentlyContinue
        
        Write-Host "SSL certificates generated successfully!" -ForegroundColor Green
        Write-Host "Private key: $KeyFile" -ForegroundColor Green
        Write-Host "Certificate: $CertFile" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Failed to generate certificates: $_" -ForegroundColor Red
        return $false
    }
}

function Check-Certificates {
    if (!(Test-Path $KeyFile) -or !(Test-Path $CertFile)) {
        Write-Host "Certificates not found!" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Checking certificate validity..." -ForegroundColor Yellow
    
    try {
        # Check certificate expiry
        $expiryInfo = & openssl x509 -in $CertFile -noout -enddate 2>$null
        $expiryDate = ($expiryInfo -split "=")[1]
        Write-Host "Certificate expires: $expiryDate" -ForegroundColor Blue
        
        # Check if certificate is still valid
        $validCheck = & openssl x509 -in $CertFile -noout -checkend 86400 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Certificate is valid" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Certificate expires within 24 hours or has expired" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "Error checking certificate: $_" -ForegroundColor Red
        return $false
    }
}

function Show-CertificateInfo {
    if (!(Test-Path $CertFile)) {
        Write-Host "Certificate file not found!" -ForegroundColor Red
        return
    }
    
    Write-Host "Certificate Information:" -ForegroundColor Blue
    try {
        & openssl x509 -in $CertFile -text -noout | Select-String "Subject:|Issuer:|Not Before|Not After|DNS:"
    }
    catch {
        Write-Host "Error reading certificate: $_" -ForegroundColor Red
    }
}

function Install-Certificate {
    Write-Host "Installing certificate in Windows trust store..." -ForegroundColor Yellow
    
    if (!(Check-Certificates)) {
        Write-Host "Valid certificates required before installation" -ForegroundColor Red
        return $false
    }
    
    try {
        # Import certificate to Current User's Trusted Root Certification Authorities
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($CertFile)
        $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
        $store.Open("ReadWrite")
        $store.Add($cert)
        $store.Close()
        
        Write-Host "Certificate installed in Windows trust store" -ForegroundColor Green
        Write-Host "You may need to restart your browser" -ForegroundColor Yellow
        return $true
    }
    catch {
        Write-Host "Failed to install certificate: $_" -ForegroundColor Red
        Write-Host "Try running PowerShell as Administrator" -ForegroundColor Blue
        return $false
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "Usage: .\manage-certs.ps1 [command]" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Blue
    Write-Host "  check    - Check certificate validity (default)" -ForegroundColor White
    Write-Host "  generate - Generate new SSL certificates" -ForegroundColor White
    Write-Host "  install  - Install certificate in Windows trust store" -ForegroundColor White
    Write-Host "  info     - Show certificate information" -ForegroundColor White
    Write-Host "  help     - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Prerequisites:" -ForegroundColor Yellow
    Write-Host "  - OpenSSL must be installed and in PATH" -ForegroundColor White
    Write-Host "  - Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Blue
    Write-Host ""
}

# Main script logic
switch ($Command) {
    "generate" {
        Generate-Certificates
    }
    "check" {
        if (Check-Certificates) {
            Show-CertificateInfo
        } else {
            Write-Host ""
            Write-Host "Run .\manage-certs.ps1 generate to create new certificates" -ForegroundColor Blue
        }
    }
    "install" {
        Install-Certificate
    }
    "info" {
        Show-CertificateInfo
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
