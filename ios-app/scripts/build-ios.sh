#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
xcodegen generate --spec project.yml
xcodebuild -project KhaiLife.xcodeproj -scheme KhaiLife -configuration Release \
  -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath build/device \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build
mkdir -p build/package/Payload
ditto build/device/Build/Products/Release-iphoneos/KhaiLife.app build/package/Payload/KhaiLife.app
# This is a real ARM64 iOS app packaged for signing by a sideloading tool.
# It is intentionally unsigned, not an App Store/TestFlight distribution build.
ditto -c -k --keepParent build/package/Payload build/KhaiLife-unsigned.ipa
unzip -l build/KhaiLife-unsigned.ipa | head -40 || true
