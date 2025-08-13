
const IW39_URL = 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/IW39.xlsx';
const SHEET_NAME = 'IW39';

async function loadExcel(url, sheetName) {
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    const wb = XLSX.read(ab, { type: 'array' });
    const sheet = wb.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
}

function calculateCost(plan, actual) {
    const p = parseFloat(plan || 0);
    const a = parseFloat(actual || 0);
    const cost = (p - a) / 16500;
    return cost < 0 ? '-' : parseFloat(cost.toFixed(2));
}

function calculateInclude(reman, cost) {
    if (typeof reman === 'string' && reman.toLowerCase().includes('reman')) {
        return cost !== '-' ? parseFloat((cost * 0.25).toFixed(2)) : '-';
    }
    return cost;
}

function calculateExclude(orderType, include) {
    return orderType === 'PM38' ? '-' : include;
}

function validateData(data) {
    return data.every(row => row.Month && row.Reman);
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
                    row.Include = calculateInclude(row.Reman, row.Cost);
                    row.Exclude = calculateExclude(row['Order Type'], row.Include);
                    renderTable(tableData); // refresh table to show updated values
                };
                td.appendChild(input);
            } else if (h === 'Action') {
                const btn = document.createElement('button');
                btn.textContent = 'Edit';
                btn.onclick = () => alert(`Edit Order ${row.Order}`);
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
    const rawData = await loadExcel(IW39_URL, SHEET_NAME);
    console.log("Raw data:", rawData); // debug

    tableData = rawData.map(row => {
        const cost = calculateCost(row['Total sum (plan)'], row['Total sum (actual)']);
        const include = calculateInclude('', cost);
        const exclude = calculateExclude(row['Order Type'], include);
        return {
            Room: row.Room || '',
            'Order Type': row['Order Type'] || '',
            Order: row.Order || '',
            Description: row.Description || '',
            'Created On': row['Created On'] || '',
            'User Status': row['User Status'] || '',
            MAT: row.MAT || '',
            Month: '',
            Reman: '',
            Cost: cost,
            Include: include,
            Exclude: exclude
        };
    });

    renderTable(tableData);

    document.getElementById('saveBtn').addEventListener('click', () => {
        if (!validateData(tableData)) {
            alert('Semua baris harus diisi Month dan Reman sebelum menyimpan!');
            return;
        }
        const blob = new Blob([JSON.stringify(tableData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'data.json';
        a.click();
    });
});
