#!/bin/bash

echo " "
echo "### "
echo "### Rsyncing walterblaire.com to server..."
echo "###  "
echo " "
echo " "

cd /Users/flash/Dropbox/Websites/walterblaire.com;

## Build the site
rm -fr public/
gulp config-prod
gulp build

## Sync the site
## This should also set read/write perms on folders/files, excludes stuff, etc.

# rsync --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r --progress --delete --exclude "shortcodes.md" --exclude ".htaccess" --exclude "*.psd" --exclude "*.git" --exclude "*.zip" --exclude ".DS_Store" --exclude "her-eternal-front" -avzh public/ flash@walterblaire.com:/home/flash/public_html/
rsync --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r --progress --delete --exclude "shortcodes.md" --exclude ".htaccess" --exclude "*.psd" --exclude "*.git" --exclude "*.zip" --exclude ".DS_Store" --exclude "her-eternal-front" -avzh public/ flash@shared16.arvixe.com:/home/flash/public_html/

## OR simple ssh:
#  ssh flash@walterblaire.com
#  ssh flash@shared16.arvixe.com

echo " "
echo " "
echo "###  "
echo "### Done rsyncing walterblaire.com to server!"
echo "###  "
echo " "
echo " "
