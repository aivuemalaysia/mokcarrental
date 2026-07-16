$files = @(
  "src\app\api\admin\business-applications\[id]\route.ts",
  "src\app\api\admin\cars\[id]\route.ts",
  "src\app\api\admin\cars\route.ts",
  "src\app\api\admin\content\pickup-locations\route.ts",
  "src\app\api\admin\content\site-settings\route.ts"
)
foreach($f in $files) {
  $path = Join-Path $PWD $f
  $lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
  $result = @()
  for($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    # Check if this is the orphaned .catch line
    if($line -match '^\s*\.catch\s*\(\s*\)\s*=>\s*null\s*\)\s*;?\s*$') {
      # Go back to find the "const body = await request.json()" line
      $searchIdx = $result.Count - 1
      while($searchIdx -ge 0 -and $result[$searchIdx] -notmatch 'await request\.json\(\)\s*$') {
        $searchIdx--
      }
      if($searchIdx -ge 0) {
        # Append .catch to the request.json line
        $result[$searchIdx] = $result[$searchIdx].TrimEnd() + ";" + $line.Trim()
      }
      # Skip this orphaned line
    } else {
      $result += $line
    }
  }
  [System.IO.File]::WriteAllLines($path, $result, [System.Text.Encoding]::UTF8)
  Write-Host "Fixed: $f"
}
