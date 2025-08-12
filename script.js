
// Monthly Plan BMB - script.js
// Requires SheetJS (xlsx.full.min.js) to be loaded in HTML

const excelFiles = {
    IW39: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/IW39.xlsx',
    SUM57: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/SUM57.xlsx',
    Planning: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Planning.xlsx',
    Data1: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Data1.xlsx',
    Data2: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Data2.xlsx'
};

let dataSources = {};

async function loadExcelFile(url) {
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    const wb = XLSX.read(ab, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
}

async function loadAllDataSources() {
    for (const [key, url] of Object.entries(excelFiles)) {
        dataSources[key] = await loadExcelFile(url);
    }
}

function lookupOrderData(order) {
    const iw39 = dataSources.IW39.find(row => row.Order == order);
    const sum57 = dataSources.SUM57.find(row => row.Order == order);
    const planning = dataSources.Planning.find(row => row.Order == order);
    const mat = iw39?.MAT || '';
    const room = iw39?.Room || '';
    const data2 = mat.startsWith('JR') ? { CPH: 'JR' } : dataSources.Data2.find(row => row.MAT == mat);
    const data1 = dataSources.Data1.find(row => row.Room == room);

    const totalPlan = parseFloat(iw39?.TotalPlan || 0);
    const totalActual = parseFloat(iw39?.TotalActual || 0);
    const cost = totalPlan && totalActual ? (totalPlan - totalActual) / 16500 : '-';
    const costValue = cost < 0 ? '-' : parseFloat(cost.toFixed(2));

    return {
        Order: order,
        Room: iw39?.Room || '',
        'Order Type': iw39?.OrderType || '',
        Description: iw39?.Description || '',
        'Created On': iw39?.CreatedOn || '',
        'User Status': iw39?.UserStatus || '',
        MAT: mat,
        CPH: data2?.CPH || '',
        Section: data1?.Section || '',
        'Status Part': sum57?.StatusPart || '',
        Aging: sum57?.Aging || '',
        Planning: planning?.EventStart || '',
        'Status AMT': planning?.StatusAMT || '',
        Cost: costValue,
        Month: '',
        Reman: '',
        Include: '',
        Exclude: ''
    };
}

function updateIncludeExclude(row) {
    if (row.Reman?.toLowerCase().includes('reman')) {
        row.Include = row.Cost !== '-' ? parseFloat((row.Cost * 0.25).toFixed(2)) : '-';
    } else {
        row.Include = row.Cost;
    }
    row.Exclude = row['Order Type'] === 'PM38' ? '-' : row.Include;
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    const table = document.createElement('table');
    const headers = Object.keys(data[0]).concat(['Action']);
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            if (h === 'Month') {
                const select = document.createElement('select');
                ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m;
                    opt.textContent = m;
                    select.appendChild(opt);
                });
                select.value = row.Month || '';
                select.onchange = e => { row.Month = e.target.value; };
                td.appendChild(select);
            } else if (h === 'Reman') {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = row.Reman || '';
                input.oninput = e => {
                    row.Reman = e.target.value;
                    updateIncludeExclude(row);
                    renderTable(data);
                };
                td.appendChild(input);
            } else if (h === 'Action') {
                const btn = document.createElement('button');
                btn.textContent = 'Delete';
                btn.onclick = () => {
                    data.splice(index, 1);
                    renderTable(data);
                };
                td.appendChild(btn);
            } else {
                td.textContent = row[h];
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

let tableData = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllDataSources();
    document.getElementById('orderForm').addEventListener('submit', e => {
        e.preventDefault();
        const input = document.getElementById('orderInput').value;
        const orders = input.split(',').map(o => o.trim()).filter(o => o);
        orders.forEach(order => {
            const row = lookupOrderData(order);
            updateIncludeExclude(row);
            tableData.push(row);
        });
        renderTable(tableData);
        document.getElementById('orderInput').value = '';
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(tableData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'data.json';
        a.click();
    });

    document.getElementById('loadBtn').addEventListener('click', async () => {
        const res = await fetch('https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/data.json');
        const json = await res.json();
        tableData = json;
        renderTable(tableData);
    });
});
