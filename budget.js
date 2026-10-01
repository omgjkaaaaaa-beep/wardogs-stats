const budgetItems = document.querySelector('#budget-items');
const kitStatus = document.querySelector('#kit-status');
let itemSequence = 0;
function addBudgetItem(item = {name:'',price:0,quantity:1}) {
  if (budgetItems.children.length >= 30) { kitStatus.textContent = 'В комплект можно добавить до 30 позиций.'; return; }
  const row = document.createElement('div');
  row.className = 'budget-row';
  const id = ++itemSequence;
  row.innerHTML = `<label for="item-name-${id}">Предмет</label><input id="item-name-${id}" class="item-name" maxlength="80" placeholder="Название"><label for="item-price-${id}">Цена за штуку</label><input id="item-price-${id}" class="item-price" type="number" min="0" max="1000000000" step="1" required><label for="item-quantity-${id}">Количество</label><input id="item-quantity-${id}" class="item-quantity" type="number" min="1" max="10000" step="1" required><button type="button" class="remove-item">Убрать</button>`;
  row.querySelector('.item-name').value = item.name;
  row.querySelector('.item-price').value = item.price;
  row.querySelector('.item-quantity').value = item.quantity;
  row.querySelector('.remove-item').addEventListener('click', () => { row.remove(); document.querySelector('#budget-result').textContent = 'Состав изменился — пересчитайте бюджет.'; });
  budgetItems.append(row);
}
function readBudgetItems() {
  return [...budgetItems.children].map(row => ({name:row.querySelector('.item-name').value.trim(),price:Number(row.querySelector('.item-price').value),quantity:Number(row.querySelector('.item-quantity').value)}));
}
function calculateBudget(items, wallet, reserve, deployments) {
  if (![wallet,reserve].every(n => Number.isSafeInteger(n) && n >= 0 && n <= 1e9) || !Number.isSafeInteger(deployments) || deployments < 1 || deployments > 1e4 || !items.length || items.some(i => !Number.isSafeInteger(i.price) || i.price < 0 || i.price > 1e9 || !Number.isSafeInteger(i.quantity) || i.quantity < 1 || i.quantity > 1e4)) throw new Error('Проверьте цены, количество предметов и сумму на счету.');
  const cost = items.reduce((sum,i) => sum + i.price * i.quantity,0);
  const planned = cost * deployments;
  if (!Number.isSafeInteger(cost) || !Number.isSafeInteger(planned)) throw new Error('Суммы слишком большие для точного расчёта.');
  const spendable = Math.max(0,wallet-reserve);
  return {cost,planned,affordable:cost > 0 ? Math.floor(spendable/cost) : null,shortfall:Math.max(0,planned+reserve-wallet)};
}
function loadSavedKits() {
  try {
    const data = JSON.parse(localStorage.getItem('wardogs-kits') || '{}');
    if (!data || Array.isArray(data) || typeof data !== 'object') return {};
    return Object.fromEntries(Object.entries(data).filter(([name,items]) => name.length <= 60 && Array.isArray(items) && items.length > 0 && items.length <= 30 && items.every(i => i && typeof i.name === 'string' && i.name.length <= 80 && Number.isSafeInteger(i.price) && i.price >= 0 && i.price <= 1e9 && Number.isSafeInteger(i.quantity) && i.quantity > 0 && i.quantity <= 1e4)).slice(0,20));
  } catch { kitStatus.textContent = 'Не удалось прочитать сохранённые комплекты. Калькулятор всё равно работает.'; return {}; }
}
function refreshSavedKits(selected = '') {
  const select = document.querySelector('#saved-kits');
  select.replaceChildren(new Option('Выберите комплект',''));
  for (const name of Object.keys(loadSavedKits())) select.add(new Option(name,name));
  select.value = selected;
}
function writeSavedKits(kits) {
  try { localStorage.setItem('wardogs-kits',JSON.stringify(kits));return true; }
  catch { kitStatus.textContent = 'Браузер не разрешил сохранить комплект. Расчёт работает без сохранения.';return false; }
}
document.querySelector('#add-item').addEventListener('click',()=>addBudgetItem());
document.querySelector('#budget-form').addEventListener('submit',event=>{
  event.preventDefault();const result=document.querySelector('#budget-result');
  try {
    const value=calculateBudget(readBudgetItems(),Number(document.querySelector('#wallet').value),Number(document.querySelector('#reserve').value),Number(document.querySelector('#deployments').value));
    const money=n=>'$'+n.toLocaleString('ru');
    result.textContent=`Комплект: ${money(value.cost)}. На выбранные выходы: ${money(value.planned)}. ${value.affordable===null?'Стоимость нулевая — число выходов не ограничено этим расчётом.':'Без расходования резерва хватит на '+value.affordable+' полных выходов.'} ${value.shortfall?'Для плана с резервом не хватает '+money(value.shortfall)+'.':'План укладывается в бюджет.'}`;
  } catch(error){result.textContent=error.message;}
});
document.querySelector('#save-kit').addEventListener('click',()=>{
  const name=document.querySelector('#kit-name').value.trim();if(!name){kitStatus.textContent='Введите название комплекта.';return;}
  if(!document.querySelector('#budget-form').reportValidity())return;
  const items=readBudgetItems();if(!items.length){kitStatus.textContent='Добавьте хотя бы один предмет.';return;}
  const kits=loadSavedKits();if(!Object.hasOwn(kits,name)&&Object.keys(kits).length>=20){kitStatus.textContent='Можно сохранить до 20 комплектов.';return;}
  const next=Object.fromEntries([...Object.entries(kits).filter(([key])=>key!==name),[name,items]]);
  if(writeSavedKits(next)){refreshSavedKits(name);kitStatus.textContent='Комплект сохранён в этом браузере.';}
});
document.querySelector('#load-kit').addEventListener('click',()=>{
  const name=document.querySelector('#saved-kits').value;const items=loadSavedKits()[name];if(!items){kitStatus.textContent='Выберите сохранённый комплект.';return;}
  budgetItems.replaceChildren();items.forEach(addBudgetItem);document.querySelector('#kit-name').value=name;document.querySelector('#budget-result').textContent='Комплект загружен — проверьте текущие цены и пересчитайте бюджет.';
});
document.querySelector('#delete-kit').addEventListener('click',()=>{
  const name=document.querySelector('#saved-kits').value;if(!name){kitStatus.textContent='Выберите комплект для удаления.';return;}
  const kits=loadSavedKits();delete kits[name];if(writeSavedKits(kits)){refreshSavedKits();kitStatus.textContent='Сохранённый комплект удалён.';}
});
for(const name of ['Оружие','Броня','Боеприпасы','Медикаменты'])addBudgetItem({name,price:0,quantity:1});
refreshSavedKits();
