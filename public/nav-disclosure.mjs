// Shared hover, touch, and keyboard behavior for the header previews.
export function bindNavDisclosure({root,panel,toggle,label}) {
  function setOpen(open) {
    panel.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',`${open?'Hide':'Show'} ${label}`);
    if(open)document.dispatchEvent(new CustomEvent('epl:nav-open',{detail:root}));
  }
  const close=()=>setOpen(false);
  toggle.addEventListener('click',()=>setOpen(panel.hidden));
  root.addEventListener('pointerover',event=>{
    if(event.pointerType==='mouse'&&!event.target.closest('.nav-menu-toggle'))setOpen(true);
  });
  root.addEventListener('pointerleave',()=>{if(!root.contains(document.activeElement))close();});
  root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget))close();});
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();toggle.focus();close();}
    else if(event.key==='ArrowDown'&&!panel.contains(event.target)){
      event.preventDefault();setOpen(true);panel.querySelector('a')?.focus();
    }
  });
  panel.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('click',event=>{if(!root.contains(event.target))close();});
  document.addEventListener('epl:nav-open',event=>{if(event.detail!==root)close();});
  window.addEventListener('hashchange',close);
  return {close};
}
