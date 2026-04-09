const SECURITY_DB = {
  fileManagers: [
    "com.tigisoftware.Filza",
    "com.johncoates.Flex3",
    "com.saurik.Cydia",
    "org.coolstar.SileoStore",
    "eu.hein-geste.ifile",
    "com.mterminal.mterminal",
    "com.zbra.zebra",
    "com.opa334.Dopamine"
  ],
  privacyKeys: [
    "NSFileProviderPresenceUsageDescription",
    "NSAppleMusicUsageDescription",
    "NSSystemExtensionUsageDescription"
  ],
  schemes: [
    { n: "Filza", u: "filza://" },
    { n: "Sileo", u: "sileo://" },
    { n: "AltStore", u: "altstore://" }
  ]
}

async function main() {
  let step1 = new Alert()
  step1.title = "📋 Paso 1 de 3 — Reporte de Privacidad"
  step1.message = "Ve a:\n\nAjustes → Privacidad y Seguridad → Reporte de Privacidad de las Apps\n\nExporta el archivo .ndjson y guárdalo."
  step1.addAction("Siguiente →")
  step1.addCancelAction("Cancelar")
  if (await step1.present() === -1) return

  let step2 = new Alert()
  step2.title = "📊 Paso 2 de 3 — Datos de Análisis"
  step2.message = "Ve a:\n\nAjustes → Privacidad y Seguridad → Análisis y Mejoras → Datos de Análisis\n\nBusca el archivo \"xp_amp_app_usage_dnu\" más reciente y guárdalo."
  step2.addAction("Siguiente →")
  step2.addCancelAction("Cancelar")
  if (await step2.present() === -1) return

  let step3 = new Alert()
  step3.title = "✅ Paso 3 de 3 — Selección"
  step3.message = "Selecciona ambos archivos para iniciar el escaneo AMP profundo."
  step3.addAction("Seleccionar Archivos")
  if (await step3.present() === -1) return

  let file1 = await DocumentPicker.openFile()
  let content1 = await readFile(file1)
  
  let file2 = await DocumentPicker.openFile()
  let content2 = await readFile(file2)

  let reportData = parseNdjson(content1)
  let usageData = parseIpsFile(content2)

  let results = await performDeepAudit(reportData, usageData)
  
  let html = buildSecurityReport(results)
  WebView.loadHTML(html)
}

async function performDeepAudit(ndjson, ips) {
  let detections = []
  
  for (let scheme of SECURITY_DB.schemes) {
    if (Safari.canOpenURL(scheme.url)) {
      detections.push({ type: "LIVE", name: scheme.n, detail: "App activa via URL Scheme" })
    }
  }

  let logBundles = new Set()
  if (ips && ips.entries) {
    ips.entries.forEach(e => logBundles.add(e.bundleId))
  }

  SECURITY_DB.fileManagers.forEach(bid => {
    if (logBundles.has(bid)) {
      detections.push({ type: "LOG", name: bid, detail: "Rastro encontrado en historial de uso (IPS)" })
    }
  })

  ndjson.forEach(entry => {
    if (entry.accessor && SECURITY_DB.fileManagers.includes(entry.accessor.bundleID)) {
      detections.push({ type: "PRIVACY", name: entry.accessor.bundleID, detail: "Acceso a archivos detectado en Reporte de Privacidad" })
    }
  })

  return detections
}

function parseNdjson(content) {
  return content.split("\n").filter(l => l.trim()).map(l => JSON.parse(l))
}

function parseIpsFile(content) {
  try {
    let lines = content.split("\n")
    let header = JSON.parse(lines[0])
    let entries = lines.slice(1).filter(l => l.trim()).map(l => JSON.parse(l))
    return { header, entries }
  } catch (e) { return { entries: [] } }
}

async function readFile(path) {
  let fm = FileManager.local()
  return fm.readString(path)
}

function buildSecurityReport(findings) {
  let rows = findings.map(f => `
    <tr style="color: ${f.type === 'LIVE' ? '#ff4d4d' : '#ffa500'}">
      <td>${f.type}</td>
      <td>${f.name}</td>
      <td>${f.detail}</td>
    </tr>
  `).join("")

  return `
    <html>
    <body style="background: #121212; color: white; font-family: sans-serif; padding: 20px;">
      <h2>🛡️ RIQUI MARICON</h2>
      <p>Resultados del escaneo de privacidad y seguridad:</p>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr><th>Tipo</th><th>Identificador</th><th>Detalle</th></tr>
        ${rows || "<tr><td colspan='3' style='color: #00ff00'>No se detectaron herramientas de gestión ocultas.</td></tr>"}
      </table>
    </body>
    </html>
  `
}

main()