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
    return Number.isInteger(value) ? value : Number(value.toFixed(1));
  }
  return value;
};

const formatDifferenceValue = value => {
  if (value === null || value === undefined) return "Não possui";
  return `${value > 0 ? "+" : ""}${formatValue(value)}`;
};

const buildDisplaySelectOptions = () => {
  const options = [
    { value: "number", label: "Número" },
    { value: "half", label: "Metade" },
    { value: "sqrt", label: "Raiz" },
    { value: "log", label: "Log" },
    { value: "prime", label: "Primo" }
  ];

  customFunctions.forEach(func => options.push({ value: `custom:${func.name}`, label: func.name }));

  return options.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
};

const getDisplayValue = (number, displayKey) => {
  if (displayKey === "number") return number;
  if (displayKey === "half") return number / 2;
  if (displayKey === "sqrt") return Math.sqrt(number);
  if (displayKey === "log") return Math.log(number);
  if (displayKey === "prime") return prime(number) ? "Sim" : "Não";
  if (displayKey.startsWith("custom:")) {
    const funcName = displayKey.slice(7);
    const func = customFunctions.find(fn => fn.name === funcName);
    if (!func) return "Erro";
    try {
      return Function("n", `return ${func.body};`)(number);
    } catch (error) {
      return "Erro";
    }
  }
  return number;
};

const formatDisplayLabel = displayKey => {
  if (displayKey === "number") return "";
  if (displayKey === "half") return "N";
  if (displayKey === "sqrt") return "N";
  if (displayKey === "log") return "N";
  if (displayKey === "prime") return "N";
  if (displayKey.startsWith("custom:")) return "N";
  return "N";
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

const buildNumberDetailsRows = (number, positionIndex, previousNumber, nextNumber) => {
  const metadataRows = [
    { label: "Posição no painel", value: `${positionIndex}º` },
    { label: "Diferença para o anterior", value: formatDifferenceValue(previousNumber === null ? null : number - previousNumber) },
    { label: "Diferença para o próximo", value: formatDifferenceValue(nextNumber === null ? null : nextNumber - number) }
  ];

  return `${metadataRows.map(item => `<div class="details-item"><span>${item.label}</span><strong>${item.value}</strong></div>`).join("")}${buildFunctionRows(number)}`;
};

const openDetails = (number, context = {}) => {
  const { positionIndex = 1, previousNumber = null, nextNumber = null } = context;
  detailsContent.innerHTML = `
    <div class="details-card">
      <strong>Número</strong>
      <div>${number}</div>
    </div>
    <div class="details-card">
      <strong>Informações</strong>
      <div class="details-list">
        ${buildNumberDetailsRows(number, positionIndex, previousNumber, nextNumber)}
      </div>
    </div>
  `;
  detailsPanel.classList.add("open");
};

const openPanelDetails = panel => {
  const numbers = Array.from(panel.querySelectorAll(".num")).map(node => ({
    number: Number(node.dataset.number),
    positionIndex: Number(node.dataset.position || 0),
    previousNumber: node.dataset.previousNumber === "" ? null : Number(node.dataset.previousNumber),
    nextNumber: node.dataset.nextNumber === "" ? null : Number(node.dataset.nextNumber)
  }));

  detailsContent.innerHTML = `
    <div class="details-card">
      <strong>Painel</strong>
      <div>${panel.querySelector("h3").textContent}</div>
    </div>
    <div class="details-card">
      <strong>Números</strong>
      <div class="details-list">
        ${numbers.map(({ number, positionIndex, previousNumber, nextNumber }) => `
          <div class="details-item details-item--stacked">
            <span>Número</span>
            <strong>${number}</strong>
            <div class="details-sublist">
              ${buildNumberDetailsRows(number, positionIndex, previousNumber, nextNumber)}
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

const renderPanelChart = (container, numbers) => {
  if (!numbers.length) {
    container.innerHTML = '<div class="chart-empty">Sem valores para exibir</div>';
    return null;
  }

  const minValue = Math.min(...numbers);
  const maxValue = Math.max(...numbers);
  const range = maxValue - minValue || 1;
  const width = 900;
  const height = 220;
  const horizontalPadding = 30;
  const step = numbers.length > 1 ? (width - horizontalPadding * 2) / (numbers.length - 1) : 0;

  const points = numbers.map((value, index) => {
    const x = numbers.length > 1 ? horizontalPadding + step * index : width / 2;
    const y = height - ((value - minValue) / range) * height;
    return { x, y, value, index };
  });

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const circles = points.map(point => `
      <g class="chart-point-group" data-value="${point.value}" data-index="${point.index}">
        <circle class="chart-point-hit" cx="${point.x}" cy="${point.y}" r="10" />
        <circle class="chart-point" cx="${point.x}" cy="${point.y}" r="5" />
        <text class="chart-point-label" x="${point.x}" y="${point.y - 10}" dy="-2">${formatValue(point.value)}</text>
      </g>
    `).join("");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(value => {
    const y = height - value * height;
    return `<line class="chart-grid-line" x1="0" y1="${y}" x2="${width}" y2="${y}" />`;
  }).join("");

  container.innerHTML = `
    <div class="chart-plot">
      <div class="chart-summary">
        <span>Máx: ${formatValue(maxValue)}</span>
        <span>Mín: ${formatValue(minValue)}</span>
      </div>
      <div class="chart-line-wrapper">
        <div class="chart-tooltip" aria-hidden="true"></div>
        <svg viewBox="0 0 ${width} ${height}" aria-label="Gráfico de evolução de valores">
          ${gridLines}
          <path class="chart-line-path" d="${path}" />
          ${circles}
        </svg>
      </div>
    </div>
  `;

  const chartWrapper = container.querySelector('.chart-line-wrapper');
  const chartTooltip = container.querySelector('.chart-tooltip');
  const pointGroups = chartWrapper.querySelectorAll('g.chart-point-group');

  pointGroups.forEach(group => {
    group.addEventListener('mouseenter', event => {
      const value = group.dataset.value;
      const index = group.dataset.index;
      chartTooltip.textContent = `Posição: ${Number(index) + 1} • Valor: ${formatValue(Number(value))}`;
      chartTooltip.style.display = 'block';
      chartTooltip.setAttribute('aria-hidden', 'false');
    });

    group.addEventListener('mousemove', event => {
      const rect = chartWrapper.getBoundingClientRect();
      chartTooltip.style.left = `${event.clientX - rect.left + 10}px`;
      chartTooltip.style.top = `${event.clientY - rect.top + 10}px`;
    });

    group.addEventListener('mouseleave', () => {
      chartTooltip.style.display = 'none';
      chartTooltip.setAttribute('aria-hidden', 'true');
    });
  });

  return null;
};

const renderPanelNumbers = (container, numbers, displayKey = 'number') => {
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'nums';

  numbers.forEach((value, index) => {
    const previousNumber = index > 0 ? numbers[index - 1] : null;
    const nextNumber = index < numbers.length - 1 ? numbers[index + 1] : null;
    const displayValue = formatValue(getDisplayValue(value, displayKey));
    const d = document.createElement('div');
    d.className = 'num';
    d.dataset.number = value;
    d.dataset.position = index + 1;
    d.dataset.previousNumber = previousNumber === null ? '' : previousNumber;
    d.dataset.nextNumber = nextNumber === null ? '' : nextNumber;
    d.innerHTML = `<span class="num-value">${displayValue}</span>`;
    d.onclick = () => openDetails(value, { positionIndex: index + 1, previousNumber, nextNumber });
    d.onmousemove = e => {
      tip.style.display = 'block';
      tip.style.left = e.pageX + 15 + 'px';
      tip.style.top = e.pageY + 25 + 'px';
      tip.innerHTML = `
  <b>Número:</b> ${formatValue(value)}<br>
  <b>Posição no painel:</b> ${index + 1}º<br>
  <b>Diferença para o anterior:</b> ${formatDifferenceValue(previousNumber === null ? null : value - previousNumber)}<br>
  <b>Diferença para o próximo:</b> ${formatDifferenceValue(nextNumber === null ? null : nextNumber - value)}<br>
  <b>Metade:</b> ${formatValue(value / 2)}<br>
  <b>Raiz:</b> ${formatValue(Math.sqrt(value))}<br>
  <b>Log:</b> ${formatValue(Math.log(value))}
`;
    };
    d.onmouseleave = () => {
      tip.style.display = 'none';
    };

    list.appendChild(d);
  });

  container.appendChild(list);
};

document.getElementById("gen").onclick = () => {
  let a = +start.value;
  let b = +end.value;
  if (a > b) [a, b] = [b, a];

  const f = filter.value;
  const p = document.createElement("div");
  p.className = "panel";
  p.innerHTML = `
    <div class="panel-header">
      <div class="panel-title-wrap">
        <h3>${a} → ${b}</h3>
        <div class="panel-display">
          <span>Exibir</span>
          <select class="panel-display-select">
            ${buildDisplaySelectOptions()}
          </select>
        </div>
      </div>
      <div class="panel-actions">
        <span class="panel-count">0 Numeros</span>
        <button class="remove-panel" type="button" aria-label="Remover painel">×</button>
      </div>
    </div>
    <div class="panel-tabs">
      <button class="panel-tab active" type="button" data-view="nums">Números</button>
      <button class="panel-tab" type="button" data-view="chart">Gráfico</button>
    </div>
    <div class="panel-body">
      <div class="panel-view"></div>
    </div>
  `;

  const viewEl = p.querySelector(".panel-view");
  const displaySelect = p.querySelector(".panel-display-select");
  let currentDisplay = displaySelect.value;
  const tabs = p.querySelectorAll(".panel-tab");
  const countEl = p.querySelector(".panel-count");
  const removeBtn = p.querySelector(".remove-panel");

  const switchPanelView = view => {
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.view === view);
    });

    if (view === "chart") {
      renderPanelChart(viewEl, visibleNumbers);
    } else {
      renderPanelNumbers(viewEl, visibleNumbers, currentDisplay);
    }
  };

  displaySelect.onchange = event => {
    currentDisplay = event.target.value;
    if (p.querySelector('.panel-tab.active').dataset.view === 'nums') {
      switchPanelView('nums');
    }
  };

  tabs.forEach(tab => {
    tab.onclick = event => {
      event.stopPropagation();
      switchPanelView(tab.dataset.view);
    };
  });

  p.onclick = event => {
    if (event.target.closest(".remove-panel") || event.target.closest(".num") || event.target.closest(".panel-tab") || event.target.closest(".panel-view")) return;
    openPanelDetails(p);
  };

  removeBtn.onclick = e => {
    e.stopPropagation();
    p.remove();
  };

  const visibleNumbers = [];

  for (let i = a; i <= b; i++) {
    if (f === "prime" && !prime(i)) continue;
    if (f === "non" && (prime(i) || i < 2)) continue;

    visibleNumbers.push(i);
  }

  switchPanelView("nums");
  countEl.textContent = `${visibleNumbers.length} item${visibleNumbers.length === 1 ? "" : "s"}`;
  panels.appendChild(p);
};