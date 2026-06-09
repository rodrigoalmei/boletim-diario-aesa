import { STATUS_OPTIONS, TREND_OPTIONS } from "./data.js";

function getFileBase(data) {
  return `boletim-aesa-${data.date || "diario"}`;
}

async function renderCanvas(element) {
  if (!window.html2canvas) throw new Error("Biblioteca html2canvas não carregada.");
  const clone = element.cloneNode(true);
  clone.removeAttribute("id");
  clone.classList.add("bulletin-export");
  clone.style.transform = "none";
  clone.style.position = "static";
  clone.style.width = "794px";
  clone.style.minHeight = "1122px";

  const host = document.createElement("div");
  host.style.background = "#ffffff";
  host.style.left = "-10000px";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.width = "794px";
  host.style.zIndex = "-1";
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    return await window.html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
      windowHeight: Math.max(1122, clone.scrollHeight)
    });
  } finally {
    host.remove();
  }
}

export async function exportPng(element, data) {
  const canvas = await renderCanvas(element);
  const link = document.createElement("a");
  link.download = `${getFileBase(data)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function exportPdf(element, data) {
  if (!window.jspdf) throw new Error("Biblioteca jsPDF não carregada.");
  const canvas = await renderCanvas(element);
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageRatio = canvas.width / canvas.height;
  let imageWidth = pageWidth;
  let imageHeight = pageWidth / imageRatio;
  if (imageHeight > pageHeight) {
    imageHeight = pageHeight;
    imageWidth = pageHeight * imageRatio;
  }
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;
  pdf.addImage(imgData, "PNG", x, y, imageWidth, imageHeight);
  pdf.save(`${getFileBase(data)}.pdf`);
}

export function exportXlsx(data, counts) {
  if (!window.XLSX) throw new Error("Biblioteca SheetJS não carregada.");
  const rows = data.stations.map((station) => ({
    Estação: station.name,
    Município: station.city,
    "Cota/Nível": station.level,
    Status: STATUS_OPTIONS[station.status].shortLabel,
    Tendência: TREND_OPTIONS[station.trend].label,
    "Mapa X (%)": station.x,
    "Mapa Y (%)": station.y
  }));
  const totals = [
    { Indicador: "Total de Estações", Total: data.stations.length },
    { Indicador: "Normal", Total: counts.normal },
    { Indicador: "Atenção", Total: counts.attention },
    { Indicador: "Alerta", Total: counts.alert },
    { Indicador: "Inundação", Total: counts.flood },
    { Indicador: "Sem Dados", Total: counts.nodata },
    { Indicador: "Estiagem", Total: counts.drought }
  ];
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, window.XLSX.utils.json_to_sheet(rows), "Estações");
  window.XLSX.utils.book_append_sheet(workbook, window.XLSX.utils.json_to_sheet(totals), "Totais");
  workbook.Sheets[workbook.SheetNames[0]]["!cols"] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 }
  ];
  workbook.Sheets[workbook.SheetNames[1]]["!cols"] = [{ wch: 24 }, { wch: 10 }];
  window.XLSX.writeFile(workbook, `${getFileBase(data)}.xlsx`);
}

export async function exportDocx(data, counts) {
  if (!window.docx) throw new Error("Biblioteca docx.js não carregada.");
  const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } = window.docx;
  const rows = [
    new TableRow({
      children: ["Estação", "Município", "Cota/Nível", "Status", "Tendência"].map(
        (text) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] })
      )
    }),
    ...data.stations.map(
      (station) =>
        new TableRow({
          children: [
            station.name,
            station.city,
            station.level,
            STATUS_OPTIONS[station.status].shortLabel,
            TREND_OPTIONS[station.trend].label
          ].map((text) => new TableCell({ children: [new Paragraph(String(text))] }))
        })
    )
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ children: [new TextRun({ text: "BOLETIM DIÁRIO DE MONITORAMENTO HIDROLÓGICO", bold: true, size: 32 })] }),
          new Paragraph("REDE DE ALERTA - SALA DE SITUAÇÃO"),
          new Paragraph(`Data: ${formatDate(data.date)}    Horário: ${data.time}`),
          new Paragraph(`Situação geral da rede: ${STATUS_OPTIONS[data.networkStatus].shortLabel}`),
          new Paragraph(`Total de estações: ${data.stations.length} | Normal: ${counts.normal} | Atenção: ${counts.attention} | Alerta: ${counts.alert} | Inundação: ${counts.flood} | Sem dados: ${counts.nodata} | Estiagem: ${counts.drought}`),
          new Paragraph({ children: [new TextRun({ text: "Destaques do dia", bold: true })] }),
          ...data.highlights.map((item) => new Paragraph(`• ${item}`)),
          new Paragraph({ children: [new TextRun({ text: "Situação das estações", bold: true })] }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
          new Paragraph({ children: [new TextRun({ text: "Texto informativo", bold: true })] }),
          new Paragraph(data.infoText),
          new Paragraph(`Fonte dos dados: ${data.dataSource}`),
          new Paragraph(`${data.site} | ${data.contactName} | ${data.phone} | ${data.email}`)
        ]
      }
    ]
  });
  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.download = `${getFileBase(data)}.docx`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
