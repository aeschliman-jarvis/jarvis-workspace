#!/bin/bash
# lib/skill-hunter.sh
# Scours the web every 6 hours for the most high-leverage OpenClaw skills.

WORKSPACE="$HOME/.openclaw/workspace"
LOG="$WORKSPACE/memory/skill-hunt-$(date +%Y-%m-%d).md"
MANUAL="$WORKSPACE/MANUAL.md"

echo "🕵️ Skill Hunter: Starting search for autonomous capabilities..." >> $LOG

# 1. Search GitHub for trending OpenClaw/Automation repos
echo "🔍 Scanning GitHub Topics..." >> $LOG
GITHUB_FINDINGS=$(curl -s "https://api.github.com/search/repositories?q=openclaw+skill+OR+autonomous+agent&sort=updated&order=desc&per_page=3" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for repo in data['items'][:2]:
        print(f\"- **{repo['name']}**: {repo['description'][:100]}... [Link]({repo['html_url']})\")
except:
    print('- Search failed (rate limit or network).')
")

# 2. Search Reddit for "automation" and "local-llama" breakthroughs
echo "🔍 Scanning Reddit for breakthroughs..." >> $LOG
REDDIT_FINDINGS=$(curl -s "https://www.reddit.com/r/LocalLLaMA/new.json?limit=5" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for post in data['data']['children']:
        title = post['data']['title']
        if any(kw in title.lower() for kw in ['agent', 'automation', 'openclaw', 'autonomous']):
            print(f\"- **{title}** [Link](https://reddit.com{post['data']['permalink']})\")
except:
    print('- Reddit search failed.')
")

# 3. Report to MANUAL.md
echo "" >> $MANUAL
echo "### 🕵️ Skill Hunt Report ($(date))" >> $MANUAL
echo "**GitHub Finds:**" >> $MANUAL
echo "$GITHUB_FINDINGS" >> $MANUAL
echo "" >> $MANUAL
echo "**Reddit Breakthroughs:**" >> $MANUAL
echo "$REDDIT_FINDINGS" >> $MANUAL
echo "" >> $MANUAL

echo "✅ Hunt complete. New potential skills logged in MANUAL.md." >> $LOG
