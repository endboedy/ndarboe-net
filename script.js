
const githubBase = "https://raw.githubusercontent.com/endboedy/belajar-web/main/excel/";
let orders = [];

function showMenu(menu) {
    document.getElementById("lembarKerja").classList.add("hidden");
    document.getElementById("costRM").classList.add("hidden");
    document.getElementById(menu).classList.remove("hidden");
}

function addOrder(event) {
    event.preventDefault();
    const order = document.getElementById("orderInput").value.trim();
    if (order && !orders.includes(order)) {
        orders.push(order);
        loadAllData();
    }
    document.getElementById("orderForm").reset();
}

async function fetchExcel(fileName) {
    const res = await fetch(githubBase + fileName);
    const data = await res.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
}

async function loadAllData() {
    const [iw39, sum57, planning, data1, data2] = await Promise.all([
        fetchExcel("IW39.xlsx"),
        fetchExcel("SUM57.xlsx"),
        fetchExcel("Planning.xlsx"),
        fetchExcel("Data1.xlsx"),
        fetchExcel("Data2.xlsx")
    ]);

    const tableContainer = document.getElementById("tableContainer");
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    const header = ["Order", "Room", "Order Type", "Description", "Created On", "User Status", "MAT", "CPH", "Section", "Status Part", "Aging", "Month", "Reman", "Cost", "Include", "Exclude", "Planning", "Status AMT", "Action"];
    const thead = document.createElement("tr");
    header.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        thead.appendChild(th);
    });
    table.appendChild(thead);

    orders.forEach(order => {
        const iw = iw39.find(row => row["Order"] == order);
        if (!iw) return;

        const room = iw["Room"];
        const mat = iw["MAT"];
        const orderType = iw["Order Type"];
        const totalPlan = parseFloat(iw["TotalPlan"] || 0);
        const totalActual = parseFloat(iw["TotalActual"] || 0);
        const costVal = (totalPlan - totalActual) / 16500;
        const cost = costVal < 0 ? "-" : costVal.toFixed(2);

        const cph = mat?.startsWith("JR") ? "JR" : (data2.find(d => d["MAT"] == mat)?.["CPH"] || "");
        const section = data1.find(d => d["Room"] == room)?.["Section"] || "";
        const sum = sum57.find(s => s["Order"] == order) || {};
        const plan = planning.find(p => p["Order"] == order) || {};

        const tr = document.createElement("tr");
        const monthCell = document.createElement("td");
        const remanCell = document.createElement("td");
        const includeCell = document.createElement("td");
        const excludeCell = document.createElement("td");

        const monthSelect = document.createElement("select");
        ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].forEach(m => {
            const opt = document.createElement("option");
            opt.value = m;
            opt.textContent = m;
            monthSelect.appendChild(opt);
        });
        monthSelect.disabled = true;
        monthCell.appendChild(monthSelect);

        const remanInput = document.createElement("input");
        remanInput.type = "text";
        remanInput.disabled = true;
        remanCell.appendChild(remanInput);

        includeCell.textContent = cost;
        excludeCell.textContent = orderType === "PM38" ? "-" : cost;

        const actionCell = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => {
            monthSelect.disabled = false;
            remanInput.disabled = false;
            remanInput.oninput = () => {
                const remanVal = remanInput.value;
                const include = remanVal.includes("Reman") ? (costVal * 0.25).toFixed(2) : cost;
                includeCell.textContent = include;
                excludeCell.textContent = orderType === "PM38" ? "-" : include;
            };
        };
        actionCell.appendChild(editBtn);

        const values = [
            order,
            room,
            orderType,
            iw["Description"],
            iw["Created On"],
            iw["User Status"],
            mat,
            cph,
            section,
            sum["Status Part"] || "",
            sum["Aging"] || "",
            monthCell,
            remanCell,
            cost,
            includeCell,
            excludeCell,
            plan["Event Start"] || "",
            plan["Status AMT"] || "",
            actionCell
        ];

        values.forEach(val => {
            const td = document.createElement("td");
            if (val instanceof HTMLElement) td.appendChild(val);
            else td.textContent = val;
            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    tableContainer.appendChild(table);
}
