#!/bin/bash

PACKAGE_VERSION=$(awk '/version/{gsub(/("|",)/,"",$2);print $2};' package.json)
echo "Packaging Dynastia GUI v$PACKAGE_VERSION for Mac"

electron-packager . dynastia --platform=darwin --arch=x64 --icon=icons/icon.icns --overwrite --out dist
zip -r "dist/dynastia-mac-$PACKAGE_VERSION.zip" ./dist/dynastia-darwin-x64