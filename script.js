
function editRow(index) {
  const item = jsonData[index]; // jsonData = array hasil generate JSON
  const form = document.createElement("form");

  form.innerHTML = `
    <label>Order: <input value="${item.Order}" disabled /></label><br>
    <label>Room: <input value="${item.Room}" /></label><br>
    <label>MAT: <input value="${item.MAT}" /></label><br>
    <label>Section: <input value="${item.Section}" /></label><br>
    <label>CPH: <input value="${item.CPH}" /></label><br>
    <label>Planning: <input value="${item.Planning}" /></label><br>
    <label>Status AMT: <input value="${item["Status AMT"]}" /></label><br>
    <label>Part Complete: <input value="${item["Part Complete"]}" /></label><br>
    <label>Aging: <input value="${item.Aging}" /></label><br>
    <label>Month: <input value="${item.Month}" /></label><br>
    <label>Reman: <input value="${item.Reman}" /></label><br>
    <button type="submit">Save</button>
  `;

  form.onsubmit = function (e) {
    e.preventDefault();
    const inputs = form.querySelectorAll("input");
    inputs.forEach(input => {
      const key = input.previousSibling.textContent.replace(":", "").trim();
      item[key] = input.value;
    });
    alert("Data updated!");
    form.remove();
  };

  document.body.appendChild(form);
}
