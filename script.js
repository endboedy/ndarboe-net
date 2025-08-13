
async function fetchExcel(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
}

function calculateCost(plan, actual) {
  const result = (plan - actual) / 16500;
  return result < 0 ? "-" : result.toFixed(2);
}

function calculateInclude(reman, cost) {
  if (reman.toLowerCase() === "reman") return (cost * 0.25).toFixed(2);
  return cost;
}

function calculateExclude(orderType, include) {
  return orderType === "PM38" ? "-" : include;
}

function createMonthDropdown() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `<select>${months.map(m => `<option value="${m}">${m}</option>`).join("")}</select>`;
}

async function loadData() {
  const base = "https://endboedy.github.io/Monthly-Plan/excel/";
  const files = {
    IW39: "IW39.xlsx",
    SUM57: "SUM57.xlsx",
    Planning: "Planning.xlsx",
    Data1: "Data1.xlsx",
    Data2: "Data2.xlsx"
  };

  const [IW39, SUM57, Planning, Data1, Data2] = await Promise.all(
    Object.values(files).map(file => fetchExcel(base + file))
  );

  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  IW39.forEach(row => {
    const order = row.Order;
    const mat = row.MAT;
    const orderType = row["Order Type"];
    const description = row.Description || "";

    // CPH
    const cph = description.startsWith("JR") ? "JR" : (Data2.find(d => d.MAT === mat)?.CPH || "");

    // Section
    const section = Data1.find(d => d.Order === order)?.Section || "";

    // SUM57 lookup
    const sumData = SUM57.find(d => d.Order === order) || {};
    const statusPart = sumData["Status Part"] || "";
    const aging = sumData["Aging"] || "";

    // Planning lookup
    const planData = Planning.find(d => d.Order === order) || {};
    const planning = planData["Event Start"] || "";
    const statusAMT = planData["Status AMT"] || "";

    // Cost
    const plan = parseFloat(row.Plan || 0);
    const actual = parseFloat(row.Actual || 0);
    const cost = calculateCost(plan, actual);

    // Reman manual input
    const reman = ""; // default kosong
    const include = calculateInclude(reman, cost);
    const exclude = calculateExclude(orderType, include);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.Room}</td><td>${orderType}</td><td>${order}</td><td>${description}</td>
      <td>${row["Created On"]}</td><td>${row["User Status"]}</td><td>${mat}</td><td>${cph}</td>
      <td>${section}</td><td>${statusPart}</td><td>${aging}</td>
      <td>${createMonthDropdown()}</td>
      <td>${cost}</td>
      <td><input type="text" placeholder="Reman"></td>
      <td>${include}</td><td>${exclude}</td>
      <td>${planning}</td><td>${statusAMT}</td>
      <td class="action-buttons">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.onload = loadData;
