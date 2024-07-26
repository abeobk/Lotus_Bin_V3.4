#!/bin/bash
find . -type f \( -iname "*" ! -path "./.git/*" ! -iname "checksum.dat" \) -exec bash -c "sha1sum '{}'" \; > checksum.dat
git add -A
git commit -m "update"
git push
echo "${GREEN}DONE${GRAY}"
exit
