#!/bin/bash

# ProductPrototypeKit - Password Protected Vault Helper
# Password is set to: PPK123

VAULT_DIR="Secure_Vault"
MENU_TREE_DIR="knowledge/menu-tree"
RAG_DIR="Product Design RAG"
ZIP_FILE="Secure_Vault.zip"
PASSWORD="PPK123"

show_help() {
  echo "ProductPrototypeKit - Secure Vault Helper"
  echo "----------------------------------------"
  echo "Usage:"
  echo "  ./vault.sh lock    - Encrypt and compress secure data into '$ZIP_FILE'"
  echo "  ./vault.sh unlock  - Decrypt and extract '$ZIP_FILE' back to their folders"
}

if [ "$1" == "lock" ]; then
  echo "Locking and encrypting secure data..."
  
  # Ensure Secure_Vault folder exists
  mkdir -p "$VAULT_DIR"
  if [ -z "$(ls -A "$VAULT_DIR")" ]; then
    echo "This is a secure vault container." > "$VAULT_DIR/.keep"
  fi

  # Gather list of paths that exist and should be zipped
  ZIP_PATHS=()
  
  if [ -d "$VAULT_DIR" ]; then
    ZIP_PATHS+=("$VAULT_DIR")
  fi
  
  if [ -d "$MENU_TREE_DIR" ]; then
    ZIP_PATHS+=("$MENU_TREE_DIR")
  else
    echo "Warning: '$MENU_TREE_DIR' not found, skipping."
  fi
  
  if [ -d "$RAG_DIR" ]; then
    ZIP_PATHS+=("$RAG_DIR")
  else
    echo "Warning: '$RAG_DIR' not found, skipping."
  fi

  if [ -f "DV2_demo_1080P.mp4" ]; then
    ZIP_PATHS+=("DV2_demo_1080P.mp4")
  fi

  if [ ${#ZIP_PATHS[@]} -eq 0 ]; then
    echo "Error: No paths to encrypt."
    exit 1
  fi

  rm -f "$ZIP_FILE"
  zip -er "$ZIP_FILE" "${ZIP_PATHS[@]}" -P "$PASSWORD"
  echo "Vault locked successfully. You can now commit and push '$ZIP_FILE'."
  
elif [ "$1" == "unlock" ]; then
  if [ ! -f "$ZIP_FILE" ]; then
    echo "Error: Encrypted file '$ZIP_FILE' not found. Please pull from git or ensure the file exists."
    exit 1
  fi
  echo "Unlocking vault..."
  unzip -o -P "$PASSWORD" "$ZIP_FILE"
  echo "Vault unlocked successfully!"
else
  show_help
fi
