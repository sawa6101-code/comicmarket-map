(() => {
  const STORAGE = 'comicmarket-map-v7';
  const STATUS_BORDER = {
    COMPLETED: '#22c55e',
    SOLD_OUT: '#ef4444'
  };

  function updateStatusBorders() {
    const markers = document.querySelectorAll('#markers .marker[data-marker]');
    if (!markers.length) return;
    let state = null;
    try { state = JSON.parse(localStorage.getItem(STORAGE)); } catch (_) {}
    const circles = Array.isArray(state?.circles) ? state.circles : [];
    const byId = new Map(circles.map(c => [String(c.id), c]));

    markers.forEach(marker => {
      const circle = byId.get(String(marker.dataset.marker));
      marker.style.border = '2px solid rgba(255,255,255,.95)';
      marker.style.boxShadow = '0 1px 4px rgba(0,0,0,.35)';
      if (circle?.status === 'SOLD_OUT') {
        marker.style.border = '4px solid #ef4444';
        marker.style.boxShadow = '0 0 0 1px rgba(127,29,29,.35), 0 1px 5px rgba(0,0,0,.4)';
      } else if (circle?.status === 'COMPLETED') {
        marker.style.border = '4px solid #22c55e';
        marker.style.boxShadow = '0 0 0 1px rgba(20,83,45,.25), 0 1px 5px rgba(0,0,0,.4)';
      }
    });
  }

  const start = () => {
    const markers = document.getElementById('markers');
    if (!markers) return;
    new MutationObserver(updateStatusBorders).observe(markers, { childList: true, subtree: true, attributes: true });
    updateStatusBorders();
    window.addEventListener('storage', updateStatusBorders);
    setInterval(updateStatusBorders, 500);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
