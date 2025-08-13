
const dummyData = [
    {
        Room: 'RM01',
        'Order Type': 'PM01',
        Order: '4700765277',
        Description: 'Replace filter',
        'Created On': '2023-08-01',
        'User Status': 'Open',
        MAT: 'MAT001',
        CPH: 'CPH01',
        Section: 'A',
        'Status Part': 'Available',
        Aging: '5',
        Month: 'Jan',
        Cost: '120.50',
        Reman: '',
        Include: '',
        Exclude: '',
        Planning: '',
        'Status AMT': ''
    }
];

function calculateInclude(reman, cost) {
    if (typeof reman === 'string' && reman.toLowerCase().includes('reman')) {
        const c = parseFloat(cost || 0);
        return c > 0 ? (c * 0.25).toFixed(2) : '';
    }
    return cost;
}

function calculateExclude(orderType, include) {
    return orderType === 'PM38' ? '' : include;
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    const table = document.createElement('table');

    const headers = [
        'Room', 'Order Type', 'Order', 'Description', 'Created On', 'User Status',
        'MAT', 'CPH', 'Section', 'Status Part', 'Aging', 'Month', 'Cost', 'Reman',
        'Include', 'Exclude', 'Planning', 'Status AMT', 'Action'
    ];

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
                select.value = row.Month || 'Jan';
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
                    renderTable(dummyData); // refresh table
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
                td.textContent = row[h] || '';
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable(dummyData);
});
