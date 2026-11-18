# Packaging script for Chrome Web Store / Edge Add-ons
$rootDir = $PSScriptRoot
$distDir = Join-Path $rootDir "dist"
$tempDir = Join-Path $distDir "temp_extension"
$zipPath = Join-Path $distDir "media-zoom-anywhere.zip"

Write-Host "Creating release package..." -ForegroundColor Cyan

if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy production files
Copy-Item (Join-Path $rootDir "manifest.json") $tempDir
Copy-Item (Join-Path $rootDir "content.js") $tempDir
Copy-Item (Join-Path $rootDir "content.css") $tempDir
Copy-Item (Join-Path $rootDir "icons") $tempDir -Recurse
Copy-Item (Join-Path $rootDir "popup") $tempDir -Recurse
Copy-Item (Join-Path $rootDir "options") $tempDir -Recurse
Copy-Item (Join-Path $rootDir "_locales") $tempDir -Recurse

# Compress to ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Clean up temp folder
Remove-Item $tempDir -Recurse -Force

Write-Host "Package created successfully: dist\media-zoom-anywhere.zip" -ForegroundColor Green
Write-Host "Ready for Chrome Web Store / Edge Add-ons upload!" -ForegroundColor Yellow

