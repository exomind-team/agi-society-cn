"""Bounded packaging QA against an existing local offline build. No network."""
import importlib.util,json,tempfile,unittest,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('release',ROOT/'scripts/offline/release.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class ReleaseTests(unittest.TestCase):
 def test_roundtrip_and_no_overwrite(self):
  with tempfile.TemporaryDirectory() as td:
   meta=mod.package(ROOT/'delivery/offline',td,True)
   archive=next(Path(td).glob('*.zip'))
   with zipfile.ZipFile(archive) as z:
    self.assertEqual(len(z.namelist()),6);self.assertIn('wiki-preview.html',z.namelist())
    self.assertEqual(mod.sha(z.read('wiki-preview.html')),meta['htmlSha256'])
    self.assertEqual(len(meta['unlisted']),12)
    standalone=next(Path(td).glob('*.html'))
    self.assertEqual(standalone.read_bytes(),z.read('wiki-preview.html'))
    sums=dict(line.split('  ',1)[::-1] for line in (Path(td)/'SHA256SUMS.txt').read_text().splitlines())
    self.assertEqual(sums[standalone.name],meta['htmlSha256'])
    self.assertEqual(sums[archive.name],mod.sha(archive.read_bytes()))
   with self.assertRaises(FileExistsError):mod.package(ROOT/'delivery/offline',td,True)
 def test_invalid_source_identity(self):
  for mutation in [{'sourceCommit':'not-a-sha'},{'sourceDirty':True}]:
   with tempfile.TemporaryDirectory() as td:
    p=Path(td);d=json.loads((ROOT/'delivery/offline/build-provenance.json').read_text());d.update(mutation)
    (p/'build-provenance.json').write_text(json.dumps(d))
    with self.assertRaises(ValueError):mod.package(p,p/'out')
 def test_manifest_tamper(self):
  with tempfile.TemporaryDirectory() as td:
   p=Path(td);d=json.loads((ROOT/'delivery/offline/build-provenance.json').read_text());d['sourceDirty']=False
   (p/'build-provenance.json').write_text(json.dumps(d));(p/'source-dist-manifest.txt').write_text('tampered')
   with self.assertRaisesRegex(ValueError,'manifest'):mod.package(p,p/'out')
if __name__=='__main__':unittest.main()
