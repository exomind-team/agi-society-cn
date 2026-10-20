#!/usr/bin/env python3
"""Package an already built offline preview. Standard library only; never publish."""
import argparse, hashlib, json, re, subprocess, zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
def sha(data): return hashlib.sha256(data).hexdigest()
def package(source, destination, allow_dirty=False):
    source, destination = Path(source), Path(destination)
    provenance = json.loads((source / 'build-provenance.json').read_text())
    commit = provenance['sourceCommit']
    if not re.fullmatch(r'[a-f0-9]{40}', commit): raise ValueError('Invalid source commit')
    if provenance.get('sourceDirty') and not allow_dirty: raise ValueError('Refuse a dirty-source public release')
    manifest = (source / 'source-dist-manifest.txt').read_bytes()
    if sha(manifest) != provenance['sourceDistManifestSha256']: raise ValueError('Dist manifest hash mismatch')
    html = (source / 'AGI-Wiki-完整离线预览.html').read_bytes()
    match = re.search(rb'<script id="offline-data" type="application/json">(.*?)</script>', html, re.S)
    if not match: raise ValueError('No offline payload')
    payload = json.loads(match.group(1))
    boundary = json.loads((ROOT / 'scripts/offline/release-boundary.json').read_text())
    routes = set(payload['pages'])
    if routes != set(boundary['routes']): raise ValueError('Page boundary changed; review release-boundary.json')
    sources = set(payload['sourceFiles'])
    if sources != set(boundary['sourceFiles']): raise ValueError('Attachment boundary changed; review before release')
    unlisted = sorted(p for p,v in payload['pages'].items() if v.get('unlisted'))
    if unlisted != boundary['unlisted']: raise ValueError('Unlisted boundary changed')
    if payload['audit']['sourceCommit'] != commit: raise ValueError('HTML/source commit mismatch')
    if payload['audit']['sourceDistManifestSha256'] != sha(manifest): raise ValueError('HTML/source manifest mismatch')
    destination.mkdir(parents=True, exist_ok=True)
    files = {'wiki-preview.html': html, 'source-dist-manifest.txt': manifest,
             'build-provenance.json': (source / 'build-provenance.json').read_bytes()}
    metadata = {'sourceCommit':commit, 'sourceDirty':bool(provenance.get('sourceDirty')), 'sourceDistManifestSha256':sha(manifest),
                'htmlSha256':sha(html), 'pages':len(routes), 'unlisted':unlisted,
                'boundary':'Public repository snapshot only. Unlisted is not private; embedded pages remain accessible.'}
    files['release-manifest.json'] = (json.dumps(metadata, ensure_ascii=False, indent=2)+'\n').encode()
    files['README.txt'] = ('AGI Wiki 离线预览\n解压后打开 wiki-preview.html；正文无需安装或联网，外部视频、论文链接仍需网络。\n'
        '社区仅本地演示：草稿不会发布；不含账号、SSO 或真实论坛。\n'
        '未索引资料仍嵌入文件、可直接访问，不是私密材料或访问控制。\n'
        '仅打包已审阅的公开仓库页面与附件；不从工作区或聊天搜集其他文件。\n'
        '源码版本：'+commit+'\nHTML SHA256：'+sha(html)+'\n'
        '可用 PowerShell Get-FileHash -Algorithm SHA256 wiki-preview.html 检查。\n').encode('utf-8')
    files['SHA256SUMS.txt'] = ''.join(f'{sha(v)}  {k}\n' for k,v in sorted(files.items())).encode()
    archive=destination / f'agi-wiki-preview-{commit[:12]}.zip'
    with zipfile.ZipFile(archive, 'x', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name,data in sorted(files.items()): z.writestr(name,data)
    with zipfile.ZipFile(archive) as z:
        if z.testzip(): raise ValueError('ZIP integrity failed')
        for name,data in files.items():
            if z.read(name) != data: raise ValueError('ZIP roundtrip mismatch')
    (destination/'SHA256SUMS.txt').write_text(f'{sha(archive.read_bytes())}  {archive.name}\n')
    (destination/'release-manifest.json').write_bytes(files['release-manifest.json'])
    (destination/'release-notes.md').write_text(f'AGI Wiki 单文件离线预览。源码 `{commit}`。\n\n下载 ZIP、解压并打开 `wiki-preview.html`。社区功能仅本地演示，不发布。未索引原料仍可访问，不是私密资料。\n\nHTML SHA256: `{sha(html)}`\n\nDist manifest SHA256: `{sha(manifest)}`\n')
    return metadata
if __name__ == '__main__':
    p=argparse.ArgumentParser(); p.add_argument('--source',default=str(ROOT/'delivery/offline')); p.add_argument('--output',default=str(ROOT/'delivery/release')); p.add_argument('--allow-dirty',action='store_true',help='Local QA only; workflow never uses this')
    a=p.parse_args(); print(json.dumps(package(a.source,a.output,a.allow_dirty),ensure_ascii=False,indent=2))
