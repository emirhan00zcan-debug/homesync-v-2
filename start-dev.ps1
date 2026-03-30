Set-Location "C:\Users\pc\OneDrive\Masaüstü\Ecommerce\homesync"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Package.json exists: $(Test-Path package.json)"
npm run dev
