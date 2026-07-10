"use client";

// React hooks used to manage search, filters, the details panel, and derived lists.
import { useEffect, useMemo, useState } from "react";

// Describes one external training lab displayed inside a vulnerability note.
type Lab = {
  name: string;
  source: string;
  href: string;
};

// Describes the complete content model for one OWASP Top 10 category.
// When you add or edit a vulnerability, these are the fields you will work with.
type Category = {
  id: string;
  number: string;
  title: string;
  status: "Documented" | "Planned";
  summary: string;
  practical: string;
  checks: string[];
  cheatSheet: string;
  labs: Lab[];
  owasp: string;
};

// This is the site's content database.
// Each object becomes an index card and a full field-note panel automatically.
// To update the portfolio, edit these objects instead of changing the page layout.
const categories: Category[] = [
  // A01 content: explanation, practical methodology, cheat sheet, labs, and OWASP source.
  {
    id: "A01",
    number: "01",
    title: "Broken Access Control",
    status: "Documented",
    summary:
      "Authorization rules fail when a user can read, change, or trigger resources outside their intended permissions. The test is never only whether a page is hidden; it is whether every request enforces ownership and role boundaries.",
    practical:
      "Map roles and objects first, then replay the same request as another user, without a session, and with changed identifiers. Test horizontal, vertical, and context-dependent access controls.",
    checks: [
      "Build a role × action × object access matrix",
      "Change IDs in paths, JSON bodies, and hidden parameters",
      "Replay privileged requests with a low-privilege session",
      "Test direct browsing, alternate methods, and missing tokens",
    ],
    cheatSheet: `# Compare the same object across two sessions\nGET /api/orders/1042\nCookie: session=<user_a>\n\nGET /api/orders/1042\nCookie: session=<user_b>\n\n# Try alternate verbs and direct routes\nGET|POST|PUT|PATCH|DELETE /admin/resource/42`,
    labs: [
      {
        name: "Access control vulnerability labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/access-control",
      },
      {
        name: "SSRF lab trail",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/ssrf",
      },
    ],
    owasp: "https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/",
  },
  // A02 content.
  {
    id: "A02",
    number: "02",
    title: "Security Misconfiguration",
    status: "Documented",
    summary:
      "Unsafe defaults, exposed administration features, verbose errors, forgotten files, and inconsistent hardening can turn normal application behavior into an attack path.",
    practical:
      "Inspect every layer: edge, web server, framework, cloud storage, headers, and deployment artifacts. Compare behavior between hosts and environments instead of trusting one baseline scan.",
    checks: [
      "Enumerate virtual hosts, hidden routes, and default endpoints",
      "Review headers, CORS, TLS, caching, and error handling",
      "Look for backups, .git exposure, debug data, and sample apps",
      "Compare production and development behavior",
    ],
    cheatSheet: `# Fast header and method review\ncurl -skI https://target.example\ncurl -ski -X OPTIONS https://target.example/api\n\n# Common exposed artifacts\n/.git/HEAD\n/.env\n/backup.zip\n/server-status\n/actuator`,
    labs: [
      {
        name: "Information disclosure labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/information-disclosure",
      },
      {
        name: "CORS labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/cors",
      },
    ],
    owasp: "https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/",
  },
  // A03 content. "Planned" means the explanation exists but hands-on evidence is not published yet.
  {
    id: "A03",
    number: "03",
    title: "Software Supply Chain Failures",
    status: "Planned",
    summary:
      "Risk enters through dependencies, build systems, package sources, CI/CD identities, and update mechanisms—not only through a library with a known CVE.",
    practical:
      "Trace what is trusted from source to deployment. Inventory dependencies, inspect lockfiles and registries, and identify which build identities can change production artifacts.",
    checks: [
      "Inventory direct, transitive, and runtime dependencies",
      "Review package sources, lockfiles, and integrity controls",
      "Map CI/CD secrets and artifact signing boundaries",
      "Check upgrade ownership and vulnerability response paths",
    ],
    cheatSheet: `# Evidence to collect\npackage-lock.json / yarn.lock / pnpm-lock.yaml\nrequirements.txt / poetry.lock\nDockerfile / image digest\n.github/workflows / CI configuration\nSBOM and signature status`,
    labs: [],
    owasp:
      "https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/",
  },
  // A04 content.
  {
    id: "A04",
    number: "04",
    title: "Cryptographic Failures",
    status: "Planned",
    summary:
      "Sensitive data becomes exposed when it is sent, stored, or transformed without appropriate cryptographic protection and key management.",
    practical:
      "Start with a data-flow map. Identify secrets and regulated data, then verify transport, storage, algorithms, key lifecycle, randomness, and failure behavior.",
    checks: [
      "Classify sensitive data in transit and at rest",
      "Review TLS, cookies, cache behavior, and mixed content",
      "Identify hard-coded keys and weak password storage",
      "Test token entropy, rotation, expiry, and revocation",
    ],
    cheatSheet: `# Transport and certificate snapshot\nopenssl s_client -connect target.example:443 -servername target.example\n\n# Look for secret material\nrg -n "(api[_-]?key|secret|password|BEGIN .* PRIVATE KEY)" .`,
    labs: [],
    owasp: "https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/",
  },
  // A05 content.
  {
    id: "A05",
    number: "05",
    title: "Injection",
    status: "Documented",
    summary:
      "Untrusted input changes the meaning of a query, command, template, or interpreter instruction because data and control are not kept separate.",
    practical:
      "Find every interpreter boundary, establish a stable response baseline, then vary one character class at a time. Confirm impact safely with the smallest possible proof.",
    checks: [
      "Map input to SQL, OS, LDAP, template, and expression sinks",
      "Test syntax, boolean, time, and out-of-band behavior",
      "Change content types and duplicate parameter placement",
      "Confirm server-side context before escalating payloads",
    ],
    cheatSheet: `# Minimal differential probes\n'  \"  \\  )  }}  ${"${7*7}"}\n\n# Time-based confirmation examples\nSLEEP(5)\nWAITFOR DELAY '0:0:5'\n; ping -c 5 127.0.0.1 #`,
    labs: [
      {
        name: "SQL injection labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/sql-injection",
      },
      {
        name: "OS command injection labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/os-command-injection",
      },
      {
        name: "Server-side template injection labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/server-side-template-injection",
      },
    ],
    owasp: "https://owasp.org/Top10/2025/A05_2025-Injection/",
  },
  // A06 content.
  {
    id: "A06",
    number: "06",
    title: "Insecure Design",
    status: "Planned",
    summary:
      "A secure implementation cannot repair a workflow whose trust assumptions, abuse cases, limits, or authorization model were never designed safely.",
    practical:
      "Model the business workflow as an attacker. Look for missing state transitions, economic abuse, unsafe recovery routes, and trust decisions that code-level scanners cannot see.",
    checks: [
      "Diagram actors, assets, trust boundaries, and state changes",
      "Write abuse cases for critical business actions",
      "Test sequence skipping, replay, concurrency, and limits",
      "Review recovery and exception paths for fail-open behavior",
    ],
    cheatSheet: `# Workflow test questions\nCan steps be skipped or repeated?\nCan price, quantity, role, or state be client-controlled?\nWhat happens under two simultaneous requests?\nCan recovery grant more trust than registration?`,
    labs: [],
    owasp: "https://owasp.org/Top10/2025/A06_2025-Insecure_Design/",
  },
  // A07 content.
  {
    id: "A07",
    number: "07",
    title: "Authentication Failures",
    status: "Documented",
    summary:
      "Identity controls fail when credentials, sessions, MFA, reset flows, or account lifecycle rules let an attacker be recognized as another user.",
    practical:
      "Treat login as only one part of the surface. Test registration, enumeration, recovery, MFA, remember-me, session rotation, logout, and account changes as one connected system.",
    checks: [
      "Compare responses for valid and invalid identities",
      "Review rate limits across IP, account, and device dimensions",
      "Test password reset and MFA state transitions",
      "Verify session rotation, invalidation, expiry, and cookie flags",
    ],
    cheatSheet: `# Authentication map\n/register  /login  /logout\n/forgot-password  /reset-password\n/mfa/setup  /mfa/verify  /mfa/recovery\n/profile/email  /profile/password\n\nCompare status, length, timing, and side effects.`,
    labs: [
      {
        name: "Authentication labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/authentication",
      },
      {
        name: "OAuth authentication labs",
        source: "PortSwigger Academy",
        href: "https://portswigger.net/web-security/oauth",
      },
    ],
    owasp: "https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/",
  },
  // A08 content.
  {
    id: "A08",
    number: "08",
    title: "Software or Data Integrity Failures",
    status: "Planned",
    summary:
      "The application trusts code, updates, serialized data, or critical records without verifying that they are authentic and unchanged.",
    practical:
      "Locate every point where external code or structured data crosses a trust boundary. Verify signatures, safe parsing, provenance, and rollback controls.",
    checks: [
      "Identify unsigned updates and untrusted CDN resources",
      "Review deserialization and object-binding boundaries",
      "Check integrity validation for critical records and artifacts",
      "Test whether CI/CD changes require independent approval",
    ],
    cheatSheet: `# Integrity evidence\nArtifact digest + signature\nTrusted publisher identity\nPinned external resources\nSafe serialization format\nProtected deployment approval\nVerified rollback artifact`,
    labs: [],
    owasp:
      "https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/",
  },
  // A09 content.
  {
    id: "A09",
    number: "09",
    title: "Security Logging and Alerting Failures",
    status: "Planned",
    summary:
      "Attacks remain invisible when high-value events are missing, ambiguous, modifiable, or disconnected from alerts and incident response.",
    practical:
      "Generate a small, controlled security event and trace it end to end—from application record to alert, owner, context, and response action.",
    checks: [
      "Trigger failed login, access denial, and sensitive changes",
      "Verify actor, target, timestamp, result, and correlation ID",
      "Test log injection, redaction, access, and retention",
      "Confirm that important events create actionable alerts",
    ],
    cheatSheet: `# A useful security event answers\nWHO acted?\nWHAT changed or failed?\nWHICH asset was targeted?\nWHEN and from WHERE?\nWHAT was the result?\nHOW is it correlated and alerted?`,
    labs: [],
    owasp:
      "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/",
  },
  // A10 content.
  {
    id: "A10",
    number: "10",
    title: "Mishandling of Exceptional Conditions",
    status: "Planned",
    summary:
      "Unexpected states become security problems when errors expose internals, skip validation, corrupt state, or cause the system to fail open.",
    practical:
      "Deliberately violate assumptions: omit fields, cross numeric limits, interrupt multi-step flows, race requests, and make dependencies fail. Observe both response and lasting state.",
    checks: [
      "Test missing, null, duplicate, oversized, and boundary values",
      "Interrupt workflows and simulate dependency failure",
      "Look for partial commits and fail-open authorization",
      "Verify safe user errors and detailed internal telemetry",
    ],
    cheatSheet: `# Exceptional input set\nmissing | null | empty | duplicate\n-1 | 0 | MAX_INT | MAX_INT+1\nvery long strings | invalid encoding\nexpired state | repeated request | parallel request`,
    labs: [],
    owasp:
      "https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/",
  },
];

// These values are calculated from the content above, so the progress card updates automatically.
const documented = categories.filter((item) => item.status === "Documented");
const labCount = documented.reduce((total, item) => total + item.labs.length, 0);

// Main page component. Everything the visitor sees starts here.
export default function Home() {
  // Stores the text written in the vulnerability search box.
  const [query, setQuery] = useState("");

  // Stores the selected status filter: all, documented, or planned.
  const [filter, setFilter] = useState<"All" | Category["status"]>("All");

  // Stores the category currently opened in the details side panel.
  const [active, setActive] = useState<Category | null>(null);

  // Controls the temporary "Copied" feedback on the cheat-sheet button.
  const [copied, setCopied] = useState(false);

  // Produces the visible category list whenever the search or filter changes.
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return categories.filter((item) => {
      const matchesFilter = filter === "All" || item.status === filter;
      const matchesSearch =
        !term ||
        `${item.id} ${item.title} ${item.summary}`.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [filter, query]);

  // Adds Escape-to-close behavior and prevents background scrolling while the panel is open.
  useEffect(() => {
    if (!active) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", close);
    document.body.classList.add("panel-open");
    return () => {
      window.removeEventListener("keydown", close);
      document.body.classList.remove("panel-open");
    };
  }, [active]);

  // Opens a category and resets the previous copy-button state.
  const openCategory = (item: Category) => {
    setCopied(false);
    setActive(item);
  };

  // Copies the active category's cheat sheet to the visitor's clipboard.
  const copyCheatSheet = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.cheatSheet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main>
      <div className="site-shell">
        {/* Top navigation: identity, internal section links, and GitHub profile. */}
        <header className="site-header" aria-label="Primary navigation">
          <a className="wordmark" href="#top" aria-label="Mohamed Abdelwahab home">
            <span className="wordmark-dot" aria-hidden="true" />
            MOHAMED ABDELWAHAB
          </a>
          <nav>
            <a href="#index">Index</a>
            <a href="#field-notes">Field notes</a>
            <a href="#lab-trails">Labs</a>
            <a href="#about">About</a>
          </nav>
          <a
            className="header-link"
            href="https://github.com/mohamedabdo333"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </header>

        {/* Hero section: the first recruiter-facing message and portfolio progress snapshot. */}
        <section className="hero" id="top">
          {/* Left side of the hero: positioning, credentials, and primary actions. */}
          <div className="hero-copy">
            <p className="eyebrow">OWASP TOP 10 — 2025</p>
            <h1>
              I break things.
              <br />
              Then document
              <br />
              the path in.
            </h1>
            <p className="hero-description">
              Junior Penetration Tester based in Oman. Building practical
              explanations, repeatable checks, and lab trails for the modern web.
            </p>
            <div className="credentials" aria-label="Credentials and current focus">
              <span><b>✓</b> eJPT</span>
              <i aria-hidden="true" />
              <span>CPTS</span>
              <i aria-hidden="true" />
              <span><b className="cyan">⌁</b> Studying mobile pentesting</span>
            </div>
            <div className="hero-actions">
              <a className="button button-primary" href="#index">
                Explore vulnerabilities <span aria-hidden="true">→</span>
              </a>
              <a
                className="button button-secondary"
                href="https://github.com/mohamedabdo333"
                target="_blank"
                rel="noreferrer"
              >
                View GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* Right side of the hero: values calculated from the category data above. */}
          <aside className="progress-card" aria-label="Portfolio progress">
            <div className="corner-mark" aria-hidden="true">＋</div>
            <p className="panel-label">Field progress</p>
            <p className="progress-number">{documented.length}/10</p>
            <h2>categories documented</h2>
            <div className="progress-line" aria-hidden="true">
              <span style={{ width: `${documented.length * 10}%` }} />
            </div>
            <dl>
              <div><dt><span className="stat-icon lime">▤</span> Practical notes</dt><dd>0{documented.length}</dd></div>
              <div><dt><span className="stat-icon cyan">↗</span> Lab links</dt><dd>{String(labCount).padStart(2, "0")}</dd></div>
              <div><dt><span className="stat-icon lime">◫</span> Latest update</dt><dd>A01</dd></div>
            </dl>
          </aside>
        </section>

        {/* Highlights three documented categories so a recruiter can reach strong examples quickly. */}
        <section className="field-notes" id="field-notes" aria-labelledby="field-notes-title">
          <div className="section-title-row">
            <p className="panel-label" id="field-notes-title">Selected field notes</p>
            <span>[01—03]</span>
          </div>
          <div className="featured-grid">
            {documented.slice(0, 3).map((item, index) => (
              <button className="featured-card" key={item.id} onClick={() => openCategory(item)}>
                <span className={`featured-number ${index === 1 ? "cyan" : "lime"}`}>{item.number}</span>
                <span className="category-id">{item.id}</span>
                <strong>{item.title}</strong>
                <span className="card-rule" />
                <span className="featured-summary">{item.practical}</span>
                {index < 2 && <span className="path-arrow" aria-hidden="true">→</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Complete searchable and filterable OWASP Top 10 index. */}
        <section className="index-section" id="index" aria-labelledby="index-title">
          <div className="index-heading">
            <div>
              <p className="eyebrow">Complete index</p>
              <h2 id="index-title">Ten risks. One repeatable methodology.</h2>
            </div>
            <p>
              Every note follows the same recruiter-friendly structure: what it is,
              how I test it, a compact cheat sheet, and evidence from labs.
            </p>
          </div>

          {/* Search input and status tabs control the `filtered` list created above. */}
          <div className="controls" aria-label="Filter OWASP categories">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search categories</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by risk, ID, or keyword"
              />
              {query && <button onClick={() => setQuery("")} aria-label="Clear search">×</button>}
            </label>
            <div className="filter-tabs" role="group" aria-label="Documentation status">
              {(["All", "Documented", "Planned"] as const).map((value) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Every matching content object is rendered as one clickable category card. */}
          <div className="category-grid">
            {filtered.map((item) => (
              <button className="category-card" key={item.id} onClick={() => openCategory(item)}>
                <span className="category-topline">
                  <span>{item.number}</span>
                  <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                </span>
                <span className="category-code">{item.id}:2025</span>
                <strong>{item.title}</strong>
                <span className="category-summary">{item.summary}</span>
                <span className="card-footer">
                  <span>{item.labs.length ? `${item.labs.length} lab links` : "Lab trail planned"}</span>
                  <span aria-hidden="true">↗</span>
                </span>
              </button>
            ))}
          </div>

          {/* Friendly fallback shown only when no category matches the selected search/filter. */}
          {!filtered.length && (
            <div className="empty-state">
              <span>NO MATCH</span>
              <p>Try another keyword or reset the status filter.</p>
              <button onClick={() => { setQuery(""); setFilter("All"); }}>Reset index</button>
            </div>
          )}
        </section>

        {/* Explains how lab evidence will be documented as the portfolio grows. */}
        <section className="lab-section" id="lab-trails" aria-labelledby="labs-title">
          <div>
            <p className="eyebrow">Lab trails</p>
            <h2 id="labs-title">Evidence, not badges.</h2>
          </div>
          <div className="lab-copy">
            <p>
              Each completed trail records the initial hypothesis, failed paths,
              working exploit chain, impact, remediation, and the check added to my methodology.
            </p>
            <div className="lab-metrics">
              <span><b>{String(labCount).padStart(2, "0")}</b> linked exercises</span>
              <span><b>04</b> documented categories</span>
              <span><b>01</b> evolving methodology</span>
            </div>
          </div>
        </section>

        {/* Footer: professional identity and verified external profile links. */}
        <footer id="about">
          <div>
            <p className="wordmark footer-wordmark">MOHAMED ABDELWAHAB</p>
            <p>Junior Penetration Tester · eJPT · CPTS · Oman</p>
          </div>
          <div className="footer-links">
            <a href="https://github.com/mohamedabdo333" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://profile.hackthebox.com/profile/019d427d-930b-735a-b981-24c78720b" target="_blank" rel="noreferrer">Hack The Box ↗</a>
            <a href="https://owasp.org/Top10/2025/" target="_blank" rel="noreferrer">OWASP 2025 ↗</a>
          </div>
          <span className="footer-meta">FIELD NOTES / V1.0 / 2026</span>
        </footer>
      </div>

      {/*
        Details side panel.
        It is rendered only when `active` contains a category selected by the visitor.
      */}
      {active && (
        <div className="panel-backdrop" role="presentation" onMouseDown={() => setActive(null)}>
          <article
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Panel heading and close control. */}
            <div className="detail-header">
              <div>
                <p className="panel-label">Field note / {active.id}:2025</p>
                <h2 id="detail-title">{active.title}</h2>
              </div>
              <button className="close-button" onClick={() => setActive(null)} aria-label="Close field note">×</button>
            </div>

            {/* Full note: explanation, methodology, checks, cheat sheet, and lab evidence. */}
            <div className="detail-scroll">
              <section>
                <p className="detail-kicker">01 / Explanation</p>
                <p className="detail-lead">{active.summary}</p>
              </section>
              <section className="practical-box">
                <p className="detail-kicker">02 / Practical summary</p>
                <p>{active.practical}</p>
              </section>
              <section>
                <p className="detail-kicker">03 / Field checklist</p>
                <ul className="checklist">
                  {active.checks.map((check) => <li key={check}><span>✓</span>{check}</li>)}
                </ul>
              </section>
              <section>
                <div className="cheat-title">
                  <p className="detail-kicker">04 / Cheat sheet</p>
                  <button onClick={copyCheatSheet}>{copied ? "Copied ✓" : "Copy"}</button>
                </div>
                <pre><code>{active.cheatSheet}</code></pre>
              </section>
              <section>
                <p className="detail-kicker">05 / Lab trail</p>
                {active.labs.length ? (
                  <div className="detail-labs">
                    {active.labs.map((lab, index) => (
                      <a href={lab.href} target="_blank" rel="noreferrer" key={lab.name}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div><strong>{lab.name}</strong><small>{lab.source}</small></div>
                        <b aria-hidden="true">↗</b>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="planned-lab"><span>PLANNED</span> Write-up and evidence trail will be added after hands-on validation.</div>
                )}
              </section>
            </div>

            {/* Panel footer: documentation status and authoritative OWASP reference. */}
            <div className="detail-footer">
              <span className={`status ${active.status.toLowerCase()}`}>{active.status}</span>
              <a href={active.owasp} target="_blank" rel="noreferrer">Read the OWASP reference ↗</a>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
