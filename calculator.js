// Independent geometry implementation. No third-party calculator code or assets.
function parseCoordinates(value) {
  const number = '([+-]?\\d+(?:[.,]\\d+)?)';
  const labelled = new RegExp('^\\s*x\\s*[:=]?\\s*'+number+'\\s*[,; ]+\\s*y\\s*[:=]?\\s*'+number+'\\s*$','i');
  const plain = new RegExp('^\\s*'+number+'(?:\\s*;\\s*|\\s+,?\\s*|\\s*,\\s*)'+number+'\\s*$');
  const match = value.match(labelled) || value.match(plain);
  if (!match) throw new Error('Введите координаты в формате x98.43, y110.38 или 98.43; 110.38.');
  const pair = match.slice(1).map(n => Number(n.replace(',', '.')));
  if (pair.some(n => !Number.isFinite(n) || Math.abs(n) > 100000)) throw new Error('Проверьте значения координат.');
  return pair;
}
function calculateRange(gun, target, northAxis = 1) {
  const dx = target[0] - gun[0];
  const dy = target[1] - gun[1];
  const distance = Math.hypot(dx, dy) * 100;
  const azimuth = distance === 0 ? null : (Math.atan2(dx, dy * northAxis) * 180 / Math.PI + 360) % 360;
  return {distance, azimuth};
}
document.querySelector('#range-form').addEventListener('submit', event => {
  event.preventDefault();
  const result = document.querySelector('#range-result');
  try {
    const gun = parseCoordinates(document.querySelector('#gun-coordinates').value);
    const target = parseCoordinates(document.querySelector('#target-coordinates').value);
    const value = calculateRange(gun, target, Number(document.querySelector('#north-axis').value));
    result.textContent = `Расстояние: ${value.distance.toLocaleString('ru', {maximumFractionDigits:1})} м. ${value.azimuth === null ? 'Точки совпадают — направление не определено.' : 'Азимут: '+value.azimuth.toLocaleString('ru', {maximumFractionDigits:1})+'°.'}`;
  } catch (error) {
    result.textContent = error.message;
  }
});
