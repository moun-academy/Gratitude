import { loadStats } from "./loader.js";
import { fallbackStats } from "./fallbackData.js";

const statsContainer = document.getElementById("stats");
const statusBanner = document.getElementById("loader-status");
const datasetMeta = document.getElementById("dataset-meta");

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

function formatValue(stat) {
  if (typeof stat.value === "number") {
    return stat.unit.toLowerCase().includes("percent")
      ? `${stat.value}%`
      : numberFormatter.format(stat.value);
  }
  return stat.value;
}

function renderStats(payload) {
  statsContainer.innerHTML = "";

  payload.stats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "stat-card";

    const heading = document.createElement("h3");
    heading.textContent = stat.metric;
    card.appendChild(heading);

    const value = document.createElement("p");
    value.className = "stat-value";
    value.textContent = formatValue(stat);
    card.appendChild(value);

    const meta = document.createElement("p");
    meta.className = "stat-meta";
    meta.textContent = `${stat.category} • Updated ${stat.update_date}`;
    card.appendChild(meta);

    const source = document.createElement("p");
    source.className = "stat-source";
    const link = document.createElement("a");
    link.href = stat.source_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = stat.source;
    source.append("Source: ", link);
    card.appendChild(source);

    statsContainer.appendChild(card);
  });
}

function renderStatus(loaderState) {
  const parts = [
    `Dataset v${loaderState.version}`,
    loaderState.last_checked ? `checked ${loaderState.last_checked}` : null,
    `served from ${loaderState.source}`,
  ].filter(Boolean);
  statusBanner.textContent = parts.join(" • ");

  if (loaderState.error && loaderState.source === "fallback") {
    const warning = document.createElement("p");
    warning.className = "status-warning";
    warning.textContent = "Live data could not be reached; showing offline copy.";
    statusBanner.appendChild(warning);
  }
}

async function initialize() {
  const loaderState = await loadStats({ fallbackData: fallbackStats });
  renderStatus(loaderState);
  renderStats(loaderState.data);
  datasetMeta.textContent = loaderState.data.source_notes;
}

document.addEventListener("DOMContentLoaded", initialize);
