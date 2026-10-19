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
        entries.append((source, root / 'docs' / group / source.relative_to(repo / 'docs'), repo, label))
for name in ['native-ai-research.md', 'native-weapon-tests.md']:
    source = args.session / 'work' / name
    if source.exists(): entries.append((source, root / 'docs/native' / name, None, 'Native PS2 investigation evidence'))
source = args.session / 'outputs/antigravity-battle-investigation.md'
if source.exists(): entries.append((source, root / 'docs/historical' / source.name, None, 'Historical investigation inventory; claims require revalidation'))
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
    content = render(raw.decode('utf-8'), source, mapping)
    # Keep the heading first so Docusaurus derives a useful title.
    lines = content.splitlines(keepends=True)
    if lines and lines[0].startswith('# '): content = lines[0] + provenance + ''.join(lines[1:])
    else: content = '# ' + source.stem.replace('_',' ') + provenance + content
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content)
    manifest.append({'page': str(dest.relative_to(root)), 'source_repository': repo.name if repo else 'investigation session', 'source_path': relative, 'repository_head': revision, 'working_copy_modified': bool(dirty), 'source_sha256': digest})
(root / 'knowledge-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Imported {len(entries)} Markdown sources; provenance recorded in knowledge-manifest.json')
