#!/bin/bash

PACKAGE_VERSION=$(awk '/version/{gsub(/("|",)/,"",$2);print $2};' package.json)
echo "Packaging Dynastia GUI v$PACKAGE_VERSION for Win64"

electron-packager . dynastia --platform=win32 --arch=x64 --icon=icons/icon.ico --overwrite --out dist
zip -r "dist/dynastia-win64-$PACKAGE_VERSION.zip" ./dist/dynastia-win32-x64