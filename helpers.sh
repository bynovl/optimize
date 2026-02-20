# Overwrite all package LICENSE files with the root LICENSE
for d in packages/*/ ; do
  cp LICENSE "$d"
done