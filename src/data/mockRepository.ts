import { DocItem } from '../types';
import { generateValidPdfBytes } from '../utils/pdfGenerator';

/**
 * Realistic nested repository data mimicking a GitHub documentation hub
 */
export const REPOSITORY_DATA: DocItem = {
  id: 'root',
  name: 'octodoc',
  type: 'folder',
  path: '/',
  lastCommit: 'chore: merge release v2.4.0 documentation and specs',
  updatedAt: '3 hours ago',
  children: [
    {
      id: 'docs',
      name: 'docs',
      type: 'folder',
      path: '/docs',
      lastCommit: 'docs(rfc): add distributed tracing & gateway rfcs',
      updatedAt: '5 hours ago',
      children: [
        {
          id: 'docs-architecture',
          name: 'architecture',
          type: 'folder',
          path: '/docs/architecture',
          lastCommit: 'feat(arch): update high-availability storage whitepaper',
          updatedAt: 'yesterday',
          children: [
            {
              id: 'doc-arch-01',
              name: 'system-overview-2026.pdf',
              type: 'file',
              path: '/docs/architecture/system-overview-2026.pdf',
              size: 1420000,
              lastCommit: 'docs: update distributed systems high-level topology',
              updatedAt: 'yesterday',
              pageCount: 14,
              category: 'Architecture',
              summary: 'Comprehensive blueprint of cloud services, caching layer, and messaging topologies.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'System Overview 2026 Architecture Blueprint',
                  category: 'Architecture',
                  pageCount: 14,
                  summary: 'Comprehensive blueprint of cloud services, caching layer, and messaging topologies.',
                }),
            },
            {
              id: 'doc-arch-02',
              name: 'microservices-event-bus.pdf',
              type: 'file',
              path: '/docs/architecture/microservices-event-bus.pdf',
              size: 890000,
              lastCommit: 'refactor: clarify dead-letter queue routing semantics',
              updatedAt: '2 days ago',
              pageCount: 9,
              category: 'Architecture',
              summary: 'Event-driven architecture guidelines, schema registry, and pub/sub guarantees.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Microservices Event Bus Architecture',
                  category: 'Architecture',
                  pageCount: 9,
                  summary: 'Event-driven architecture guidelines, schema registry, and pub/sub guarantees.',
                }),
            },
            {
              id: 'doc-arch-03',
              name: 'storage-replication-design.pdf',
              type: 'file',
              path: '/docs/architecture/storage-replication-design.pdf',
              size: 2150000,
              lastCommit: 'docs(storage): cross-region multi-primary failover runbook',
              updatedAt: '3 days ago',
              pageCount: 22,
              category: 'Storage',
              summary: 'Multi-datacenter replication, Raft consensus validation, and quorum recovery.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Storage Replication & Consensus Design',
                  category: 'Storage',
                  pageCount: 22,
                  summary: 'Multi-datacenter replication, Raft consensus validation, and quorum recovery.',
                }),
            },
          ],
        },
        {
          id: 'docs-rfc',
          name: 'rfc',
          type: 'folder',
          path: '/docs/rfc',
          lastCommit: 'docs(rfc): add rfc-104 distributed tracing specification',
          updatedAt: '4 days ago',
          children: [
            {
              id: 'rfc-101',
              name: 'rfc-101-auth-federation.pdf',
              type: 'file',
              path: '/docs/rfc/rfc-101-auth-federation.pdf',
              size: 460000,
              lastCommit: 'rfc: add openid connect token exchange flow',
              updatedAt: '4 days ago',
              pageCount: 5,
              category: 'RFC',
              summary: 'Proposal for enterprise identity federation and token exchange protocol.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'RFC 101: Identity & Auth Federation',
                  category: 'RFC',
                  pageCount: 5,
                  summary: 'Proposal for enterprise identity federation and token exchange protocol.',
                }),
            },
            {
              id: 'rfc-102',
              name: 'rfc-102-zero-trust-gateways.pdf',
              type: 'file',
              path: '/docs/rfc/rfc-102-zero-trust-gateways.pdf',
              size: 640000,
              lastCommit: 'rfc: mTLS client verification standard in edge proxies',
              updatedAt: '5 days ago',
              pageCount: 7,
              category: 'RFC',
              summary: 'Edge proxy architecture implementing mutual TLS and context-aware authorization.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'RFC 102: Zero-Trust Gateway Standard',
                  category: 'RFC',
                  pageCount: 7,
                  summary: 'Edge proxy architecture implementing mutual TLS and context-aware authorization.',
                }),
            },
            {
              id: 'rfc-103',
              name: 'rfc-103-client-side-caching.pdf',
              type: 'file',
              path: '/docs/rfc/rfc-103-client-side-caching.pdf',
              size: 380000,
              lastCommit: 'rfc: stale-while-revalidate client cache policy',
              updatedAt: '6 days ago',
              pageCount: 4,
              category: 'RFC',
              summary: 'Deterministic browser caching rules, ServiceWorker policies, and cache invalidation.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'RFC 103: Client-Side Caching Policies',
                  category: 'RFC',
                  pageCount: 4,
                  summary: 'Deterministic browser caching rules, ServiceWorker policies, and cache invalidation.',
                }),
            },
            {
              id: 'rfc-104',
              name: 'rfc-104-distributed-tracing.pdf',
              type: 'file',
              path: '/docs/rfc/rfc-104-distributed-tracing.pdf',
              size: 780000,
              lastCommit: 'rfc: OpenTelemetry span propagation headers',
              updatedAt: '1 week ago',
              pageCount: 8,
              category: 'RFC',
              summary: 'W3C TraceContext headers, sampling rate algorithms, and span baggage limits.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'RFC 104: OpenTelemetry Distributed Tracing',
                  category: 'RFC',
                  pageCount: 8,
                  summary: 'W3C TraceContext headers, sampling rate algorithms, and span baggage limits.',
                }),
            },
          ],
        },
        {
          id: 'docs-security',
          name: 'security',
          type: 'folder',
          path: '/docs/security',
          lastCommit: 'sec: update vulnerability disclosure guidelines & pgp key',
          updatedAt: '1 week ago',
          children: [
            {
              id: 'sec-01',
              name: 'threat-model-whitepaper.pdf',
              type: 'file',
              path: '/docs/security/threat-model-whitepaper.pdf',
              size: 1850000,
              lastCommit: 'sec: STRIDE threat assessment report for cluster nodes',
              updatedAt: '1 week ago',
              pageCount: 18,
              category: 'Security',
              summary: 'STRIDE model analysis across internal and boundary-facing network interfaces.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Infrastructure Threat Modeling Whitepaper',
                  category: 'Security',
                  pageCount: 18,
                  summary: 'STRIDE model analysis across internal and boundary-facing network interfaces.',
                }),
            },
            {
              id: 'sec-02',
              name: 'compliance-audit-soc2.pdf',
              type: 'file',
              path: '/docs/security/compliance-audit-soc2.pdf',
              size: 3200000,
              lastCommit: 'audit: publish annual SOC2 Type II audit summary',
              updatedAt: '2 weeks ago',
              pageCount: 31,
              category: 'Security',
              summary: 'Third-party auditor evaluation of trust services criteria and control procedures.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'SOC2 Type II Annual Compliance Audit',
                  category: 'Security',
                  pageCount: 31,
                  summary: 'Third-party auditor evaluation of trust services criteria and control procedures.',
                }),
            },
            {
              id: 'sec-03',
              name: 'vulnerability-disclosure-policy.pdf',
              type: 'file',
              path: '/docs/security/vulnerability-disclosure-policy.pdf',
              size: 290000,
              lastCommit: 'sec: clarify safe harbor protections for ethical researchers',
              updatedAt: '2 weeks ago',
              pageCount: 3,
              category: 'Security',
              summary: 'Rules of engagement, SLA timelines, and bug bounty payout guidelines.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Coordinated Vulnerability Disclosure Policy',
                  category: 'Security',
                  pageCount: 3,
                  summary: 'Rules of engagement, SLA timelines, and bug bounty payout guidelines.',
                }),
            },
            {
              id: 'sec-04',
              name: 'cryptographic-key-management.pdf',
              type: 'file',
              path: '/docs/security/cryptographic-key-management.pdf',
              size: 1150000,
              lastCommit: 'sec: automated KMS envelope encryption standard',
              updatedAt: '3 weeks ago',
              pageCount: 12,
              category: 'Security',
              summary: 'Root of trust, HSM rotation schedules, and envelope encryption requirements.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Cryptographic Key Management Standard',
                  category: 'Security',
                  pageCount: 12,
                  summary: 'Root of trust, HSM rotation schedules, and envelope encryption requirements.',
                }),
            },
          ],
        },
        {
          id: 'docs-specifications',
          name: 'specifications',
          type: 'folder',
          path: '/docs/specifications',
          lastCommit: 'spec: finalize OpenAPI 3.1 contract and streaming protocols',
          updatedAt: '2 weeks ago',
          children: [
            {
              id: 'spec-01',
              name: 'api-schema-v3-openapi.pdf',
              type: 'file',
              path: '/docs/specifications/api-schema-v3-openapi.pdf',
              size: 2420000,
              lastCommit: 'spec: add pagination & filter schemas to API v3',
              updatedAt: '2 weeks ago',
              pageCount: 24,
              category: 'Specification',
              summary: 'Full OpenAPI 3.1 specification for external client integration.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'OpenAPI 3.1 REST API Specification',
                  category: 'Specification',
                  pageCount: 24,
                  summary: 'Full OpenAPI 3.1 specification for external client integration.',
                }),
            },
            {
              id: 'spec-02',
              name: 'telemetry-protocol-spec.pdf',
              type: 'file',
              path: '/docs/specifications/telemetry-protocol-spec.pdf',
              size: 980000,
              lastCommit: 'spec: protobuf serialization format for edge metrics',
              updatedAt: '3 weeks ago',
              pageCount: 10,
              category: 'Specification',
              summary: 'Protocol buffers schema and binary wire format for client telemetry dispatch.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Telemetry Protocol & Binary Wire Spec',
                  category: 'Specification',
                  pageCount: 10,
                  summary: 'Protocol buffers schema and binary wire format for client telemetry dispatch.',
                }),
            },
            {
              id: 'spec-03',
              name: 'event-streaming-protocol.pdf',
              type: 'file',
              path: '/docs/specifications/event-streaming-protocol.pdf',
              size: 1540000,
              lastCommit: 'spec: server-sent events heartbeat and reconnect semantics',
              updatedAt: '3 weeks ago',
              pageCount: 15,
              category: 'Specification',
              summary: 'SSE streaming payload structures, framing, and channel multiplexing.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Server-Sent Events Streaming Protocol',
                  category: 'Specification',
                  pageCount: 15,
                  summary: 'SSE streaming payload structures, framing, and channel multiplexing.',
                }),
            },
          ],
        },
      ],
    },
    {
      id: 'research',
      name: 'research',
      type: 'folder',
      path: '/research',
      lastCommit: 'research: add 2026 AI evaluation benchmarks & Paxos comparisons',
      updatedAt: '3 days ago',
      children: [
        {
          id: 'research-ai',
          name: 'ai-evaluation',
          type: 'folder',
          path: '/research/ai-evaluation',
          lastCommit: 'research: LLM reasoning benchmarks across 4,000 runs',
          updatedAt: '3 days ago',
          children: [
            {
              id: 'res-ai-01',
              name: 'llm-reasoning-benchmarks-2026.pdf',
              type: 'file',
              path: '/research/ai-evaluation/llm-reasoning-benchmarks-2026.pdf',
              size: 3850000,
              lastCommit: 'bench: add multimodal latency and precision curves',
              updatedAt: '3 days ago',
              pageCount: 38,
              category: 'Research',
              summary: 'Comparative analysis of reasoning models on complex verification tasks.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: '2026 AI Reasoning Benchmarks & Evaluation',
                  category: 'Research',
                  pageCount: 38,
                  summary: 'Comparative analysis of reasoning models on complex verification tasks.',
                }),
            },
            {
              id: 'res-ai-02',
              name: 'context-window-compression.pdf',
              type: 'file',
              path: '/research/ai-evaluation/context-window-compression.pdf',
              size: 2200000,
              lastCommit: 'research: semantic KV-cache pruning evaluation',
              updatedAt: '4 days ago',
              pageCount: 21,
              category: 'Research',
              summary: 'Algorithmic approaches to long-context compression with minimal perplexity degradation.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Semantic Context Window Compression',
                  category: 'Research',
                  pageCount: 21,
                  summary: 'Algorithmic approaches to long-context compression with minimal perplexity degradation.',
                }),
            },
            {
              id: 'res-ai-03',
              name: 'agentic-tool-reliability.pdf',
              type: 'file',
              path: '/research/ai-evaluation/agentic-tool-reliability.pdf',
              size: 1950000,
              lastCommit: 'research: recursive error correction under partial tool failures',
              updatedAt: '5 days ago',
              pageCount: 19,
              category: 'Research',
              summary: 'Empirical study of function-calling hallucination and retry resilience.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Agentic Tool Calling & Error Recovery',
                  category: 'Research',
                  pageCount: 19,
                  summary: 'Empirical study of function-calling hallucination and retry resilience.',
                }),
            },
          ],
        },
        {
          id: 'research-databases',
          name: 'databases',
          type: 'folder',
          path: '/research/databases',
          lastCommit: 'research: append-only storage engines write amplification',
          updatedAt: '1 week ago',
          children: [
            {
              id: 'res-db-01',
              name: 'lsm-trees-vs-btree-benchmarks.pdf',
              type: 'file',
              path: '/research/databases/lsm-trees-vs-btree-benchmarks.pdf',
              size: 2750000,
              lastCommit: 'bench: NVMe write-amplification curves in high-IOPS workloads',
              updatedAt: '1 week ago',
              pageCount: 28,
              category: 'Database',
              summary: 'Trade-off analysis of log-structured merge trees vs. B-trees on modern SSD storage.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'LSM-Trees vs B-Trees Storage Engine Benchmark',
                  category: 'Database',
                  pageCount: 28,
                  summary: 'Trade-off analysis of log-structured merge trees vs. B-trees on modern SSD storage.',
                }),
            },
            {
              id: 'res-db-02',
              name: 'distributed-consensus-paxos-raft.pdf',
              type: 'file',
              path: '/research/databases/distributed-consensus-paxos-raft.pdf',
              size: 3120000,
              lastCommit: 'research: leader election recovery times under network partitions',
              updatedAt: '1 week ago',
              pageCount: 32,
              category: 'Database',
              summary: 'Formal validation and failure mode analysis of Raft vs. Multi-Paxos.',
              contentGenerator: () =>
                generateValidPdfBytes({
                  title: 'Distributed Consensus: Multi-Paxos & Raft',
                  category: 'Database',
                  pageCount: 32,
                  summary: 'Formal validation and failure mode analysis of Raft vs. Multi-Paxos.',
                }),
            },
          ],
        },
      ],
    },
    {
      id: 'handbooks',
      name: 'handbooks',
      type: 'folder',
      path: '/handbooks',
      lastCommit: 'docs(handbook): update engineering onboarding and runbooks',
      updatedAt: '4 days ago',
      children: [
        {
          id: 'hb-01',
          name: 'engineering-onboarding-2026.pdf',
          type: 'file',
          path: '/handbooks/engineering-onboarding-2026.pdf',
          size: 4100000,
          lastCommit: 'handbook: add local development setup and monorepo tips',
          updatedAt: '4 days ago',
          pageCount: 42,
          category: 'Handbook',
          summary: 'Complete onboarding walkthrough for new engineering hires and contributors.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Engineering Onboarding Handbook 2026',
              category: 'Handbook',
              pageCount: 42,
              summary: 'Complete onboarding walkthrough for new engineering hires and contributors.',
            }),
        },
        {
          id: 'hb-02',
          name: 'incident-response-runbook.pdf',
          type: 'file',
          path: '/handbooks/incident-response-runbook.pdf',
          size: 1650000,
          lastCommit: 'handbook: severity escalation matrices and on-call paging procedures',
          updatedAt: '5 days ago',
          pageCount: 16,
          category: 'Handbook',
          summary: 'Sev-1 through Sev-4 mitigation protocols, status page updates, and blameless postmortems.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Incident Response & On-Call Runbook',
              category: 'Handbook',
              pageCount: 16,
              summary: 'Sev-1 through Sev-4 mitigation protocols, status page updates, and blameless postmortems.',
            }),
        },
        {
          id: 'hb-03',
          name: 'code-review-styleguide.pdf',
          type: 'file',
          path: '/handbooks/code-review-styleguide.pdf',
          size: 850000,
          lastCommit: 'handbook: TypeScript 5.8 idioms and lint rules',
          updatedAt: '6 days ago',
          pageCount: 8,
          category: 'Handbook',
          summary: 'Constructive review patterns, PR sizing recommendations, and naming conventions.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Code Review Standards & Styleguide',
              category: 'Handbook',
              pageCount: 8,
              summary: 'Constructive review patterns, PR sizing recommendations, and naming conventions.',
            }),
        },
        {
          id: 'hb-04',
          name: 'release-engineering-playbook.pdf',
          type: 'file',
          path: '/handbooks/release-engineering-playbook.pdf',
          size: 1350000,
          lastCommit: 'handbook: zero-downtime database migration cadence',
          updatedAt: '1 week ago',
          pageCount: 14,
          category: 'Handbook',
          summary: 'Blue/green deployment workflows, canary testing thresholds, and automated rollbacks.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Release Engineering & Canary Playbook',
              category: 'Handbook',
              pageCount: 14,
              summary: 'Blue/green deployment workflows, canary testing thresholds, and automated rollbacks.',
            }),
        },
      ],
    },
    {
      id: 'guidelines',
      name: 'guidelines',
      type: 'folder',
      path: '/guidelines',
      lastCommit: 'design: update frontend design constitution & accessibility criteria',
      updatedAt: '1 week ago',
      children: [
        {
          id: 'guide-01',
          name: 'frontend-design-constitution.pdf',
          type: 'file',
          path: '/guidelines/frontend-design-constitution.pdf',
          size: 1250000,
          lastCommit: 'design: zero-pill typography and spatial discipline rules',
          updatedAt: '1 week ago',
          pageCount: 12,
          category: 'Guidelines',
          summary: 'Universal UI guidelines, 60-30-10 palette distribution, and responsive contracts.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Frontend Design Constitution & Principles',
              category: 'Guidelines',
              pageCount: 12,
              summary: 'Universal UI guidelines, 60-30-10 palette distribution, and responsive contracts.',
            }),
        },
        {
          id: 'guide-02',
          name: 'accessibility-wcag-checklist.pdf',
          type: 'file',
          path: '/guidelines/accessibility-wcag-checklist.pdf',
          size: 760000,
          lastCommit: 'a11y: WCAG 2.2 AA audit criteria for web applications',
          updatedAt: '2 weeks ago',
          pageCount: 7,
          category: 'Guidelines',
          summary: 'Focus rings, screen-reader landmarks, color contrast equations, and keyboard traps.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'WCAG 2.2 AA Accessibility Audit Checklist',
              category: 'Guidelines',
              pageCount: 7,
              summary: 'Focus rings, screen-reader landmarks, color contrast equations, and keyboard traps.',
            }),
        },
        {
          id: 'guide-03',
          name: 'performance-budget-standards.pdf',
          type: 'file',
          path: '/guidelines/performance-budget-standards.pdf',
          size: 610000,
          lastCommit: 'perf: LCP and INP thresholds for client-side web apps',
          updatedAt: '2 weeks ago',
          pageCount: 6,
          category: 'Guidelines',
          summary: 'Core Web Vitals budgets, JavaScript execution limits, and asset compression rules.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Web Performance Budget & Vitals Standards',
              category: 'Guidelines',
              pageCount: 6,
              summary: 'Core Web Vitals budgets, JavaScript execution limits, and asset compression rules.',
            }),
        },
      ],
    },
    {
      id: 'templates',
      name: 'templates',
      type: 'folder',
      path: '/templates',
      lastCommit: 'templates: add clean technical doc and rfc templates',
      updatedAt: '2 weeks ago',
      children: [
        {
          id: 'tmpl-01',
          name: 'rfc-proposal-template.pdf',
          type: 'file',
          path: '/templates/rfc-proposal-template.pdf',
          size: 220000,
          lastCommit: 'templates: RFC review rubric and template skeleton',
          updatedAt: '2 weeks ago',
          pageCount: 2,
          category: 'Template',
          summary: 'Standard RFC format with motivation, alternatives, security, and rollout stages.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'RFC Engineering Proposal Template',
              category: 'Template',
              pageCount: 2,
              summary: 'Standard RFC format with motivation, alternatives, security, and rollout stages.',
            }),
        },
        {
          id: 'tmpl-02',
          name: 'postmortem-incident-template.pdf',
          type: 'file',
          path: '/templates/postmortem-incident-template.pdf',
          size: 310000,
          lastCommit: 'templates: blameless incident timeline and corrective actions rubric',
          updatedAt: '2 weeks ago',
          pageCount: 3,
          category: 'Template',
          summary: 'Structured retrospective framework with 5-whys root cause analysis and SLA impacts.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Blameless Postmortem & RCA Template',
              category: 'Template',
              pageCount: 3,
              summary: 'Structured retrospective framework with 5-whys root cause analysis and SLA impacts.',
            }),
        },
        {
          id: 'tmpl-03',
          name: 'design-doc-template.pdf',
          type: 'file',
          path: '/templates/design-doc-template.pdf',
          size: 280000,
          lastCommit: 'templates: design document sections for new service launch',
          updatedAt: '3 weeks ago',
          pageCount: 3,
          category: 'Template',
          summary: 'Service architecture planning template with scale estimations and SLOs.',
          contentGenerator: () =>
            generateValidPdfBytes({
              title: 'Service Architecture Design Doc Template',
              category: 'Template',
              pageCount: 3,
              summary: 'Service architecture planning template with scale estimations and SLOs.',
            }),
        },
      ],
    },
    {
      id: 'root-readme',
      name: 'README.pdf',
      type: 'file',
      path: '/README.pdf',
      size: 320000,
      lastCommit: 'docs: repository navigation instructions and index guide',
      updatedAt: 'yesterday',
      pageCount: 3,
      category: 'Documentation',
      summary: 'Repository guide, directory index, download instructions, and contributing overview.',
      contentGenerator: () =>
        generateValidPdfBytes({
          title: 'OctoDoc Repository Guide & Index',
          category: 'Documentation',
          pageCount: 3,
          summary: 'Repository guide, directory index, download instructions, and contributing overview.',
        }),
    },
    {
      id: 'root-contributing',
      name: 'CONTRIBUTING.pdf',
      type: 'file',
      path: '/CONTRIBUTING.pdf',
      size: 410000,
      lastCommit: 'docs: documentation submission workflow and PR review guide',
      updatedAt: '4 days ago',
      pageCount: 4,
      category: 'Documentation',
      summary: 'Contribution standards, markdown linting, and PDF build instructions.',
      contentGenerator: () =>
        generateValidPdfBytes({
          title: 'Contributing to OctoDoc Hub',
          category: 'Documentation',
          pageCount: 4,
          summary: 'Contribution standards, markdown linting, and PDF build instructions.',
        }),
    },
    {
      id: 'root-license',
      name: 'LICENSE.pdf',
      type: 'file',
      path: '/LICENSE.pdf',
      size: 110000,
      lastCommit: 'legal: Apache 2.0 open source license text',
      updatedAt: '1 month ago',
      pageCount: 1,
      category: 'Legal',
      summary: 'Apache License Version 2.0 full legal terms and conditions.',
      contentGenerator: () =>
        generateValidPdfBytes({
          title: 'Apache License Version 2.0',
          category: 'Legal',
          pageCount: 1,
          summary: 'Apache License Version 2.0 full legal terms and conditions.',
        }),
    },
  ],
};

/**
 * Returns a flat list of all PDF files across all nested directories
 */
export function flattenAllFiles(node: DocItem = REPOSITORY_DATA): DocItem[] {
  const result: DocItem[] = [];
  if (node.type === 'file') {
    result.push(node);
  } else if (node.children) {
    for (const child of node.children) {
      result.push(...flattenAllFiles(child));
    }
  }
  return result;
}

/**
 * Returns node located at path
 */
export function getNodeByPath(path: string, current: DocItem = REPOSITORY_DATA): DocItem | null {
  const normalizedTarget = path === '' || path === '/' ? '/' : path.replace(/\/+$/, '');
  const normalizedCurrent = current.path === '' || current.path === '/' ? '/' : current.path.replace(/\/+$/, '');

  if (normalizedTarget === normalizedCurrent) {
    return current;
  }

  if (current.children) {
    for (const child of current.children) {
      const match = getNodeByPath(normalizedTarget, child);
      if (match) return match;
    }
  }

  return null;
}

/**
 * Counts total PDF files inside a folder
 */
export function countFolderFiles(folder: DocItem): number {
  if (folder.type === 'file') return 1;
  if (!folder.children) return 0;
  return folder.children.reduce((acc, child) => acc + countFolderFiles(child), 0);
}

/**
 * Computes total bytes of all PDFs inside a folder
 */
export function calculateFolderBytes(folder: DocItem): number {
  if (folder.type === 'file') return folder.size || 0;
  if (!folder.children) return 0;
  return folder.children.reduce((acc, child) => acc + calculateFolderBytes(child), 0);
}

/**
 * Human readable file size formatter
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
