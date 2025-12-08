import { calculateWeightedScore } from './scoreUtils.js';
import { computeRollingAverage, getScores, saveDailyScore } from './storage.js';

const form = document.getElementById('checkin-form');
const scoreValue = document.getElementById('score-value');
const scoreDetail = document.getElementById('score-detail');
const chart = document.getElementById('trend-chart');
const emptyState = document.getElementById('trend-empty');
const averageOutput = document.getElementById('average-output');
const rollingInput = document.getElementById('rolling-window');

function collectResponses() {
  const selects = form.querySelectorAll('select');
  return Array.from(selects).map((select) => {
    const importance = select.parentElement.querySelector('input').value;
    return {
      label: select.dataset.label,
      answer: select.value,
      importance: Number(importance),
    };
  });
}

function renderScore({ score, positiveWeight, totalWeight }) {
  scoreValue.textContent = `${score}%`;
  scoreDetail.textContent = totalWeight === 0
    ? 'Add importance to start scoring.'
    : `${positiveWeight} of ${totalWeight} weighted points felt fortunate.`;
}

function drawChart(data) {
  if (!chart) return;
  chart.innerHTML = '';
  if (!data || data.length === 0) {
    chart.setAttribute('aria-hidden', 'true');
    chart.style.display = 'none';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  chart.style.display = 'block';
  chart.setAttribute('aria-hidden', 'false');

  const width = chart.clientWidth || 800;
  const height = chart.clientHeight || 220;
  const padding = 28;

  const maxScore = Math.max(...data.map((d) => d.score), 100);
  const minScore = Math.min(...data.map((d) => d.score), 0);
  const range = Math.max(maxScore - minScore, 1);

  const points = data.map((d, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = padding + ((maxScore - d.score) / range) * (height - padding * 2);
    return { x, y, label: d.date, value: d.score };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  polyline.setAttribute('d', pathD);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', '#219ebc');
  polyline.setAttribute('stroke-width', '3');
  polyline.setAttribute('stroke-linecap', 'round');
  polyline.setAttribute('stroke-linejoin', 'round');

  const gradientId = 'chart-gradient';
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', gradientId);
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('x2', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('y2', '100%');
  const stopTop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stopTop.setAttribute('offset', '0%');
  stopTop.setAttribute('stop-color', '#8ecae6');
  stopTop.setAttribute('stop-opacity', '0.6');
  const stopBottom = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stopBottom.setAttribute('offset', '100%');
  stopBottom.setAttribute('stop-color', '#8ecae6');
  stopBottom.setAttribute('stop-opacity', '0');
  gradient.append(stopTop, stopBottom);
  defs.appendChild(gradient);

  const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const areaPath = `${pathD} L ${points.at(-1).x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  area.setAttribute('d', areaPath);
  area.setAttribute('fill', `url(#${gradientId})`);
  area.setAttribute('stroke', 'none');

  const circles = points.map((point) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', point.x);
    c.setAttribute('cy', point.y);
    c.setAttribute('r', 4);
    c.setAttribute('fill', '#1d4e89');
    c.setAttribute('stroke', '#e0f2fe');
    c.setAttribute('stroke-width', '2');
    c.setAttribute('aria-label', `${point.label}: ${point.value}%`);
    return c;
  });

  chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  chart.append(defs, area, polyline, ...circles);
}

function renderAverages(windowSize) {
  const average = computeRollingAverage(windowSize);
  const data = getScores();
  const overall = data.length
    ? Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length)
    : 0;

  averageOutput.innerHTML = '';
  const rollingBadge = document.createElement('span');
  rollingBadge.className = 'badge';
  rollingBadge.textContent = `${windowSize}-day average: ${average}%`;

  const overallBadge = document.createElement('span');
  overallBadge.className = 'badge';
  overallBadge.textContent = `All-time average: ${overall}%`;

  averageOutput.append(rollingBadge, overallBadge);
}

function refreshUI() {
  const scores = getScores();
  drawChart(scores);
  renderAverages(rollingInput.value);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const responses = collectResponses();
  const result = calculateWeightedScore(responses);
  renderScore(result);
  saveDailyScore(result.score);
  refreshUI();
});

rollingInput.addEventListener('change', () => {
  renderAverages(rollingInput.value);
});

// Initial render
refreshUI();
const initialScore = calculateWeightedScore(collectResponses());
renderScore(initialScore);
