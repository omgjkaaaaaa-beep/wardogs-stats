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
  document.querySelector('#comparison-result').innerHTML = `<div class="table-wrap"><table><thead><tr><th>Показатель</th><th>${escapeHtml(a.name)}</th><th>${escapeHtml(b.name)}</th></tr></thead><tbody><tr><td>Цена покупки</td><td>${money(a.price)}</td><td>${money(b.price)}</td></tr><tr><td>Масса</td><td>${a.weight === null ? 'Не указана' : a.weight.toLocaleString('ru')+' кг'}</td><td>${b.weight === null ? 'Не указана' : b.weight.toLocaleString('ru')+' кг'}</td></tr><tr><td>Роль</td><td>${escapeHtml(a.role)}</td><td>${escapeHtml(b.role)}</td></tr><tr><td>Уровень доступа по роли</td><td>${a.level}</td><td>${b.level}</td></tr></tbody></table></div><p>Разница в цене покупки: ${money(Math.abs(a.price-b.price))}.</p>`;
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
    const status = document.querySelector('#catalog-status');
    status.textContent = `${gameItems.length} позиций. Цены из руководства сообщества, обновлённого 30 сентября 2026 года. Собрано 1 октября. Номер патча не указан; цены не проверены в магазине игры. `;
    const link = document.createElement('a');link.href='https://steamcommunity.com/sharedfiles/filedetails/?id=3809584533';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Источник ↗';status.append(link);
    for (const category of new Set(gameItems.map(item=>item.category))) document.querySelector('#catalog-category').add(new Option(category,category));
    for (const role of new Set(gameItems.map(item=>item.role))) document.querySelector('#catalog-role').add(new Option(role,role));
    filterCatalog();
    const personalItems = gameItems.filter(item => item.category !== 'Транспорт');
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
