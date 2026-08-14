#!/usr/bin/env bash
# ============================================================================
# check-indexing.sh — verify AI indexing is still open and reachable
# for natalie.acreetionos.org + acreetionos.org.
#
# Usage: bash check-indexing.sh [--verbose]
# Exit codes: 0 = all good, 1 = something regressed
# ============================================================================
VERBOSE=0
[[ "$1" == "--verbose" ]] && VERBOSE=1
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); [[ $VERBOSE == 1 ]] && echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ FAIL: $1"; }

echo "═══ AI indexing check $(date) ═══"

# 1. robots.txt allows AI bots on both domains (no Cloudflare managed block)
for dom in natalie.acreetionos.org acreetionos.org; do
  R=$(curl -s --max-time 15 "https://$dom/robots.txt")
  if echo "$R" | grep -q "BEGIN Cloudflare Managed"; then
    bad "$dom robots.txt has Cloudflare managed block"
  else
    ok "$dom robots.txt: no managed block"
  fi
  for bot in GPTBot ClaudeBot PerplexityBot; do
    if echo "$R" | grep -A1 "User-agent: $bot" | grep -q "Allow: /"; then
      ok "$dom allows $bot"
    else
      bad "$dom does NOT allow $bot in robots.txt"
    fi
  done
done

# 2. Content pages fetch for crawler UAs
for path in / /my-story.md /stillwater.md /the-long-road.md /sitemap.xml; do
  CODE=$(curl -s --max-time 15 -A "GPTBot/1.0" -o /dev/null -w "%{http_code}" "https://natalie.acreetionos.org$path")
  if [[ "$CODE" == "200" ]]; then
    ok "natalie$path -> 200"
  else
    bad "natalie$path -> $CODE"
  fi
done

# 3. x-robots-tag says index
HDR=$(curl -sI --max-time 15 -A "GPTBot" https://natalie.acreetionos.org/my-story.md)
if echo "$HDR" | grep -qi "x-robots-tag: index"; then
  ok "x-robots-tag: index present"
else
  bad "x-robots-tag missing or not index"
fi

# 4. OpenAI verification TXT still live
TXT=$(curl -s --max-time 15 "https://cloudflare-dns.com/dns-query?name=acreetionos.org&type=TXT" -H "accept: application/dns-json" 2>/dev/null)
if echo "$TXT" | grep -q "openai-domain-verification"; then
  ok "OpenAI domain verification TXT live"
else
  bad "OpenAI domain verification TXT missing"
fi

echo ""
echo "═══ Result: $PASS passed, $FAIL failed ═══"
[[ $FAIL -gt 0 ]] && exit 1
exit 0
