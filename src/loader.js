function normalizePayload(payload) {
  const stats = Array.isArray(payload?.stats) ? payload.stats : [];
  return {
    dataset: payload?.dataset ?? "Unspecified dataset",
    version: payload?.version ?? "0.0.0",
    last_checked: payload?.last_checked ?? "",
    source_notes: payload?.source_notes ?? "",
    stats: stats.map((item) => ({
      category: item.category ?? "",
      metric: item.metric ?? "",
      value: item.value ?? "",
      unit: item.unit ?? "",
      update_date: item.update_date ?? "",
      source: item.source ?? "",
      source_url: item.source_url ?? "",
    })),
  };
}

export async function loadStats({
  sourceUrl = "./data/stats.json",
  fallbackData = null,
} = {}) {
  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const payload = await response.json();
    const normalized = normalizePayload(payload);
    return {
      source: "remote",
      version: normalized.version,
      last_checked: normalized.last_checked,
      data: normalized,
      error: null,
    };
  } catch (error) {
    if (fallbackData) {
      const normalized = normalizePayload(fallbackData);
      return {
        source: "fallback",
        version: normalized.version,
        last_checked: normalized.last_checked,
        data: normalized,
        error: error.message,
      };
    }

    return {
      source: "unavailable",
      version: "0.0.0",
      last_checked: "",
      data: { dataset: "Unavailable", version: "0.0.0", stats: [] },
      error: error.message,
    };
  }
}
