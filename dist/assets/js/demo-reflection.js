const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function isDark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
function colors() {
  return isDark()
    ? { axis:"#3A4A70", mirror:"#198825", incident:"#198825", reflect:"#5FA8FF", normal:"#5A6C94", obj:"#5FA8FF", img:"#C97BFF", text:"#D6DDEE" }
    : { axis:"#B9C3DC", mirror:"#01224B", incident:"#14701E", reflect:"#14701E", normal:"#8894B2", obj:"#01224B", img:"#7C6AF7", text:"#1E2430" };
}

/* ================= WIDGET 1: LAW OF REFLECTION ================= */
function drawLaw(angle) {
  const svg = document.getElementById("lawSvg");
  svg.innerHTML = "";
  const c = colors();
  const cx = 320, cy = 230, len = 170;
  svg.appendChild(el("line", { x1: 60, y1: cy, x2: 580, y2: cy, stroke: c.mirror, "stroke-width": 5 }));
  for (let x = 60; x < 580; x += 14) {
    svg.appendChild(el("line", { x1: x, y1: cy, x2: x + 8, y2: cy + 14, stroke: c.mirror, "stroke-width": 2, opacity: .5 }));
  }
  svg.appendChild(el("line", { x1: cx, y1: cy, x2: cx, y2: cy - 190, stroke: c.normal, "stroke-width": 1.5, "stroke-dasharray": "5 4" }));
  svg.appendChild(el("text", { x: cx + 8, y: cy - 178, "font-family": "IBM Plex Mono", "font-size": "11", fill: c.text }))
     .textContent = "normal";

  const rad = angle * Math.PI / 180;
  const ix = cx - len * Math.sin(rad), iy = cy - len * Math.cos(rad);
  const rx = cx + len * Math.sin(rad), ry = cy - len * Math.cos(rad);

  const inc = el("line", { x1: ix, y1: iy, x2: cx, y2: cy, stroke: c.incident, "stroke-width": 3 });
  svg.appendChild(inc);
  const arrow1 = el("path", { d: `M ${cx-10} ${cy-16} L ${cx} ${cy} L ${cx-16} ${cy-10}`, stroke: c.incident, "stroke-width": 3, fill: "none" });
  svg.appendChild(arrow1);

  svg.appendChild(el("line", { x1: cx, y1: cy, x2: rx, y2: ry, stroke: c.reflect, "stroke-width": 3 }));
  svg.appendChild(el("path", { d: `M ${rx+10} ${ry+16} L ${rx} ${ry} L ${rx+ (rx>cx?16:-16)} ${ry+10}`, stroke: c.reflect, "stroke-width": 3, fill: "none" }));

  const arcR = 46;
  svg.appendChild(el("path", {
    d: `M ${cx - arcR*Math.sin(rad)} ${cy - arcR*Math.cos(rad)} A ${arcR} ${arcR} 0 0 1 ${cx} ${cy-arcR}`,
    stroke: c.incident, "stroke-width": 1.6, fill: "none"
  }));
  svg.appendChild(el("path", {
    d: `M ${cx} ${cy-arcR} A ${arcR} ${arcR} 0 0 1 ${cx + arcR*Math.sin(rad)} ${cy - arcR*Math.cos(rad)}`,
    stroke: c.reflect, "stroke-width": 1.6, fill: "none"
  }));

  const li = el("text", { x: cx - 55, y: cy - 55, "font-family": "IBM Plex Mono", "font-weight": "700", "font-size": "13", fill: c.incident }); li.textContent = "i"; svg.appendChild(li);
  const lr = el("text", { x: cx + 42, y: cy - 55, "font-family": "IBM Plex Mono", "font-weight": "700", "font-size": "13", fill: c.reflect }); lr.textContent = "r"; svg.appendChild(lr);

  document.getElementById("lawAngleVal").textContent = angle + "°";
  document.getElementById("lawI").textContent = "∠i = " + angle + "°";
  document.getElementById("lawR").textContent = "∠r = " + angle + "°";
}
document.getElementById("lawAngle").addEventListener("input", e => drawLaw(+e.target.value));

/* ================= WIDGET 2: CONCAVE MIRROR ================= */
function drawConcave(u) {
  const svg = document.getElementById("concaveSvg");
  svg.innerHTML = "";
  const c = colors();
  const axisY = 150, mirrorX = 420, f = 90, apY0 = 30, apY1 = 270;

  // mirror arc (visual only)
  const arc = `M ${mirrorX} ${apY0} Q ${mirrorX-40} ${axisY} ${mirrorX} ${apY1}`;
  svg.appendChild(el("path", { d: arc, stroke: c.mirror, "stroke-width": 4, fill: "none" }));
  for (let y = apY0; y < apY1; y += 16) {
    svg.appendChild(el("line", { x1: mirrorX+2, y1: y, x2: mirrorX+14, y2: y+8, stroke: c.mirror, "stroke-width": 1.6, opacity: .5 }));
  }
  // axis
  svg.appendChild(el("line", { x1: 10, y1: axisY, x2: 630, y2: axisY, stroke: c.axis, "stroke-width": 1.4 }));
  // F and C
  const Fx = mirrorX - f, Cx = mirrorX - 2*f;
  [[Fx,"F"],[Cx,"C"]].forEach(([x,label]) => {
    svg.appendChild(el("line", { x1:x, y1:axisY-6, x2:x, y2:axisY+6, stroke:c.text, "stroke-width":1.6 }));
    const t = el("text", { x:x, y:axisY+22, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); t.textContent = label; svg.appendChild(t);
  });

  const objX = mirrorX - u;
  const objH = 55;
  const objTopY = axisY - objH;

  // object arrow
  svg.appendChild(el("line", { x1:objX, y1:axisY, x2:objX, y2:objTopY, stroke:c.obj, "stroke-width":3 }));
  svg.appendChild(el("path", { d:`M ${objX-7} ${objTopY+12} L ${objX} ${objTopY} L ${objX+7} ${objTopY+12}`, stroke:c.obj, "stroke-width":3, fill:"none" }));

  const eps = 4;
  let v, real;
  if (Math.abs(u - f) < eps) { v = null; real = null; }
  else { v = (f * u) / (u - f); real = v > 0; }

  let readoutHTML = "";
  if (v === null) {
    readoutHTML = `<span class="tag hi">Object at F</span><span class="tag">Reflected rays become parallel — image forms at infinity</span>`;
  } else {
    const imgX = mirrorX - v;
    const mag = Math.abs(v / u);
    const imgH = Math.min(objH * mag, 120);
    const imgTopY = real ? axisY + imgH : axisY - imgH; // real→inverted(down), virtual→erect(up)

    // construction ray A: object tip parallel to axis -> mirror -> through/away from F
    const hitAx = mirrorX, hitAy = objTopY;
    svg.appendChild(el("line", { x1:objX, y1:objTopY, x2:hitAx, y2:hitAy, stroke:c.reflect, "stroke-width":2 }));
    if (real) {
      const dirX = imgX - hitAx, dirY = imgTopY - hitAy;
      const ext = 2.4;
      svg.appendChild(el("line", { x1:hitAx, y1:hitAy, x2:hitAx+dirX*ext, y2:hitAy+dirY*ext, stroke:c.reflect, "stroke-width":2 }));
    } else {
      // diverges as if from F, extend forward; dashed backward to F
      const dx = hitAx - Fx, dy = hitAy - axisY;
      svg.appendChild(el("line", { x1:hitAx, y1:hitAy, x2:hitAx+dx*1.6, y2:hitAy+dy*1.6, stroke:c.reflect, "stroke-width":2 }));
      svg.appendChild(el("line", { x1:hitAx, y1:hitAy, x2:Fx, y2:axisY, stroke:c.reflect, "stroke-width":1.4, "stroke-dasharray":"4 3" }));
    }

    // construction ray B: object tip through F -> mirror -> parallel to axis after
    const t = (mirrorX - objX) / (Fx - objX || 0.0001);
    const hitBx = mirrorX, hitBy = objTopY + (axisY - objTopY) * ((mirrorX - objX) / ((Fx - objX) || 0.0001));
    const hitByClamped = Math.max(apY0, Math.min(apY1, hitBy));
    svg.appendChild(el("line", { x1:objX, y1:objTopY, x2:hitBx, y2:hitByClamped, stroke:c.incident, "stroke-width":2, opacity:.85 }));
    svg.appendChild(el("line", { x1:hitBx, y1:hitByClamped, x2: real ? hitBx + 220 : hitBx + 220, y2: hitByClamped, stroke:c.incident, "stroke-width":2, opacity:.85 }));
    if (!real) {
      svg.appendChild(el("line", { x1:objX, y1:objTopY, x2:objX - 40, y2:objTopY - (axisY-objTopY)*0.001, stroke:c.incident, "stroke-width":1, opacity:0 }));
    }

    // image arrow
    const dash = real ? "0" : "5 4";
    svg.appendChild(el("line", { x1:imgX, y1:axisY, x2:imgX, y2:imgTopY, stroke:c.img, "stroke-width":3, "stroke-dasharray":dash }));
    const ah = real ? 1 : -1;
    svg.appendChild(el("path", { d:`M ${imgX-7} ${imgTopY-12*Math.sign(imgTopY-axisY||1)} L ${imgX} ${imgTopY} L ${imgX+7} ${imgTopY-12*Math.sign(imgTopY-axisY||1)}`, stroke:c.img, "stroke-width":3, fill:"none" }));

    readoutHTML = `
      <span class="tag ${real ? 'real':'virtual'}">${real ? 'Real' : 'Virtual'}</span>
      <span class="tag hi">${real ? 'Inverted' : 'Erect'}</span>
      <span class="tag hi">${mag > 1.02 ? 'Magnified' : (mag < 0.98 ? 'Diminished' : 'Same size')}</span>
      <span class="tag">v ≈ ${Math.abs(v).toFixed(0)} px, m ≈ ${mag.toFixed(2)}×</span>
    `;
  }

  document.getElementById("concaveUVal").textContent = u + " px";
  document.getElementById("concaveReadout").innerHTML = readoutHTML;
}
document.getElementById("concaveU").addEventListener("input", e => drawConcave(+e.target.value));

/* ================= WIDGET 3: CONVEX MIRROR ================= */
function drawConvex(u) {
  const svg = document.getElementById("convexSvg");
  svg.innerHTML = "";
  const c = colors();
  const axisY = 130, mirrorX = 260, f = 90, apY0 = 20, apY1 = 240;

  const arc = `M ${mirrorX} ${apY0} Q ${mirrorX+40} ${axisY} ${mirrorX} ${apY1}`;
  svg.appendChild(el("path", { d: arc, stroke: c.mirror, "stroke-width": 4, fill: "none" }));
  for (let y = apY0; y < apY1; y += 16) {
    svg.appendChild(el("line", { x1: mirrorX-2, y1: y, x2: mirrorX-14, y2: y+8, stroke: c.mirror, "stroke-width": 1.6, opacity: .5 }));
  }
  svg.appendChild(el("line", { x1: 10, y1: axisY, x2: 630, y2: axisY, stroke: c.axis, "stroke-width": 1.4 }));

  const Fx = mirrorX + f;
  svg.appendChild(el("line", { x1:Fx, y1:axisY-6, x2:Fx, y2:axisY+6, stroke:c.text, "stroke-width":1.6 }));
  const ft = el("text", { x:Fx, y:axisY+22, "text-anchor":"middle", "font-family":"IBM Plex Mono", "font-size":"11", fill:c.text }); ft.textContent = "F"; svg.appendChild(ft);

  const objX = mirrorX - u;
  const objH = 55;
  const objTopY = axisY - objH;
  svg.appendChild(el("line", { x1:objX, y1:axisY, x2:objX, y2:objTopY, stroke:c.obj, "stroke-width":3 }));
  svg.appendChild(el("path", { d:`M ${objX-7} ${objTopY+12} L ${objX} ${objTopY} L ${objX+7} ${objTopY+12}`, stroke:c.obj, "stroke-width":3, fill:"none" }));

  const v = (f * u) / (u + f);
  const mag = v / u;
  const imgH = objH * mag;
  const imgX = mirrorX + v;
  const imgTopY = axisY - imgH;

  // ray parallel -> appears to diverge from F
  const hitAy = objTopY;
  svg.appendChild(el("line", { x1:objX, y1:objTopY, x2:mirrorX, y2:hitAy, stroke:c.reflect, "stroke-width":2 }));
  const dx = mirrorX - Fx, dy = hitAy - axisY;
  svg.appendChild(el("line", { x1:mirrorX, y1:hitAy, x2:mirrorX+dx*-1.4, y2:hitAy+dy*-1.4, stroke:c.reflect, "stroke-width":2 }));
  svg.appendChild(el("line", { x1:mirrorX, y1:hitAy, x2:Fx, y2:axisY, stroke:c.reflect, "stroke-width":1.4, "stroke-dasharray":"4 3" }));

  svg.appendChild(el("line", { x1:imgX, y1:axisY, x2:imgX, y2:imgTopY, stroke:c.img, "stroke-width":3, "stroke-dasharray":"5 4" }));
  svg.appendChild(el("path", { d:`M ${imgX-6} ${imgTopY+10} L ${imgX} ${imgTopY} L ${imgX+6} ${imgTopY+10}`, stroke:c.img, "stroke-width":3, fill:"none" }));

  document.getElementById("convexUVal").textContent = u + " px";
}
document.getElementById("convexU").addEventListener("input", e => drawConvex(+e.target.value));

/* ================= QUIZ ================= */
const QUIZ = [
  { q: "The angle of incidence is 35°. The angle of reflection is:", o: ["0°", "35°", "55°", "70°"], a: 1 },
  { q: "An object is placed beyond C in front of a concave mirror. The image is:", o: ["Virtual, erect, magnified", "Real, inverted, diminished", "Real, erect, same size", "Virtual, inverted, diminished"], a: 1 },
  { q: "For a concave mirror, when the object is between the pole and the focus, the image is:", o: ["Real and inverted", "Virtual and erect", "Real and erect", "Virtual and inverted"], a: 1 },
  { q: "A convex mirror is preferred as a vehicle rear-view mirror because it:", o: ["Magnifies the image", "Gives a wider field of view", "Forms a real image", "Inverts the image"], a: 1 },
  { q: "Which mirror is used in a torch to produce a parallel beam of light?", o: ["Convex mirror, bulb at F", "Concave mirror, bulb at F", "Plane mirror", "Concave mirror, bulb at C"], a: 1 }
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
    : score === QUIZ.length ? "Full marks. Move on to refraction." : "Correct answers are marked in green.";
  res.innerHTML = `You scored ${score} out of ${QUIZ.length}<small>${note}</small>`;
  res.scrollIntoView({ behavior: "smooth", block: "center" });
});


/* ================= init + redraw on theme change ================= */
function redrawAll() {
  drawLaw(+document.getElementById("lawAngle").value);
  drawConcave(+document.getElementById("concaveU").value);
  drawConvex(+document.getElementById("convexU").value);
}
document.addEventListener("themechange", redrawAll);
document.addEventListener("DOMContentLoaded", redrawAll);
