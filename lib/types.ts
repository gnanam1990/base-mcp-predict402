export type Metric = {
  label: string;
  value: string;
  tone: "blue" | "green" | "amber";
};

export type ProjectData = {
  repo: string;
  name: string;
  shortName: string;
  api: string;
  category: string;
  tagline: string;
  status: string;
  mission: string;
  primaryAction: string;
  secondaryAction: string;
  metrics: Metric[];
  workflow: string[];
  tools: string[];
  records: [string, string, string][];
};
