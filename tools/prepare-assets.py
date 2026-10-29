from PIL import Image
from pathlib import Path
import json
import shutil
import re
root=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parents[1]/'public'
# Names transcribed from the supplied player artwork, in filename order.
data=[
('Argentina','AR','Pacific',4,['Robin Lee','Chase Baird','Stephen Nicknish','Connie Inselmann',None]),
('Brazil','BR','Atlantic',1,['Kate Skokin',None,'Rokas (Rocky) Kersulis','Johnny Le','Chris Szalo']),
('Cape Verde','CV','Pacific',0,[None,'Anna Schelkopf','Tim Suter','Sudi Korba','David Ginsberg']),
('Columbia','CO','Atlantic',3,['Ryan Kosowski','Teresa Huelskoetter','Casey Sincavage',None,'Valentina Tabares']),
('Fiji','FJ','Pacific',0,[None,'Zoe Chambers','Liz Mazzocco','Murtaza Raza','Kevin Ma']),
('Germany','DE','Atlantic',0,[None,'Gina Sammarco','Jeremy Kloess','Ron Lampen','Laura Sues']),
('Greece','GR','Pacific',4,['Amanda McCleary','Michael Garcia','Lara Stehlik','JJ Przybylka',None]),
('Ireland','IE','Pacific',1,['Jason March',None,'Torie Lichti','Dawn Bell','Jim Ferguson']),
('Italy','IT','Atlantic',1,['Ryan Melzer',None,'Dan Slinger','Morgan Steinys','Melissa Henry']),
('Korea','KR','Atlantic',4,['Jenny Park','Austin Paik','Jill Ko','Dongwann Kim',None]),
('Spain','ES','Pacific',3,['Natalie Silver','Andrew Silver','Adi Vijayan',None,'Kelly Merydith']),
('Ukraine','UA','Pacific',2,['Ernesta Glutkinaite','Tiffany Hauser',None,'Peter Reuling','Sergey Spisovskiy']),
('USA','US','Atlantic',2,['Kash Abbas','Tati Washington',None,'Alice Velcherean','Adam Long']),
('Vatican City','VA','Atlantic',0,[None,'Eric Zito','Rachel Goldberg','Maly Foote','Matt Schapiro']),
('Venezuela','VE','Pacific',1,['Anna Trinh',None,'Thai Tran','Bridget Aguado','Gino Peluso']),
('Vietnam','VN','Atlantic',1,['Allyson Kolpas',None,'Bella Zanotti','Long Huynh','Nico Smith'])
]
stable_ids={'Gina Sammarco':'gina-samarco','Torie Lichti':'torie-licht','Peter Reuling':'peter-behling'}
teams=[]
for folder,code,division,poster,names in data:
    slug=('Colombia' if folder=='Columbia' else folder).lower().replace(' ','-')
    files=sorted((root/folder).glob('*.jp*'))
    assets=[]
    for i,p in enumerate(files):
        # Brazil's replacement player has a separate supplied card.
        replacement = folder == 'Brazil' and names[i] == 'Johnny Le'
        if replacement:
            p = root / folder / 'E2FCF032-E8F8-4174-BD3B-132789558F6A.png'
        im=Image.open(p).convert('RGB'); im.thumbnail((800,1050))
        name='assets/brazil-johnny-le.webp' if replacement else f'assets/{slug}-{i}.webp'
        im.save(out/name,'WEBP',quality=86)
        assets.append(name)
    teams.append(dict(id=slug,name='Colombia' if folder=='Columbia' else folder,code=code,division=division,art=assets[poster],players=[dict(id=stable_ids.get(n,re.sub('[^a-z0-9]+','-',n.lower()).strip('-')),name=n,image=assets[i]) for i,n in enumerate(names) if n]))
for i,p in enumerate(sorted(root.glob('*.jp*'))):
    im=Image.open(p).convert('RGB'); im.thumbnail((1600,1600)); im.save(out/f'assets/league-{i}.webp','WEBP',quality=90)
shutil.copyfile(root/'EPL Logo.png',out/'assets/epl-logo.png')
(out/'data.js').write_text('window.EPL_DATA = '+json.dumps(dict(teams=teams),ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
roster=[dict(p,teamId=t['id'],country=t['name'],division=t['division']) for t in teams for p in t['players']]
(out.parent/'data/roster.json').write_text(json.dumps(roster,indent=2)+'\n',encoding='utf-8')
print(f'Prepared {len(teams)} teams and {sum(len(t["players"]) for t in teams)} player cards.')
