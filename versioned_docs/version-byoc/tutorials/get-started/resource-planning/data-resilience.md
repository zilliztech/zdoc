---
title: "Data Resilience | BYOC"
slug: /data-resilience
sidebar_label: "Data Resilience"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud, as a fully managed vector database service, delivers enterprise-grade High Availability (HA) and Disaster Recovery (DR) capabilities to ensure the continuous availability of your mission-critical data and services under various failure scenarios. | BYOC"
type: origin
token: YBDGwmFYkiRmRIkKGsscRjDmnIb
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - data resilience
  - ha
  - dr
  - rto
  - rpo
  - cost optimzation
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds

---

import Admonition from '@theme/Admonition';


# Data Resilience

Zilliz Cloud, as a fully managed vector database service, delivers enterprise-grade **High Availability (HA)** and **Disaster Recovery (DR)** capabilities to ensure the continuous availability of your mission-critical data and services under various failure scenarios.

### Core Capabilities\{#core-capabilities}

- **High Availability (HA):** Automatic failure detection and rapid failover mechanisms ensure uninterrupted service operation during node, availability zone (AZ), or region-level outages.

- **Disaster Recovery (DR):** Comprehensive backup and restore strategies enable rapid business recovery after major incidents.

- **Flexible Resilience Tiers:** From Standard to enterprise-grade cross-region deployments, tailored to meet diverse RPO/RTO requirements across business scenarios.

- **Cost Optimization:** Choose the most cost-effective resilience strategy based on business value and risk tolerance.

## Key Concepts\{#key-concepts}

### Core Metrics\{#core-metrics}

- **Recovery Point Objective (RPO):** The maximum acceptable data loss, measured in time. For example, an RPO of 5 minutes means up to 5 minutes of recent data may be lost during a failure.

- **Recovery Time Objective (RTO):** The maximum permissible time from failure onset to full service restoration, including failure detection, failover decision-making, and actual recovery.

- **Service Level Agreement (Uptime SLA):** Zilliz Cloud’s commitment to service availability is usually expressed as a percentage (for example, 99.95% uptime means no more than 21.6 minutes of downtime each month).

### Fault Tolerance Scope\{#fault-tolerance-scope}

- **Node-level fault tolerance:** Failure of a single compute or storage node

- **AZ-level fault tolerance:** Complete AZ outage (e.g., data center failure)

- **Region-level fault tolerance:** Entire region service disruption (e.g., natural disaster)

- **Cloud provider-level fault tolerance:** Multi-cloud deployment to mitigate risks from a single cloud vendor

## Resilience Architecture Tiers\{#resilience-architecture-tiers}

### High Availability (HA) Tiers\{#high-availability-ha-tiers}

<table>
   <tr>
     <th><p>Tier</p></th>
     <th><p>Description</p></th>
     <th><p>RPO</p></th>
     <th><p>RTO</p></th>
     <th><p>Write Latency / Replication Scheme</p></th>
     <th><p>Fault Tolerance</p></th>
     <th><p>SLA</p></th>
     <th><p>Relative Cost</p></th>
   </tr>
   <tr>
     <td><p><strong>Standard</strong></p></td>
     <td><p>Single-region, single-AZ deployment with multi-replica mechanism</p></td>
     <td><p>0 seconds</p></td>
     <td><p>≤1 minute</p></td>
     <td><p>Write within single AZ; WAL replicated via Quorum</p></td>
     <td><p>Node-level failure</p><p>AZs: 1</p><p>Regions: 1</p></td>
     <td><p>No SLA guarantee</p></td>
     <td><p>Low</p></td>
   </tr>
   <tr>
     <td><p><strong>Enterprise</strong></p></td>
     <td><p>Single-region deployment across 3 AZs with automatic failover</p></td>
     <td><p>0 seconds</p></td>
     <td><p>≤1 minute</p></td>
     <td><p>Cross-AZ writes; WAL replicated via Quorum</p></td>
     <td><p>AZ-level failure</p><p>AZs: 3</p><p>Regions: 1</p></td>
     <td><p>99.95%</p></td>
     <td><p>Medium</p></td>
   </tr>
   <tr>
     <td><p><strong>Enterprise Multi-Replica</strong></p></td>
     <td><p>Active-active multi-replica architecture within region; read/write separation with fast failover</p></td>
     <td><p>0 seconds</p></td>
     <td><p>≤10 seconds</p></td>
     <td><p>Cross-AZ writes; inter-replica sync via WAL</p></td>
     <td><p>AZ-level failure</p><p>AZs: 3</p><p>Regions: 1</p></td>
     <td><p>99.99%</p></td>
     <td><p>Medium–High</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-Region HA</strong></p></td>
     <td><p>Multi-region/multi-cloud deployment with global load balancing</p></td>
     <td><p>≤10 seconds</p></td>
     <td><p>Manual or auto failover:</p><p>Auto: ≤3 minutes</p></td>
     <td><p>Synchronous writes across AZs; asynchronous replication to other regions/clouds</p></td>
     <td><p>Region-level failure</p><p>AZs: ≥3</p><p>Regions: ≥2</p></td>
     <td><p>99.99%</p></td>
     <td><p>High</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Cross-region HA will be available in November 2025. Incremental backup will be available in December 2025.</p>

</Admonition>

### Disaster Recovery (DR) Tiers\{#disaster-recovery-dr-tiers}

<table>
   <tr>
     <th><p>Tier</p></th>
     <th><p>Description</p></th>
     <th><p>RPO</p></th>
     <th><p>Restore Speed</p></th>
     <th><p>Backup Strategy</p></th>
     <th><p>Use Case</p></th>
     <th><p>Additional Cost</p></th>
   </tr>
   <tr>
     <td><p><strong>Local Backup</strong></p></td>
     <td><p>Same-region object storage; scheduled full backups</p></td>
     <td><p>Hourly</p></td>
     <td><p>Minutes to hours</p></td>
     <td><p>Full backups</p></td>
     <td><p>Accidental deletion, logical error recovery</p></td>
     <td><p>Low</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-Region Backup</strong></p></td>
     <td><p>Backup data stored in a different region; protects against regional disasters</p></td>
     <td><p>Hourly</p></td>
     <td><p>Minutes to hours</p></td>
     <td><p>Full backups replicated across regions/clouds</p></td>
     <td><p>Regional disaster, compliance requirements</p></td>
     <td><p>Medium</p></td>
   </tr>
   <tr>
     <td><p><strong>Incremental Backup</strong></p></td>
     <td><p>Real-time incremental backups; fine-grained recovery points</p></td>
     <td><p>≤1 minute</p></td>
     <td><p>Minutes to hours</p></td>
     <td><p>Continuous capture of transaction logs</p></td>
     <td><p>Point-in-time recovery for critical workloads</p></td>
     <td><p>Medium–High</p></td>
   </tr>
</table>

## Quick Selection Guide\{#quick-selection-guide}

### Business Tiering & Resilience Recommendations\{#business-tiering-and-resilience-recommendations}

#### **Tier 1 – Mission-Critical Workloads**\{#tier-1-mission-critical-workloads}

- **Characteristics:** 24/7 operation; even minutes of downtime cause significant loss; extremely high business value

- **Recommended:** Cross-region HA + Enterprise Multi-Replica + Continuous Data Protection

- **Targets:** RPO = 0s, RTO < 30s, cross-cloud/region DR

- **Expected Cost:** High

#### **Tier 2 – Important Business Systems**\{#tier-2-important-business-systems}

- **Characteristics:** 24/7 operation; high stability requirements

- **Recommended:** Enterprise Multi-Replica + Cross-region Backup

- **Targets:** RPO = 0s, RTO < 30s

- **Expected Cost:** Medium–High

#### **Tier 3 – General Applications**\{#tier-3-general-applications}

- **Characteristics:** Operates during business hours; cost-sensitive; tolerates some recovery time

- **Recommended:** Enterprise + Local Backup

- **Targets:** RPO = 0s, RTO < 3 minutes

- **Expected Cost:** Low–Medium

#### **Tier 4 – Non-Critical Workloads**\{#tier-4-non-critical-workloads}

- **Characteristics:** Non-essential systems; cost-sensitive; accepts scheduled maintenance windows

- **Recommended:** Standard + Local Backup

- **Targets:** RPO = 0s, RTO < 3 minutes

- **Expected Cost:** Low–Medium

### Cost Optimization Decision Matrix\{#cost-optimization-decision-matrix}

<table>
   <tr>
     <th><p>Business Impact</p></th>
     <th><p>Data Value</p></th>
     <th><p>Compliance Requirement</p></th>
     <th><p>Recommended Solution</p></th>
     <th><p>Cost Level</p></th>
   </tr>
   <tr>
     <td><p>Extremely High</p></td>
     <td><p>Extremely High</p></td>
     <td><p>Strict</p></td>
     <td><p>Cross-region HA + Full DR</p></td>
     <td><p>High</p></td>
   </tr>
   <tr>
     <td><p>High</p></td>
     <td><p>High</p></td>
     <td><p>Moderate</p></td>
     <td><p>Enterprise Multi-Replica + Cross-region Backup</p></td>
     <td><p>Medium–High</p></td>
   </tr>
   <tr>
     <td><p>Medium</p></td>
     <td><p>Medium</p></td>
     <td><p>Basic</p></td>
     <td><p>Enterprise + Local Backup</p></td>
     <td><p>Medium</p></td>
   </tr>
   <tr>
     <td><p>Low</p></td>
     <td><p>Low</p></td>
     <td><p>None</p></td>
     <td><p>Standard + Basic Backup</p></td>
     <td><p>Low</p></td>
   </tr>
</table>

## Frequently Asked Questions (FAQ)\{#frequently-asked-questions-faq}

**Q1: How do Standard and Enterprise plans achieve high availability?**

**Architecture Design**  

Zilliz Cloud uses a compute-storage disaggregated architecture with three data types:  

- **Metadata:** Stored in etcd (3 replicas, RAFT protocol)

- **Log Data:** Stored in proprietary Woodpecker (Quorum protocol)

- **Raw & Index Data:** Stored in object storage, inheriting cloud storage’s native HA

**Compute Node HA**  

- Managed by Kubernetes for automatic scheduling

- Pods automatically respawn upon single-node or single-AZ failure

- Coordinator reassigns segments to other QueryNodes

- Indexes and data are reloaded from storage; recovery time < 1 minute

**Cost Optimization**  

- Uses **multiple persistent replicas** + **dynamic in-memory loading**  

    - Avoids cost explosion from maintaining multiple in-memory replicas

    - Simplifies DR architecture

    - Leverages log and object storage bandwidth for faster recovery

**Q2: How does the multi-replica mechanism work?**

**Core Mechanism**  

- **Shard Level:** Multiple StreamNodes load the same shard with primary/standby roles

- **Segment Level:** Multiple QueryNodes load the same segment; data persists as a single copy

**Read/Write Separation**  

- **Writes:** Handled by the primary StreamNode

- **Reads:** Served by any standby StreamNode or QueryNode

**Key Benefits**  

- **Fast Failover:** Proxy automatically redirects traffic to standby nodes

- **Higher QPS:** Multiple in-memory replicas improve read throughput

- **Smooth Upgrades:** Rolling updates reduce service jitter and improve stability

**Q3: How does Global Database enable cross-region high availability?**

**CDC Synchronization**  

- Change Data Capture (CDC) synchronizes DDL, DML, and bulk import operations

- Typical sync latency < 10 seconds

- Enables cross-region/cross-cloud DR with very low RPO

**Data Write Strategy**  

- Data written synchronously across multiple AZs within the same region

- Write latency is at inter-AZ level

- In extreme failover scenarios, data loss < 10 seconds

<Admonition type="info" icon="📘" title="Notes">

<p><strong>The roadmap for 2026:</strong> Achieve <strong>RPO = 0</strong> with cross-region Woodpecker</p>

</Admonition>

**Failover Modes**  

- **Manual:** Via OpenAPI or Web Console

- **Automatic:** Zilliz health-check service detects failure and completes failover in 1–3 minutes

**Access Patterns**

<table>
   <tr>
     <th><p>Mode</p></th>
     <th><p>Characteristics</p></th>
     <th><p>Use Case</p></th>
   </tr>
   <tr>
     <td><p><strong>Active-Standby DR</strong></p></td>
     <td><p>Primary handles reads/writes; standby is activated only during failover</p></td>
     <td><p>Standard disaster recovery</p></td>
   </tr>
   <tr>
     <td><p><strong>Active-Active (Multi-Read)</strong></p></td>
     <td><p>Primary writes; multiple regions serve reads (nearest-region read)</p></td>
     <td><p>Global read-heavy, low-write workloads</p></td>
   </tr>
   <tr>
     <td><p><strong>Multi-Primary</strong> <em>(Coming in 2026)</em></p></td>
     <td><p>Both regions accept writes; the user must avoid data conflicts</p></td>
     <td><p>Cell-based or sharded deployments</p></td>
   </tr>
</table>

For the latest feature updates or technical support, please contact [Zilliz Cloud support](https://support.zilliz.com/hc/en-us).

