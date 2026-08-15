const panels = document.getElementById("panels");
const tip = document.getElementById("tip");
const detailsPanel = document.getElementById("details-panel");
const detailsContent = document.getElementById("details-content");
const closeDetails = document.getElementById("close-details");
const funcNameInput = document.getElementById("func-name");
const funcBodyInput = document.getElementById("func-body");
const addFuncButton = document.getElementById("add-func");
const funcList = document.getElementById("func-list");
const configModal = document.getElementById("config-modal");
const configOpenButton = document.getElementById("config-open");
const configCloseButton = document.getElementById("config-close");
const displayOptionsList = document.getElementById("display-options-list");
let list = false;
let customFunctions = [];
let activeDisplayOptions = ["number", "half", "sqrt", "binary", "hex", "factorization", "eratosthenes"];

const sidePanel = document.getElementById("side-panel");
const sidePanelToggle = document.getElementById("side-panel-toggle");
const sidePanelClose = document.getElementById("side-panel-close");
const sidePanelFullscreen = document.getElementById("side-panel-fullscreen");
const sidePanelTabs = document.querySelectorAll(".side-panel__tab");
const sidePanelPanes = document.querySelectorAll(".side-panel__pane");
const appShell = document.querySelector(".app-shell");

const openSidePanel = () => {
  sidePanel.classList.add("is-open");
  appShell.classList.add("app-shell--pushed");
  sidePanelToggle.classList.add("is-hidden");
};

const closeSidePanel = () => {
  sidePanel.classList.remove("is-open");
  sidePanel.classList.remove("is-fullscreen");
  appShell.classList.remove("app-shell--pushed");
  sidePanelToggle.classList.remove("is-hidden");
  sidePanelFullscreen.setAttribute("aria-pressed", "false");
  sidePanelFullscreen.setAttribute("aria-label", "Expandir painel para tela cheia");
};

sidePanelToggle.onclick = openSidePanel;
sidePanelClose.onclick = closeSidePanel;
sidePanelFullscreen.onclick = () => {
  const isFullscreen = sidePanel.classList.toggle("is-fullscreen");
  sidePanelFullscreen.setAttribute("aria-pressed", String(isFullscreen));
  sidePanelFullscreen.setAttribute(
    "aria-label",
    isFullscreen ? "Restaurar tamanho do painel" : "Expandir painel para tela cheia"
  );
};

sidePanelTabs.forEach(tab => {
  tab.onclick = () => {
    const target = tab.dataset.tab;
    sidePanelTabs.forEach(item => {
      const isActive = item.dataset.tab === target;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    sidePanelPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === `pane-${target}`);
    });
  };
});

const paintCanvas = document.getElementById("paint-canvas");
const paintCtx = paintCanvas.getContext("2d");
const paintColorInput = document.getElementById("paint-color");
const paintSizeInput = document.getElementById("paint-size");
const paintClearButton = document.getElementById("paint-clear");
const paintToolButtons = document.querySelectorAll(".paint-tool");
let isDrawing = false;
let activeTool = "brush";
let lastPoint = { x: 0, y: 0 };

const getCanvasPoint = event => {
  const rect = paintCanvas.getBoundingClientRect();
  const scaleX = paintCanvas.width / rect.width;
  const scaleY = paintCanvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
};

const startPaint = event => {
  isDrawing = true;
  const point = getCanvasPoint(event);
  lastPoint = point;
  paintCtx.beginPath();
  paintCtx.moveTo(point.x, point.y);
};

const drawPaint = event => {
  if (!isDrawing) return;
  const point = getCanvasPoint(event);
  paintCtx.strokeStyle = activeTool === "eraser" ? "#ffffff" : paintColorInput.value;
  paintCtx.lineWidth = Number(paintSizeInput.value) * (activeTool === "eraser" ? 2 : 1);
  paintCtx.lineCap = "round";
  paintCtx.lineJoin = "round";
  paintCtx.lineTo(point.x, point.y);
  paintCtx.stroke();
  lastPoint = point;
};

const stopPaint = () => {
  if (!isDrawing) return;
  isDrawing = false;
  paintCtx.closePath();
};

paintCanvas.addEventListener("pointerdown", startPaint);
paintCanvas.addEventListener("pointermove", drawPaint);
paintCanvas.addEventListener("pointerup", stopPaint);
paintCanvas.addEventListener("pointerleave", stopPaint);
paintCanvas.addEventListener("pointercancel", stopPaint);

paintToolButtons.forEach(button => {
  button.onclick = () => {
    activeTool = button.dataset.tool;
    paintToolButtons.forEach(item => item.classList.toggle("active", item === button));
  };
});

paintClearButton.onclick = () => {
  paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
  paintCtx.fillStyle = "#ffffff";
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
};

paintCtx.fillStyle = "#ffffff";
paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);

const calculatorDisplay = document.getElementById("calc-display");
const calculatorKeys = document.querySelector(".calculator__keys");
let calculatorExpression = "";

const updateCalculatorDisplay = () => {
  calculatorDisplay.value = calculatorExpression || "0";
};

const appendCalculatorValue = value => {
  if (value === "C") {
    calculatorExpression = "";
    updateCalculatorDisplay();
    return;
  }

  if (value === "⌫") {
    calculatorExpression = calculatorExpression.slice(0, -1);
    updateCalculatorDisplay();
    return;
  }

  if (value === "=") {
    try {
      const normalized = calculatorExpression.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
      calculatorExpression = String(Function(`return (${normalized})`)());
    } catch (error) {
      calculatorExpression = "Erro";
    }
    updateCalculatorDisplay();
    return;
  }

  const normalizedValue = value === "×" ? "*" : value === "÷" ? "/" : value === "−" ? "-" : value;

  if (value === ".") {
    const lastNumber = calculatorExpression.split(/[-+*/]/).pop();
    if (lastNumber.includes(".")) return;
  }

  if (["+", "-", "*", "/"].includes(normalizedValue)) {
    if (!calculatorExpression || /[+\-*/]$/.test(calculatorExpression)) return;
  }

  calculatorExpression += normalizedValue;
  updateCalculatorDisplay();
};

calculatorKeys.onclick = event => {
  const button = event.target.closest("button[data-value]");
  if (!button) return;
  appendCalculatorValue(button.dataset.value);
};

document.addEventListener("keydown", event => {
  if (document.activeElement !== calculatorDisplay) return;

  if (/^\d$/.test(event.key) || [".", "+", "-", "*", "/"].includes(event.key)) {
    appendCalculatorValue(event.key);
    event.preventDefault();
    return;
  }

  if (event.key === "Enter") {
    appendCalculatorValue("=");
    event.preventDefault();
    return;
  }

  if (event.key === "Backspace") {
    calculatorExpression = calculatorExpression.slice(0, -1);
    updateCalculatorDisplay();
    event.preventDefault();
    return;
  }

  if (event.key === "Escape") {
    appendCalculatorValue("C");
    event.preventDefault();
  }
});

updateCalculatorDisplay();

const createEratosthenesSieve = limit => {
  const max = Math.floor(limit);
  if (!Number.isSafeInteger(max) || max < 2) return new Uint8Array(0);

  const sieve = new Uint8Array(max + 1);
  sieve.fill(1, 2);

  for (let prime = 2; prime * prime <= max; prime++) {
    if (!sieve[prime]) continue;
    for (let multiple = prime * prime; multiple <= max; multiple += prime) {
      sieve[multiple] = 0;
    }
  }

  return sieve;
};

const formatEratosthenesSieve = value => {
  if (!Number.isFinite(value) || value <= 1) return "Não aplicável";
  return value / Math.log(value);
};

const viewToggleButtons = document.querySelectorAll('.view-toggle__btn');

const setViewMode = view => {
  list = view === 'list';
  panels.classList.toggle('panels-list', list);
  panels.classList.toggle('panels-grid', !list);

  viewToggleButtons.forEach(button => {
    const isActive = button.dataset.view === view;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

viewToggleButtons.forEach(button => {
  button.onclick = () => setViewMode(button.dataset.view);
});

setViewMode('grid');

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

const formatBaseValue = (value, base) => {
  if (!Number.isFinite(value)) return "Não aplicável";
  if (base === 2) return value.toString(2);
  if (base === 16) return value.toString(16).toUpperCase();
  return String(value);
};

const formatFactorization = value => {
  if (!Number.isSafeInteger(value)) return "Não aplicável";
  if (value === -1 || value === 0 || value === 1) return String(value);

  const factors = [];
  let number = Math.abs(value);
  let divisor = 2;

  while (divisor * divisor <= number) {
    let exponent = 0;
    while (number % divisor === 0) {
      number /= divisor;
      exponent += 1;
    }
    if (exponent > 0) factors.push(exponent === 1 ? String(divisor) : `${divisor}^${exponent}`);
    divisor += divisor === 2 ? 1 : 2;
  }

  if (number > 1) factors.push(String(number));
  return `${value < 0 ? "-1 × " : ""}${factors.join(" × ")}`;
};

const baseDisplayOptions = [
  { value: "number", label: "Número" },
  { value: "half", label: "Metade" },
  { value: "sqrt", label: "Raiz" },
  { value: "binary", label: "Binário" },
  { value: "hex", label: "Hexadecimal" },
  { value: "factorization", label: "Fatoração" },
  { value: "eratosthenes", label: "Crivo de Eratóstenes" }
];

const getAllDisplayOptions = () => {
  const options = [...baseDisplayOptions];
  customFunctions.forEach(func => options.push({ value: `custom:${func.name}`, label: func.name }));
  return options;
};

const getActiveDisplayOptions = () => {
  return getAllDisplayOptions().filter(option => activeDisplayOptions.includes(option.value));
};

const buildDisplaySelectOptions = () => {
  return getActiveDisplayOptions().map(option => `<option value="${option.value}">${option.label}</option>`).join("");
};

const getDisplayValue = (number, displayKey) => {
  if (displayKey === "number") return number;
  if (displayKey === "half") return number / 2;
  if (displayKey === "sqrt") return Math.sqrt(number);
  if (displayKey === "binary") return formatBaseValue(number, 2);
  if (displayKey === "hex") return formatBaseValue(number, 16);
  if (displayKey === "factorization") return formatFactorization(number);
  if (displayKey === "eratosthenes") return formatEratosthenesSieve(number);
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

const buildFunctionRows = number => {
  const rows = [];

  getActiveDisplayOptions().forEach(option => {
    if (option.value === "number") return;

    if (option.value === "half") {
      rows.push({ label: option.label, value: number / 2 });
      return;
    }

    if (option.value === "sqrt") {
      rows.push({ label: option.label, value: Math.sqrt(number) });
      return;
    }

    if (option.value === "binary") {
      rows.push({ label: option.label, value: formatBaseValue(number, 2) });
      return;
    }

    if (option.value === "hex") {
      rows.push({ label: option.label, value: formatBaseValue(number, 16) });
      return;
    }

    if (option.value === "factorization") {
      rows.push({ label: option.label, value: formatFactorization(number) });
      return;
    }

    if (option.value === "eratosthenes") {
      rows.push({ label: option.label, value: formatEratosthenesSieve(number) });
      return;
    }

    if (option.value.startsWith("custom:")) {
      const funcName = option.value.slice(7);
      const func = customFunctions.find(fn => fn.name === funcName);
      if (!func) {
        rows.push({ label: option.label, value: "Erro" });
        return;
      }

      try {
        const result = Function("n", `return ${func.body};`)(number);
        rows.push({ label: option.label, value: result });
      } catch (error) {
        rows.push({ label: option.label, value: "Erro" });
      }
    }
  });

  return rows.map(item => `<div class="details-item"><span>${item.label}</span><strong>${formatValue(item.value)}</strong></div>`).join("");
};

const buildNumberDetailsRows = (number, positionIndex, previousNumber, nextNumber) => {
  const baseRows = [
    { label: "Binário", value: formatBaseValue(number, 2) },
    { label: "Hexadecimal", value: formatBaseValue(number, 16) }
  ];
  const metadataRows = [
    { label: "Posição no painel", value: `${positionIndex}º` },
    { label: "Diferença para o anterior", value: formatDifferenceValue(previousNumber === null ? null : number - previousNumber) },
    { label: "Diferença para o próximo", value: formatDifferenceValue(nextNumber === null ? null : nextNumber - number) }
  ];

  return `${baseRows.map(item => `<div class="details-item"><span>${item.label}</span><strong>${item.value}</strong></div>`).join("")}${metadataRows.map(item => `<div class="details-item"><span>${item.label}</span><strong>${item.value}</strong></div>`).join("")}${buildFunctionRows(number)}`;
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

const renderDisplayOptions = () => {
  displayOptionsList.innerHTML = getAllDisplayOptions().map(option => {
    const isChecked = activeDisplayOptions.includes(option.value);
    return `
      <label class="display-option">
        <input type="checkbox" value="${option.value}" ${isChecked ? "checked" : ""}>
        <span>${option.label}</span>
      </label>
    `;
  }).join("");

  displayOptionsList.querySelectorAll("input").forEach(input => {
    input.onchange = () => {
      const value = input.value;
      if (input.checked) {
        if (!activeDisplayOptions.includes(value)) activeDisplayOptions.push(value);
      } else {
        activeDisplayOptions = activeDisplayOptions.filter(option => option !== value);
      }
      refreshPanelsDisplayOptions();
    };
  });
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
      renderDisplayOptions();
      refreshPanelsDisplayOptions();
    };
  });
};

const refreshPanelsDisplayOptions = () => {
  document.querySelectorAll(".panel").forEach(panel => {
    const select = panel.querySelector(".panel-display-select");
    const viewEl = panel.querySelector(".panel-view");
    if (!select || !viewEl) return;

    const availableDisplayOptions = getAllDisplayOptions().filter(option => activeDisplayOptions.includes(option.value));
    const fallbackDisplay = availableDisplayOptions[0]?.value || "number";
    const currentSelection = select.value;
    const nextDisplay = availableDisplayOptions.some(option => option.value === currentSelection)
      ? currentSelection
      : fallbackDisplay;

    select.innerHTML = availableDisplayOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
    select.value = nextDisplay;
    panel._currentDisplay = nextDisplay;

    const activeTab = panel.querySelector('.panel-tab.active')?.dataset.view || 'nums';
    if (activeTab === 'chart') {
      renderPanelChart(viewEl, panel._visibleNumbers || []);
    } else {
      renderPanelNumbers(viewEl, panel._visibleNumbers || [], panel._currentDisplay);
    }
  });
};

const openConfigModal = () => {
  renderDisplayOptions();
  configModal.classList.add("is-open");
  configModal.setAttribute("aria-hidden", "false");
};

const closeConfigModal = () => {
  configModal.classList.remove("is-open");
  configModal.setAttribute("aria-hidden", "true");
};

addFuncButton.onclick = () => {
  const name = funcNameInput.value.trim();
  const body = funcBodyInput.value.trim();

  if (!name || !body) return;

  customFunctions = customFunctions.filter(func => func.name !== name);
  customFunctions.push({ name, body });
  if (!activeDisplayOptions.includes(`custom:${name}`)) {
    activeDisplayOptions.push(`custom:${name}`);
  }
  funcNameInput.value = "";
  funcBodyInput.value = "";
  renderFunctionList();
  renderDisplayOptions();
  refreshPanelsDisplayOptions();
};

configOpenButton.onclick = openConfigModal;
configCloseButton.onclick = closeConfigModal;
configModal.querySelector(".modal__backdrop").onclick = closeConfigModal;

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && configModal.classList.contains("is-open")) {
    closeConfigModal();
  }
});

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
  <b>Binário:</b> ${formatBaseValue(value, 2)}<br>
  <b>Hexadecimal:</b> ${formatBaseValue(value, 16)}<br>
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
  const availableDisplayOptions = getAllDisplayOptions().filter(option => activeDisplayOptions.includes(option.value));
  const defaultDisplay = availableDisplayOptions[0]?.value || "number";

  displaySelect.innerHTML = availableDisplayOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
  displaySelect.value = defaultDisplay;
  p._currentDisplay = defaultDisplay;
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
      renderPanelNumbers(viewEl, visibleNumbers, p._currentDisplay);
    }
  };

  displaySelect.onchange = event => {
    p._currentDisplay = event.target.value;
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
  const primeSieve = createEratosthenesSieve(b);
  const isPrime = number => Number.isInteger(number) && number >= 2 && primeSieve[number] === 1;

  for (let i = a; i <= b; i++) {
    if (f === "prime" && !isPrime(i)) continue;
    if (f === "non" && (isPrime(i) || i < 2)) continue;

    visibleNumbers.push(i);
  }

  p._visibleNumbers = visibleNumbers;
  switchPanelView("nums");
  countEl.textContent = `${visibleNumbers.length} item${visibleNumbers.length === 1 ? "" : "s"}`;
  panels.appendChild(p);
};
