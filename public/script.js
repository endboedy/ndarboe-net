
// Fungsi untuk menampilkan section sesuai menu yang diklik
function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sidebar li");
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-target");
      showSection(targetId);
    });
  });

  // Tampilkan default section saat pertama kali load
  showSection("upload");
});

// Fungsi utama untuk upload dan baca file Excel
function uploadFiles() {
  const fileKeys = ["IW39", "SUM57", "Planning", "Budget", "Data1", "Data2"];
  const statusBox = document.getElementById("uploadStatus");
  const metadataBox = document.getElementById("metadataPreview");

  statusBox.innerHTML = "<strong>Status Upload:</strong><br>";
  metadataBox.innerHTML = "<strong>Metadata Preview:</strong><br>";

  fileKeys.forEach(key => {
    const input = document.getElementById(key);
    const file = input?.files[0];

    if (!file) {
      const msg = document.createElement("p");
      msg.textContent = `${key} file not selected.`;
      msg.style.color = "orange";
      statusBox.appendChild(msg);
      return;
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      const msg = document.createElement("p");
      msg.textContent = `${key} file format not supported.`;
      msg.style.color = "red";
      statusBox.appendChild(msg);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = key; // Sheet name disamakan dengan nama file
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        const msg = document.createElement("p");
        msg.textContent = `Sheet '${sheetName}' not found in ${file.name}`;
        msg.style.color = "red";
        statusBox.appendChild(msg);
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      window[`data_${key}`] = jsonData;

      const msg = document.createElement("p");
      msg.textContent = `${key} file loaded successfully.`;
      msg.style.color = "green";
      statusBox.appendChild(msg);

      // Simpan metadata ke Firebase Realtime Database
      saveMetadataToFirebase(key, jsonData, file.name);

      // Tampilkan metadata preview
      const meta = document.createElement("p");
      meta.innerHTML = `<strong>${key}</strong>: ${jsonData.length} rows, ${jsonData[0]?.length || 0} columns`;
      metadataBox.appendChild(meta);

      // Tampilkan Planning ke tabel sebagai contoh
      if (key === "Planning") {
        renderTable(jsonData);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Simpan metadata ke Firebase Realtime Database
function saveMetadataToFirebase(fileKey, jsonData, fileName) {
  if (typeof firebase === "undefined" || !firebase.database) {
    console.error("Firebase Realtime Database belum tersedia.");
    return;
  }

  const metadata = {
    fileName: fileName,
    sheetName: fileKey,
    rowCount: jsonData.length,
    columnCount: jsonData[0]?.length || 0,
    uploadedAt: new Date().toISOString()
  };

  firebase.database().ref(`metadata/${fileKey}`).set(metadata)
    .then(() => {
      console.log(`✅ Metadata ${fileKey} berhasil disimpan ke Firebase`);
    })
    .catch(error => {
      console.error(`❌ Gagal simpan metadata ${fileKey}:`, error);
    });
}

// Tampilkan data ke tabel HTML
function renderTable(data) {
  const tableBody = document.querySelector("#planTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement(rowIndex === 0 ? "th" : "td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// Placeholder untuk download
function downloadMonthlyPlan() {
  alert("Download functionality will be implemented here.");
}
