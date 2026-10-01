const content = document.querySelector('#content');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate = timestamp => new Date(timestamp).toLocaleDateString('ru', {timeZone:'Europe/Moscow',day:'numeric',month:'long',year:'numeric'});

function renderNews(data) {
  document.querySelector('#feed-updated').textContent = `Лента обновлена ${formatDate(data.updated_at)} · ${new Date(data.updated_at).toLocaleTimeString('ru', {timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit'})} МСК`;
  if (!data.news.length) {
    content.innerHTML = '<div class="empty">В официальной ленте пока нет публикаций.</div>';
    return;
  }
  content.innerHTML = `<div class="section-head"><div><div class="eyebrow">ОБЪЯВЛЕНИЯ РАЗРАБОТЧИКОВ</div><h2>Последние новости</h2></div><span class="muted">Официальная лента Steam</span></div><label class="news-search">Поиск по новостям<input id="news-search" type="search" placeholder="Например: второй сезон"></label><p id="news-count" class="muted" aria-live="polite"></p><div class="news-grid">${data.news.map(n => `<article class="about news-card"><div class="eyebrow"><time datetime="${new Date(n.date * 1000).toISOString()}">${formatDate(n.date * 1000)}</time> · STEAM</div><h2>${escapeHtml(n.title)}</h2><span class="muted">${n.translated ? 'Русский перевод-пересказ' : 'Перевод готовится · оригинальный заголовок'}</span>${n.summary ? '<p>' + escapeHtml(n.summary).replace(/\n\n/g, '</p><p>') + '</p>' : '<p>Эту новость ещё не перевели. Пока можно прочитать оригинал.</p>'}<a href="${escapeHtml(n.url)}" target="_blank" rel="noopener noreferrer">Читать в Steam ↗</a></article>`).join('')}</div>`;
  document.querySelector('#news-search').addEventListener('input', event => {
    const query = event.target.value.trim().toLocaleLowerCase('ru');
    let visible = 0;
    document.querySelectorAll('.news-card').forEach(card => { card.hidden = !card.textContent.toLocaleLowerCase('ru').includes(query); if (!card.hidden) visible++; });
    document.querySelector('#news-count').textContent = visible ? 'Найдено публикаций: '+visible : 'По этому запросу ничего не найдено.';
  });
}

content.innerHTML = '<div class="empty">Загружаем новости WARDOGS…</div>';
fetch('./news.json', {cache:'no-store'})
  .then(response => { if (!response.ok) throw new Error('News unavailable'); return response.json(); })
  .then(data => {
    if (data.app_id !== 1867240 || !Array.isArray(data.news) || !Number.isFinite(Date.parse(data.updated_at))) throw new Error('Invalid news feed');
    for (const item of data.news) {
      if (typeof item.title !== 'string' || !Number.isFinite(item.date) || !Number.isFinite(new Date(item.date * 1000).getTime()) || typeof item.url !== 'string' || !/^https:\/\/steamcommunity\.com\/games\/1867240\/announcements\/detail\/\d+$/.test(item.url)) throw new Error('Invalid news item');
    }
    renderNews(data);
  })
  .catch(() => {
    document.querySelector('#feed-updated').textContent = 'Лента временно недоступна';
    content.innerHTML = '<div class="empty">Не удалось загрузить новости. Попробуйте обновить страницу позже. <a href="https://store.steampowered.com/news/app/1867240">Открыть официальную ленту Steam ↗</a></div>';
  });

fetch('./overview.json', {cache:'no-store'})
  .then(response => { if (!response.ok) throw new Error('Overview unavailable'); return response.json(); })
  .then(data => {
    if (data.app_id !== 1867240 || !Number.isInteger(data.player_count) || data.player_count < 0 || !Array.isArray(data.achievements) || !Number.isFinite(Date.parse(data.updated_at))) throw new Error('Invalid overview');
    if (data.achievements.some(a => typeof a.title !== 'string' || typeof a.description !== 'string' || !Number.isFinite(a.percent) || a.percent < 0 || a.percent > 100)) throw new Error('Invalid achievements');
    const time = new Date(data.updated_at).toLocaleTimeString('ru', {timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit'});
    const stale = Date.now() - Date.parse(data.updated_at) > 3 * 60 * 60 * 1000;
    document.querySelector('#online').innerHTML = `<div class="online-strip"><div><span class="eyebrow">ОНЛАЙН В STEAM</span><strong>${data.player_count.toLocaleString('ru')}</strong><span>игроков на момент обновления</span></div><small>${formatDate(data.updated_at)} · ${time} МСК${stale ? ' · данные устарели' : ''}</small></div>`;
    document.querySelector('#achievements').innerHTML = `<div class="section-head"><div><div class="eyebrow">STEAM / WARDOGS</div><h2>Достижения</h2></div></div><p>Доля игроков, получивших достижение, по данным Steam. Названия и описания переведены нами.</p><div class="achievement-controls"><label>Поиск<input id="achievement-search" type="search" placeholder="Название или условие"></label><label><input id="remaining-only" type="checkbox">Только неотмеченные</label></div><p class="muted">Можно отметить полученные достижения вручную. Это ваши заметки в браузере, без синхронизации со Steam.</p><p id="achievement-status" class="muted" aria-live="polite"></p><div class="table-wrap"><table><thead><tr><th>Достижение</th><th>Получили</th></tr></thead><tbody>${data.achievements.map(a => `<tr data-achievement="${escapeHtml(a.name)}"><td>${escapeHtml(a.title)}<small>${escapeHtml(a.description)}</small><label class="achievement-mark"><input type="checkbox" class="achievement-done" aria-label="Отметить: ${escapeHtml(a.title)}">Получено</label></td><td class="rating">${a.percent.toLocaleString('ru')}%</td></tr>`).join('')}</tbody></table></div><p class="muted">Обновлено ${formatDate(data.updated_at)} · ${time} МСК${stale ? ' · данные устарели' : ''}</p>`;
    setupAchievementChecklist();
  })
  .catch(() => {
    document.querySelector('#online').innerHTML = '<div class="notice">Онлайн Steam сейчас недоступен.</div>';
    document.querySelector('#achievements').innerHTML = '<div class="empty">Не удалось загрузить достижения. Попробуйте обновить страницу позже.</div>';
  });

function setupAchievementChecklist() {
  let marked = new Set();
  let storageAvailable = true;
  try { const data = JSON.parse(localStorage.getItem('wardogs-achievements') || '[]'); if (Array.isArray(data)) marked = new Set(data.filter(v => typeof v === 'string')); } catch { storageAvailable = false; }
  const rows = [...document.querySelectorAll('[data-achievement]')];
  function filter() {
    const query = document.querySelector('#achievement-search').value.trim().toLocaleLowerCase('ru');
    const remaining = document.querySelector('#remaining-only').checked;
    let visible = 0;
    rows.forEach(row => {row.hidden = !row.textContent.toLocaleLowerCase('ru').includes(query) || (remaining && marked.has(row.dataset.achievement));if (!row.hidden) visible++;});
    const completed = rows.filter(row => marked.has(row.dataset.achievement)).length;
    document.querySelector('#achievement-status').textContent = `Отмечено: ${completed} из ${rows.length}. Найдено: ${visible}.` + (storageAvailable ? '' : ' Браузер не разрешил сохранить отметки; после обновления они могут исчезнуть.');
  }
  rows.forEach(row => {
    const checkbox = row.querySelector('.achievement-done');checkbox.checked = marked.has(row.dataset.achievement);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) marked.add(row.dataset.achievement);else marked.delete(row.dataset.achievement);
      try {localStorage.setItem('wardogs-achievements',JSON.stringify([...marked]));} catch {storageAvailable = false;}
      filter();
    });
  });
  document.querySelector('#achievement-search').addEventListener('input',filter);
  document.querySelector('#remaining-only').addEventListener('change',filter);
  filter();
}
