import { STATUS_OPTIONS } from "./data.js";

export function renderMap(data, selectedStationId, onSelectStation) {
  const image = data.mapImage
    ? `<img class="map-image" src="${data.mapImage}" alt="Mapa de localização das estações" />`
    : `<div class="map-fallback" aria-label="Mapa esquemático da Paraíba">
        <span class="north">N</span>
        <svg viewBox="0 0 520 360" role="img" aria-label="Mapa padrão esquemático">
          <path d="M60 248 C88 216 94 170 128 150 C170 126 178 80 228 76 C274 72 306 100 344 88 C386 74 422 92 456 122 C426 154 414 196 378 214 C336 236 324 282 276 292 C226 304 202 270 158 276 C118 282 88 270 60 248 Z" />
          <path d="M138 255 C164 230 180 210 188 176" />
          <path d="M248 292 C252 236 278 202 328 176" />
          <path d="M224 78 C232 118 260 134 298 150" />
        </svg>
      </div>`;

  const markers = data.stations
    .map((station) => {
      const status = STATUS_OPTIONS[station.status];
      const selected = station.id === selectedStationId ? " selected" : "";
      return `<button class="map-marker${selected}" style="left:${station.x}%; top:${station.y}%; --marker:${status.color}" data-marker-id="${station.id}" type="button" title="${station.name} - ${status.shortLabel}">
        <span></span>
        <strong>${station.name}</strong>
        <small>(${station.city})</small>
      </button>`;
    })
    .join("");

  setTimeout(() => {
    document.querySelectorAll("[data-marker-id]").forEach((marker) => {
      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectStation(marker.dataset.markerId);
      });
    });
  });

  return `<div class="map-box" id="mapBox">${image}${markers}</div>`;
}

export function bindMapPositioning(mapBox, getSelectedStationId, onMove) {
  if (!mapBox) return;
  mapBox.addEventListener("click", (event) => {
    const id = getSelectedStationId();
    if (!id) return;
    const rect = mapBox.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(3, Math.min(97, ((event.clientY - rect.top) / rect.height) * 100));
    onMove(id, Math.round(x), Math.round(y));
  });
}
