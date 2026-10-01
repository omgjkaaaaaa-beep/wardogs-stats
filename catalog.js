let gameItems = [];
const money = value => '$' + value.toLocaleString('ru');
const itemText = item => `${item.name} · ${money(item.price)} · ${item.role}, ур. ${item.level}`;
function fillItemSelect(select, items, selected) {
  select.replaceChildren();
  items.forEach(item => select.add(new Option(itemText(item),item.id)));
  if (items.some(item => item.id === selected)) select.value = selected;
}
function filterCatalog() {
  const category = document.querySelector('#catalog-category').value;
  const role = document.querySelector('#catalog-role').value;
  const query = document.querySelector('#catalog-search').value.trim().toLocaleLowerCase('ru');
  const select = document.querySelector('#catalog-item');
  const filtered = gameItems.filter(item => (!category || item.category === category) && (!role || item.role === role) && item.name.toLocaleLowerCase('ru').includes(query));
  fillItemSelect(select,filtered,select.value);
  document.querySelector('#catalog-add').disabled = !filtered.length;
  describeSelection();
}
function describeSelection() {
  const item = gameItems.find(item => item.id === document.querySelector('#catalog-item').value);
  document.querySelector('#catalog-detail').textContent = item ? `${item.name}: ${money(item.price)} за покупку; роль — ${item.role}, уровень ${item.level}. Масса: ${item.weight === null ? 'не указана' : item.weight.toLocaleString('ru')+' кг'}. Разблокировка: ${item.unlock_price === null ? 'цена неизвестна' : money(item.unlock_price)}. Цена разблокировки не входит в бюджет комплекта.` : 'По этим фильтрам ничего не найдено.';
}
function renderComparison() {
  const a = gameItems.find(item => item.id === document.querySelector('#compare-a').value);
  const b = gameItems.find(item => item.id === document.querySelector('#compare-b').value);
  if (!a || !b) return;
  const extraRows = [...new Set([...Object.keys(a.details || {}),...Object.keys(b.details || {})])].map(key => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(a.details?.[key] || 'Нет данных')}</td><td>${escapeHtml(b.details?.[key] || 'Нет данных')}</td></tr>`).join('');
  document.querySelector('#comparison-result').innerHTML = `<div class="table-wrap"><table><thead><tr><th>Показатель</th><th>${escapeHtml(a.name)}</th><th>${escapeHtml(b.name)}</th></tr></thead><tbody><tr><td>Цена покупки</td><td>${money(a.price)}</td><td>${money(b.price)}</td></tr><tr><td>Масса</td><td>${a.weight === null ? 'Не указана' : a.weight.toLocaleString('ru')+' кг'}</td><td>${b.weight === null ? 'Не указана' : b.weight.toLocaleString('ru')+' кг'}</td></tr><tr><td>Роль</td><td>${escapeHtml(a.role)}</td><td>${escapeHtml(b.role)}</td></tr><tr><td>Уровень доступа по роли</td><td>${a.level}</td><td>${b.level}</td></tr><tr><td>Разблокировка</td><td>${a.unlock_price === null ? 'Нет данных' : money(a.unlock_price)}</td><td>${b.unlock_price === null ? 'Нет данных' : money(b.unlock_price)}</td></tr>${extraRows}</tbody></table></div><p>Разница в цене покупки: ${money(Math.abs(a.price-b.price))}.</p>`;
}
function vehicleCost(item, count, unlocked) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 10000) throw new Error('Введите целое число покупок от 1 до 10 000.');
  const purchases = item.price * count;
  const unlock = unlocked ? 0 : item.unlock_price;
  return {purchases,unlock,total:unlock === null ? null : purchases + unlock};
}
function renderVehicle() {
  const item = gameItems.find(item => item.id === document.querySelector('#vehicle-select').value);
  if (!item) return;
  const result = document.querySelector('#vehicle-result');
  try {
    const value = vehicleCost(item,Number(document.querySelector('#vehicle-count').value),document.querySelector('#vehicle-unlocked').value === 'yes');
    result.textContent = `${item.name}: ${money(item.price)} за одну покупку. На выбранное количество: ${money(value.purchases)}. ${value.unlock === null ? 'Цена разблокировки неизвестна — полный итог посчитать нельзя.' : 'Разблокировка: '+money(value.unlock)+'. Итого: '+money(value.total)+'.'} Роль: ${item.role}, уровень ${item.level}.`;
  } catch(error) { result.textContent = error.message; }
}
fetch('./items.json',{cache:'no-store'})
  .then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); })
  .then(data => {
    if (data.game !== 'WARDOGS' || !Array.isArray(data.items) || !data.items.length) throw new Error('Invalid catalog');
    if (data.items.some(item => typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.role !== 'string' || typeof item.category !== 'string' || !Number.isSafeInteger(item.price) || item.price < 0 || !Number.isSafeInteger(item.level) || item.level < 0 || !(item.weight === null || Number.isFinite(item.weight) && item.weight >= 0) || !(item.unlock_price === null || Number.isSafeInteger(item.unlock_price) && item.unlock_price >= 0))) throw new Error('Invalid catalog item');
    gameItems = data.items;
    renderArsenal();
    const status = document.querySelector('#catalog-status');
    status.textContent = `${gameItems.length} позиций. Цены из руководства сообщества, обновлённого 30 сентября 2026 года. Собрано 1 октября. Номер патча не указан; цены не проверены в магазине игры. `;
    const link = document.createElement('a');link.href='https://steamcommunity.com/sharedfiles/filedetails/?id=3809584533';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Источник ↗';status.append(link);
    for (const category of new Set(gameItems.map(item=>item.category))) document.querySelector('#catalog-category').add(new Option(category,category));
    for (const role of new Set(gameItems.map(item=>item.role))) document.querySelector('#catalog-role').add(new Option(role,role));
    filterCatalog();
    const personalItems = gameItems;
    fillItemSelect(document.querySelector('#compare-a'),personalItems,personalItems.find(item=>item.name==='M4')?.id);
    fillItemSelect(document.querySelector('#compare-b'),personalItems,personalItems.find(item=>item.name==='AK74')?.id);
    fillItemSelect(document.querySelector('#vehicle-select'),gameItems.filter(item=>item.category==='Транспорт'));
    renderComparison();renderVehicle();
  })
  .catch(()=>{document.querySelector('#catalog-status').textContent='Каталог сейчас не загрузился. Пока можно добавить предметы вручную.';document.querySelector('#vehicle-result').textContent='Цены транспорта недоступны.';document.querySelector('#comparison-result').textContent='Не удалось загрузить предметы для сравнения.';});
for (const selector of ['#catalog-category','#catalog-role','#catalog-search']) document.querySelector(selector).addEventListener('input',filterCatalog);
document.querySelector('#catalog-item').addEventListener('change',describeSelection);
document.querySelector('#catalog-add').addEventListener('click',()=>{
  const item = gameItems.find(item=>item.id===document.querySelector('#catalog-item').value);
  if (!item) return;
  addBudgetItem({name:item.name,price:item.price,quantity:1});
  document.querySelector('#budget-result').textContent='Предмет добавлен по цене каталога. Пересчитайте бюджет.';
});
for (const selector of ['#compare-a','#compare-b']) document.querySelector(selector).addEventListener('change',renderComparison);
for (const selector of ['#vehicle-select','#vehicle-unlocked','#vehicle-count']) document.querySelector(selector).addEventListener('input',renderVehicle);

function renderArsenal() {
  const query = document.querySelector('#arsenal-search').value.trim().toLocaleLowerCase('ru');
  const category = document.querySelector('#arsenal-category').value;
  const order = document.querySelector('#arsenal-sort').value;
  const items = gameItems.filter(item => (!category || item.category === category) && [item.name,item.role,...Object.values(item.details || {})].join(' ').toLocaleLowerCase('ru').includes(query));
  items.sort((a,b) => order === 'cheap' ? a.price-b.price : order === 'level' ? a.level-b.level : a.name.localeCompare(b.name,'ru'));
  document.querySelector('#arsenal-count').textContent = `Найдено: ${items.length} из ${gameItems.length}`;
  const grid = document.querySelector('#arsenal-grid');
  grid.innerHTML = items.map(item => {
    const details = Object.entries(item.details || {}).map(([key,value]) => `<div><dt>${escapeHtml(key === 'Макс.скорость' ? 'Макс. скорость (по источнику)' : key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    const image = item.image_url && /^https:\/\/images\.steamusercontent\.com\//.test(item.image_url) ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" loading="lazy" width="320" height="180">` : '<span class="item-image-empty">Изображение пока не добавлено</span>';
    return `<article class="item-card"><div class="item-image">${image}</div><div class="item-body"><span class="eyebrow">${escapeHtml(item.category)} / ${escapeHtml(item.role)}</span><h3>${escapeHtml(item.name)}</h3><div class="item-price">${money(item.price)} <small>за покупку</small></div><p>${escapeHtml(item.description || `Предмет для роли «${item.role}». Открывается на уровне ${item.level}.`)}</p><details><summary>Все характеристики</summary><dl class="item-stats"><div><dt>Уровень доступа</dt><dd>${item.level}</dd></div><div><dt>Масса</dt><dd>${item.weight === null ? 'Нет данных' : item.weight.toLocaleString('ru')+' кг'}</dd></div><div><dt>Разблокировка</dt><dd>${item.unlock_price === null ? 'Нет данных' : money(item.unlock_price)}</dd></div>${details}</dl><a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3809584533" target="_blank" rel="noopener noreferrer">Источник характеристик ↗</a></details><button type="button" data-kit-item="${escapeHtml(item.id)}">Добавить в комплект</button></div></article>`;
  }).join('');
  grid.querySelectorAll('img').forEach(img => img.addEventListener('error',()=>{const fallback=document.createElement('span');fallback.className='item-image-empty';fallback.textContent='Изображение не загрузилось';img.replaceWith(fallback);},{once:true}));
}
for (const selector of ['#arsenal-search','#arsenal-category','#arsenal-sort']) document.querySelector(selector).addEventListener('input',renderArsenal);
document.querySelector('#arsenal-grid').addEventListener('click',event=>{
  const button=event.target.closest('[data-kit-item]');if(!button)return;
  const item=gameItems.find(item=>item.id===button.dataset.kitItem);if(!item)return;
  addBudgetItem({name:item.name,price:item.price,quantity:1});
  document.querySelector('#budget-result').textContent=`${item.name} добавлен в комплект. Пересчитайте бюджет.`;
  button.textContent='Добавлено ✓';
});
