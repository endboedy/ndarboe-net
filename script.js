
async function generateJSON() {
  const files = ["IW39.xlsx", "SUM57.xlsx", "Planning.xlsx", "Data1.xlsx", "Data2.xlsx"];
  const data = {};

  for (const file of files) {
    const response = await fetch(`excel/${file}`);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    data[file] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }

  const iw39 = data["IW39.xlsx"];
  const sum57 = Object.fromEntries(data["SUM57.xlsx"].map(row => [row.Order, row]));
  const planning = Object.fromEntries(data["Planning.xlsx"].map(row => [row.Order, row]));
  const sectionMap = Object.fromEntries(data["Data1.xlsx"].map(row => [row.Room, row.Section]));
  const cphMap = Object.fromEntries(data["Data2.xlsx"].map(row => [row.MAT, row.CPH]));

  const result = iw39.map(row => {
    const order = row.Order;
    const mat = row.MAT;
    const desc = row.Description || "";
    const plan = row["Total sum (plan)"] || 0;
    const actual = row["Total sum (actual)"] || 0;
    const costVal = (plan - actual) / 16500;
    const cost = costVal < 0 ? "-" : parseFloat(costVal.toFixed(2));
    const include = cost === "-" ? "-" : cost;
    const exclude = row["Order Type"] === "PM38" ? "-" : include;

    return {
      Room: row.Room,
      "Order Type": row["Order Type"],
      Order: order,
      Description: desc,
      "Created On": row["Created On"],
      "User Status": row["User Status"],
      MAT: mat,
      CPH: desc.startsWith("JR") ? "JR" : cphMap[mat] || "",
      Section: sectionMap[row.Room] || "",
      "Part Complete": sum57[order]?.["Part Complete"] || "",
      Aging: sum57[order]?.Aging || "",
      Month: "",
      Cost: cost,
      Reman: "",
      Include: include,
      Exclude: exclude,
      Planning: planning[order]?.["Event Start"] || "",
      "Status AMT": planning[order]?.Status || ""
    };
  });

  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "data.json";
  link.click();
}
