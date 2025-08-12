
async function loadIW39Data() {
    const url = 'https://raw.githubusercontent.com/endboedy/Monthly-Plan/main/data/render_data.json';
    const res = await fetch(url);
    const data = await res.json();
    return data;
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
                input.oninput = e => { row.Reman = e.target.value; };
                td.appendChild(input);
            } else if (h === 'Action') {
                const btn = document.createElement('button');
                btn.textContent = 'Edit';
                btn.onclick = () => {
                    alert(`Edit Order ${row.Order}`);
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

function validateBeforeSave(data) {
    return data.every(row => row.Month && row.Reman);
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadIW39Data();
    renderTable(data);

    document.getElementById('saveBtn').addEventListener('click', () => {
        if (!validateBeforeSave(data)) {
            alert('Semua baris harus diisi Month dan Reman sebelum menyimpan!');
            return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'data.json';
        a.click();
    });
});
