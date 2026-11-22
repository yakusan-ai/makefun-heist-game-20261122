#!/usr/bin/env bash
set -euo pipefail
project="$(cd "$(dirname "$0")/.." && pwd)"
chrome='/mnt/c/Program Files/Google/Chrome/Application/chrome.exe'
profile="$(wslpath -w "$(dirname "$project")/makefun-prep/chrome-profile")"
for pair in '01-cover cover' '02-tools tools' '03-alarm alarm' '04-escape escape'; do
  read -r name scene <<< "$pair"
  destination="$(wslpath -w "$project/screenshots/$name.png")"
  "$chrome" --headless --disable-gpu --no-first-run --no-default-browser-check --disable-background-networking     --user-data-dir="$profile" --window-size=960,540 --hide-scrollbars     --screenshot="$destination" --dump-dom "http://127.0.0.1:18766/?capture=$scene"     > "$project/artifacts/$name.html" 2> "$project/artifacts/$name-chrome.log"
done
"$chrome" --headless --disable-gpu --no-first-run --no-default-browser-check --disable-background-networking   --user-data-dir="$profile" --window-size=960,540 --hide-scrollbars --dump-dom   'http://127.0.0.1:18766/?capture=escaped' > "$project/artifacts/browser-escape.html" 2> "$project/artifacts/browser-escape.log"
