// League sponsorship levels supplied by Elite Pickleball, October 29, 2026.
export const PARTNERS = [
  {id:'proton',name:'Proton Sports',tier:'platinum',url:'https://protonsports.com/'},
  {id:'natures-path',name:'Nature’s Path',tier:'gold',url:'https://naturespath.com/'},
  {id:'fox-valley',name:'Fox Valley Orthopedics',tier:'gold',url:'https://fvortho.com/'},
  {id:'pickled',name:'Pickled',tier:'gold',url:'https://www.ugotpickled.com/',dark:true},
  {id:'pickleball-clubhouse',name:'Pickleball Clubhouse Chicago',tier:'silver',url:'https://www.pickleballclub.house/'},
  {id:'chicago-academy',name:'Chicago Pickleball Academy',tier:'silver',url:'https://www.chicagopickleballacademy.com/'},
  {id:'dk-chiropractic',name:'DK Chiropractic Wellness Center',tier:'silver',url:'https://www.dkchirowellness.com/'},
  {id:'quad-city',name:'Quad City Tennis Club',tier:'silver',url:'https://quadcitytennisclub.com/',dark:true,monochrome:true},
  {id:'farmers-fridge',name:'Farmer’s Fridge',tier:'silver',url:'https://www.farmersfridge.com/'},
  {id:'spine-pain',name:'Spine Pain & Performance Center',tier:'silver',url:'https://www.spinepainpc.com/'},
  {id:'top-renu',name:'Top ReNu Medicine',tier:'silver',url:'https://toprenu.com/'},
  {id:'weinert-team',name:'The Weinert Team · Berkshire Hathaway',tier:'silver',url:'https://carolweinert.com/'},
  {id:'partly-sunny',name:'Partly Sunny',tier:'silver',url:'https://www.partlysunnypb.com/'},
  {id:'ninja',name:'Ninja Pickleball Club',tier:'bronze',url:'https://ninjapickleballclub.com/',dark:true},
  {id:'pickle-tv',name:'PickleTV',tier:'bronze',url:'https://pickletv.com/',dark:true},
  {id:'joma',name:'Joma Sport',tier:'bronze',url:'https://www.joma-sport.com/',dark:true,monochrome:true}
];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=tier=>tier[0].toUpperCase()+tier.slice(1);
const logo=partner=>`<div class="partner-logo-panel${partner.dark?' partner-logo-dark':''}${partner.monochrome?' partner-logo-monochrome':''}"><img src="assets/partners/${partner.id}.webp" alt="" loading="lazy" width="600" height="360"></div>`;
const card=(partner,featured=false)=>`<a class="partner-card partner-${partner.tier}" href="${partner.url}" target="_blank" rel="noopener" data-partner="${partner.id}" aria-label="Visit ${esc(partner.name)} — ${title(partner.tier)} partner (opens a new tab)">${featured?`<span class="partner-card-tier">${title(partner.tier)} partner</span>`:''}${logo(partner)}<div class="partner-card-caption"><h3>${esc(partner.name)}</h3><span aria-hidden="true">↗</span></div></a>`;

export function renderPartners(){
  const platinum=PARTNERS.find(partner=>partner.tier==='platinum');
  document.querySelector('#home-partner-content').innerHTML=`<div class="section-heading home-partners-heading"><div><p class="eyebrow">THE PEOPLE BEHIND THE LEAGUE</p><h2>Our league partners.</h2></div><a class="text-link" href="#partners">Meet all 16 partners <span aria-hidden="true">↗</span></a></div><div class="home-partner-grid">${PARTNERS.filter(partner=>['platinum','gold'].includes(partner.tier)).map(partner=>card(partner,true)).join('')}</div>`;
  document.querySelector('#partner-directory').innerHTML=`<section id="partner-tier-platinum" class="partner-tier partner-tier-platinum" aria-labelledby="platinum-title"><div class="partner-tier-heading"><h2 id="platinum-title">Platinum partner</h2><span>2026–2027 SEASON</span></div><article class="platinum-feature" data-partner="${platinum.id}"><a class="platinum-logo-link" href="${platinum.url}" target="_blank" rel="noopener" aria-label="Visit Proton Sports (opens a new tab)">${logo(platinum)}</a><div class="platinum-feature-copy"><p class="eyebrow">POWERING THE WORLD LEAGUE</p><h3>Proton Sports</h3><p>Platinum partner of the 2026–2027 Elite Pickleball World League.</p><a class="text-link" href="${platinum.url}" target="_blank" rel="noopener">Visit Proton Sports <span aria-hidden="true">↗</span></a></div></article></section>${['gold','silver','bronze'].map(tier=>`<section id="partner-tier-${tier}" class="partner-tier partner-tier-${tier}" aria-labelledby="${tier}-title"><div class="partner-tier-heading"><h2 id="${tier}-title">${title(tier)} partners</h2><span>${PARTNERS.filter(partner=>partner.tier===tier).length} LEAGUE PARTNERS</span></div><div class="partner-grid">${PARTNERS.filter(partner=>partner.tier===tier).map(partner=>card(partner)).join('')}</div></section>`).join('')}`;
}
