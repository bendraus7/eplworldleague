// Delivery conversion only: backgrounds are prepared with imagegen before this step.
import {mkdir,access} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {PARTNERS} from '../public/partners.mjs';
const source=path.resolve(process.argv[2]||'../Sponsors/Prepared');
const destination=path.resolve('public/assets/partners');
await mkdir(destination,{recursive:true});
for(const partner of PARTNERS){
  const input=path.join(source,`${partner.id}.png`);
  await access(input);
  await sharp(input).resize({width:1000,height:1000,fit:'inside',withoutEnlargement:true}).webp({lossless:true,effort:6}).toFile(path.join(destination,`${partner.id}.webp`));
  console.log(`Prepared ${partner.id}`);
}
