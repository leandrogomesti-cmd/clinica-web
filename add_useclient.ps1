# add_useclient.ps1 - compatível com PS antigo (sem -Raw)
$files = Get-ChildItem -Recurse -Path ".\app" -Filter *.tsx

foreach ($f in $files) {
  $p = $f.FullName
  $c = [System.IO.File]::ReadAllText($p)

  # Usa hooks?
  $usesHooks = [System.Text.RegularExpressions.Regex]::IsMatch($c, '\buse(State|Effect|Reducer|Ref)\b')
  if (-not $usesHooks) { continue }

  # Já tem 'use client' no topo?
  $hasDirective = [System.Text.RegularExpressions.Regex]::IsMatch($c, "^\s*('use client'|""use client"")", 'Multiline')

  if (-not $hasDirective) {
    $c = "'use client'`r`n" + $c
    Write-Host "[add] 'use client' -> $p"
  }

  # Garantir import useState
  $needsUseState = [System.Text.RegularExpressions.Regex]::IsMatch($c, '\buseState\b') -and `
                   -not [System.Text.RegularExpressions.Regex]::IsMatch($c, "import\s*{\s*[^}]*useState[^}]*}\s*from\s*'react'")
  if ($needsUseState) {
    if ([System.Text.RegularExpressions.Regex]::IsMatch($c, "(?m)^\s*('use client'|""use client"")\s*\r?\n")) {
      $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        "(?m)^\s*('use client'|""use client"")\s*\r?\n",
        "`$1`r`nimport { useState } from 'react';`r`n", 1)
    } else {
      $c = "import { useState } from 'react';`r`n" + $c
    }
    Write-Host "[add] import useState -> $p"
  }

  # Garantir import useEffect (e mesclar com import de useState, se existir)
  $needsUseEffect = [System.Text.RegularExpressions.Regex]::IsMatch($c, '\buseEffect\b') -and `
                    -not [System.Text.RegularExpressions.Regex]::IsMatch($c, "import\s*{\s*[^}]*useEffect[^}]*}\s*from\s*'react'")
  if ($needsUseEffect) {
    if ([System.Text.RegularExpressions.Regex]::IsMatch($c, "import\s*{\s*useState\s*}\s*from\s*'react';?")) {
      $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        "import\s*{\s*useState\s*}\s*from\s*'react';?",
        "import { useState, useEffect } from 'react';", 1)
    } elseif ([System.Text.RegularExpressions.Regex]::IsMatch($c, "(?m)^\s*('use client'|""use client"")\s*\r?\n")) {
      $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        "(?m)^\s*('use client'|""use client"")\s*\r?\n",
        "`$1`r`nimport { useEffect } from 'react';`r`n", 1)
    } else {
      $c = "import { useEffect } from 'react';`r`n" + $c
    }
    Write-Host "[add] import useEffect -> $p"
  }

  # Gravar em UTF-8 (sem BOM)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($p, $c, $utf8NoBom)
}
