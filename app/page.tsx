import { Activity, ArrowUpRight, Bot, CheckCircle2, CircleDollarSign, Database, Gauge, Network, ShieldCheck, WalletCards } from "lucide-react";
import projectData from "@/lib/project-data.json";
import type { ProjectData } from "@/lib/types";

const project = projectData as ProjectData;
const icons = [Database, Activity, CircleDollarSign];

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">{project.shortName}</div>
          <div>
            <p className="eyebrow">Base MCP Suite</p>
            <h1>{project.name}</h1>
          </div>
        </div>
        <nav className="nav" aria-label="Product sections">
          <a className="active" href="#console">Console</a>
          <a href="#workflow">Flow</a>
          <a href="#tools">Tools</a>
          <a href="#launch">Launch</a>
        </nav>
        <button className="wallet" type="button">
          <WalletCards size={18} />
          Base Account
        </button>
      </header>

      <section className="grid" id="console">
        <aside className="panel" aria-labelledby="launch-state">
          <p className="eyebrow">{project.category}</p>
          <h2 id="launch-state">{project.status}</h2>
          <p>{project.mission}</p>
          <div className="metric-stack">
            {project.metrics.map((metric, index) => {
              const Icon = icons[index] ?? Gauge;
              return (
                <div className={`metric ${metric.tone}`} key={metric.label}>
                  <span className="metric-icon"><Icon size={20} /></span>
                  <div>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="status">
            <CheckCircle2 size={18} />
            Themed MVP ready for Base Sepolia wiring
          </div>
        </aside>

        <section className="main">
          <article className="hero-console">
            <div className="hero-copy">
              <p className="eyebrow">Today build</p>
              <h2>{project.tagline}</h2>
              <p>{project.mission}</p>
              <div className="hero-actions">
                <button className="action" type="button">
                  <Bot size={18} />
                  {project.primaryAction}
                </button>
                <button className="wallet" type="button">
                  <ShieldCheck size={18} />
                  {project.secondaryAction}
                </button>
              </div>
            </div>
            <div className="signal-board" aria-hidden="true">
              <Network size={36} />
              <span>{project.category}</span>
              <div className="signal-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
          </article>

          <div className="section-heading">
            <div>
              <p className="eyebrow">Core modules</p>
              <h2>Execution surface</h2>
            </div>
          </div>
          <div className="module-grid">
            {project.records.map((record) => (
              <article className="module-card" key={record[0]}>
                <p className="mono">{record[1]}</p>
                <h3>{record[0]}</h3>
                <p>{record[2]}</p>
              </article>
            ))}
          </div>

          <div className="section-heading" id="workflow">
            <div>
              <p className="eyebrow">Agent flow</p>
              <h2>One approval path</h2>
            </div>
          </div>
          <div className="workflow-grid">
            {project.workflow.map((step, index) => (
              <article className="timeline-step" key={step}>
                <p className="mono">Step {index + 1}</p>
                <h3>{index === 0 ? "Discover" : index === 1 ? "Prepare" : index === 2 ? "Pay" : "Record"}</h3>
                <p>{step}</p>
              </article>
            ))}
          </div>

          <section className="bottom-grid" id="tools">
            <div className="record-table" aria-label="Live records">
              {project.records.map((record) => (
                <div className="record-row" key={record[0]}>
                  <strong>{record[0]}</strong>
                  <span>{record[1]}</span>
                  <span>{record[2]}</span>
                </div>
              ))}
            </div>
            <aside className="tool-panel">
              <p className="eyebrow">MCP tools</p>
              <ul>
                {project.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </aside>
          </section>
        </section>
      </section>
    </main>
  );
}
