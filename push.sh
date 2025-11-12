#!/bin/bash
set -euo pipefail

# --- color setup (auto-disable if not terminal) ---
if [ -t 1 ]; then
  GREEN="\e[0;32m"; GRAY="\e[0;37m"; YELLOW="\e[1;33m"; RESET="\e[0m"
else
  GREEN=""; GRAY=""; YELLOW=""; RESET=""
fi

# --- helpers ---
draw_bar() {
  local current=$1 total=$2 width=40
  (( total == 0 )) && total=1
  local percent=$(( current * 100 / total ))
  local filled=$(( current * width / total ))
  (( filled < 0 )) && filled=0
  (( filled > width )) && filled=$width
  local empty=$(( width - filled ))
  printf -v bar "%0.s#" $(seq 1 $filled)
  printf -v pad "%0.s-" $(seq 1 $empty)
  printf "\r${GRAY}[%s%s] %3d%% (%d/%d)${RESET}" "$bar" "$pad" "$percent" "$current" "$total" >&2
}

# --- start timer ---
start_time=$(date +%s)

# --- collect file list once ---
mapfile -d '' FILES < <(find . -type f ! -path "./.git/*" ! -iname "checksum.dat" -print0)
total=${#FILES[@]}
echo -e "${YELLOW}Found $total files to hash using $(nproc) cores...${RESET}" >&2

# --- system cores (fallback for Git Bash) ---
CORES=${NUMBER_OF_PROCESSORS:-}
if [ -z "${CORES}" ]; then
  CORES=$(command -v nproc >/dev/null 2>&1 && nproc || echo 4)
fi

# --- temp files ---
tmp_hashes=$(mktemp)
tmp_progress=$(mktemp)
: > "$tmp_progress"

export TMP_PROGRESS="$tmp_progress"

# --- background watcher for progress ---
(
  done_count=0
  while :; do
    done_count=$(wc -c < "$TMP_PROGRESS" 2>/dev/null || echo 0)
    draw_bar "$done_count" "$total"
    (( done_count >= total )) && break
    sleep 0.1
  done
  echo >&2
) & watcher_pid=$!

# --- parallel hashing: each process writes '.' when done ---
printf '%s\0' "${FILES[@]}" | xargs -0 -n1 -P"$CORES" bash -c '
  f="$0"
  sha1sum "$f"
  printf . >> "$TMP_PROGRESS"
' > "$tmp_hashes"

# --- wait for progress watcher ---
wait "$watcher_pid" || true

# --- sort results by filename (2nd column) for deterministic output ---
sort -k 2 "$tmp_hashes" -o checksum.dat
rm -f -- "$tmp_hashes" "$tmp_progress"

# --- git operations ---
git add -A
git commit -m "update"
git push

# --- show elapsed time ---
elapsed=$(( $(date +%s) - start_time ))
echo -e "${GREEN}DONE${RESET} in ${YELLOW}${elapsed}s${RESET}" >&2
exit 0
