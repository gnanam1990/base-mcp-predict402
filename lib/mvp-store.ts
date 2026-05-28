import fs from "node:fs";
import path from "node:path";
import projectData from "./project-data.json";

type MetricKind = "count" | "activity" | "revenue" | "paidRuns" | "delta" | "apy";

export type MvpItem = {
  slug: string;
  name: string;
  descriptor: string;
  detail: string;
  priceUsdc: number;
  usageCount: number;
  paidRuns: number;
  revenueUsdc: number;
  status: "Active" | "Draft";
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type MvpReceipt = {
  id: string;
  itemSlug: string;
  itemName: string;
  amountUsdc: number;
  asset: "USDC";
  network: string;
  paymentMode: "demo" | "facilitator";
  paymentPayloadHash?: string;
  facilitatorReference?: string;
  createdAt: string;
};

type MvpDb = {
  items: MvpItem[];
  receipts: MvpReceipt[];
};

type ItemInput = {
  name: string;
  descriptor: string;
  detail: string;
  priceUsdc: number;
  payload?: Record<string, unknown>;
};

const metricKinds = ["count", "revenue", "paidRuns"] as MetricKind[];
const seedRecords = projectData.records as [string, string, string][];
const seedItems: MvpItem[] = seedRecords.map((record, index) => ({
  slug: slugify(record[0]),
  name: record[0],
  descriptor: record[1],
  detail: record[2],
  priceUsdc: Number((0.25 + index * 0.01).toFixed(3)),
  usageCount: extractNumber(record[2], 12 + index * 7),
  paidRuns: extractNumber(record[1], 4 + index * 3),
  revenueUsdc: Number(((0.25 + index * 0.01) * (4 + index * 3)).toFixed(3)),
  status: "Active",
  payload: {
    label: record[0],
    descriptor: record[1],
    detail: record[2],
    product: projectData.name,
  },
  createdAt: "2026-05-28T00:00:00.000Z",
  updatedAt: "2026-05-28T00:00:00.000Z",
}));

function dbPath() {
  if (process.env.PREDICT402_DATA_FILE) {
    return process.env.PREDICT402_DATA_FILE;
  }
  return process.env.VERCEL
    ? path.join("/tmp", "predict402-db.json")
    : path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "predict402-db.json");
}

function readDb(): MvpDb {
  const file = dbPath();
  if (!fs.existsSync(file)) {
    const initial = { items: seedItems, receipts: [] };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as MvpDb;
}

function writeDb(db: MvpDb) {
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `predict402-item-${Date.now()}`;
}

function uniqueSlug(name: string, items: MvpItem[]) {
  const base = slugify(name);
  let slug = base;
  let index = 2;
  while (items.some((item) => item.slug === slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

function extractNumber(value: string, fallback: number) {
  const match = value.match(/[0-9]+(?:\.[0-9]+)?/);
  return match ? Number(match[0]) : fallback;
}

export function listItems() {
  return readDb().items;
}

export function findItem(slug: string) {
  return readDb().items.find((item) => item.slug === slug && item.status === "Active");
}

export function createItem(input: ItemInput) {
  const db = readDb();
  const now = new Date().toISOString();
  const item: MvpItem = {
    slug: uniqueSlug(input.name, db.items),
    name: input.name,
    descriptor: input.descriptor,
    detail: input.detail,
    priceUsdc: input.priceUsdc,
    usageCount: 0,
    paidRuns: 0,
    revenueUsdc: 0,
    status: "Active",
    payload: input.payload || {
      "thesis": "Base activity stays above target",
      "confidence": 0.61
    },
    createdAt: now,
    updatedAt: now,
  };
  db.items.unshift(item);
  writeDb(db);
  return item;
}

export function projectStats() {
  const items = readDb().items.filter((item) => item.status === "Active");
  return {
    count: items.length,
    activity: items.reduce((sum, item) => sum + item.usageCount, 0),
    paidRuns: items.reduce((sum, item) => sum + item.paidRuns, 0),
    revenue: items.reduce((sum, item) => sum + item.revenueUsdc, 0),
  };
}

function formatMetric(kind: MetricKind, stats: ReturnType<typeof projectStats>) {
  switch (kind) {
    case "count":
      return String(stats.count);
    case "activity":
      return String(stats.activity);
    case "paidRuns":
      return String(stats.paidRuns);
    case "delta":
      return `+${Math.max(1, stats.paidRuns / 8).toFixed(1)}%`;
    case "apy":
      return `${Math.max(4, stats.activity / 10).toFixed(1)}%`;
    case "revenue":
      return `$${stats.revenue.toFixed(2)}`;
  }
}

export function dashboardData() {
  const stats = projectStats();
  const items = listItems();
  return {
    ...projectData,
    metrics: projectData.metrics.map((metric, index) => ({
      ...metric,
      value: formatMetric(metricKinds[index] || "count", stats),
    })),
    records: items.slice(0, 3).map((item) => [item.name, item.descriptor, item.detail]),
  };
}

export function recordPaidRun(
  itemSlug: string,
  payment: Omit<MvpReceipt, "id" | "itemSlug" | "itemName" | "amountUsdc" | "asset" | "createdAt">,
) {
  const db = readDb();
  const item = db.items.find((entry) => entry.slug === itemSlug);
  if (!item) {
    return undefined;
  }

  const receipt: MvpReceipt = {
    id: `predict402-${itemSlug}-${Date.now()}`,
    itemSlug,
    itemName: item.name,
    amountUsdc: item.priceUsdc,
    asset: "USDC",
    network: payment.network,
    paymentMode: payment.paymentMode,
    paymentPayloadHash: payment.paymentPayloadHash,
    facilitatorReference: payment.facilitatorReference,
    createdAt: new Date().toISOString(),
  };

  item.usageCount += 1;
  item.paidRuns += 1;
  item.revenueUsdc = Number((item.revenueUsdc + item.priceUsdc).toFixed(6));
  item.updatedAt = receipt.createdAt;
  db.receipts.unshift(receipt);
  writeDb(db);
  return receipt;
}
