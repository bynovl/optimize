#!/bin/bash
read -p "This script will install custom checks or extensions examples from a GitHub repository. Do you want to continue? (y/n) " -n 1 -r
echo    # move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1 
fi

read -p "Do you want to install the custom check (c) or extension examples (e)? (c/e) " -n 1 -r
echo    # move to a new line

if [[ $REPLY =~ ^[Cc]$ ]]; then
    FOLDER_PATH="templates/custom-check"
elif [[ $REPLY =~ ^[Ee]$ ]]; then
    FOLDER_PATH="templates/extend-checks.js"
else
    echo "Invalid choice. Please enter 'c' for custom check or 'e' for extension examples."
    exit 1
fi

# Prompt for target directory
read -p "Please enter where you want to copy the custom checks (default is current directory): " TARGET_DIR
TARGET_DIR=${TARGET_DIR:-.}

# Variables (replace with your values)
REPO_URL="https://github.com/bynovl/optimize.git"

# Create a temp directory
TMP_DIR=$(mktemp -d)

# Clone the repo to temp directory
git clone "$REPO_URL" "$TMP_DIR"
if [ $? -ne 0 ]; then
    echo "Error: Failed to clone repository. Please check the URL or your network connection."
    rm -rf "$TMP_DIR"
    exit 1
fi

# Copy the desired folder to your target location
cp -r "$TMP_DIR/$FOLDER_PATH" "$TARGET_DIR"

# Remove the temp directory
rm -rf "$TMP_DIR"

echo    # move to a new line
echo "Folder/files copied successfully to $TARGET_DIR!"