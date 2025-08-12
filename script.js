let data = [];

function showMenu(menu) {
    document.getElementById('lembarKerja').classList.add('hidden');
    document.getElementById('costRM').classList.add('hidden');
    document.getElementById(menu).classList.remove('hidden');
}

function addOrder(event) {
    event.preventDefault();
    const input = document.getElementById('orderInput').value;
    const orders = input.split(',').map(o => o.trim()).filter(o => o);
    orders.forEach(order => {
        data.push({
            Order: order,
            Room: '',
            OrderType: '',
            Description: '',
            CreatedOn: '',
            UserStatus: '',
            MAT: '',
            CPH: '',
            Section: '',
            StatusPart: '',
            Aging: '',
            Month: '',
            Reman: '',
            Cost: '',
            Include: '',
            Exclude: '',
            Planning: '',
            StatusAMT: ''
        });
    });
    document.getElementById('orderInput').value = '';
    renderTable();
}

function renderTable() {
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
            if (h === 'Action') {
                td.innerHTML = `<button onclick="editRow(${index})">Edit</button>
                                <button onclick="deleteRow(${index})">Delete</button>`;
            } else if (h === 'Month') {
                td.innerHTML = `<select onchange="updateValue(${index}, 'Month', this.value)">
                    <option value="">-</option>
                    <option>Jan</option><option>Feb</option><option>Mar</option>
                    <option>Apr</option><option>May</option><option>Jun</option>
                    <option>Jul</option><option>Aug</option><option>Sep</option>
                    <option>Oct</option><option>Nov</option><option>Dec</option>
                </select>`;
            } else if (h === 'Reman') {
                td.innerHTML = `<input type="text" value="${row[h]}" onchange="updateValue(${index}, 'Reman', this.value)">`;
            } else {
                td.textContent = row[h] || '';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function updateValue(index, key, value) {
    data[index][key] = value;
}

function editRow(index) {
    // Placeholder for future edit logic
}

function deleteRow(index) {
    data.splice(index, 1);
    renderTable();
}

function applyFilters() {
    const room = document.getElementById('filterRoom').value.toLowerCase();
    const order = document.getElementById('filterOrder').value.toLowerCase();
    const mat = document.getElementById('filterMAT').value.toLowerCase();
    const cph = document.getElementById('filterCPH').value.toLowerCase();
    const section = document.getElementById('filterSection').value.toLowerCase();

    const filtered = data.filter(row =>
        row.Room.toLowerCase().includes(room) &&
        row.Order.toLowerCase().includes(order) &&
        row.MAT.toLowerCase().includes(mat) &&
        row.CPH.toLowerCase().includes(cph) &&
        row.Section.toLowerCase().includes(section)
    );
    renderFilteredTable(filtered);
}

function renderFilteredTable(filteredData) {
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    const table = document.createElement('table');
    const headers = Object.keys(filteredData[0] || {}).concat(['Action']);
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
    filteredData.forEach((row, index) => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            if (h === 'Action') {
                td.innerHTML = `<button onclick="editRow(${index})">Edit</button>
                                <button onclick="deleteRow(${index})">Delete</button>`;
            } else {
                td.textContent = row[h] || '';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function resetFilters() {
    document.getElementById('filterRoom').value = '';
    document.getElementById('filterOrder').value = '';
    document.getElementById('filterMAT').value = '';
    document.getElementById('filterCPH').value = '';
    document.getElementById('filterSection').value = '';
    renderTable();
}

function refreshTable() {
    renderTable();
}

function saveToGitHub() {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
}

async function loadFromGitHub() {
    try {
        const res = await fetch('data.json');
        data = await res.json();
        renderTable();
    } catch (err) {
        alert('Gagal load data.json');
    }
}
