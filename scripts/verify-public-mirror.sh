#!/usr/bin/env bash
set -euo pipefail

expected="${1:?expected Git commit SHA required}"
[[ "$expected" =~ ^[0-9a-f]{40}$ ]] || { echo 'invalid expected revision' >&2; exit 2; }
origin="${WIKI_PUBLIC_ORIGIN:-https://www.agi-society.cn}"
attempts="${WIKI_PUBLIC_VERIFY_ATTEMPTS:-12}"

fetch() {
  local path="$1"
  curl -4 -fsS --connect-timeout 10 --max-time 20 \
    -H 'Cache-Control: no-cache' \
    "$origin$path?revision=$expected" 2>/dev/null || true
}

for attempt in $(seq 1 "$attempts"); do
  revision="$(fetch '/deployment-revision.txt')"
  if [[ "$revision" == "$expected" ]]; then
    jia="$(fetch '/wiki/people/jia-min')"
    qi="$(fetch '/wiki/people/qi-haibin')"
    wang="$(fetch '/wiki/people/wang-tao')"
    home="$(fetch '/')"
    if [[ "$jia" == *'贵州京师城投智慧教育产业股份有限公司'* &&
          "$qi" == *'华中师范大学'* && "$qi" == *'华中科技大学公共管理学院'* &&
          "$wang" == *'湖北经济学院信息工程学院'* &&
          "$home" == *'href="/wiki/people/wang-tao"'* ]]; then
      printf 'public_mirror_verified revision=%s attempt=%s\n' "$expected" "$attempt"
      exit 0
    fi
  fi
  sleep 5
done

printf 'public_mirror_mismatch expected_revision=%s observed_revision=%s attempts=%s\n' \
  "$expected" "${revision:-missing}" "$attempts" >&2
exit 1
