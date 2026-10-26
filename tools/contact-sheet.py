from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
root = Path(__file__).resolve().parents[2]
out = Path(__file__).resolve().parent
folders = [root] + sorted(p for p in root.iterdir() if p.is_dir() and p.name != 'epl-world-league-site')
for start in range(0, len(folders), 4):
    group = folders[start:start+4]
    sheet = Image.new('RGB', (1500, len(group)*340), '#e6e6e6')
    d = ImageDraw.Draw(sheet)
    for row, folder in enumerate(group):
        files=sorted(p for p in folder.iterdir() if p.suffix.lower() in ('.jpg','.jpeg','.png'))
        d.text((10,row*340+3), folder.name, fill='black')
        for col,p in enumerate(files):
            im=Image.open(p).convert('RGB')
            im.thumbnail((290,300))
            sheet.paste(im,(col*300,row*340+25))
            d.text((col*300+4,row*340+325), f'{col}: {p.name[:15]}', fill='black')
    sheet.save(out/f'contact-{start//4}.jpg')
