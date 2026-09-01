const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function isDark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
function colors() {
  return isDark()
    ? { wire:"#5FA8FF", res:"#198825", batt:"#FCF2E0", text:"#D6DDEE", grid:"#22314F", line:"#14701E" }
    : { wire:"#01224B", res:"#14701E", batt:"#01224B", text:"#1E2430", grid:"#E3E8F4", line:"#14701E" };
}

/* ---------- reusable resistor zigzag ---------- */
function resistorPath(x1, y1, x2, y2) {
  const segs = 6, dx = (x2 - x1) / segs, dy = (y2 - y1) / segs;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i < segs; i++) {
    const px = x1 + dx * i, py = y1 + dy * i + (i % 2 === 0 ? 10 : -10);
    d += ` L ${px} ${py}`;
  }
  d += ` L ${x2} ${y2}`;
  return d;
}

/* ================= WIDGET 1: OHM'S LAW ================= */
function drawOhm(V, R) {
  const svg = document.getElementById("ohmSvg");
  svg.innerHTML = "";
  const c = colors();
  const I = V / R;

  // --- left: simple circuit ---
  const bx = 90, by = 130, w = 180, h = 90;
  svg.appendChild(el("rect", { x:bx, y:by-h/2, width:w, height:h, fill:"none", stroke:c.wire, "stroke-width":3, rx:4 }));
  // battery symbol on left edge
  svg.appendChild(el("line", { x1:bx, y1:by-14, x2:bx, y2:by+14, stroke:c.batt, "stroke-width":4 }));
  svg.appendChild(el("line", { x1:bx-8, y1:by-7, x2:bx-8, y2:by+7, stroke:c.batt, "stroke-width":2 }));
  const bt = el("text", { x:bx-24, y:by+4, "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); bt.textContent = V.toFixed(1)+"V"; svg.appendChild(bt);
  // resistor on top edge
  svg.appendChild(el("path", { d: resistorPath(bx+40, by-h/2, bx+w-40, by-h/2), stroke:c.res, "stroke-width":3, fill:"none" }));
  const rt = el("text", { x:bx+w/2-14, y:by-h/2-10, "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); rt.textContent = R.toFixed(1)+"Ω"; svg.appendChild(rt);
  // ammeter circle on right edge
  svg.appendChild(el("circle", { cx:bx+w, cy:by, r:16, fill:"none", stroke:c.wire, "stroke-width":2.4 }));
  const at = el("text", { x:bx+w, y:by+4, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-weight":"700", "font-size":"11", fill:c.text }); at.textContent = "A"; svg.appendChild(at);
  const it = el("text", { x:bx+w+26, y:by+4, "font-family":"IBM Plex Mono", "font-weight":"700", "font-size":"13", fill:c.res }); it.textContent = I.toFixed(2)+" A"; svg.appendChild(it);

  // flow dots
  const speed = Math.max(0.3, Math.min(3, I));
  const t = (Date.now()/1000 * speed) % 1;
  const perim = 2*w + 2*h;
  // simplified: dots along top edge only for clarity
  for (let k=0;k<4;k++){
    const frac = (t + k/4) % 1;
    const dx = bx + frac * w;
    svg.appendChild(el("circle", { cx:dx, cy:by-h/2, r:3, fill:c.res }));
  }

  // --- right: V-I graph ---
  const gx = 380, gy = 210, gw = 220, gh = 170;
  svg.appendChild(el("line", { x1:gx, y1:gy, x2:gx, y2:gy-gh, stroke:c.text, "stroke-width":1.4 }));
  svg.appendChild(el("line", { x1:gx, y1:gy, x2:gx+gw, y2:gy, stroke:c.text, "stroke-width":1.4 }));
  const lx = el("text", { x:gx+gw-10, y:gy+18, "text-anchor":"end", "font-family":"IBM Plex Mono", "font-size":"10", fill:c.text }); lx.textContent = "V →"; svg.appendChild(lx);
  const ly = el("text", { x:gx-8, y:gy-gh+4, "text-anchor":"end", "font-family":"IBM Plex Mono", "font-size":"10", fill:c.text }); ly.textContent = "I"; svg.appendChild(ly);

  // line I = V/R over V range 0-12
  const maxV = 12, maxI = 12; // scale
  const x2 = gx + gw, y2 = gy - Math.min(gh, (maxV/R) * (gh/maxI));
  svg.appendChild(el("line", { x1:gx, y1:gy, x2:x2, y2:y2, stroke:c.line, "stroke-width":2.4 }));

  // current point
  const px = gx + (V/maxV)*gw, py = gy - Math.min(gh, I*(gh/maxI));
  svg.appendChild(el("circle", { cx:px, cy:py, r:5, fill:c.res }));
  svg.appendChild(el("line", { x1:px, y1:py, x2:px, y2:gy, stroke:c.res, "stroke-width":1, "stroke-dasharray":"3 2" }));
  svg.appendChild(el("line", { x1:px, y1:py, x2:gx, y2:py, stroke:c.res, "stroke-width":1, "stroke-dasharray":"3 2" }));

  document.getElementById("ohmVVal").textContent = V.toFixed(1) + " V";
  document.getElementById("ohmRVal").textContent = R.toFixed(1) + " Ω";
  document.getElementById("ohmReadout").innerHTML = `
    <span class="tag hi">I = V/R = ${I.toFixed(2)} A</span>
    <span class="tag">Power P = VI = ${(V*I).toFixed(1)} W</span>
    <span class="tag">${I > 2.5 ? 'Low R → large current for the same V' : 'High R → small current for the same V'}</span>
  `;
}
document.getElementById("ohmV").addEventListener("input", e => drawOhm(+e.target.value, +document.getElementById("ohmR").value));
document.getElementById("ohmR").addEventListener("input", e => drawOhm(+document.getElementById("ohmV").value, +e.target.value));

/* ================= WIDGET 2: SERIES vs PARALLEL ================= */
function drawSP(R1, R2) {
  const svg = document.getElementById("spSvg");
  svg.innerHTML = "";
  const c = colors();
  const Vs = 12;
  const Rseries = R1 + R2;
  const Iseries = Vs / Rseries;
  const Rparallel = (R1 * R2) / (R1 + R2);
  const I1 = Vs / R1, I2 = Vs / R2;

  // --- series circuit (top) ---
  const sy = 55, sx = 70, sw = 500;
  svg.appendChild(el("line", { x1:sx, y1:sy, x2:sx+150, y2:sy, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("path", { d: resistorPath(sx+150, sy, sx+230, sy), stroke:c.res, "stroke-width":3, fill:"none" }));
  svg.appendChild(el("line", { x1:sx+230, y1:sy, x2:sx+310, y2:sy, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("path", { d: resistorPath(sx+310, sy, sx+390, sy), stroke:c.res, "stroke-width":3, fill:"none" }));
  svg.appendChild(el("line", { x1:sx+390, y1:sy, x2:sx+sw, y2:sy, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:sx+sw, y1:sy, x2:sx+sw, y2:sy+55, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:sx, y1:sy, x2:sx, y2:sy+55, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:sx, y1:sy+55, x2:sx+sw, y2:sy+55, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:sx+8, y1:sy+48, x2:sx+8, y2:sy+62, stroke:c.batt, "stroke-width":4 }));
  svg.appendChild(el("line", { x1:sx+20, y1:sy+52, x2:sx+20, y2:sy+58, stroke:c.batt, "stroke-width":2 }));
  const lbl1 = el("text", { x:sx+190, y:sy-12, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); lbl1.textContent = "R1="+R1.toFixed(1); svg.appendChild(lbl1);
  const lbl2 = el("text", { x:sx+350, y:sy-12, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); lbl2.textContent = "R2="+R2.toFixed(1); svg.appendChild(lbl2);
  const st = el("text", { x:sx, y:sy+92, "font-family":"IBM Plex Mono", "font-weight":"700", "font-size":"12", fill:c.line }); st.textContent = `SERIES  R_eq = ${Rseries.toFixed(1)} Ω   I = ${Iseries.toFixed(2)} A (same everywhere)`; svg.appendChild(st);

  // --- parallel circuit (bottom) ---
  const py0 = 245, px0 = 70, pw = 500, branchGap = 55;
  svg.appendChild(el("line", { x1:px0, y1:py0, x2:px0+120, y2:py0, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0+120, y1:py0-branchGap, x2:px0+120, y2:py0+branchGap, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0+120, y1:py0-branchGap, x2:px0+150, y2:py0-branchGap, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("path", { d: resistorPath(px0+150, py0-branchGap, px0+290, py0-branchGap), stroke:c.res, "stroke-width":3, fill:"none" }));
  svg.appendChild(el("line", { x1:px0+290, y1:py0-branchGap, x2:px0+320, y2:py0-branchGap, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0+120, y1:py0+branchGap, x2:px0+150, y2:py0+branchGap, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("path", { d: resistorPath(px0+150, py0+branchGap, px0+290, py0+branchGap), stroke:c.res, "stroke-width":3, fill:"none" }));
  svg.appendChild(el("line", { x1:px0+290, y1:py0+branchGap, x2:px0+320, y2:py0+branchGap, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0+320, y1:py0-branchGap, x2:px0+320, y2:py0+branchGap, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0+320, y1:py0, x2:px0+pw-50, y2:py0, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0, y1:py0, x2:px0, y2:py0+70, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0+pw-50, y1:py0, x2:px0+pw-50, y2:py0+70, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0, y1:py0+70, x2:px0+pw-50, y2:py0+70, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:px0+8, y1:py0+63, x2:px0+8, y2:py0+77, stroke:c.batt, "stroke-width":4 }));

  const rl1 = el("text", { x:px0+220, y:py0-branchGap-10, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-size":"10.5", fill:c.text }); rl1.textContent = `R1=${R1.toFixed(1)}  I1=${I1.toFixed(2)}A`; svg.appendChild(rl1);
  const rl2 = el("text", { x:px0+220, y:py0+branchGap+24, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-size":"10.5", fill:c.text }); rl2.textContent = `R2=${R2.toFixed(1)}  I2=${I2.toFixed(2)}A`; svg.appendChild(rl2);
  const pt = el("text", { x:px0, y:py0+96, "font-family":"IBM Plex Mono", "font-weight":"700", "font-size":"12", fill:c.line }); pt.textContent = `PARALLEL  R_eq = ${Rparallel.toFixed(2)} Ω   I_total = ${(I1+I2).toFixed(2)} A`; svg.appendChild(pt);

  document.getElementById("r1Val").textContent = R1.toFixed(1) + " Ω";
  document.getElementById("r2Val").textContent = R2.toFixed(1) + " Ω";
  document.getElementById("spReadout").innerHTML = `
    <span class="tag hi">Series R_eq = ${Rseries.toFixed(1)} Ω</span>
    <span class="tag hi">Parallel R_eq = ${Rparallel.toFixed(2)} Ω</span>
    <span class="tag">Parallel R_eq is always smaller than the smallest single resistor</span>
  `;
}
document.getElementById("r1").addEventListener("input", e => drawSP(+e.target.value, +document.getElementById("r2").value));
document.getElementById("r2").addEventListener("input", e => drawSP(+document.getElementById("r1").value, +e.target.value));

/* ================= WIDGET 3: RESISTIVITY ================= */
function drawRho(Lcm, Dmm) {
  const svg = document.getElementById("rhoSvg");
  svg.innerHTML = "";
  const c = colors();
  const rho = 1.1e-6; // nichrome, ohm-metre (approx)
  const Lm = Lcm / 100;
  const Am2 = Math.PI * Math.pow((Dmm/1000)/2, 2);
  const R = rho * Lm / Am2;

  const cy = 90;
  const drawLen = 80 + Lcm * 5;
  const drawThick = 6 + Dmm * 3;
  const startX = 320 - drawLen/2;

  svg.appendChild(el("rect", { x:startX, y:cy-drawThick/2, width:drawLen, height:drawThick, rx:drawThick/2, fill:c.res, opacity:.85 }));
  svg.appendChild(el("line", { x1:startX-30, y1:cy, x2:startX, y2:cy, stroke:c.wire, "stroke-width":3 }));
  svg.appendChild(el("line", { x1:startX+drawLen, y1:cy, x2:startX+drawLen+30, y2:cy, stroke:c.wire, "stroke-width":3 }));

  const lt = el("text", { x:320, y:cy-drawThick/2-14, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); lt.textContent = `L = ${Lcm} cm`; svg.appendChild(lt);
  const dt = el("text", { x:startX+drawLen+50, y:cy+4, "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); dt.textContent = `⌀ ${Dmm} mm`; svg.appendChild(dt);

  document.getElementById("lenVal").textContent = Lcm + " cm";
  document.getElementById("diaVal").textContent = Dmm + " mm";
  const Rtxt = R < 0.1 ? R.toFixed(3) : R.toFixed(2);
  document.getElementById("rhoReadout").innerHTML = `
    <span class="tag hi">R = ρL/A ≈ ${Rtxt} Ω</span>
    <span class="tag">ρ (nichrome) = 1.1 × 10⁻⁶ Ω·m</span>
    <span class="tag">${R > 0.3 ? 'Longer + thinner → more resistance' : 'Shorter + thicker → less resistance'}</span>
  `;
}
document.getElementById("len").addEventListener("input", e => drawRho(+e.target.value, +document.getElementById("dia").value));
document.getElementById("dia").addEventListener("input", e => drawRho(+document.getElementById("len").value, +e.target.value));

/* ================= QUIZ ================= */
const QUIZ = [
  { q: "Ohm's law states that V equals:", o: ["I/R", "IR", "R/I", "I²R"], a: 1 },
  { q: "For resistors in series, the equivalent resistance is:", o: ["Less than the smallest resistor", "Equal to the largest resistor", "Sum of all resistances", "1 / sum of reciprocals"], a: 2 },
  { q: "In a parallel combination, which quantity is the same across every resistor?", o: ["Current", "Voltage", "Power", "Resistance"], a: 1 },
  { q: "Doubling the length of a wire (same material, same area) changes its resistance to:", o: ["Half", "Same", "Double", "Four times"], a: 2 },
  { q: "The equivalent resistance of two resistors in parallel is always:", o: ["Greater than either resistor", "Equal to their sum", "Less than the smaller resistor", "Equal to their average"], a: 2 }
];
const quizEl = document.getElementById("quiz");
QUIZ.forEach((item, i) => {
  const wrap = document.createElement("div");
  wrap.className = "quiz-q";
  wrap.innerHTML =
    `<p class="q">${i + 1}. ${item.q}</p><div class="opts2">` +
    item.o.map((opt, j) => `<label class="opt2"><input type="radio" name="q${i}" value="${j}"><span>${opt}</span></label>`).join("") +
    `</div>`;
  quizEl.appendChild(wrap);
});
document.getElementById("check").addEventListener("click", () => {
  let score = 0, answered = 0;
  QUIZ.forEach((item, i) => {
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
    document.querySelectorAll(`input[name="q${i}"]`).forEach((input, j) => {
      const label = input.closest(".opt2");
      label.classList.remove("correct", "wrong");
      if (j === item.a) label.classList.add("correct");
      if (chosen && Number(chosen.value) === j && j !== item.a) label.classList.add("wrong");
    });
    if (chosen) { answered++; if (Number(chosen.value) === item.a) score++; }
  });
  const res = document.getElementById("result");
  res.hidden = false;
  const note = answered < QUIZ.length ? "You left some blank — correct answers are marked in green."
    : score === QUIZ.length ? "Full marks. Move on to EMF and internal resistance." : "Correct answers are marked in green.";
  res.innerHTML = `You scored ${score} out of ${QUIZ.length}<small>${note}</small>`;
  res.scrollIntoView({ behavior: "smooth", block: "center" });
});

/* ================= init + live animation + redraw on theme change ================= */
function redrawAll() {
  drawOhm(+document.getElementById("ohmV").value, +document.getElementById("ohmR").value);
  drawSP(+document.getElementById("r1").value, +document.getElementById("r2").value);
  drawRho(+document.getElementById("len").value, +document.getElementById("dia").value);
}
function tick() {
  drawOhm(+document.getElementById("ohmV").value, +document.getElementById("ohmR").value);
  requestAnimationFrame(function () { setTimeout(tick, 90); });
}
document.addEventListener("themechange", redrawAll);
document.addEventListener("DOMContentLoaded", function () {
  redrawAll();
  tick();
});
