
function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = section.id === id ? 'block' : 'none';
    });
}

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
            const storageRef = firebase.storage().ref(key + '/' + file.name);
            storageRef.put(file).then(() => {
                console.log(key + " uploaded successfully.");
            }).catch(error => {
                console.error("Error uploading " + key + ": ", error);
            });
        }
    }
}

function downloadMonthlyPlan() {
    alert("Download functionality will be implemented here.");
}
