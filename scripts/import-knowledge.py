#!/usr/bin/env python3
"""Import Markdown only; do not copy executable, disc, generated, capture or binary assets."""
import argparse, hashlib, json, re, subprocess
from pathlib import Path
parser = argparse.ArgumentParser()
parser.add_argument('--ps2', type=Path, default=Path('/Users/monty/Documents/GitHub/eod-recomp'))
parser.add_argument('--research', type=Path, default=Path('/Users/monty/Documents/GitHub/TDEOD RECOMP'))
parser.add_argument('--session', type=Path, default=Path('/Users/monty/Documents/Codex/2026-10-19/find'))
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
manifest = []
def git(repo, *argv):
    p = subprocess.run(['git', '-C', str(repo), *argv], capture_output=True, text=True)
    return p.stdout.strip() if p.returncode == 0 else 'unavailable'
def render(text, source, mapping):
    # MDX 1 treats raw angle brackets as JSX. Preserve code fences and inline code.
    out, fence = [], False
    for line in text.splitlines():
        if re.match(r'^\s*(```|~~~)', line): fence = not fence
        elif not fence:
            parts = re.split(r'(`+[^`]*`+)', line)
            line = ''.join(p if p.startswith('`') else p.replace('<', '&lt;') for p in parts)
        out.append(line)
    text = '\n'.join(out) + '\n'
    def link(m):
        target = m.group(2)
        if target.startswith(('http:', 'https:', '#', 'mailto:')): return m.group(0)
        raw, _, anchor = target.partition('#')
        resolved = (source.parent / raw).resolve()
        if resolved in mapping:
            import os
            dest = os.path.relpath(mapping[resolved], mapping[source.resolve()].parent)
            return m.group(1) + '(' + dest + ('#' + anchor if anchor else '') + ')'
        # Local source links stay inspectable as literal paths rather than broken site routes.
        return m.group(1) + ' (`' + target + '`, source checkout)'
    return re.sub(r'(!?\[[^\]]*\])\(([^)]+)\)', link, text)
entries = []
for group, repo, label in [('ps2', args.ps2, 'PS2 implementation notes'), ('research', args.research, 'Historical / cross-platform research')]:
    for source in sorted((repo / 'docs').rglob('*.md')):
        if source.name in {'CODEX_HANDOFF.md', 'STATUS.md'} or 'superpowers' in source.parts:
            continue
        entries.append((source, root / 'docs' / group / source.relative_to(repo / 'docs'), repo, label))
for name in ['native-ai-research.md', 'native-weapon-tests.md']:
    source = args.session / 'work' / name
    if source.exists(): entries.append((source, root / 'docs/native' / name, None, 'Native PS2 investigation evidence'))
def sanitize(text):
    text = re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '[session metadata omitted]', text, flags=re.I)
    text = re.sub(r"Claude(?:'s)?|Antigravity|Gemini", 'prior investigation', text, flags=re.I)
    text = re.sub(r'(?i)codex', 'workspace', text)
    text = re.sub(r'(?i)\bsubagents?\b|\bagents?\b', 'investigation', text)
    text = re.sub(r'(?i)\bparent\b', 'integration', text)
    return text
# Remove excluded older snapshots from prior imports, while preserving owner-created pages.
for stale in ['docs/ps2/CODEX_HANDOFF.md', 'docs/ps2/STATUS.md', 'docs/research/STATUS.md', 'docs/ps2/superpowers/plans/2026-10-16-macos-takeover.md']:
    (root / stale).unlink(missing_ok=True)
mapping = {s.resolve(): d for s,d,_,_ in entries}
for source, dest, repo, label in entries:
    raw = source.read_bytes()
    relative = str(source.relative_to(repo)) if repo else str(source.relative_to(args.session))
    revision = git(repo, 'rev-parse', 'HEAD') if repo else 'session working notes'
    dirty = git(repo, 'status', '--porcelain', '--', relative) if repo else 'working notes'
    digest = hashlib.sha256(raw).hexdigest()
    warning = ('This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. ' if 'research' in dest.parts or 'historical' in dest.parts or source.name == 'GAMEPLAY_MODS_RE.md' else '')
    warning += 'Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.'
    provenance = f'\n\n:::note Source and evidence\n{label}. {warning}\n\nSource: `{relative}` in `{repo.name if repo else "investigation session"}`. Repository HEAD: `{revision}`. Working-copy modifications: `{"yes" if dirty else "no"}`. Source SHA-256: `{digest}`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.\n:::\n\n'
    content = render(sanitize(raw.decode('utf-8')), source, mapping)
    # Keep the heading first so Docusaurus derives a useful title.
    lines = content.splitlines(keepends=True)
    if lines and lines[0].startswith('# '): content = lines[0] + provenance + ''.join(lines[1:])
    else: content = '# ' + source.stem.replace('_',' ') + provenance + content
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content)
    manifest.append({'page': str(dest.relative_to(root)), 'source_repository': repo.name if repo else 'investigation session', 'source_path': relative, 'repository_head': revision, 'working_copy_modified': bool(dirty), 'source_sha256': digest})
(root / 'knowledge-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Imported {len(entries)} Markdown sources; provenance recorded in knowledge-manifest.json')

# Subsystem-first navigation and stable machine retrieval resources.
static = root / 'static'
static.mkdir(exist_ok=True)
index = []
categories = {}
def classify(name):
    if any(k in name for k in ['BATTLE', 'GAMEPLAY_MODS', 'native-ai', 'native-weapon']): return 'cars', 'combat-and-ai'
    if 'ai_and_path' in name: return 'cars', 'ai-and-navigation'
    if 'vehicles' in name: return 'models', 'vehicles-and-damage'
    if 'maps_and' in name: return 'terrain', 'tracks-landscape-and-skybox'
    if 'physics' in name: return 'physics', 'collision-and-rigid-bodies'
    if 'HUD' in name: return 'hud', 'anchors-and-scaling'
    if any(k in name for k in ['KEYBOARD','INPUT','PLAYER_']): return 'gui', 'input-and-player-controls'
    if any(k in name for k in ['event_injection', 'game_modes']): return 'menus', 'event-selection'
    if any(k in name for k in ['GS_', 'RENDER', 'LOD_', 'DETAIL_', 'CAMERA', 'VULKAN']): return 'engine', 'rendering'
    if any(k in name for k in ['MODDING', 'mod_tools', 'engine_overhauls']): return 'engine', 'modding-and-formats'
    return 'engine', 'runtime-and-platform'
for item in manifest:
    path = root / item['page']
    content = path.read_text()
    title = re.search(r'^# (.+)', content, re.M).group(1)
    category, subcategory = classify(path.stem)
    platform = 'PS2 SLUS_209.10' if '/ps2/' in item['page'] or '/native/' in item['page'] else 'mixed Xbox / PS2; verify per claim'
    historical = '/research/' in item['page'] or path.name == 'GAMEPLAY_MODS_RE.md'
    evidence = 'historical-unverified' if historical else ('static-analysis-and-cpu-tests; live-gameplay-pending' if path.name in ['BATTLE_RECOVERY.md','native-ai-research.md','native-weapon-tests.md'] else 'source-reported; verify per claim')
    docid = str(path.relative_to(root/'docs').with_suffix(''))
    tags = [category, subcategory, 'ps2' if platform.startswith('PS2') else 'cross-platform', 'historical' if historical else 'technical-reference']
    record = dict(id=docid, title=title, category=category, subcategory=subcategory, tags=tags, platform=platform, evidence=evidence,
        source_revision=item['repository_head'], source_path=item['source_path'], source_repository=item['source_repository'], source_sha256=item['source_sha256'],
        url='https://catsandsoup.github.io/testdriveeveofdestructionwiki/'+docid+'/', raw_url='https://catsandsoup.github.io/testdriveeveofdestructionwiki/raw/'+docid+'.md',
        function_addresses=sorted(set(re.findall(r'\b(?:f_)?(?:0x)?00[0-9a-fA-F]{6}\b',content))), dependencies=[], dependencies_status='not-extracted; consult source')
    index.append(record)
    header='---\ntags: '+json.dumps(tags)+'\n---\n'
    path.write_text(header+content)
    rawpath=static/'raw'/path.relative_to(root/'docs')
    rawpath.parent.mkdir(parents=True,exist_ok=True)
    rawpath.write_text(content)
    categories.setdefault(category,{}).setdefault(subcategory,[]).append(docid)
sidebar=['index']
for category, subs in sorted(categories.items()):
    sidebar.append(dict(type='category',label=category,items=[dict(type='category',label=sub,items=ids) for sub,ids in sorted(subs.items())]))
(root/'sidebars.js').write_text('module.exports = '+json.dumps(dict(knowledge=sidebar),indent=2)+';\n')
(static/'knowledge-index.json').write_text(json.dumps(dict(schema_version=1, purpose='LLM modding retrieval; evidence is per claim', entries=index),indent=2)+'\n')
(static/'llms.txt').write_text('# Test Drive: Eve of Destruction technical knowledge\n\nUse knowledge-index.json to filter by category, subcategory, tags, platform and evidence. Each entry has a stable id, canonical URL, raw Markdown URL, source revision/path/hash, address candidates and dependency status. Address candidates are lexical mentions, not verified function symbols. Never treat historical or source-reported claims as current verified behavior. Empty dependencies means not extracted.\n\n- [Structured index](https://catsandsoup.github.io/testdriveeveofdestructionwiki/knowledge-index.json)\n- [Full Markdown corpus](https://catsandsoup.github.io/testdriveeveofdestructionwiki/llms-full.txt)\n')
(static/'llms-full.txt').write_text('\n\n'.join('## '+i['id']+'\n'+(static/'raw'/(i['id']+'.md')).read_text() for i in index))
print(f'Indexed {len(index)} technical sources by subsystem; raw corpus and LLM manifests ready')
