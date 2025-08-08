<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Monthly Plan - Endar Budi Prasetyo</title>

  <!-- SheetJS untuk baca file Excel -->
  <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

  <!-- Firebase SDK (Compat version) -->
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>

  <style>
    body { font-family: Arial, sans-serif; margin:0; background:#e6f0fa; }
    header { background:#204d74; color:#fff; padding:18px 28px; text-align:center; font-weight:600; }
    .container { display:flex; height:calc(100vh - 66px); }
    .sidebar { background:#204d74; color:#fff; width:210px; padding:18px; box-sizing:border-box; }
    .sidebar ul { list-style:none; padding:0; margin:0; }
    .sidebar li { padding:8px 6px; cursor:pointer; font-size:13px; border-radius:6px; }
    .sidebar li:hover { background:rgba(255,255,255,0.06); text-decoration:underline; }
    .content { flex:1; padding:18px; overflow:auto; background:#fff; }
    .section { display:none; }
    .section.active { display:block; }
    table { width:100%; border-collapse:collapse; margin-top:12px; font-size:13px; }
    th, td { border:1px solid #d0d7de; padding:6px 8px; text-align:left; }
    th { background:#204d74; color:#fff; font-weight:600; }
    label { display:block; margin:10px 0; font-size:14px; }
    .btn { padding:8px 12px; background:#204d74; color:#fff; border:none; border-radius:6px; cursor:pointer; }
    .btn:disabled { opacity:0.6; cursor:not-allowed; }
    #uploadStatus p { margin:6px 0; }
    .small { font-size:12px; color:#555; margin-top:6px; }
    .green { color:green; } .red { color:#c0392b } .orange { color:orange }
    pre { background:#f4f6f8; padding:10px; border-radius:6px; overflow:auto; max-height:240px; }
  </style>
</head>
<body>
  <header>MONTHLY PLAN — Endar Budi Prasetyo</header>

  <div class="container">
    <aside class="sidebar">
      <ul>
        <li data-target="upload">📂 Upload Data</li>
        <li data-target="plan">📊 Monthly Plan</li>
        <li data-target="cost">💰 Cost RM</li>
        <li data-target="download">📥 Download Excel</li>
      </ul>
      <p class="small">Buka lewat http(s) agar Storage & Database bekerja tanpa CORS issues.</p>
    </aside>

    <main class="content">
      <section id="upload" class="section active">
        <h3>Upload Data</h3>
        <form id="uploadForm">
          <label>IW39 File: <input type="file" id="IW39" accept=".xlsx,.xls" /></label>
          <label>SUM57 File: <input type="file" id="SUM57" accept=".xlsx,.xls" /></label>
          <label>Planning File: <input type="file" id="Planning" accept=".xlsx,.xls" /></label>
          <label>Budget File: <input type="file" id="Budget" accept=".xlsx,.xls" /></label>
          <label>Data1 File: <input type="file" id="Data1" accept=".xlsx,.xls" /></label>
          <label>Data2 File: <input type="file" id="Data2" accept=".xlsx,.xls" /></label>
          <div style="margin-top:12px;">
            <button type="submit" id="btnUpload" class="btn">Upload Semua</button>
          </div>
        </form>

        <div id="uploadStatus" style="margin-top:14px;">
          <strong>Status Upload:</strong>
          <div id="statusRows"></div>
        </div>

        <div id="metadataPreview" style="margin-top:12px;">
          <strong>Metadata Preview:</strong>
          <div id="metaRows"></div>
        </div>
      </section>

      <section id="plan" class="section">
        <h3>Monthly Plan (Preview Planning sheet)</h3>
        <div id="planNotice" class="small">Upload file 'Planning' lalu lihat preview di tabel di bawah.</div>
        <table>
          <thead id="planTableHead"></thead>
          <tbody id="planTableBody"></tbody>
        </table>
      </section>

      <section id="cost" class="section">
        <h3>Cost RM</h3>
        <p>Isi data cost di sini...</p>
      </section>

      <section id="download" class="section">
        <h3>Download Excel</h3>
        <button class="btn" onclick="downloadMonthlyPlan()">Download</button>
      </section>
    </main>
  </div>

  <!-- Script utama: inisialisasi Firebase, event, upload & parse -->
  <script>
  // ----- Firebase config: pastikan ini milik project kamu -----
  const firebaseConfig = {
    apiKey: "AIzaSyA9OAiNLQd8jcSJAhQTbVAEWus1nevatfc",
    authDomain: "monthly-plan-2baf5.firebaseapp.com",
    projectId: "monthly-plan-2baf5",
    storageBucket: "monthly-plan-2baf5.appspot.com",
    messagingSenderId: "42911040784",
    appId: "1:42911040784:web:5b54401d854b933b84d195",
    measurementId: "G-LVY6V58JS0"
  };

  // Inisialisasi firebase saat script dipanggil
  if (typeof firebase !== 'undefined' && firebase?.initializeApp) {
    try {
      firebase.initializeApp(firebaseConfig);
      // firebase.database() dan firebase.storage() siap pakai (compat)
      console.log("✅ Firebase initialized (compat).");
    } catch (err) {
      console.warn("Firebase mungkin sudah di-initialize sebelumnya:", err);
    }
  } else {
    console.error("Firebase SDK tidak tersedia. Pastikan script SDK ter-load.");
  }

  // Navigasi sidebar (pakai fungsi showSection agar konsisten)
  function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const t = document.getElementById(id);
    if (t) t.classList.add('active');
  }

  document.addEventListener("DOMContentLoaded", () => {
    // sidebar click
    document.querySelectorAll(".sidebar li").forEach(li => {
      li.addEventListener("click", () => {
        const tar = li.getAttribute("data-target");
        showSection(tar);
      });
    });

    // form submit -> upload
    document.getElementById("uploadForm").addEventListener("submit", function(e){
      e.preventDefault();
      uploadFiles();
    });

    // show default
    showSection("upload");
  });

  // Utility: create colored message
  function appendStatus(parent, text, colorClass) {
    const p = document.createElement('p');
    p.textContent = text;
    if (colorClass) p.classList.add(colorClass);
    parent.appendChild(p);
    return p;
  }

  // Core: uploadFiles() - baca tiap file, parse pakai SheetJS, upload ke Storage & simpan metadata ke Realtime DB
  async function uploadFiles() {
    const fileKeys = ["IW39","SUM57","Planning","Budget","Data1","Data2"];
    const statusRows = document.getElementById("statusRows");
    const metaRows = document.getElementById("metaRows");
    const planTableHead = document.getElementById("planTableHead");
    const planTableBody = document.getElementById("planTableBody");
    const btn = document.getElementById("btnUpload");

    // reset tampilan
    statusRows.innerHTML = "";
    metaRows.innerHTML = "";
    planTableHead.innerHTML = "";
    planTableBody.innerHTML = "";

    btn.disabled = true;
    appendStatus(statusRows, "Mulai proses upload & parse...", "orange");

    // cek firebase
    if (typeof firebase === "undefined" || !firebase.storage || !firebase.database) {
      appendStatus(statusRows, "Firebase tidak tersedia atau belum ter-load. Proses dihentikan.", "red");
      btn.disabled = false;
      return;
    }

    const storage = firebase.storage();
    const db = firebase.database();

    // proses tiap file sekuensial (lebih aman untuk update UI)
    for (const key of fileKeys) {
      const input = document.getElementById(key);
      if (!input) continue;

      const file = input.files?.[0];
      if (!file) {
        appendStatus(statusRows, `${key}: file belum dipilih.`, "orange");
        continue;
      }

      // cek ekstensi sederhana
      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith(".xlsx") && !nameLower.endsWith(".xls")) {
        appendStatus(statusRows, `${key}: format file tidak didukung (${file.name}).`, "red");
        continue;
      }

      appendStatus(statusRows, `${key}: membaca file ${file.name} ...`, "orange");

      try {
        // 1) Parse file Excel menggunakan FileReader + SheetJS
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: "array" });

        // tentukan sheet: coba match nama sheet = key, fallback ke sheet pertama
        let sheetName = workbook.SheetNames.includes(key) ? key : workbook.SheetNames[0];
        if (!sheetName) {
          appendStatus(statusRows, `${key}: tidak ditemukan sheet apapun di ${file.name}`, "red");
          continue;
        }

        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          appendStatus(statusRows, `${key}: sheet '${sheetName}' tidak dapat diambil.`, "red");
          continue;
        }

        // konversi ke JSON (header as array rows)
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        // simpan ke window global (opsional)
        window[`data_${key}`] = jsonData;

        appendStatus(statusRows, `${key}: berhasil diparsing — ${jsonData.length} baris.`, "green");

        // jika file Planning, render preview tabel
        if (key === "Planning") {
          renderTableFromArray(jsonData, planTableHead, planTableBody);
          appendStatus(statusRows, `Preview Planning ditampilkan.`, "green");
        }

        // 2) Upload file ke Firebase Storage
        appendStatus(statusRows, `${key}: mengupload file ke Firebase Storage...`, "orange");
        const storagePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
        const storageRef = storage.ref().child(storagePath);

        // mulai upload
        const uploadTaskSnapshot = await storageRef.put(file);
        // dapatkan URL download (jika diperlukan)
        const downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();

        appendStatus(statusRows, `${key}: upload sukses -> ${storagePath}`, "green");

        // 3) Simpan metadata ke Realtime Database
        const metadata = {
          fileKey: key,
          fileName: file.name,
          sheetUsed: sheetName,
          rowCount: jsonData.length,
          columnCount: (jsonData[0] && jsonData[0].length) ? jsonData[0].length : 0,
          storagePath: storagePath,
          downloadURL: downloadURL,
          uploadedAt: new Date().toISOString()
        };

        await db.ref(`metadata/${key}`).set(metadata);
        appendStatus(statusRows, `${key}: metadata disimpan ke Realtime Database.`, "green");

        // tampilkan ringkasan metadata
        const p = document.createElement("p");
        p.innerHTML = `<strong>${key}</strong>: ${metadata.rowCount} rows, ${metadata.columnCount} cols — <span class="small">(${metadata.fileName})</span>`;
        metaRows.appendChild(p);

      } catch (err) {
        console.error(`${key} error:`, err);
        appendStatus(statusRows, `${key}: terjadi error -> ${err.message || err}`, "red");
      }
    } // end for

    appendStatus(statusRows, "Proses selesai.", "green");
    btn.disabled = false;
  }

  // Render tabel dari array-of-arrays (SheetJS header:1)
  function renderTableFromArray(rows, theadEl, tbodyEl) {
    theadEl.innerHTML = "";
    tbodyEl.innerHTML = "";
    if (!rows || rows.length === 0) {
      theadEl.innerHTML = "<tr><th>No data</th></tr>";
      return;
    }

    // header = first row
    const headerRow = rows[0];
    const trHead = document.createElement("tr");
    headerRow.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h || "";
      trHead.appendChild(th);
    });
    theadEl.appendChild(trHead);

    // body
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const tr = document.createElement("tr");
      // ensure same length as header
      for (let c = 0; c < headerRow.length; c++) {
        const td = document.createElement("td");
        td.textContent = row?.[c] ?? "";
        tr.appendChild(td);
      }
      tbodyEl.appendChild(tr);
    }
  }

  // Placeholder download function
  function downloadMonthlyPlan() {
    alert("Fitur download belum diimplementasikan — mau aku tambahkan export Excel/CSV juga?");
  }
  </script>
</body>
</html>
