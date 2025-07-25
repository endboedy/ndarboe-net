
let selectedIndex = null;

function getData() {
  return JSON.parse(localStorage.getItem("equipmentData") || "[]");
}

function saveData(data) {
  localStorage.setItem("equipmentData", JSON.stringify(data));
}

function clearForm() {
  document.getElementById("entryForm").reset();
  selectedIndex = null;
}

function fillTable() {
  const data = getData();
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";
  data.forEach((row, index) => {
    const tr = document.createElement("tr");
    Object.values(row).forEach(cell => {
      const td = document.createElement("td");
      td.innerText = cell;
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    actionTd.innerHTML = `
      <button onclick="editRow(${index})">Edit</button>
      <button onclick="deleteRow(${index})">Delete</button>
    `;
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

function editRow(index) {
  const data = getData()[index];
  selectedIndex = index;
  for (const key in data) {
    const field = document.getElementById(key);
    if (field) field.value = data[key];
  }
}

function deleteRow(index) {
  const data = getData();
  if (confirm("Delete this entry?")) {
    data.splice(index, 1);
    saveData(data);
    fillTable();
  }
}

document.getElementById("entryForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = {};
  this.querySelectorAll("input").forEach(input => {
    formData[input.id] = input.value;
  });

  const data = getData();
  if (selectedIndex === null) {
    data.push(formData);
  } else {
    data[selectedIndex] = formData;
  }

  saveData(data);
  fillTable();
  clearForm();
});

window.onload = fillTable;
