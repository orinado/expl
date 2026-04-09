async function main() {
  let step = new Alert()
  step.title = "📋 Auditoría de Privacidad"
  step.message = "Selecciona el archivo exportado (.ndjson o .ips) para iniciar el escaneo en el sistema."
  step.addAction("Seleccionar Archivo")
  step.addCancelAction("Cancelar")
  if (await step.present() === -1) return

  let path = await DocumentPicker.openFile()
  if (!path) return
  
  let content = await readFile(path)
  let findings = analyze(content)
  await show(findings)
}

function analyze(text) {
  let detections = []
  const targets = [
    { id: "com.tigisoftware.Filza", name: "Filza" },
    { id: "com.opa334.Dopamine", name: "Dopamine" },
    { id: "com.zbra.zebra", name: "Zebra" },
    { id: "org.coolstar.SileoStore", name: "Sileo" },
    { id: "com.johncoates.Flex3", name: "Flex 3" },
    { id: "com.mterminal.mterminal", name: "Terminal" }
  ]
  
  targets.forEach(t => {
    if (text.includes(t.id)) {
      detections.push(t)
    }
  })
  return detections
}

async function readFile(p) {
  let fm = FileManager.local()
  return fm.readString(p)
}

async function show(data) {
  let table = new UITable()
  let h = new UITableRow()
  h.isHeader = true
  h.addText("REPORTE FANTASMA")
  table.addRow(h)
  
  if (data.length === 0) {
    let r = new UITableRow()
    r.addText("No se hallaron rastros de herramientas de gestión.")
    table.addRow(r)
  } else {
    data.forEach(item => {
      let r = new UITableRow()
      r.addText(item.name)
      r.addText("⚠️ DETECTADO").titleColor = Color.red()
      table.addRow(r)
    })
  }
  QuickLook.present(table)
}

await main()
