
const excelFiles = {
    IW39: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/IW39.xlsx',
    SUM57: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/SUM57.xlsx',
    Planning: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Planning.xlsx',
    Data1: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Data1.xlsx',
    Data2: 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/excel/Data2.xlsx'
};

let dataSources = {};

async function loadExcelFile(url) {
    try {
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        const wb = XLSX.read(ab, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        console.log(`Loaded ${url}`, json.slice(0, 3)); // tampilkan 3 baris pertama
        return json;
    } catch (err) {
        console.error(`Gagal load ${url}`, err);
        return [];
    }
}

async function loadAllDataSources() {
    for (const [key, url] of Object.entries(excelFiles)) {
        dataSources[key] = await loadExcelFile(url);
    }
    console.log('Semua data berhasil dimuat:', dataSources);
}

function lookupOrderData(order) {
    const iw39 = dataSources.IW39.find(row => row.Order?.toString().trim() === order.trim());
    const sum57 = dataSources.SUM57.find(row => row.Order?.toString().trim() === order.trim());
    const planning = dataSources.Planning.find(row => row.Order?.toString().trim() === order.trim());

    const mat = iw39?.MAT?.toString().trim() || '';
    const room = iw39?.Room?.toString().trim() || '';

    const data2 = mat.startsWith('JR') ? { CPH: 'JR' } :
        dataSources.Data2.find(row => row.MAT?.toString().trim().toUpperCase() === mat.toUpperCase());

    const data1 = dataSources.Data1.find(row => row.Room?.toString().trim().toUpperCase() === room.toUpperCase());

    const totalPlan = parseFloat(iw39?.TotalPlan || 0);
    const totalActual = parseFloat(iw39?.TotalActual || 0);
    const cost = totalPlan && totalActual ? (totalPlan - totalActual) / 16500 : '-';
    const costValue = cost < 0 ? '-' : parseFloat(cost.toFixed(2));

    const result = {
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

    console.log('Hasil lookup:', result);
    return result;
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
