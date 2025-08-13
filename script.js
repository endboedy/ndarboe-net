
let tableData = [];

function applyFilters() {
    const filters = {
        Room: document.getElementById('filterRoom').value.toLowerCase(),
        Order: document.getElementById('filterOrder').value.toLowerCase(),
        MAT: document.getElementById('filterMAT').value.toLowerCase(),
        CPH: document.getElementById('filterCPH').value.toLowerCase(),
        Section: document.getElementById('filterSection').value.toLowerCase(),
        Month: document.getElementById('filterMonth')?.value?.toLowerCase() || ''
    };

    const filtered = tableData.filter(row => {
        return Object.keys(filters).every(key => {
            return !filters[key] || (row[key] || '').toLowerCase().includes(filters[key]);
        });
    });

    renderTable(filtered);
}

function resetFilters() {
    ['filterRoom', 'filterOrder', 'filterMAT', 'filterCPH', 'filterSection', 'filterMonth'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    renderTable(tableData);
}

function refreshData() {
    mergeData(); // reload dari Excel
}

function saveJSON() {
    const blob = new Blob([JSON.stringify(tableData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MonthlyPlanData.json';
    a.click();
    URL.revokeObjectURL(url);
}

function loadJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = evt => {
            tableData = JSON.parse(evt.target.result);
            renderTable(tableData);
        };
        reader.readAsText(file);
    };
    input.click();
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    const table = document.createElement('table');

    const headers = Object.keys(data[0] || {}).concat(['Action']);
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
                select.onchange = e => {
                    row.Month = e.target.value;
                };
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

    document.getElementById('filterBtn')?.addEventListener('click', applyFilters);
    document.getElementById('resetBtn')?.addEventListener('click', resetFilters);
    document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
    document.getElementById('saveJSONBtn')?.addEventListener('click', saveJSON);
    document.getElementById('loadJSONBtn')?.addEventListener('click', loadJSON);
});
