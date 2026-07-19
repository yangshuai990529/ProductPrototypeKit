#!/bin/bash

# ProductPrototypeKit - Password Protected Vault Helper
# Password is set to: PPK123

VAULT_DIR="Secure_Vault"
ZIP_FILE="Secure_Vault.zip"
PASSWORD="PPK123"

show_help() {
  echo "ProductPrototypeKit - Secure Vault Helper"
  echo "----------------------------------------"
  echo "Usage:"
  echo "  ./vault.sh lock    - Encrypt and compress '$VAULT_DIR' into '$ZIP_FILE'"
  echo "  ./vault.sh unlock  - Decrypt and extract '$ZIP_FILE' back into '$VAULT_DIR'"
}

if [ "$1" == "lock" ]; then
  if [ ! -d "$VAULT_DIR" ]; then
    echo "Error: Directory '$VAULT_DIR' does not exist."
    exit 1
  fi
  
  # Check if directory is empty
  if [ -z "$(ls -A "$VAULT_DIR")" ]; then
    echo "Warning: Directory '$VAULT_DIR' is empty. Creating a dummy file to allow zipping."
    echo "This is a secure vault container." > "$VAULT_DIR/.keep"
  fi

  echo "Locking vault..."
  rm -f "$ZIP_FILE"
  zip -er "$ZIP_FILE" "$VAULT_DIR" -P "$PASSWORD"
  echo "Vault locked successfully. You can now commit and push '$ZIP_FILE'."
  
elif [ "$1" == "unlock" ]; then
  if [ ! -f "$ZIP_FILE" ]; then
    echo "Error: Encrypted file '$ZIP_FILE' not found. Please pull from git or ensure the file exists."
    exit 1
  fi
  echo "Unlocking vault..."
  unzip -o -P "$PASSWORD" "$ZIP_FILE"
  echo "Vault unlocked successfully in '$VAULT_DIR/'."
else
  show_help
fi
