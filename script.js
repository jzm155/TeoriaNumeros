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

const formatDifferenceValue = value => {
  if (value === null || value === undefined) return "Não possui";
  return `${value > 0 ? "+" : ""}${value}`;
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

  container.innerHTML = '<div class="chart-plot"></div>';
  const plotEl = container.querySelector('.chart-plot');

  if (!window.echarts) {
    plotEl.innerHTML = '<div class="chart-empty">Não foi possível carregar o gráfico.</div>';
    return null;
  }

  const chart = window.echarts.init(plotEl, 'dark');
  const points = numbers.map((value, index) => ({
    value,
    position: index + 1
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(255,255,255,0.12)',
      textStyle: { color: '#f9fafb', fontFamily: 'DM Sans, sans-serif' },
      formatter: params => {
        const point = params[0];
        return `<strong>Posição:</strong> ${point.data.position}<br/><strong>Valor (N):</strong> ${point.data.value}`;
      }
    },
    grid: { left: 24, right: 16, top: 20, bottom: 28 },
    xAxis: {
      type: 'value',
      name: 'Posição',
      nameTextStyle: { color: '#cbd5e1', fontFamily: 'DM Sans, sans-serif' },
      axisLabel: { color: '#cbd5e1', fontFamily: 'DM Sans, sans-serif' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.16)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    yAxis: {
      type: 'value',
      name: 'Valor (N)',
      nameTextStyle: { color: '#cbd5e1', fontFamily: 'DM Sans, sans-serif' },
      axisLabel: { color: '#cbd5e1', fontFamily: 'DM Sans, sans-serif' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.16)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    series: [{
      name: 'Valores',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#60a5fa', width: 2.5 },
      itemStyle: { color: '#fbbf24' },
      areaStyle: {
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(96, 165, 250, 0.45)' },
          { offset: 1, color: 'rgba(96, 165, 250, 0.04)' }
        ])
      },
      data: points.map(point => ({ value: [point.position, point.value], label: point.value, position: point.position }))
    }]
  };

  chart.setOption(option);
  container._chart = chart;
  return chart;
};

const renderPanelNumbers = (container, numbers) => {
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'nums';

  numbers.forEach((value, index) => {
    const previousNumber = index > 0 ? numbers[index - 1] : null;
    const nextNumber = index < numbers.length - 1 ? numbers[index + 1] : null;
    const d = document.createElement('div');
    d.className = 'num';
    d.dataset.number = value;
    d.dataset.position = index + 1;
    d.dataset.previousNumber = previousNumber === null ? '' : previousNumber;
    d.dataset.nextNumber = nextNumber === null ? '' : nextNumber;
    d.innerHTML = `<span class="num-value">${value}</span>`;
    d.onclick = () => openDetails(value, { positionIndex: index + 1, previousNumber, nextNumber });
    d.onmousemove = e => {
      tip.style.display = 'block';
      tip.style.left = e.pageX + 15 + 'px';
      tip.style.top = e.pageY + 25 + 'px';
      tip.innerHTML = `
  <b>Número:</b> ${value}<br>
  <b>Posição no painel:</b> ${index + 1}º<br>
  <b>Diferença para o anterior:</b> ${formatDifferenceValue(previousNumber === null ? null : value - previousNumber)}<br>
  <b>Diferença para o próximo:</b> ${formatDifferenceValue(nextNumber === null ? null : nextNumber - value)}<br>
  <b>Metade:</b> ${value / 2}<br>
  <b>Raiz:</b> ${Math.sqrt(value).toFixed(4)}<br>
  <b>Log:</b> ${Math.log(value).toFixed(4)}
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
      <h3>${a} → ${b}</h3>
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
  const tabs = p.querySelectorAll(".panel-tab");
  const countEl = p.querySelector(".panel-count");
  const removeBtn = p.querySelector(".remove-panel");

  const switchPanelView = view => {
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.view === view);
    });

    if (view === "chart") {
      renderPanelChart(viewEl, visibleNumbers);
      requestAnimationFrame(() => {
        if (viewEl._chart) {
          viewEl._chart.resize();
        }
      });
    } else {
      renderPanelNumbers(viewEl, visibleNumbers);
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