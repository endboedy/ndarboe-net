
// Fungsi untuk menampilkan section sesuai menu yang diklik
function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

// Event listener untuk menu sidebar
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

// Fungsi untuk upload dan baca file Excel
function uploadFiles() {
  const files = {
    iw39: document.getElementById('iw39File')?.files[0],
    sum57: document.getElementById('sum57File')?.files[0],
    planning: document.getElementById('planningFile')?.files[0],
    budget: document.getElementById('budgetFile')?.files[0],
    data1: document.getElementById('data1File')?.files[0],
    data2: document.getElementById('data2File')?.files[0]
  };

  const statusBox = document.getElementById('uploadStatus');
  if (!statusBox) {
    console.error("Element dengan ID 'uploadStatus' tidak ditemukan.");
    return;
  }

  statusBox.innerHTML = '<strong>Status Upload:</strong><br>';

  for (const [key, file] of Object.entries(files)) {
    if (!file) {
      const msg = document.createElement('p');
      msg.textContent = `${key.toUpperCase()} file not selected.`;
      msg.style.color = 'orange';
      statusBox.appendChild(msg);
      continue;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      const msg = document.createElement('p');
      msg.textContent = `${key.toUpperCase()} file format not supported.`;
      msg.style.color = 'red';
      statusBox.appendChild(msg);
      continue;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "", header: 1 });

      console.log(`✅ ${key.toUpperCase()} loaded`, jsonData);

      const msg = document.createElement('p');
      msg.textContent = `${key.toUpperCase()} file loaded successfully.`;
      msg.style.color = 'green';
      statusBox.appendChild(msg);

      // Simpan ke variabel global kalau perlu
      window[`data_${key}`] = jsonData;

      // Tampilkan Planning ke tabel sebagai contoh
      if (key === 'planning') {
        renderTable(jsonData);
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

// Fungsi untuk menampilkan data ke tabel HTML
function renderTable(data) {
  const tableBody = document.querySelector('#planTableBody');
  if (!tableBody) {
    console.warn("Element dengan ID 'planTableBody' tidak ditemukan.");
    return;
  }

  tableBody.innerHTML = '';

  data.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement(rowIndex === 0 ? 'th' : 'td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// Fungsi placeholder untuk download
function downloadMonthlyPlan() {
  alert("Download functionality will be implemented here.");
}
