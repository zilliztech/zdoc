---
title: "Data Resilience | Cloud"
slug: /data-resilience
sidebar_label: "Data Resilience"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud, as a fully managed vector database service, delivers enterprise-grade High Availability (HA) and Disaster Recovery (DR) capabilities to ensure the continuous availability of your mission-critical data and services under various failure scenarios. | Cloud"
type: origin
token: YBDGwmFYkiRmRIkKGsscRjDmnIb
sidebar_position: 1
displayed_sidebar: default

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

| Tier | Description | RPO | RTO | Write Latency / Replication Scheme | Fault Tolerance | SLA | Relative Cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Standard** | Single-region, single-AZ deployment with multi-replica mechanism | 0 seconds | ≤1 minute | Write within single AZ; WAL replicated via Quorum | Node-level failure<br/>AZs: 1<br/>Regions: 1 | No SLA guarantee | Low |
| **Enterprise** | Single-region deployment across 3 AZs with automatic failover | 0 seconds | ≤1 minute | Cross-AZ writes; WAL replicated via Quorum | AZ-level failure<br/>AZs: 3<br/>Regions: 1 | 99.95% | Medium |
| **Enterprise Multi-Replica** | Active-active multi-replica architecture within region; read/write separation with fast failover | 0 seconds | ≤10 seconds | Cross-AZ writes; inter-replica sync via WAL | AZ-level failure<br/>AZs: 3<br/>Regions: 1 | 99.99% | Medium–High |
| **Cross-Region HA** | Multi-region/multi-cloud deployment with global load balancing | ≤10 seconds | Manual or auto failover:<br/>Auto: ≤3 minutes | Synchronous writes across AZs; asynchronous replication to other regions/clouds | Region-level failure<br/>AZs: ≥3<br/>Regions: ≥2 | 99.99% | High |

<Admonition type="info" icon="📘" title="Notes">

Cross-region HA will be available in November 2025. 

</Admonition>

### Disaster Recovery (DR) Tiers\{#disaster-recovery-dr-tiers}

| Tier | Description | RPO | Restore Speed | Backup Strategy | Use Case | Additional Cost |
| --- | --- | --- | --- | --- | --- | --- |
| **Local Backup** | Same-region object storage; scheduled full backups | Hourly | Minutes to hours | Full backups | Accidental deletion, logical error recovery | Low |
| **Cross-Region Backup** | Backup data stored in a different region; protects against regional disasters | Hourly | Minutes to hours | Full backups replicated across regions/clouds | Regional disaster, compliance requirements | Medium |

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

| Business Impact | Data Value | Compliance Requirement | Recommended Solution | Cost Level |
| --- | --- | --- | --- | --- |
| Extremely High | Extremely High | Strict | Cross-region HA + Full DR | High |
| High | High | Moderate | Enterprise Multi-Replica + Cross-region Backup | Medium–High |
| Medium | Medium | Basic | Enterprise + Local Backup | Medium |
| Low | Low | None | Standard + Basic Backup | Low |

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

<Admonition type="info" icon="📘" title="Notes:">

**The roadmap for 2026:** Achieve **RPO = 0** with cross-region Woodpecker

</Admonition>

**Failover Modes**  

- **Manual:** Via OpenAPI or Web Console

- **Automatic:** Zilliz health-check service detects failure and completes failover in 1–3 minutes

**Access Patterns**

| Mode | Characteristics | Use Case |
| --- | --- | --- |
| **Active-Standby DR** | Primary handles reads/writes; standby is activated only during failover | Standard disaster recovery |
| **Active-Active (Multi-Read)** | Primary writes; multiple regions serve reads (nearest-region read) | Global read-heavy, low-write workloads |
| **Multi-Primary** *(Coming in 2026)* | Both regions accept writes; the user must avoid data conflicts | Cell-based or sharded deployments |

For the latest feature updates or technical support, please contact [Zilliz Cloud support](https://support.zilliz.com/hc/en-us).

