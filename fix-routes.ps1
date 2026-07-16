$files = @(
  "src\app\api\admin\business-applications\[id]\route.ts",
  "src\app\api\admin\cars\[id]\route.ts",
  "src\app\api\admin\cars\route.ts",
  "src\app\api\admin\content\pickup-locations\route.ts",
  "src\app\api\admin\content\site-settings\route.ts"
)
foreach($f in $files) {
  $content = [System.IO.File]::ReadAllText((Join-Path $PWD $f), [System.Text.Encoding]::UTF8)
  $lines = $content -split "`r?`n"
  $result = @()
  $i = 0
  while($i -lt $lines.Count) {
    if($lines[$i] -match '^\s*\.catch\s*\(\s*\)\s*=>\s*null\s*\)\s*;?\s*$') {
      $prevIdx = $result.Count - 1
      while($prevIdx -ge 0 -and ($result[$prevIdx] -match '^\s*$' -or $result[$prevIdx] -match '^\s*//')) {
        $prevIdx--
      }
      if($prevIdx -ge 0) {
        $trimmed = $result[$prevIdx].TrimEnd()
        if($trimmed -notmatch ';\s*$') {
          $result[$prevIdx] = $trimmed + ';' + $lines[$i].Trim()
        } else {
          $result[$prevIdx] = $trimmed + $lines[$i].Trim()
        }
      }
    } else {
      $result += $lines[$i]
    }
    $i++
  }
  $newContent = $result -join "`n"
  [System.IO.File]::WriteAllText((Join-Path $PWD $f), $newContent, [System.Text.Encoding]::UTF8)
  Write-Host "Fixed: $f"
}
