#!/bin/bash

PACKAGE_VERSION=$(awk '/version/{gsub(/("|",)/,"",$2);print $2};' package.json)
echo "Packaging Dynastia GUI v$PACKAGE_VERSION for Win32"

electron-packager . Dynastia --platform=win32 --arch=ia32 --icon=icons/icon.ico --overwrite --out dist
zip -r "dist/installers/dynastia-win32-$PACKAGE_VERSION.zip" ./dist/Dynastia-win32-ia32