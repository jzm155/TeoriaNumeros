const panels = document.getElementById("panels");
const tip = document.getElementById("tip");
const detailsPanel = document.getElementById("details-panel");
const detailsContent = document.getElementById("details-content");
const closeDetails = document.getElementById("close-details");
const funcNameInput = document.getElementById("func-name");
const funcBodyInput = document.getElementById("func-body");
const addFuncButton = document.getElementById("add-func");
const funcList = document.getElementById("func-list");
let list = false;
let customFunctions = [];

const prime = n => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

document.getElementById("toggle").onclick = () => {
  list = !list;
  panels.classList.toggle("panels-list", list);
  panels.classList.toggle("panels-grid", !list);
  document.getElementById("toggle").textContent = list ? "Lista" : "Grid";
};

const formatValue = value => {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : value.toFixed(4);
  }
  return value;
};

const buildFunctionRows = number => {
  const rows = [
    { label: "Metade", value: number / 2 },
    { label: "Raiz", value: Math.sqrt(number) },
    { label: "Log", value: Math.log(number) },
    { label: "Primo", value: prime(number) ? "Sim" : "Não" }
  ];

  customFunctions.forEach(func => {
    try {
      const result = Function("n", `return ${func.body};`)(number);
      rows.push({ label: func.name, value: result });
    } catch (error) {
      rows.push({ label: func.name, value: "Erro" });
    }
  });

  return rows.map(item => `<div class="details-item"><span>${item.label}</span><strong>${formatValue(item.value)}</strong></div>`).join("");
};

const openDetails = number => {
  detailsContent.innerHTML = `
    <div class="details-card">
      <strong>Número</strong>
      <div>${number}</div>
    </div>
    <div class="details-card">
      <strong>Informações</strong>
      <div class="details-list">
        ${buildFunctionRows(number)}
      </div>
    </div>
  `;
  detailsPanel.classList.add("open");
};

const openPanelDetails = panel => {
  const numbers = Array.from(panel.querySelectorAll(".num")).map(node => Number(node.textContent));
  detailsContent.innerHTML = `
    <div class="details-card">
      <strong>Painel</strong>
      <div>${panel.querySelector("h3").textContent}</div>
    </div>
    <div class="details-card">
      <strong>Números</strong>
      <div class="details-list">
        ${numbers.map(number => `
          <div class="details-item details-item--stacked">
            <span>Número</span>
            <strong>${number}</strong>
            <div class="details-sublist">
              ${buildFunctionRows(number).split("</div>").slice(0, -1).map(row => row + "</div>").join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  detailsPanel.classList.add("open");
};

const renderFunctionList = () => {
  funcList.innerHTML = customFunctions.map(func => `
    <div class="func-chip">
      <span>${func.name}: ${func.body}</span>
      <button type="button" data-name="${func.name}" aria-label="Remover função">×</button>
    </div>
  `).join("");

  funcList.querySelectorAll("button").forEach(button => {
    button.onclick = () => {
      customFunctions = customFunctions.filter(func => func.name !== button.dataset.name);
      renderFunctionList();
    };
  });
};

addFuncButton.onclick = () => {
  const name = funcNameInput.value.trim();
  const body = funcBodyInput.value.trim();

  if (!name || !body) return;

  customFunctions = customFunctions.filter(func => func.name !== name);
  customFunctions.push({ name, body });
  funcNameInput.value = "";
  funcBodyInput.value = "";
  renderFunctionList();
};

closeDetails.onclick = () => {
  detailsPanel.classList.remove("open");
};

renderFunctionList();

document.getElementById("gen").onclick = () => {
  let a = +start.value;
  let b = +end.value;
  if (a > b) [a, b] = [b, a];

  const f = filter.value;
  const p = document.createElement("div");
  p.className = "panel";
  p.innerHTML = `
    <div class="panel-header">
      <h3>${a} → ${b}</h3>
      <div class="panel-actions">
        <span class="panel-count">0 Numeros</span>
        <button class="remove-panel" type="button" aria-label="Remover painel">×</button>
      </div>
    </div>
    <div class="nums"></div>
  `;

  const c = p.querySelector(".nums");
  const countEl = p.querySelector(".panel-count");
  const removeBtn = p.querySelector(".remove-panel");

  p.onclick = event => {
    if (event.target.closest(".remove-panel") || event.target.closest(".num")) return;
    openPanelDetails(p);
  };

  removeBtn.onclick = e => {
    e.stopPropagation();
    p.remove();
  };

  for (let i = a; i <= b; i++) {
    if (f === "prime" && !prime(i)) continue;
    if (f === "non" && (prime(i) || i < 2)) continue;

    const d = document.createElement("div");
    d.className = "num";
    d.textContent = i;
    d.onclick = () => openDetails(i);
    d.onmousemove = e => {
      tip.style.display = "block";
      tip.style.left = e.pageX + 15 + "px";
      tip.style.top = e.pageY + 25 + "px";
      tip.innerHTML = `
  <b>Número:</b> ${i}<br>
  <b>Metade:</b> ${i / 2}<br>
  <b>Raiz:</b> ${Math.sqrt(i).toFixed(4)}<br>
  <b>Log:</b> ${Math.log(i).toFixed(4)}
`;
    };
    d.onmouseleave = () => {
      tip.style.display = "none";
    };

    c.appendChild(d);
  }

  countEl.textContent = `${c.children.length} item${c.children.length === 1 ? "" : "s"}`;
  panels.appendChild(p);
};