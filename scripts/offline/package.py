#!/usr/bin/env python3
"""Create a fresh delivery directory. Never modify the source or overwrite a package."""
import argparse, hashlib, json, re
from pathlib import Path

def package(source, destination, chunk_size=5_000_000):
    source, destination = Path(source), Path(destination)
    if not 1 <= chunk_size <= 5_000_000: raise ValueError('Invalid chunk size')
    if not source.is_file() or not source.stat().st_size: raise ValueError('Source is missing/empty')
    destination.mkdir(parents=True, exist_ok=False)
    output = 'wiki-community-demo.html'
    total = hashlib.sha256(); size = 0; parts = []
    with source.open('rb') as f:
        i = 0
        while True:
            data = f.read(chunk_size)
            if not data: break
            i += 1; name = f'{output}.{i:04d}.part'
            (destination/name).write_bytes(data)
            parts.append(dict(index=i,name=name,size=len(data),sha256=hashlib.sha256(data).hexdigest()))
            total.update(data); size += len(data)
    manifest = dict(schema=1,output=output,size=size,sha256=total.hexdigest(),parts=parts)
    raw = (json.dumps(manifest, indent=2, ensure_ascii=True)+'\n').encode()
    (destination/'manifest.json').write_bytes(raw)
    manifest_hash = hashlib.sha256(raw).hexdigest()
    for name in ['merge.py','merge.ps1']:
        text = (Path(__file__).parent/(name+'.in')).read_text()
        (destination/name).write_text(text.replace('@MANIFEST_SHA256@',manifest_hash),encoding='utf-8')
    (destination/'README-Windows.txt').write_text('''Windows 合并步骤\n\n1. 下载所有 .part、manifest.json、merge.py、merge.ps1 到同一个文件夹。不要改名，不要编辑 manifest，不要手动拼接或调整顺序。\n2. 在这个文件夹打开终端。任选一种命令：\n\nPython（推荐，已安装 Python 3）：\npy -3 .\\merge.py\n\nPowerShell（执行策略允许本地脚本时）：\npowershell -NoProfile -File .\\merge.ps1\n\n如果 PowerShell 阻止运行，不要更改执行策略或权限，直接使用上面的 Python 命令。\n3. 显示 Verified 后，用浏览器打开 wiki-community-demo.html。\n\n脚本固定校验原始 manifest 的 SHA256，按固定序列逐块校验大小/SHA256，且校验合并结果的总 SHA256。缺块、改名、损坏、互换内容或编辑清单都会报错，不发布最终 HTML。临时文件经总校验成功后才原子发布；所有 part 文件保留。已有同名 HTML 若完全相同则只验证并提示；不同则拒绝覆盖。Python 使用原子硬链接发布再移除临时名，需要支持硬链接的文件系统（Windows 推荐本地 NTFS）；不支持时安全失败，可使用 PowerShell。\n\nSHA256 用于检测缺失与意外损坏，不能证明来自可信作者；不要运行来源不明的合并脚本。\n''',encoding='utf-8-sig')
    return manifest

if __name__ == '__main__':
    p=argparse.ArgumentParser(); p.add_argument('source'); p.add_argument('destination'); a=p.parse_args()
    print(json.dumps(package(a.source,a.destination),indent=2))
