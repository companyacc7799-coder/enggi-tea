/* =====================================================
   GRAPH VISUALIZER
   Parses a simple f(x) expression and plots it on canvas.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("plotBtn").addEventListener("click", plotFunction);
  plotFunction();
});

function compileFunction(expr) {
  const sanitized = expr
    .replace(/\^/g, "**")
    .replace(/\bpi\b/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/\b(sin|cos|tan|sqrt|log|abs|exp|pow|atan|asin|acos)\b/g, "Math.$1");

  // Guard against anything that isn't arithmetic / Math.* / x
  if (!/^[0-9x\s+\-*/().,MathPIEsincoqrtlgabeuxpowanS]*$/i.test(sanitized)) {
    throw new Error("Expression contains unsupported characters.");
  }

  // eslint-disable-next-line no-new-func
  return new Function("x", `"use strict"; return (${sanitized});`);
}

function plotFunction() {
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");
  const errorBox = document.getElementById("graphError");
  errorBox.style.display = "none";

  const exprRaw = document.getElementById("fnInput").value.trim();
  const xMin = parseFloat(document.getElementById("xMin").value);
  const xMax = parseFloat(document.getElementById("xMax").value);

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (!exprRaw || isNaN(xMin) || isNaN(xMax) || xMin >= xMax) {
    errorBox.textContent = "Enter a valid function and a range where x min is less than x max.";
    errorBox.style.display = "block";
    return;
  }

  let fn;
  try {
    fn = compileFunction(exprRaw);
    fn(1); // sanity check
  } catch (err) {
    errorBox.textContent = "Could not parse that function. Check the syntax and try again.";
    errorBox.style.display = "block";
    return;
  }

  const samples = [];
  const steps = 600;
  let yMin = Infinity, yMax = -Infinity;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps;
    let y;
    try { y = fn(x); } catch { y = NaN; }
    if (isFinite(y)) {
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
    samples.push({ x, y });
  }

  if (!isFinite(yMin) || !isFinite(yMax)) {
    errorBox.textContent = "This function produced no plottable values in that range.";
    errorBox.style.display = "block";
    return;
  }
  if (yMin === yMax) { yMin -= 1; yMax += 1; }

  const padY = (yMax - yMin) * 0.1;
  yMin -= padY; yMax += padY;

  const toPx = (x, y) => {
    const px = ((x - xMin) / (xMax - xMin)) * width;
    const py = height - ((y - yMin) / (yMax - yMin)) * height;
    return [px, py];
  };

  // grid
  ctx.strokeStyle = "#E3DDF7";
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= 10; gx++) {
    const px = (gx / 10) * width;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, height); ctx.stroke();
  }
  for (let gy = 0; gy <= 8; gy++) {
    const py = (gy / 8) * height;
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(width, py); ctx.stroke();
  }

  // axes
  ctx.strokeStyle = "#8A7FDC";
  ctx.lineWidth = 2;
  if (yMin < 0 && yMax > 0) {
    const [, zy] = toPx(0, 0);
    ctx.beginPath(); ctx.moveTo(0, zy); ctx.lineTo(width, zy); ctx.stroke();
  }
  if (xMin < 0 && xMax > 0) {
    const [zx] = toPx(0, 0);
    ctx.beginPath(); ctx.moveTo(zx, 0); ctx.lineTo(zx, height); ctx.stroke();
  }

  // curve
  ctx.strokeStyle = "#6C5CE7";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  let drawing = false;
  samples.forEach(({ x, y }) => {
    if (!isFinite(y)) { drawing = false; return; }
    const [px, py] = toPx(x, y);
    if (!drawing) { ctx.moveTo(px, py); drawing = true; }
    else { ctx.lineTo(px, py); }
  });
  ctx.stroke();
}
