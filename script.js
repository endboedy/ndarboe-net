
async function loadData() {
  const response = await fetch("data.json");
  const data = await response.json();
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.Room}</td><td>${row["Order Type"]}</td><td>${row.Order}</td><td>${row.Description}</td>
      <td>${row["Created On"]}</td><td>${row["User Status"]}</td><td>${row.MAT}</td><td>${row.CPH}</td>
      <td>${row.Section}</td><td>${row["Status Part"]}</td><td>${row.Aging}</td>
      <td>
        <select>
          ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            .map(m => `<option value="${m}" ${m === row.Month ? "selected" : ""}>${m}</option>`).join("")}
        </select>
      </td>
      <td>${row.Cost}</td>
      <td><input type="text" value="${row.Reman}" placeholder="Reman"></td>
      <td>${row.Include}</td><td>${row.Exclude}</td>
      <td>${row.Planning}</td><td>${row["Status AMT"]}</td>
      <td class="action-buttons">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.onload = loadData;
