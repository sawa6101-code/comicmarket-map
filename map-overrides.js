/* Additional official maps supplied by the user.
   This layer keeps the existing app logic intact while enabling the two
   additional local map assets without iframe/web-page rendering. */
(() => {
  const ASSETS = {
    '東123': { src: './maps/east123.webp', ratio: 1320 / 571 },
    '西12': { src: './maps/west12.webp', ratio: 1201 / 860 },
    '東7': { src: './maps/east7.jpg', ratio: 874 / 877 },
    '南12': { src: './maps/south12.jpg', ratio: 1253 / 698 }
  };

  const readState = () => {
    try { return JSON.parse(localStorage.getItem('comicmarket-map-v6') || 'null') || {}; }
    catch { return {}; }
  };

  const apply = (mapId) => {
    const asset = ASSETS[mapId];
    if (!asset) return;
    const img = document.getElementById('mapImage');
    const canvas = document.getElementById('mapCanvas');
    const title = document.getElementById('mapTitle');
    const hint = document.getElementById('mapHint');
    if (img) {
      img.src = asset.src;
      img.alt = `コミケット公式 ${mapId} 白地図`;
    }
    if (canvas) canvas.style.aspectRatio = asset.ratio;
    if (title) title.textContent = `${readState().day || '1日目'}・${mapId}`;
    if (hint) hint.textContent = '画像を直接操作できます。ピンチで拡大、ドラッグで移動';
  };

  const install = () => {
    const maps = document.getElementById('maps');
    if (!maps) return;
    const current = readState().map || '東123';
    maps.innerHTML = Object.keys(ASSETS).map(id =>
      `<button class="${current === id ? 'active' : ''}" data-map="${id}">${id}</button>`
    ).join('');
    maps.addEventListener('click', (e) => {
      const b = e.target.closest('[data-map]');
      if (!b) return;
      e.stopImmediatePropagation();
      const state = readState();
      state.map = b.dataset.map;
      localStorage.setItem('comicmarket-map-v6', JSON.stringify(state));
      location.reload();
    }, true);
    apply(current);
  };

  window.addEventListener('load', install, { once: true });
})();
