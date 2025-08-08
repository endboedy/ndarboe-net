
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

// Fungsi untuk upload file ke Firebase Storage
function uploadFiles() {
  if (typeof firebase === 'undefined' || !firebase.storage) {
    console.error("Firebase belum di-load atau storage belum tersedia.");
    alert("Firebase belum di-load. Periksa konfigurasi di HTML.");
    return;
  }

  const files = {
    iwds: document.getElementById('iwdsFile')?.files[0],
    swot: document.getElementById('swotFile')?.files[0],
    planning: document.getElementById('planningFile')?.files[0],
    budget: document.getElementById('budgetFile')?.files[0],
    detail1: document.getElementById('detail1File')?.files[0],
    detail2: document.getElementById('detail2File')?.files[0]
  };

  const statusBox = document.getElementById('uploadStatus');
  if (!statusBox) {
    console.error("Element dengan ID 'uploadStatus' tidak ditemukan.");
    return;
  }

  statusBox.innerHTML = '<strong>Status Upload:</strong><br>';

  for (const [key, file] of Object.entries(files)) {
    if (file) {
      const storageRef = firebase.storage().ref(`${key}/${file.name}`);
      const uploadTask = storageRef.put(file);

      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`${key} upload progress: ${progress.toFixed(2)}%`);
        },
        error => {
          const msg = document.createElement('p');
          msg.textContent = `Error uploading ${key.toUpperCase()}: ${error.message}`;
          msg.style.color = 'red';
          statusBox.appendChild(msg);
        },
        () => {
          const msg = document.createElement('p');
          msg.textContent = `${key.toUpperCase()} uploaded successfully.`;
          msg.style.color = 'green';
          statusBox.appendChild(msg);

          // Baca file Planning setelah upload
          if (key === 'planning') {
            readExcel(file);
          }
        }
      );
    } else {
      const msg = document.createElement('p');
      msg.textContent = `${key.toUpperCase()} file not selected.`;
      msg.style.color = 'orange';
      statusBox.appendChild(msg);
    }
  }
}

// Fungsi untuk membaca file Excel menggunakan SheetJS
function readExcel(file) {
  if (typeof XLSX === 'undefined') {
    alert("SheetJS belum dimuat. Pastikan script XLSX.js sudah ditambahkan.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    renderTable(jsonData);
  };
  reader.readAsArrayBuffer(file);
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
