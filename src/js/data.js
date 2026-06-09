export const STATUS_OPTIONS = {
  drought: {
    label: "Cota de Estiagem",
    shortLabel: "Estiagem",
    className: "status-drought",
    cardClass: "card-drought",
    color: "#6d6d62"
  },
  normal: {
    label: "Nível normal",
    shortLabel: "Normal",
    className: "status-normal",
    cardClass: "card-normal",
    color: "#8fce4e"
  },
  attention: {
    label: "Cota de atenção",
    shortLabel: "Atenção",
    className: "status-attention",
    cardClass: "card-attention",
    color: "#ff9d2f"
  },
  alert: {
    label: "Cota de alerta",
    shortLabel: "Alerta",
    className: "status-alert",
    cardClass: "card-alert",
    color: "#ff9999"
  },
  flood: {
    label: "Cota de inundação",
    shortLabel: "Inundação",
    className: "status-flood",
    cardClass: "card-flood",
    color: "#c4332f"
  },
  nodata: {
    label: "Sem dados",
    shortLabel: "Sem Dados",
    className: "status-nodata",
    cardClass: "card-nodata",
    color: "#4fa7db"
  }
};

export const TREND_OPTIONS = {
  up: { label: "Subindo", arrow: "↑", className: "trend-up" },
  down: { label: "Descendo", arrow: "↓", className: "trend-down" },
  stable: { label: "Estável", arrow: "→", className: "trend-stable" }
};

export const DEFAULT_DATA = {
  date: "2026-04-19",
  time: "12:00",
  networkStatus: "normal",
  dataSource: "AESA / ANA / CPRM",
  site: "www.aesa.pb.gov.br",
  contactName: "Sala de Situação - AESA",
  phone: "(83) 3225-5508",
  email: "salasituacao@aesa.pb.gov.br",
  logoAesa: "src/assets/logos/logo-aesa.png",
  logoGov: "src/assets/logos/logo-governo-paraiba.png",
  mapImage: "src/assets/maps/mapa-padrao.png",
  highlights: [
    "A estação Sítio Vassouras e Caraúbas encontra-se em nível de ALERTA",
    "A estação Sítio Vassouras encontra-se subindo o nível"
  ],
  infoText:
    "A Rede de Alertas é composta por 09 plataformas de coletas de dados hidrológicos que apresentam níveis de cotas de referência para inundações e estiagens. Essas informações obtidas das estações são monitoradas periodicamente para que os tomadores de decisão possam implementar medidas no âmbito da prevenção de possíveis eventos críticos extremos, como inundações e estiagens mais severas.",
  stations: [
    { id: crypto.randomUUID(), name: "Pombinho", city: "Diamante", level: "116", status: "normal", trend: "stable", x: 28, y: 78 },
    { id: crypto.randomUUID(), name: "Piancó", city: "Piancó", level: "Sem dados", status: "nodata", trend: "stable", x: 25, y: 50 },
    { id: crypto.randomUUID(), name: "Sítio Vassouras", city: "Pombal", level: "178", status: "attention", trend: "up", x: 33, y: 33 },
    { id: crypto.randomUUID(), name: "Sítio Curralinho", city: "Paulista", level: "213", status: "normal", trend: "stable", x: 66, y: 38 },
    { id: crypto.randomUUID(), name: "Sítio Conceição", city: "Sumé", level: "75", status: "normal", trend: "stable", x: 14, y: 66 },
    { id: crypto.randomUUID(), name: "PISF Monteiro", city: "Monteiro", level: "324", status: "normal", trend: "stable", x: 48, y: 61 },
    { id: crypto.randomUUID(), name: "Sítio Queimação", city: "Camalaú", level: "76", status: "normal", trend: "stable", x: 55, y: 49 },
    { id: crypto.randomUUID(), name: "Pau Ferrado", city: "Pombal", level: "19", status: "normal", trend: "down", x: 43, y: 24 },
    { id: crypto.randomUUID(), name: "Caraúbas", city: "Caraúbas", level: "339", status: "attention", trend: "stable", x: 73, y: 67 }
  ]
};

export function cloneDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
