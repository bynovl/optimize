#!/bin/bash
read -p "This script will install custom checks or extensions examples from a GitHub repository. Do you want to continue? (y/n) " -n 1 -r
echo    # move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1 
fi

read -p "Do you want to install the config file (cf), custom check (cc), or extend check examples (ce)? (cf/cc/ce) " -n 2 -r
CHOICE=$REPLY
echo    # move to a new line

if [[ $CHOICE =~ ^[Cc][Ff]$ ]]; then
    FOLDER_PATH="templates/optimize.config.js"
elif [[ $CHOICE =~ ^[Cc][Cc]$ ]]; then
    FOLDER_PATH="templates/custom-check"
elif [[ $CHOICE =~ ^[Cc][Ee]$ ]]; then
    FOLDER_PATH="templates/extend-checks.js"
else
    echo "Invalid choice. Please enter 'cf' for config file, 'cc' for custom check, or 'ce' for extension examples."
    exit 1
fi

# Prompt for target directory
read -p "Please enter where you want to copy the custom checks (default is current directory): " TARGET_DIR
TARGET_DIR=${TARGET_DIR:-.}

# Variables
REPO_URL="git@github.com:bynovl/optimize.git"


# Create a temp directory
TMP_DIR=$(mktemp -d)

# Clone the repo to temp directory
git clone "$REPO_URL" "$TMP_DIR"
if [ $? -ne 0 ]; then
    echo "Error: Failed to clone repository. Please check the URL or your network connection."
    rm -rf "$TMP_DIR"
    exit 1
fi

# Debug: List contents of templates directory after cloning
ls -l "$TMP_DIR/templates"

# Check if the file/folder exists before copying
if [ ! -e "$TMP_DIR/$FOLDER_PATH" ]; then
    echo "Error: $FOLDER_PATH not found in the repository."
    rm -rf "$TMP_DIR"
    exit 1
fi

# Copy the desired folder to your target location
cp -r "$TMP_DIR/$FOLDER_PATH" "$TARGET_DIR"

# Remove the temp directory
rm -rf "$TMP_DIR"

echo    # move to a new line
echo "Folder/files copied successfully to $TARGET_DIR!"