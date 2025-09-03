#!/bin/bash

# Certificate Management Script for Development
# This script helps generate and manage SSL certificates for local development
# for windows only 
# TODO: config for macbook later 

set -e

CERT_DIR="./certificates"
DOMAIN="dev.youpage.info"
KEY_FILE="$CERT_DIR/localhost-key.pem"
CERT_FILE="$CERT_DIR/localhost.pem"

echo "🔒 SSL Certificate Management for Development"
echo "============================================="

# Create certificates directory if it doesn't exist
if [ ! -d "$CERT_DIR" ]; then
    echo "📁 Creating certificates directory..."
    mkdir -p "$CERT_DIR"
fi

# Function to generate new certificates
generate_certificates() {
    echo "🔧 Generating SSL certificates..."
    
    # Create a configuration file for the certificate
    cat > "$CERT_DIR/cert.conf" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
CN=$DOMAIN

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = localhost
DNS.3 = *.youpage.info
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

    # Generate private key
    openssl genpkey -algorithm RSA -out "$KEY_FILE" -pkcs8 -pass pass: -aes256

    # Remove passphrase from key (for development ease)
    openssl rsa -in "$KEY_FILE" -out "$KEY_FILE" -passin pass:

    # Generate certificate signing request
    openssl req -new -key "$KEY_FILE" -out "$CERT_DIR/cert.csr" -config "$CERT_DIR/cert.conf"

    # Generate self-signed certificate
    openssl x509 -req -in "$CERT_DIR/cert.csr" -signkey "$KEY_FILE" -out "$CERT_FILE" -days 365 -extensions v3_req -extfile "$CERT_DIR/cert.conf"

    # Clean up temporary files
    rm "$CERT_DIR/cert.csr" "$CERT_DIR/cert.conf"

    echo "✅ SSL certificates generated successfully!"
    echo "🔑 Private key: $KEY_FILE"
    echo "📜 Certificate: $CERT_FILE"
}

# Function to check certificate validity
check_certificates() {
    if [ ! -f "$KEY_FILE" ] || [ ! -f "$CERT_FILE" ]; then
        echo "❌ Certificates not found!"
        return 1
    fi

    echo "🔍 Checking certificate validity..."
    
    # Check certificate expiry
    expiry_date=$(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)
    echo "📅 Certificate expires: $expiry_date"
    
    # Check if certificate is still valid
    if openssl x509 -in "$CERT_FILE" -noout -checkend 86400; then
        echo "✅ Certificate is valid"
        return 0
    else
        echo "⚠️  Certificate expires within 24 hours or has expired"
        return 1
    fi
}

# Function to show certificate information
show_certificate_info() {
    if [ ! -f "$CERT_FILE" ]; then
        echo "❌ Certificate file not found!"
        return 1
    fi
    
    echo "📋 Certificate Information:"
    openssl x509 -in "$CERT_FILE" -text -noout | grep -A 5 "Subject:\|Issuer:\|Validity\|DNS:"
}

# Function to install certificate in system (macOS/Linux)
install_certificate() {
    echo "💻 Installing certificate in system trust store..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "🍎 Detected macOS - Installing in Keychain..."
        sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_FILE"
        echo "✅ Certificate installed in macOS Keychain"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "🐧 Detected Linux - Installing in ca-certificates..."
        sudo cp "$CERT_FILE" "/usr/local/share/ca-certificates/$DOMAIN.crt"
        sudo update-ca-certificates
        echo "✅ Certificate installed in Linux ca-certificates"
    else
        echo "⚠️  Manual installation required for your OS"
        echo "   Certificate path: $CERT_FILE"
    fi
}

# Main script logic
case "${1:-check}" in
    "generate")
        generate_certificates
        ;;
    "check")
        if check_certificates; then
            show_certificate_info
        else
            echo ""
            echo "🔧 Run './manage-certs.sh generate' to create new certificates"
        fi
        ;;
    "install")
        if check_certificates; then
            install_certificate
        else
            echo "❌ Valid certificates required before installation"
            echo "🔧 Run './manage-certs.sh generate' first"
        fi
        ;;
    "info")
        show_certificate_info
        ;;
    "help"|*)
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check    - Check certificate validity (default)"
        echo "  generate - Generate new SSL certificates"
        echo "  install  - Install certificate in system trust store"
        echo "  info     - Show certificate information"
        echo "  help     - Show this help message"
        echo ""
        ;;
esac
