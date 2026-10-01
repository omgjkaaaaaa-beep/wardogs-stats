let priceEntries=[];
function russianRequirement(text){return text.replace(/Career level/gi,'Карьера, уровень').replace(/Support level/gi,'Поддержка, уровень').replace(/Default/gi,'Доступно по умолчанию').replace(/Free/gi,'Бесплатно').replace(/N\/A/gi,'Условия не указаны');}
function renderPrices(){
  const query=document.querySelector('#price-search').value.trim().toLocaleLowerCase('ru');const filter=document.querySelector('#price-filter').value;
  const rows=priceEntries.filter(i=>(filter==='all'||filter==='known'&&i.unlock_price!==null||filter==='unknown'&&i.unlock_price===null||filter==='ammo'&&i.category==='Боеприпасы и припасы')&&[i.name,i.category,i.requirement].join(' ').toLocaleLowerCase('ru').includes(query));
  const known=priceEntries.filter(i=>i.unlock_price!==null).length;
  document.querySelector('#price-coverage').textContent=`Всего ${priceEntries.length} позиций. Цена разблокировки известна у ${known}; нужно уточнить ${priceEntries.length-known}. По вашему фильтру: ${rows.length}.`;
  document.querySelector('#price-table').innerHTML=`<table><thead><tr><th>Предмет</th><th>Покупка</th><th>Разблокировка</th><th>Условия доступа</th><th>Источник</th></tr></thead><tbody>${rows.map(i=>`<tr><td>${escapeHtml(i.name)}<br><small>${escapeHtml(i.category)}</small></td><td>${i.price===null?'Не указана':money(i.price)}</td><td>${i.unlock_price===null?'Требует уточнения':i.unlock_price===0?'Бесплатно':money(i.unlock_price)}</td><td>${escapeHtml(i.requirement)}</td><td><a href="${escapeHtml(i.source_url)}" target="_blank" rel="noopener noreferrer">${i.official?'Разработчики':'Сообщество'} ↗</a></td></tr>`).join('')}</tbody></table>`;
  document.querySelector('#price-status').textContent=rows.length?'':'По этим фильтрам предметы не найдены.';
}
Promise.all([fetch('./items.json').then(r=>{if(!r.ok)throw Error();return r.json()}),fetch('./ammunition.json').then(r=>{if(!r.ok)throw Error();return r.json()})]).then(([catalog,ammo])=>{
  if(!Array.isArray(catalog.items)||!Array.isArray(ammo.items))throw Error();
  const entries=[...catalog.items.map(i=>({...i,requirement:`${i.level_track||i.role}, уровень ${i.level}`,source_url:i.unlock_source_url||catalog.source_url,official:!!i.unlock_source_url})),...ammo.items.map(i=>({...i,category:'Боеприпасы и припасы',requirement:russianRequirement(i.requirement),official:false}))];
  if(entries.some(i=>typeof i.name!=='string'||!(i.price===null||Number.isSafeInteger(i.price)&&i.price>=0)||!(i.unlock_price===null||Number.isSafeInteger(i.unlock_price)&&i.unlock_price>=0)||!/^https:\/\/(steamcommunity\.com|steamstore-a\.akamaihd\.net)\//.test(i.source_url)))throw Error();
  priceEntries=entries;renderPrices();
}).catch(()=>{document.querySelector('#price-coverage').textContent='Не удалось загрузить таблицу цен. Попробуйте обновить страницу.';});
for(const id of ['price-search','price-filter'])document.getElementById(id).addEventListener('input',renderPrices);
