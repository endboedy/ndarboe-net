// Import Firebase SDK (sudah di-include di HTML)
const firebaseConfig = {
  apiKey: "AIzaSyA9OAiNLQd8jcSJAhQTbVAEWus1nevatfc",
  authDomain: "monthly-plan-2baf5.firebaseapp.com",
  projectId: "monthly-plan-2baf5",
  storageBucket: "monthly-plan-2baf5.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://monthly-plan-2baf5-default-rtdb.firebaseio.com"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const database = firebase.database();

// DOM
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const output = document.getElementById("output");
const fileList = document.getElementById("fileList");

// Upload file ke Firebase
uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) return alert("Pilih file terlebih dahulu!");

  const storageRef = storage.ref("uploads/" + file.name);
  const uploadTask = storageRef.put(file);

  uploadTask.on("state_changed",
    snapshot => {
      let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      output.innerText = `Uploading: ${progress.toFixed(0)}%`;
    },
    error => {
      alert("Upload gagal: " + error.message);
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then(url => {
        const fileMeta = {
          name: file.name,
          url: url,
          uploadedAt: new Date().toISOString()
        };
        database.ref("files").push(fileMeta);
        output.innerText = "✅ Upload berhasil!";
        loadFiles();
      });
    }
  );
});

// Menampilkan daftar file yang sudah diupload
function loadFiles() {
  fileList.innerHTML = "";
  database.ref("files").once("value", snapshot => {
    snapshot.forEach(child => {
      const file = child.val();
      const li = document.createElement("li");
      li.innerHTML = `<a href="${file.url}" target="_blank">${file.name}</a> - ${new Date(file.uploadedAt).toLocaleString()}`;
      fileList.appendChild(li);
    });
  });
}

// Baca isi Excel
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log("Excel Data:", json);
  };
  reader.readAsArrayBuffer(file);
});

// Load file saat halaman dibuka
loadFiles();
