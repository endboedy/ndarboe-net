
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

    for (const [key, file] of Object.entries(files)) {
        if (file) {
            const storageRef = firebase.storage().ref(`${key}/${file.name}`);
            storageRef.put(file)
                .then(() => {
                    console.log(`${key} uploaded successfully.`);
                })
                .catch(error => {
                    console.error(`Error uploading ${key}:`, error);
                });
        }
    }
}

// Fungsi untuk download file (placeholder)
function downloadMonthlyPlan() {
    alert("Download functionality will be implemented here.");
}
