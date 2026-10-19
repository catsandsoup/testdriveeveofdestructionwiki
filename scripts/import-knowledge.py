#!/usr/bin/env python3
"""Import Markdown only; do not copy executable, disc, generated, capture or binary assets."""
import argparse, hashlib, json, re, subprocess
from datetime import date
from pathlib import Path
parser = argparse.ArgumentParser()
import os
parser.add_argument('--ps2', type=Path, default=Path(os.environ.get('EOD_PS2_SOURCE', '../eod-recomp')))
parser.add_argument('--research', type=Path, default=Path(os.environ['EOD_RESEARCH_SOURCE']) if 'EOD_RESEARCH_SOURCE' in os.environ else None)
args = parser.parse_args()
# Fail before touching published outputs if PS2 source checkout is unavailable.
if not (args.ps2 / "docs").is_dir() or not any((args.ps2 / "docs").rglob("*.md")):
    parser.error(f"Missing or empty PS2 source documentation: {args.ps2 / 'docs'}")
imported_date = date.today().isoformat()
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
    if not repo:
        continue
    for source in sorted((repo / 'docs').rglob('*.md')):
        if source.name in {'CODEX_HANDOFF.md', 'STATUS.md', 'DEVELOPER_HANDOFF.md', 'PLAYER_JOURNEY.md', 'PLAYER_SUCCESS_AND_STAR.md', 'MODDING_IDEAS.md', 'mod_tools_roadmap.md', 'native-ai-research.md', 'native-weapon-tests.md'} or 'superpowers' in source.parts:
            continue
        entries.append((source, root / 'docs' / group / source.relative_to(repo / 'docs'), repo, label))
def sanitize(text, source):
    # Public titles describe mechanisms, not the research session that produced them.
    public_titles = {
        'DETAIL_PRESETS.md': 'Rendering detail presets',
        'INPUT_CONTINUATION.md': 'Controller allocation and input routing',
        'GS_COLD_PACKET_REPLAY.md': 'Clean-start GS packet replay',
        'RECOMP_RENDERER_RECON.md': 'Renderer architecture and dependencies',
        'RENDERER_REFERENCES.md': 'PS2, Vulkan and MoltenVK reference contracts',
        'MACOS.md': 'macOS and Apple Silicon runtime',
        'engine_overhauls_specs.md': 'Engine extension proposals — unverified designs',
        'game_modes_specs.md': 'Custom game-mode proposals — unverified designs',
    }
    if source.name in public_titles:
        text = re.sub(r'^# [^\n]+', '# ' + public_titles[source.name], text, count=1, flags=re.M)
    text = re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '[metadata omitted]', text, flags=re.I)
    text = re.sub(r"Claude(?:'s)?|Antigravity|Gemini|Codex", 'documentation process', text, flags=re.I)
    # Preserve literal VAL `parent` keys and technical agent/ownership terminology.
    text = text.replace('Parent integration', 'Integration validation')
    # Remove human workflow references while preserving technical owner indices, slots and ownership.
    text = re.sub(r"(?i)\bthe owner's (?:thin black lines|M2 Pro|PS2 disc|Xbox disc|local machine|personal configuration|own saves|design doc|Road Trip reference|priority|requirements?)\b", 'the cited', text)
    text = re.sub(r"(?i)\bowner-provided\b", 'provided', text)
    text = re.sub(r"(?i)\bby the owner\b", 'in the source', text)
    text = re.sub(r"(?i)\bthe owner explicitly (?:requires|requested|promoted|prioritizes)\b", 'the documented requirements', text)
    text = re.sub(r"(?i)\bowner priority update\b", 'Technical scope update', text)
    text = re.sub(r"(?i)\bpriority set by owner\b", 'Recorded priority', text)
    text = re.sub(r"(?i)\bpersonal (?:Mac app|builds|configuration)\b", 'local build', text)
    replacements = {
        'The stopped documentation process job left investigation only. ': '',
        'The stopped documentation process job left investigation only.': '',
        'the stopped documentation process job left investigation only.': '',
        "the user's final instruction limited validation to their4x setting.": '',
        "Runs use isolated memory cards, not the owner's saves.": 'Runs used isolated memory card data.',
        'The owner requested removal of the “Get back in the race!” countdown, while': 'A change removes the “Get back in the race!” countdown, while',
        "The checkpoint intentionally does not claim the owner's entire Battle/chicken request is complete.": 'The checkpoint intentionally does not claim that Battle and course-navigation acceptance is complete.',
        'the owner’s thin black lines': 'the observed thin black lines',
        "the owner's thin black lines": 'the observed thin black lines',
        "the owner's own Xbox disc": 'the Xbox disc',
        "the owner's machine": 'specific hardware',
        "the owner’s machine": 'specific hardware',
        "DLSS is explicitly the very last priority per the owner;": '',
        "No private chats, game execution, builds or GPU workloads were used. ": '',
        "Local `AGENTS.md` and `RENDERER_REFERENCES.md` supplied requirements only; their conclusions were not treated as independent evidence.": '',
        "See the main branch's docs/DEVELOPER_HANDOFF.md for current owner priorities, build instructions and branch map.": 'Consult the source repository for current build instructions and implementation status.',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r'(?im)^.*\b(?:The owner explicitly requires|Priority set by owner)\b.*$', '', text)
    text = re.sub(r'(?im)^.*documentation process (?:controller )?job.*$', '', text)
    text = re.sub(r'(?im)^.*the user.s final instruction.*$', '', text)
    text = re.sub(r'(?i)(?:/Users|/private/tmp|/tmp)/[^\s`)\]]+', '[local path omitted]', text)
    text = re.sub(r'(?i)[^\n.!?]*\bthe owner(?:[’\']s)?\b[^\n.!?]*[.!?]', '', text)
    text = re.sub(r'(?i)[^\n.!?]*\bthe user[’\']s own\b[^\n.!?]*[.!?]', '', text)
    text = re.sub(r'(?i)[^\n.!?]*\bpersonal (?:priority|roadmap|preference|configuration|build)\b[^\n.!?]*[.!?]', '', text)
    text = re.sub(r'(?im)^.*(?:work/(?:input|lod|cpu-write|t2p|codex)|private/tmp/).*$\n?', '', text)
    text = text.replace("the owner's own Xbox disc", 'the Xbox disc')
    text = text.replace("the owner's **Xbox** disc", 'the **Xbox** disc')
    text = text.replace("the owner's **PS2**", 'the **PS2**')
    text = text.replace("the owner owns", 'the rights holder owns')
    text = text.replace("the user's own files", 'the source files')
    text = text.replace("the owner's BMS script", 'the BMS script')
    text = text.replace("per the owner", '')
    text = text.replace("the owner's PS2 disc read in place", 'the PS2 disc read in place')
    text = text.replace("the owner’s M2 Pro", 'the target hardware')
    text = text.replace("the owner's M2 Pro", 'the target hardware')
    text = text.replace("no EOD/M2 Pro measurements", 'no EOD hardware measurements')
    text = text.replace("no EOD/M2 Pro", 'no EOD hardware')
    if source.name == 'MODDING_SCOPE.md':
        start, end = text.find('## Technical scope update'), text.find('## 0. Summary')
        if start >= 0 and end > start:
            text = text[:start] + '## Scope and evidence\n\nThis page records format, data, and implementation feasibility findings for the PS2 version. Claims marked as guesses remain unverified; platform-specific evidence is identified per section.\n\n' + text[end:]
        a, b = text.find('| # | Idea |'), text.find('### 0.1 PS2 hook points found')
        if a >= 0 and b > a:
            text = text[:a] + text[b:]
    if source.name in {'GAMEPLAY_MODS_RE.md', 'RENDERER_REFERENCES.md'}:
        text = text.replace('Executive Summary & investigation Handoff', 'Technical summary')
        text = re.sub(r'(?im)^.*(?:owner|investigation session|private chats|local `investigation\.md`).*$', '', text)
    if source.name == 'index.md' and 'docs/wiki' in source.as_posix():
        text = re.sub(r'(?im)^.*(?:mod_tools_roadmap|Community Mod Tools Roadmap).*\n?', '', text)
    text = text.replace('MODDING_IDEAS', 'unverified design proposal')
    text = re.sub(r"The checkpoint intentionally does not claim the owner's entire Battle/chicken\s+request is complete\.", 'The checkpoint intentionally does not claim that Battle and course-navigation acceptance is complete.', text)
    text = re.sub(r'\n## STAR handoff.*\Z', '', text, flags=re.S)
    return text
# Remove excluded planning and workflow pages, plus their stale retrieval copies.
for stale in ['docs/ps2/CODEX_HANDOFF.md', 'docs/ps2/STATUS.md', 'docs/research/STATUS.md', 'docs/ps2/DEVELOPER_HANDOFF.md', 'docs/ps2/PLAYER_JOURNEY.md', 'docs/ps2/PLAYER_SUCCESS_AND_STAR.md', 'docs/ps2/MODDING_IDEAS.md', 'docs/research/MODDING_IDEAS.md', 'docs/native/native-ai-research.md', 'docs/native/native-weapon-tests.md', 'docs/research/wiki/mod_tools_roadmap.md', 'docs/ps2/superpowers/plans/2026-10-16-macos-takeover.md']:
    destination = root / stale
    destination.unlink(missing_ok=True)
    (root / 'static' / 'raw' / Path(stale).relative_to('docs')).unlink(missing_ok=True)
mapping = {s.resolve(): d for s,d,_,_ in entries}
for source, dest, repo, label in entries:
    raw = source.read_bytes()
    relative = str(source.relative_to(repo))
    revision = git(repo, 'rev-parse', 'HEAD') if repo else 'session working notes'
    dirty = git(repo, 'status', '--porcelain', '--', relative) if repo else 'working notes'
    digest = hashlib.sha256(raw).hexdigest()
    content = render(sanitize(raw.decode('utf-8'), source), source, mapping)
    content = '\n'.join(line.rstrip() for line in content.splitlines()).rstrip() + '\n'
    # Keep heading first
    lines = content.splitlines(keepends=True)
    if lines and lines[0].startswith('# '):
        content = lines[0] + '\n' + ''.join(lines[1:]).lstrip('\n')
    else:
        content = '# ' + source.stem.replace('_', ' ') + '\n\n' + content
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content)
    manifest.append({'page': str(dest.relative_to(root)), 'source_repository': repo.name if repo else 'native evidence source', 'source_path': relative, 'repository_head': revision, 'working_copy_modified': bool(dirty), 'source_sha256': digest})
(root / 'knowledge-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Imported {len(entries)} Markdown sources; provenance recorded in knowledge-manifest.json')

# Subsystem-first navigation and stable machine retrieval resources.
static = root / 'static'
static.mkdir(exist_ok=True)
index = []
categories = {}
def classify(name):
    if any(k in name for k in ['BATTLE', 'native-ai', 'native-weapon']): return 'cars', 'combat-and-ai'
    if 'GAMEPLAY_MODS' in name: return 'engine', 'modding-and-formats'
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
    historical = '/research/' in item['page']
    evidence = 'historical-unverified' if historical else ('static-analysis-cpu-tests-and-bounded-gameplay; consult per-claim limits' if path.name in ['BATTLE_RECOVERY.md','native-ai-research.md','native-weapon-tests.md'] else 'source-reported; verify per claim')
    docid = str(path.relative_to(root/'docs').with_suffix(''))
    tags = [category, subcategory, 'ps2' if platform.startswith('PS2') else 'cross-platform', 'historical' if historical else 'technical-reference']
    record = dict(id=docid, title=title, category=category, subcategory=subcategory, tags=tags, platform=platform, evidence=evidence,
        source_revision=item['repository_head'], source_path=item['source_path'], source_repository=item['source_repository'], source_sha256=item['source_sha256'],
        url='https://catsandsoup.github.io/testdriveeveofdestructionwiki/'+docid+'/', raw_url='https://catsandsoup.github.io/testdriveeveofdestructionwiki/raw/'+docid+'.md',
        function_addresses=sorted(set(re.findall(r'\b(?:f_)?(?:0x)?00[0-9a-fA-F]{6}\b',content))), dependencies=[], dependencies_status='not-extracted; consult source')
    if path.name == 'BATTLE_RECOVERY.md': record['tags'] += ['weapons', 'trajectory', 'battle', 'bots', 'native-abi']
    index.append(record)
    header='---\ntags: '+json.dumps(tags)+'\n---\n'
    if not content.startswith('---\n'):
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
