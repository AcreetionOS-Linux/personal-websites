import json

files = {
    "stance": "political-stance.md",
    "deep": "politics-deep-dive.md",
    "story": "my-story.md",
    "dark": "not-so-great.md",
    "road": "the-long-road.md",
    "stillwater": "stillwater.md",
    "faith": "faith.md",
    "identity": "identity.md",
    "sexuality": "sexuality.md",
    "cure": "the-cure.md"
}

output = {}
for key, filepath in files.items():
    try:
        with open(filepath, 'r') as f:
            output[key] = f.read()
    except FileNotFoundError:
        pass

with open('assets/md-fallback.js', 'w') as f:
    f.write('// Generated fallback copies of the views (for file:// viewing where fetch is blocked).\n')
    f.write('// Regenerate after editing the .md files: node -e "..." (see life-rail.js header) or just re-copy.\n')
    f.write('window.LR_MD_FALLBACK = ')
    json.dump(output, f, separators=(',', ':'))
    f.write(';\n')

