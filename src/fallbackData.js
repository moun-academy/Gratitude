export const fallbackStats = {
  dataset: "Community Wellbeing Benchmarks",
  version: "2024-06-01",
  last_checked: "2024-06-01",
  source_notes: "Values pulled from the latest publicly posted US national reports at time of curation.",
  stats: [
    {
      category: "homelessness",
      metric: "People experiencing homelessness on a single night",
      value: 653104,
      unit: "people",
      update_date: "2023-12-15",
      source: "HUD 2023 Annual Homeless Assessment Report (AHAR) Part 1",
      source_url: "https://www.huduser.gov/portal/sites/default/files/pdf/2023-AHAR-Part-1.pdf"
    },
    {
      category: "hunger",
      metric: "People living in food-insecure households",
      value: 44000000,
      unit: "people",
      update_date: "2024-05-01",
      source: "USDA Household Food Security in the United States in 2023",
      source_url: "https://www.ers.usda.gov/publications/pub-details/?pubid=107731"
    },
    {
      category: "health",
      metric: "Adults without health insurance",
      value: 25000000,
      unit: "people",
      update_date: "2024-02-15",
      source: "CDC National Health Interview Survey early release, 2023 full year",
      source_url: "https://www.cdc.gov/nchs/data/nhis/earlyrelease/insur202402.pdf"
    },
    {
      category: "safety",
      metric: "Violent crime rate",
      value: 380.7,
      unit: "incidents per 100,000 residents",
      update_date: "2024-03-15",
      source: "FBI Crime in the United States 2022 (revised release)",
      source_url: "https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads"
    },
    {
      category: "connection",
      metric: "Adults who volunteered for an organization in the past year",
      value: 23.2,
      unit: "percent",
      update_date: "2024-01-15",
      source: "Census/ AmeriCorps Current Population Survey Volunteering Supplement, 2023 release",
      source_url: "https://americorps.gov/about/our-impact/research-and-reports/volunteering-civic-life"
    }
  ]
};
