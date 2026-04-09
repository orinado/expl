const auditConfig = {
  targets: [
    { name: "Filza", url: "filza://" },
    { name: "Sileo", url: "sileo://" },
    { name: "Cydia", url: "cydia://" },
    { name: "iFile", url: "ifile://" },
    { name: "NewTerm", url: "mterminal://" },
    { name: "Zebra", url: "zbra://" }
  ],
  privacyKeys: [
    "NSFileProviderPresenceUsageDescription",
    "NSAppleMusicUsageDescription",
    "NSSystemExtensionUsageDescription"
  ]
};

async function startAudit() {
  let ui = new UITable();
  
  let head = new UITableRow();
  head.isHeader = true;
  head.addText("pene");
  ui.addRow(head);

  for (let app of auditConfig.targets) {
    let r = new UITableRow();
    let found = Safari.canOpenURL(app.url);
    
    r.addText(app.name);
    if (found) {
      r.addText("⚠️ DETECTADO").titleColor = Color.red();
    } else {
      r.addText("LIMPIO").titleColor = Color.green();
    }
    ui.addRow(r);
  }

  let sep = new UITableRow();
  sep.addText("pene");
  ui.addRow(sep);

  for (let k of auditConfig.privacyKeys) {
    let r = new UITableRow();
    r.addText(k);
    r.addText("riquimaricon").titleColor = Color.blue();
    ui.addRow(r);
  }

  QuickLook.present(ui);
}

await startAudit();