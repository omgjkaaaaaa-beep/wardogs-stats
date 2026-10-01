const content = document.querySelector('#content');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate = timestamp => new Date(timestamp).toLocaleDateString('ru', {timeZone:'Europe/Moscow',day:'numeric',month:'long',year:'numeric'});

function renderNews(data) {
  document.querySelector('#feed-updated').textContent = `Лента обновлена ${formatDate(data.updated_at)} · ${new Date(data.updated_at).toLocaleTimeString('ru', {timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit'})} МСК`;
  if (!data.news.length) {
    content.innerHTML = '<div class="empty">В официальной ленте пока нет публикаций.</div>';
    return;
  }
  content.innerHTML = `<div class="section-head"><div><div class="eyebrow">ОБЪЯВЛЕНИЯ РАЗРАБОТЧИКОВ</div><h2>Последние новости</h2></div><span class="muted">Официальная лента Steam</span></div><div class="news-grid">${data.news.map(n => `<article class="about news-card"><div class="eyebrow"><time datetime="${new Date(n.date * 1000).toISOString()}">${formatDate(n.date * 1000)}</time> · STEAM</div><h2>${escapeHtml(n.title)}</h2><span class="muted">${n.translated ? 'Русский перевод-пересказ' : 'Перевод готовится · оригинальный заголовок'}</span>${n.summary ? '<p>' + escapeHtml(n.summary).replace(/\n\n/g, '</p><p>') + '</p>' : '<p>Эту новость ещё не перевели. Пока можно прочитать оригинал.</p>'}<a href="${escapeHtml(n.url)}" target="_blank" rel="noopener noreferrer">Читать в Steam ↗</a></article>`).join('')}</div>`;
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
