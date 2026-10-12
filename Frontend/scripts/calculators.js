/* =====================================================
   CALCULATORS — tabs
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#calcTabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#calcTabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".calc-panel").forEach(p => {
        p.style.display = p.dataset.panel === btn.dataset.tab ? "block" : "none";
      });
    });
  });

  buildMatrixInputs();
});

/* ---------- Quadratic ---------- */

function solveQuadratic() {
  const a = parseFloat(document.getElementById("qa").value);
  const b = parseFloat(document.getElementById("qb").value);
  const c = parseFloat(document.getElementById("qc").value);
  const box = document.getElementById("quadraticResult");

  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    box.textContent = "Enter valid numbers for a, b and c.";
    box.classList.add("show");
    return;
  }
  if (a === 0) {
    box.textContent = "a cannot be 0 — this would not be a quadratic equation.";
    box.classList.add("show");
    return;
  }

  const discriminant = b * b - 4 * a * c;

  let text;
  if (discriminant > 0) {
    const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    text = `Discriminant = ${discriminant.toFixed(3)} (two real roots) → x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
  } else if (discriminant === 0) {
    const x = -b / (2 * a);
    text = `Discriminant = 0 (one repeated root) → x = ${x.toFixed(4)}`;
  } else {
    const real = (-b / (2 * a)).toFixed(4);
    const imag = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
    text = `Discriminant = ${discriminant.toFixed(3)} (complex roots) → x = ${real} ± ${imag}i`;
  }

  box.textContent = text;
  box.classList.add("show");
}

/* ---------- Matrix determinant ---------- */

function buildMatrixInputs() {
  const size = parseInt(document.getElementById("matrixSize").value, 10);
  const grid = document.getElementById("matrixGrid");
  grid.style.gridTemplateColumns = `repeat(${size}, 90px)`;
  grid.innerHTML = "";

  for (let i = 0; i < size * size; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.className = "form-control matrix-cell";
    input.value = i % (size + 1) === 0 ? "1" : "0";
    grid.appendChild(input);
  }
}

function solveDeterminant() {
  const size = parseInt(document.getElementById("matrixSize").value, 10);
  const cells = Array.from(document.querySelectorAll(".matrix-cell")).map(c => parseFloat(c.value) || 0);
  const box = document.getElementById("matrixResult");

  let det;
  if (size === 2) {
    const [a, b, c, d] = cells;
    det = a * d - b * c;
  } else {
    const m = [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6, 9)];
    det =
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }

  box.textContent = `det(A) = ${det.toFixed(4)}`;
  box.classList.add("show");
}

/* ---------- Stats ---------- */

function solveStats() {
  const raw = document.getElementById("statData").value;
  const box = document.getElementById("statsResult");

  const values = raw.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

  if (values.length === 0) {
    box.textContent = "Enter at least one numeric value, separated by commas.";
    box.classList.add("show");
    return;
  }

  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  box.textContent = `n = ${n} · Mean = ${mean.toFixed(4)} · Variance = ${variance.toFixed(4)} · Std Dev = ${stdDev.toFixed(4)}`;
  box.classList.add("show");
}
