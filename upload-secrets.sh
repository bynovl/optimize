# Dynamically set GitHub secrets from a .env file in the 'public' remote repository
PUBLIC_REPO_URL=$(git remote get-url public)
while IFS='=' read -r name value; do
  # Skip empty lines and comments
  [[ -z "$name" || "$name" =~ ^# ]] && continue
  # Add the secret to the GitHub repository (uncomment the line below to enable)
  gh secret set "$name" -b"$value" --repo "$PUBLIC_REPO_URL"
  # To delete the secret from the GitHub repository (uncomment the line below to enable)
  #gh secret delete "$name" --repo "$PUBLIC_REPO_URL"
done < .env
