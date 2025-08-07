
// Fungsi untuk menampilkan section sesuai menu yang diklik
function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = section.id === id ? 'block' : 'none';
    });
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
    const files = {
        iwds: document.getElementById('iwdsFile').files[0],
        swot: document.getElementById('swotFile').files[0],
        planning: document.getElementById('planningFile').files[0],
        detail1: document.getElementById('detail1File').files[0],
        detail2: document.getElementById('detail2File').files[0]
    };

    // Hapus status sebelumnya jika ada
    const oldStatus = document.getElementById('uploadStatus');
    if (oldStatus) oldStatus.remove();

    // Buat elemen status baru
    const statusBox = document.createElement('div');
    statusBox.id = 'uploadStatus';
    statusBox.style.marginTop = '15px';
    statusBox.innerHTML = '<strong>Status Upload:</strong><br>';
    document.querySelector('.upload-form').appendChild(statusBox);

    for (const [key, file] of Object.entries(files)) {
        if (file) {
            const storageRef = firebase.storage().ref(`${key}/${file.name}`);
            storageRef.put(file)
                .then(() => {
                    const msg = document.createElement('p');
                    msg.textContent = `${key.toUpperCase()} uploaded successfully.`;
                    msg.style.color = 'green';
                    statusBox.appendChild(msg);
                })
                .catch(error => {
                    const msg = document.createElement('p');
                    msg.textContent = `Error uploading ${key.toUpperCase()}: ${error.message}`;
                    msg.style.color = 'red';
                    statusBox.appendChild(msg);
                });
        } else {
            const msg = document.createElement('p');
            msg.textContent = `${key.toUpperCase()} file not selected.`;
            msg.style.color = 'orange';
            statusBox.appendChild(msg);
        }
    }
}

// Fungsi placeholder untuk download
function downloadMonthlyPlan() {
    alert("Download functionality will be implemented here.");
}
