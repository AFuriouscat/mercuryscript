// app.js
const codeArea = document.getElementById("codeArea");
const runBtn = document.getElementById("runBtn");
const tableBody = document.querySelector("#tokenTable tbody");
const exportCsvBtn = document.getElementById("exportCsvBtn");

runBtn.addEventListener("click", () => {
  const lexer = new Lexer(codeArea.value);
  const tokens = lexer.tokenize();

  // Clear table
  tableBody.innerHTML = "";

  for (let t of tokens) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${t.lexeme}</td><td>${t.token}</td>`;
    tableBody.appendChild(row);
  }
});

exportCsvBtn.addEventListener("click", () => {
  let csv = "Lexeme,Token\n";
  document.querySelectorAll("#tokenTable tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    csv += `"${cells[0].textContent}","${cells[1].textContent}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tokens.csv";
  a.click();
  URL.revokeObjectURL(url);
});
