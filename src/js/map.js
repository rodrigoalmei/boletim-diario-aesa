import { STATUS_OPTIONS } from "./data.js";

export function renderMap(data, selectedStationId, onSelectStation) {
  const width = clampMapWidth(data.mapWidth);
  const height = clampMapHeight(data.mapHeight);
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

  return `<div class="map-box" id="mapBox" style="--map-width:${width}%; --map-height:${height}px">${image}${markers}<button class="map-resize-handle map-resize-right" type="button" data-resize-axis="x" aria-label="Redimensionar largura do mapa" title="Puxe para alterar a largura"></button><button class="map-resize-handle map-resize-bottom" type="button" data-resize-axis="y" aria-label="Redimensionar altura do mapa" title="Puxe para alterar a altura"></button><button class="map-resize-handle map-resize-corner" type="button" data-resize-axis="xy" aria-label="Redimensionar mapa" title="Puxe para alterar largura e altura"></button></div>`;
}

export function bindMapPositioning(mapBox, getSelectedStationId, onMove) {
  if (!mapBox) return;
  mapBox.addEventListener("click", (event) => {
    if (event.target.closest(".map-resize-handle")) return;
    const id = getSelectedStationId();
    if (!id) return;
    const rect = mapBox.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(3, Math.min(97, ((event.clientY - rect.top) / rect.height) * 100));
    onMove(id, Math.round(x), Math.round(y));
  });
}

export function bindMapResizing(mapBox, currentSize, onResize) {
  if (!mapBox) return;
  mapBox.querySelectorAll(".map-resize-handle").forEach((handle) => {
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const axis = handle.dataset.resizeAxis || "xy";
      const parent = mapBox.parentElement;
      if (!parent) return;
      const rect = mapBox.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = clampMapWidth(currentSize.width);
      const startHeight = clampMapHeight(currentSize.height);
      document.body.classList.add("is-resizing-map");

      const onPointerMove = (moveEvent) => {
        moveEvent.preventDefault();
        const nextWidth = axis.includes("x")
          ? clampMapWidth(((rect.width + moveEvent.clientX - startX) / parentRect.width) * 100)
          : startWidth;
        const nextHeight = axis.includes("y") ? clampMapHeight(startHeight + moveEvent.clientY - startY) : startHeight;
        onResize({ width: nextWidth, height: nextHeight });
      };

      const onPointerUp = () => {
        document.body.classList.remove("is-resizing-map");
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    });
  });
}

function clampMapWidth(value) {
  const width = Number(value);
  if (!Number.isFinite(width)) return 100;
  return Math.max(70, Math.min(100, Math.round(width)));
}

function clampMapHeight(value) {
  const height = Number(value);
  if (!Number.isFinite(height)) return 388;
  return Math.max(240, Math.min(560, Math.round(height / 10) * 10));
}
