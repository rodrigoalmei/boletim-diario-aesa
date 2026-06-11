import { DEFAULT_DATA, STATUS_OPTIONS, TREND_OPTIONS, cloneDefaultData } from "./data.js";
import { bindMapPositioning, bindMapResizing, renderMap } from "./map.js";
import { exportDocx, exportPdf, exportPng, exportXlsx } from "./export.js";

const STORAGE_KEY = "boletim-diario-aesa";
let state = cloneDefaultData();
let selectedStationId = "";

const elements = {
  bulletin: document.querySelector("#bulletin"),
  previewPanel: document.querySelector(".preview-panel"),
  previewViewport: document.querySelector(".preview-viewport"),
  stationEditor: document.querySelector("#stationEditor"),
  message: document.querySelector("#appMessage"),
  date: document.querySelector("#bulletinDate"),
  time: document.querySelector("#bulletinTime"),
  networkStatus: document.querySelector("#networkStatus"),
  dataSource: document.querySelector("#dataSource"),
  site: document.querySelector("#site"),
  contactName: document.querySelector("#contactName"),
  phone: document.querySelector("#phone"),
  email: document.querySelector("#email"),
  highlights: document.querySelector("#highlights"),
  infoText: document.querySelector("#infoText"),
  mapWidth: document.querySelector("#mapWidth"),
  mapHeight: document.querySelector("#mapHeight")
};

init();

function init() {
  fillSelects();
  loadSavedData({ silent: true });
  bindGeneralForm();
  bindButtons();
  bindKeyboardShortcuts();
  bindResponsivePreview();
  loadIntoForm();
  renderAll();
}

function fillSelects() {
  elements.networkStatus.innerHTML = Object.entries(STATUS_OPTIONS)
    .map(([value, option]) => `<option value="${value}">${option.shortLabel}</option>`)
    .join("");
}

function bindGeneralForm() {
  const bindings = [
    ["date", "date"],
    ["time", "time"],
    ["networkStatus", "networkStatus"],
    ["dataSource", "dataSource"],
    ["site", "site"],
    ["contactName", "contactName"],
    ["phone", "phone"],
    ["email", "email"],
    ["infoText", "infoText"],
    ["mapWidth", "mapWidth"],
    ["mapHeight", "mapHeight"]
  ];
  bindings.forEach(([key, prop]) => {
    elements[key].addEventListener("input", () => {
      state[prop] = prop === "mapWidth" || prop === "mapHeight" ? Number(elements[key].value) : elements[key].value;
      renderAll(false);
    });
  });
  elements.highlights.addEventListener("input", () => {
    state.highlights = elements.highlights.value.split("\n").filter(Boolean);
    renderAll(false);
  });
}

function bindButtons() {
  document.querySelector("#addStation").addEventListener("click", addStation);
  document.querySelector("#updatePreview").addEventListener("click", () => renderAll(true));
  document.querySelector("#saveData").addEventListener("click", saveData);
  document.querySelector("#resetData").addEventListener("click", resetData);
  document.querySelector("#logoAesaInput").addEventListener("change", (event) => readImage(event, "logoAesa"));
  document.querySelector("#logoGovInput").addEventListener("change", (event) => readImage(event, "logoGov"));
  document.querySelector("#mapInput").addEventListener("change", (event) => readImage(event, "mapImage"));
  document.querySelector("#exportPdf").addEventListener("click", () => runExport(() => exportPdf(elements.bulletin, state), "PDF gerado."));
  document.querySelector("#exportPng").addEventListener("click", () => runExport(() => exportPng(elements.bulletin, state), "PNG gerado."));
  document.querySelector("#exportXlsx").addEventListener("click", () => runExport(() => exportXlsx(state, getCounts()), "XLSX gerado."));
  document.querySelector("#exportDocx").addEventListener("click", () => runExport(() => exportDocx(state, getCounts()), "DOCX gerado."));
}

function bindKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !selectedStationId) return;
    selectedStationId = "";
    renderAll();
  });
}

function loadIntoForm() {
  elements.date.value = state.date;
  elements.time.value = state.time;
  elements.networkStatus.value = state.networkStatus;
  elements.dataSource.value = state.dataSource;
  elements.site.value = state.site;
  elements.contactName.value = state.contactName;
  elements.phone.value = state.phone;
  elements.email.value = state.email;
  elements.highlights.value = state.highlights.join("\n");
  elements.infoText.value = state.infoText;
  elements.mapWidth.value = state.mapWidth;
  elements.mapHeight.value = state.mapHeight;
}

function renderAll(showMessage = false) {
  sanitizeState();
  renderStationEditor();
  renderBulletin();
  resizePreview();
  if (showMessage) setMessage("Boletim atualizado.");
}

function bindResponsivePreview() {
  window.addEventListener("resize", resizePreview);
  window.addEventListener("orientationchange", resizePreview);
}

function resizePreview() {
  if (!elements.previewPanel || !elements.previewViewport || !elements.bulletin) return;
  const naturalWidth = 794;
  const naturalHeight = 1122;
  const availableWidth = Math.max(280, elements.previewPanel.clientWidth - 4);
  const scale = Math.min(1, availableWidth / naturalWidth);
  elements.bulletin.style.transform = `scale(${scale})`;
  elements.previewViewport.style.width = `${naturalWidth * scale}px`;
  elements.previewViewport.style.height = `${naturalHeight * scale}px`;
}

function sanitizeState() {
  state.stations.forEach((station) => {
    station.id ||= crypto.randomUUID();
    station.status = STATUS_OPTIONS[station.status] ? station.status : "normal";
    station.trend = TREND_OPTIONS[station.trend] ? station.trend : "stable";
    station.x = Number.isFinite(Number(station.x)) ? Number(station.x) : 50;
    station.y = Number.isFinite(Number(station.y)) ? Number(station.y) : 50;
  });
  state.mapWidth = clampMapWidth(state.mapWidth);
  state.mapHeight = clampMapHeight(state.mapHeight);
  elements.mapWidth.value = state.mapWidth;
  elements.mapHeight.value = state.mapHeight;
  if (!state.stations.some((station) => station.id === selectedStationId)) {
    selectedStationId = "";
  }
}

function renderStationEditor() {
  elements.stationEditor.innerHTML = state.stations
    .map((station, index) => {
      const selected = station.id === selectedStationId ? " selected" : "";
      return `<article class="station-form${selected}" data-station-id="${station.id}">
        <div class="station-title">
          <button type="button" class="select-station" data-action="select">Editar estação ${index + 1}</button>
          <button type="button" class="remove-station" data-action="remove">Remover</button>
        </div>
        <label>Estação <input data-field="name" value="${escapeHtml(station.name)}" /></label>
        <label>Município <input data-field="city" value="${escapeHtml(station.city)}" /></label>
        <label>Cota/Nível <input data-field="level" value="${escapeHtml(station.level)}" /></label>
        <div class="inline-fields">
          <label>Status ${statusSelect(station.status)}</label>
          <label>Tendência ${trendSelect(station.trend)}</label>
        </div>
        <div class="inline-fields">
          <label>Mapa X <input data-field="x" type="number" min="0" max="100" value="${station.x}" /></label>
          <label>Mapa Y <input data-field="y" type="number" min="0" max="100" value="${station.y}" /></label>
        </div>
      </article>`;
    })
    .join("");

  elements.stationEditor.querySelectorAll(".station-form").forEach((form) => {
    const id = form.dataset.stationId;
    form.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", () => updateStation(id, field.dataset.field, field.value));
    });
    form.querySelector("[data-action='select']").addEventListener("click", () => {
      selectedStationId = id;
      renderAll();
    });
    form.querySelector("[data-action='remove']").addEventListener("click", () => removeStation(id));
  });
}

function statusSelect(value) {
  const options = Object.entries(STATUS_OPTIONS)
    .map(([key, status]) => `<option value="${key}" ${key === value ? "selected" : ""}>${status.shortLabel}</option>`)
    .join("");
  return `<select data-field="status">${options}</select>`;
}

function trendSelect(value) {
  const options = Object.entries(TREND_OPTIONS)
    .map(([key, trend]) => `<option value="${key}" ${key === value ? "selected" : ""}>${trend.label}</option>`)
    .join("");
  return `<select data-field="trend">${options}</select>`;
}

function renderBulletin() {
  const counts = getCounts();
  elements.bulletin.innerHTML = `
    <header class="bulletin-header">
      <img src="${state.logoAesa}" alt="Logo AESA" />
      <div>
        <h2>BOLETIM DIÁRIO</h2>
        <p>DE MONITORAMENTO HIDROLÓGICO</p>
        <strong>REDE DE ALERTA - SALA DE SITUAÇÃO</strong>
      </div>
      <img src="${state.logoGov}" alt="Logo Governo da Paraíba" />
    </header>
    <section class="date-bar">
      <span>📅 ${formatDate(state.date)}</span>
      <span>⏰ ${state.time}H</span>
      <div class="network-box">
        <small>SITUAÇÃO GERAL DA REDE</small>
        <strong class="${STATUS_OPTIONS[state.networkStatus].className}">${networkStatusText()}</strong>
      </div>
    </section>
    <section class="summary-cards">
      ${summaryCard("Total de Estações", state.stations.length, "card-total")}
      ${summaryCard("Normal", counts.normal, STATUS_OPTIONS.normal.cardClass)}
      ${summaryCard("Atenção", counts.attention, STATUS_OPTIONS.attention.cardClass)}
      ${summaryCard("Alerta", counts.alert, STATUS_OPTIONS.alert.cardClass)}
      ${summaryCard("Inundação", counts.flood, STATUS_OPTIONS.flood.cardClass)}
      ${summaryCard("Sem Dados", counts.nodata, STATUS_OPTIONS.nodata.cardClass)}
      ${summaryCard("Estiagem", counts.drought, STATUS_OPTIONS.drought.cardClass)}
    </section>
    <section class="bulletin-block highlights-block">
      <h3>Destaques do dia</h3>
      <ul>${state.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <section class="content-grid">
      <div class="bulletin-block stations-block">
        <h3>Situação das Estações</h3>
        <table>
          <thead>
            <tr><th>Estação</th><th>Município</th><th>Cota/Nível</th><th>Status</th><th>Tendência</th></tr>
          </thead>
          <tbody>${stationRows()}</tbody>
        </table>
      </div>
      <div class="bulletin-block map-block">
        <h3>Mapa de Localização das Estações</h3>
        ${renderMap(state, selectedStationId, (id) => {
          selectedStationId = id;
          renderAll();
        })}
      </div>
    </section>
    <section class="legend-row">
      <div class="level-legend">${levelLegend()}</div>
      <div class="trend-legend">
        <h3>Tendência</h3>
        <p>Subindo <span class="trend-up">↑</span> Descendo <span class="trend-down">↓</span> Estável <span class="trend-stable">→</span></p>
      </div>
    </section>
    <section class="info-strip">
      <div class="info-icon">⚠</div>
      <p>${escapeHtml(state.infoText)}</p>
    </section>
    <footer class="bulletin-footer">
      <strong>Fonte dos dados</strong>
      <strong>${escapeHtml(state.dataSource)}</strong>
      <strong>Mais informações</strong>
      <span>${escapeHtml(state.site)}</span>
      <span>${escapeHtml(state.contactName)}</span>
      <span>${escapeHtml(state.phone)} | ${escapeHtml(state.email)}</span>
    </footer>`;

  bindMapPositioning(
    document.querySelector("#mapBox"),
    () => selectedStationId,
    (id, x, y) => {
      const station = state.stations.find((item) => item.id === id);
      if (!station) return;
      station.x = x;
      station.y = y;
      renderAll();
    }
  );
  bindMapResizing(document.querySelector("#mapBox"), { width: state.mapWidth, height: state.mapHeight }, ({ width, height }) => {
    state.mapWidth = width;
    state.mapHeight = height;
    elements.mapWidth.value = width;
    elements.mapHeight.value = height;
    const mapBox = document.querySelector("#mapBox");
    mapBox?.style.setProperty("--map-width", `${width}%`);
    mapBox?.style.setProperty("--map-height", `${height}px`);
  });
}

function summaryCard(label, value, className) {
  return `<article class="summary-card ${className}">
    <span>${label}</span>
    <strong>${String(value).padStart(2, "0")}</strong>
  </article>`;
}

function stationRows() {
  return state.stations
    .map((station) => {
      const status = STATUS_OPTIONS[station.status];
      const trend = TREND_OPTIONS[station.trend];
      return `<tr>
        <td>${escapeHtml(station.name)}</td>
        <td>${escapeHtml(station.city)}</td>
        <td>${escapeHtml(station.level)}</td>
        <td><span class="status-pill ${status.className}">${status.shortLabel}</span></td>
        <td><span class="trend-arrow ${trend.className}">${trend.arrow}</span></td>
      </tr>`;
    })
    .join("");
}

function levelLegend() {
  return Object.values(STATUS_OPTIONS)
    .map((status) => `<article><span style="background:${status.color}"></span><strong>${status.shortLabel}</strong><small>${status.label}</small></article>`)
    .join("");
}

function getCounts() {
  return Object.keys(STATUS_OPTIONS).reduce((acc, key) => {
    acc[key] = state.stations.filter((station) => station.status === key).length;
    return acc;
  }, {});
}

function networkStatusText() {
  const labels = {
    flood: "SITUAÇÃO DE INUNDAÇÃO",
    alert: "SITUAÇÃO DE ALERTA",
    attention: "SITUAÇÃO DE ATENÇÃO",
    drought: "SITUAÇÃO DE ESTIAGEM",
    nodata: "SEM DADOS",
    normal: "SITUAÇÃO NORMAL"
  };
  return labels[state.networkStatus] || "SITUAÇÃO NORMAL";
}

function updateStation(id, field, value) {
  const station = state.stations.find((item) => item.id === id);
  if (!station) return;
  station[field] = field === "x" || field === "y" ? Number(value) : value;
  if (field === "status") {
    state.networkStatus = inferNetworkStatus();
    elements.networkStatus.value = state.networkStatus;
  }
  renderBulletin();
}

function inferNetworkStatus() {
  const priority = ["flood", "alert", "attention", "drought", "normal", "nodata"];
  return priority.find((status) => state.stations.some((station) => station.status === status)) || "normal";
}

function addStation() {
  const station = { id: crypto.randomUUID(), name: "Nova estação", city: "", level: "", status: "normal", trend: "stable", x: 50, y: 50 };
  state.stations.push(station);
  selectedStationId = station.id;
  renderAll(true);
}

function removeStation(id) {
  state.stations = state.stations.filter((station) => station.id !== id);
  renderAll(true);
}

function readImage(event, key) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state[key] = reader.result;
    renderAll(true);
  });
  reader.readAsDataURL(file);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setMessage("Modelo salvo no navegador.");
}

function loadSavedData({ silent = false } = {}) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    if (!silent) setMessage("Nenhum modelo salvo encontrado.");
    return;
  }
  try {
    state = normalizeImported(JSON.parse(saved));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    if (!silent) setMessage("Modelo salvo inválido removido.");
  }
}

function resetData() {
  state = cloneDefaultData();
  selectedStationId = "";
  localStorage.removeItem(STORAGE_KEY);
  loadIntoForm();
  renderAll(true);
}

function normalizeImported(data) {
  return {
    ...cloneDefaultData(),
    ...data,
    mapWidth: clampMapWidth(data.mapWidth ?? data.mapScale ?? 100),
    mapHeight: clampMapHeight(data.mapHeight),
    stations: Array.isArray(data.stations) ? data.stations : DEFAULT_DATA.stations
  };
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

async function runExport(action, successMessage) {
  try {
    await action();
    setMessage(successMessage);
  } catch (error) {
    setMessage(error.message || "Não foi possível exportar.");
  }
}

function setMessage(text) {
  elements.message.textContent = text;
  window.clearTimeout(setMessage.timeout);
  setMessage.timeout = window.setTimeout(() => {
    elements.message.textContent = "";
  }, 3500);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
