"""One-time asset import. Usage: python scripts/extract-catalina.py portfolio.pdf"""
import sys, json
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
out = root / 'dist/proyectos/catalina/assets'
out.mkdir(parents=True, exist_ok=True)
pdf = PdfReader(sys.argv[1])
manifest = {}
for page in [2,4,5,6,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,32,33,34,36,37,38,43,44,45,46,47,48,49,50]:
    for index, asset in enumerate(pdf.pages[page-1].images):
        im = asset.image
        if min(im.size) < 200: continue
        name = f'p{page}-{index}'
        # Keep transparency, original proportions, and never upscale the PDF assets.
        im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
        im.thumbnail((1800,1800))
        im.save(out / f'{name}.webp', quality=88)
        manifest[name] = {'width':im.width,'height':im.height,'page':page,'source':asset.name}
        im.thumbnail((640,640))
        im.save(out / f'{name}-small.webp', quality=82)
(root / 'content/catalina/images.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
