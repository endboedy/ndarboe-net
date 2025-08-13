
const files = {
    IW39: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/IW39.xlsx',
    SUM57: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/SUM57.xlsx',
    Planning: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Planning.xlsx',
    Data1: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Data1.xlsx',
    Data2: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Data2.xlsx'
};

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

let tableData = [];

async function mergeData() {
    const [iw39, sum57, planning, data1, data2] = await Promise.all([
        loadExcel(files.IW39, 'IW39'),
        loadExcel(files.SUM57, 'SUM57'),
        loadExcel(files.Planning, 'Planning'),
        loadExcel(files.Data1, 'Data1'),
        loadExcel(files.Data2, 'Data2')
    ]);

    const result = iw39.map(row => {
        const mat = row.MAT || '';
        const order = row.Order || '';
        const orderType = row['Order Type'] || '';
        const cost = calculateCost(row['Total sum (plan)'], row['Total sum (actual)']);
        const reman = '';
        const month = '';

        const include = calculateInclude(reman, cost);
        const exclude = calculateExclude(orderType, include);

        const cph = mat.startsWith('JR') ? 'JR' : (data2.find(d => d.MAT === mat)?.CPH || '');
        const section = data1.find(d => d.MAT === mat)?.Section || '';
        const sumRow = sum57.find(d => d.Order === order) || {};
        const statusPart = sumRow['Part Complete'] || '';
        const aging = sumRow['Aging'] || '';
        const planRow = planning.find(d => d.Order === order) || {};
        const planningDate = planRow['Event Start'] || '';
        const statusAMT = planRow['Status'] || '';

        return {
            Room: row.Room || '',
            'Order Type': orderType,
            Order: order,
            Description: row.Description || '',
            'Created On': row['Created On'] || '',
            'User Status': row['User Status'] || '',
            MAT: mat,
            CPH: cph,
            Section: section,
            'Status Part': statusPart,
            Aging: aging,
            Month: month,
            Cost: cost,
            Reman: reman,
            Include: include,
            Exclude: exclude,
            Planning: planningDate,
            'Status AMT': statusAMT
        };
    });

    tableData = result;
    renderTable(tableData);
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
                    renderTable(data);
                };
                td.appendChild(input);
            } else if (h === 'Action') {
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.onclick = () => alert(`Edit Order ${row.Order}`);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => {
                    data.splice(index, 1);
                    renderTable(data);
                };

                td.appendChild(editBtn);
                td.appendChild(deleteBtn);
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

document.addEventListener('DOMContentLoaded', () => {
    mergeData();
});
