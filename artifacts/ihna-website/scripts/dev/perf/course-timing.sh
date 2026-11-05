#!/usr/bin/env bash
# Warm TTFB (second hit onwards) of 5 course URLs: bash scripts/dev/perf/course-timing.sh (BASE, else PORT, default :3001)
BASE=${BASE:-http://localhost:${PORT:-3001}}
for p in bachelor-of-nursing-international bachelor-of-social-work graduate-certificate-in-advanced-nursing-australian-nursing-practice diabetes-nursing master-of-nursing-international; do
  curl -s -o /dev/null "$BASE/courses/$p/"
  for i in 1 2 3; do t=$(curl -s -o /dev/null -w '%{http_code} %{time_starttransfer}' "$BASE/courses/$p/"); echo "$p $t"; done
done
