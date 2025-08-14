
let jsonData = [];

async function generateJSON() {
  const files = ["IW39.xlsx", "SUM57.xlsx", "Planning.xlsx", "Data1.xlsx", "Data2.xlsx"];
  file of files) {
    const response = await fetch(`excel/${file}`);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    data[file] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }

  const iw39 = data["IW39.xlsx"];
  const sum57 = Object.fromEntries(data["SUM57.xlsx"].map(row => [row.Order, row]));
  const planning = Object.fromEntries(data["Planning.xlsx"].map(row => [row.Order, row]));
  const sectionMap = Object.fromEntries(data["Data1.xlsx"].map(row => [row.Room, row.Section]));
  const cphMap = Object.fromEntries(data["Data2.xlsx"].map(row => [row.MAT, row.CPH]));

  jsonData = iw39.map((row, index) => {
    const order = row.Order;
    const mat = row.MAT;
    const desc = row.Description || "";
    const plan = row["Total sum (plan)"] || 0;
    const actual = row["Total sum (actual)"] || 0;
    const costVal = (plan - actual) / 16500;
    const cost = costVal < 0 ? "-" : parseFloat(costVal.toFixed(2));
    const include = cost === "-" ? "-" : cost;
    const exclude = row["Order Type"] === "PM38" ? "-" : include;

    return {
      Room: row.Room,
      "Order Type": row["Order Type"],
      Order: order,
      Description: desc,
      "Created On": row["Created On"],
      "User Status": row["User Status"],
      MAT: mat,
      CPH: desc.startsWith("JR") ? "JR" : cphMap[mat] || "",
      Section: sectionMap[row.Room] || "",
      "Part Complete": sum57[order]?.["Part Complete"] || "",
      Aging: sum57[order]?.Aging || "",
      Month: "",
      Cost: cost,
      Reman: "",
      Include: include,
      Exclude: exclude,
      Planning: planning[order]?.["Event Start"]?.toString() || "",
      "Status AMT": planning[order]?.Status || ""
    };
  });

  renderTable();
}

function renderTable() {
  const container = document.getElementById("table-container");
  container.innerHTML = "";

  const table = document.createElement("table");
  table.border = "1";
  const header = Object.keys(jsonData[0]);
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  header.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });

  const actionTh = document.createElement("th");
  actionTh.textContent = "Action";
  headRow.appendChild(actionTh);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  jsonData.forEach((row, index) => {
    const tr = document.createElement("tr");
    header.forEach(h => {
      const td = document.createElement("td");
      td.textContent = row[h];
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editRow(index);
    actionTd.appendChild(editBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function editRow(index) {
  const item = jsonData[index];
  const form = document.createElement("form");
  form.innerHTML = `<h3>Edit Data for Order ${item.Order}</h3>`;

  Object.keys(item).forEach(key => {
    form.innerHTML += `
      <label>${key}: <input name="${key}" value="${item[key]}" /></label><br>
    `;
  });

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.type = "submit";
  form.appendChild(saveBtn);

  form.onsubmit = function (e) {
    e.preventDefault();
    const inputs = form.querySelectorAll("input");
    inputs.forEach(input => {
      item[input.name] = input.value;
    });
    alert("Data updated!");
    form.remove();
    renderTable();
  };

  document.body.appendChild(form);
}

function saveJSON() {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "data_edited.json";
  link.click();
}
