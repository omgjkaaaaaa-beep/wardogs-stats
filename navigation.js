// Group the existing tools without changing calculator state or saved kits.
const toolSection = document.querySelector('#tools');
const toolNames = [['range-tool','Расстояние'],['budget-tool','Комплект'],['compare-tool','Сравнение'],['vehicle-tool','Техника'],['ammo-tool','Боеприпасы']];
const toolPanels = [];
for (const [id] of toolNames) {
  const target = document.getElementById(id);
  const heading = target.classList.contains('about') ? target.previousElementSibling : target.closest('.section-head');
  const body = heading.nextElementSibling;
  const panel = document.createElement('div');panel.dataset.toolPanel=id;heading.before(panel);panel.append(heading,body);toolPanels.push(panel);
}
const toolTabs=document.createElement('div');toolTabs.className='tool-tabs';toolTabs.setAttribute('aria-label','Калькуляторы');
for (const [id,name] of toolNames) {const a=document.createElement('a');a.href='#'+id;a.textContent=name;toolTabs.append(a);}
toolSection.prepend(toolTabs);
const panes={home:['home','online','game-gallery'],maps:['maps-screen','map-planner'],tools:['tools'],catalog:['arsenal'],guides:['guides'],news:['content'],achievements:['achievements']};
const globalNotice=document.querySelector('main > .notice');const launcher=document.querySelector('.tool-launcher');
function showPage(scroll=false) {
  const id=decodeURIComponent(location.hash.slice(1)) || 'home';
  const target=document.getElementById(id);
  let page=Object.entries(panes).find(([,ids])=>ids.some(root=>root===id || target && document.getElementById(root)?.contains(target)))?.[0] || 'home';
  for(const [name,ids] of Object.entries(panes))for(const root of ids)document.getElementById(root).hidden=name!==page;
  launcher.hidden=page!=='home';globalNotice.hidden=page!=='home'&&page!=='news';
  const selected=toolNames.some(([tool])=>tool===id)?id:'budget-tool';
  for(const panel of toolPanels)panel.hidden=panel.dataset.toolPanel!==selected;
  for(const a of toolTabs.querySelectorAll('a')){const active=a.hash==='#'+selected;a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');}
  for(const a of document.querySelectorAll('header nav a')){const key=Object.entries(panes).find(([,ids])=>ids.includes(a.hash.slice(1)))?.[0];const active=key===page;a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');}
  if(scroll){if(page==='maps'&&id==='map-planner')target.scrollIntoView({block:'start'});else window.scrollTo({top:0,behavior:'instant'});}
}
window.addEventListener('hashchange',()=>showPage(true));showPage();
for(const button of document.querySelectorAll('[data-world-map]'))button.addEventListener('click',()=>{
  const slug=button.dataset.worldMap;const name=button.textContent;
  const url='https://wardogs.n4lab.dev/?map='+slug+'&mode=view&lang=ru';
  document.querySelector('#world-map').src=url;document.querySelector('#world-map').title='Интерактивная карта '+name+' от N4Lab';document.querySelector('#world-map-link').href=url;
  for(const tab of document.querySelectorAll('[data-world-map]'))tab.setAttribute('aria-pressed',String(tab===button));
  document.querySelector('#plan-map').value=name;document.querySelector('#plan-map').dispatchEvent(new Event('change'));
});
