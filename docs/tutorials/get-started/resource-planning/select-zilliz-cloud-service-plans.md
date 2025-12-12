---
title: "Detailed Plan Comparison | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "Plan Comparison"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides a range of project plans to suit diverse requirements. Whether you're new to vector databases or require robust solutions for enterprise-level tasks, making the right choice ensures optimal performance, scalability, and cost-efficiency. This guide will help you make an informed decision. | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster plan
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms

---

import Admonition from '@theme/Admonition';


# Detailed Plan Comparison

Zilliz Cloud provides a range of project plans to suit diverse requirements. Whether you're new to vector databases or require robust solutions for enterprise-level tasks, making the right choice ensures optimal performance, scalability, and cost-efficiency. This guide will help you make an informed decision. 

## Plan overview\{#plan-overview}

Zilliz Cloud categorizes its offerings into five distinct plans.

- **Standard:** The Standard plan is tailored for non-critical workloads. It is best suited for prototypes and testing environments. See [Zilliz Cloud Pricing](https://zilliz.com/pricing) for details.

- **Enterprise:** The Enterprise plan provides enterprise-grade reliability and controls. It is best suited for production applications. See [Zilliz Cloud Pricing](https://zilliz.com/pricing) for details.

- **Business Critical**: The Business Critical plan is regulated-ready with maximum resilience. It is best suited for healthcare, finance, mission-critical systems. To select the Business Critical plan, [contact sales](http://zilliz.com/contact-sales).

- **Bring Your Own Cloud (BYOC):** The BYOC Plan is designed for organizations that prioritize custom infrastructure, enhanced data protection, and compliance. It provides the same features and experience as SaaS Dedicated clusters. To select the BYOC plan, [contact sales](http://zilliz.com/contact-sales).

## Plan comparison\{#plan-comparison}

The following section compares the plans and deployment options, detailing the specific features available in each plan.

### Deployment\{#deployment}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>Environment</p></td>
     <td><p>Shared</p></td>
     <td><p>Shared</p></td>
     <td><p>Dedicated</p></td>
     <td><p>Dedicated</p></td>
     <td><p>Dedicated</p></td>
     <td><p>Dedicated</p></td>
   </tr>
   <tr>
     <td><p><a href="./cloud-providers-and-regions">Cloud provider & region</a></p></td>
     <td><p>AWS, GCP</p></td>
     <td><p>AWS, GCP</p></td>
     <td><p>AWS, GCP, Azure</p><p>For details, refer to <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></td>
     <td><p>AWS, GCP, Azure</p><p>For details, refer to <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></td>
     <td><p>AWS, GCP, Azure</p><p>For details, refer to <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></td>
     <td><p>User's VPC</p></td>
   </tr>
   <tr>
     <td><p>Query CU number </p></td>
     <td><p>Single query CU</p></td>
     <td><p>Auto-scale. No configuration required</p></td>
     <td><ul><li><p>Up to 32 query CUs. (You can directly create cluster of 32 query CUs or less on the web UI. For larger query CUs, please <a href="https://zilliz.com/contact-sales">contact sales</a>.</p></li><li><p>Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32.</p></li></ul></td>
     <td><ul><li><p>Up to 256 query CUs.(You can directly create cluster of 256 query CUs or less on the web UI. For larger query CUs, please <a href="https://zilliz.com/contact-sales">contact sales</a>.</p></li><li><p>Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32,…,64, 72, 80, 88,…,256 <em>(Notes: When query CU is greater than 8, the increment increase becomes 4 CUs. When query CU is greater than 64, the increment increase becomes 8 CUs)</em></p></li></ul></td>
     <td><ul><li><p>Up to 256 query CUs.(You can directly create cluster of 256 query CUs or less on the web UI. For larger query CUs, please <a href="https://zilliz.com/contact-sales">contact sales</a>.</p></li><li><p>Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32,…,64, 72, 80, 88,…,256 <em>(Notes: When query CU is greater than 8, the increment increase becomes 4 CUs. When query CU is greater than 64, the increment increase becomes 8 CUs</em></p></li></ul></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p><a href="./scale-cluster">Compute Scaling</a></p></td>
     <td></td>
     <td><p>System-managed auto-scaling</p><p>(No configuration required)</p></td>
     <td><p>Manual scaling to</p><p>32 CUs</p></td>
     <td><p>Configurable auto-scaling</p><p>Manual scaling to 256 CUs or more</p></td>
     <td><p>Configurable auto-scaling</p><p>Manual scaling to 256 CUs or more</p></td>
     <td><p>Configurable auto-scaling</p><p>Manual scaling to 256 CUs or more</p></td>
   </tr>
   <tr>
     <td><p><a href="./cu-types-explained">Cluster type</a> options</p></td>
     <td></td>
     <td></td>
     <td><p>3 Options:</p><ul><li><p>Performance-optimized CU</p></li><li><p>Capacity-optimized CU</p></li><li><p>Tiered-storage CU</p></li></ul></td>
     <td><p>3 Options:</p><ul><li><p>Performance-optimized CU</p></li><li><p>Capacity-optimized CU</p></li><li><p>Tiered-storage CU</p></li></ul></td>
     <td><p>3 Options:</p><ul><li><p>Performance-optimized CU</p></li><li><p>Capacity-optimized CU</p></li><li><p>Tiered-storage CU</p></li></ul></td>
     <td><p>2 Options</p><ul><li><p>Performance-optimized CU</p></li><li><p>Capacity-optimized CU</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Max. collections</p></td>
     <td><p>5 Collections</p></td>
     <td><p>10 Collections per cluster.</p></td>
     <td><p>For details, refer to <a href="./limits#collections">Zilliz Cloud Limits</a>.</p></td>
     <td><p>For details, refer to <a href="./limits#collections">Zilliz Cloud Limits</a>.</p></td>
     <td><p>For details, refer to <a href="./limits#collections">Zilliz Cloud Limits</a>.</p></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p>Uptime SLA</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>99.95%</p></td>
     <td><p>99.99% (If multi-replica is enabled)</p></td>
     <td><p>99.95%</p></td>
   </tr>
</table>

### High availability\{#high-availability}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>Availability zone</p></td>
     <td></td>
     <td><p>Single</p></td>
     <td><p>Single</p></td>
     <td><p>Multiple</p></td>
     <td><p>Multiple</p></td>
     <td><p>Multiple</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-replica">Replica</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Snapshot</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Global Cluster</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
</table>

### Data managment\{#data-managment}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./offline-migration">Cross-cluster migration</a></p></td>
     <td></td>
     <td><p>From Free cluster</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./zero-downtime-migration">Zero downtime migration</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-external-sources">Migration from external sources</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-stages">Stage</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./import-data">High speed data import</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./use-recycle-bin">Recycle bin</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### Data security and compliance\{#data-security-and-compliance}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>OAuth 2.0</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./single-sign-on">Enterprise SSO</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Customer managed encryption keys (CMEK)</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p><a href="./multi-factor-auth">MFA</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./auditing">Auditing</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-api-keys">API key management</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./data-security#data-encryption">Data encryption in transit and at rest</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-and-restore">Backup and restore</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">Cross-region backup</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-whitelist">IP address access control</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-a-private-link">Private networking</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/trust-center">SOC 2 Type II and ISO/ICE 27001 compliant, GDPR ready</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/trust-center">HIPPA ready</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### Observability\{#observability}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./view-cluster-metric-charts">Fine-grained metrics with real-time monitoring dashboard</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-project-alerts">Alerts</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./integrate-with-third-parties">Alerting and monitoring integrations</a></p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./job-center">Job Center</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### Role-based access control\{#role-based-access-control}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./access-control-overview">Organization and project RBAC</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-control">Data plane RBAC</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### Integrations and tools\{#integrations-and-tools}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="/reference/restful">Intuitive RESTful APIs for control and data plane operations</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="/reference/python">User-friendly SDKs in multiple programming languages</a> (Python, Java, Go, and Node.js SDKs)</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/vector-transport-service">VTS (Vector Transport Service)</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/vdbbench-leaderboard">VectorDBBench</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### Technical support\{#technical-support}

<table>
   <tr>
     <th colspan="2"></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated (Standard)</strong></p></th>
     <th><p><strong>Dedicated (Enterprise)</strong></p></th>
     <th><p><strong>Dedicated (Business Critical)</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>On-call availability</p></td>
     <td></td>
     <td><p>Business hours</p></td>
     <td><p>Business hours</p></td>
     <td><p>24/7/365</p></td>
     <td><p>24/7/365</p></td>
     <td></td>
   </tr>
   <tr>
     <td rowspan="4"><p>First response SLAs</p></td>
     <td><p>Emergency</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>30 min on-call</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Urgent</p></td>
     <td></td>
     <td><p>4 hours</p></td>
     <td><p>4 hours</p></td>
     <td><p>1 hour</p></td>
     <td><p>1 hour</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>High</p></td>
     <td></td>
     <td><p>1 business day</p></td>
     <td><p>1 business day</p></td>
     <td><p>4 hours</p></td>
     <td><p>4 hours</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Medium/Normal</p></td>
     <td></td>
     <td><p>2 business days</p></td>
     <td><p>2 business days</p></td>
     <td><p>1 business day</p></td>
     <td><p>1 business day</p></td>
     <td></td>
   </tr>
   <tr>
     <td rowspan="6"><p>Support Options</p></td>
     <td><p>Community</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Support Bot</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Email/Ticket Portal</p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Slack channel</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Zoom/Meet/Teams</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Assigned support engineer</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>Architectural Guidance</p></td>
     <td><p>General</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Use-case specific</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Code reviews</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Live consultations</p></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

