#!/bin/bash

PACKAGE_VERSION=$(awk '/version/{gsub(/("|",)/,"",$2);print $2};' package.json)
echo "Packaging Dynastia GUI v$PACKAGE_VERSION for Mac"

electron-packager . Dynastia --platform=darwin --arch=x64 --icon=icons/icon.icns --overwrite --out dist
# zip -r "dist/dynastia-mac-$PACKAGE_VERSION.zip" dist/Dynastia-darwin-x64
# hdiutil create "dist/dynastia-mac-$PACKAGE_VERSION.dmg" -volname "Dynastia v$PACKAGE_VERSION" -srcfolder dist/Dynastia-darwin-x64
appdmg dist/release-mac.json "dist/dynastia-mac-$PACKAGE_VERSION.dmg"