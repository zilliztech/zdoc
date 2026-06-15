---
title: "Monitor Global Cluster | Cloud"
slug: /monitor-global-cluster
sidebar_label: "Monitor Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page explains how to monitor the health, replication status, and performance of your global cluster. | Cloud"
type: origin
token: ZQqowpu4Oi0xIPkyRSTconB6nnb
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Monitor Global Cluster

This page explains how to monitor the health, replication status, and performance of your global cluster.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters in a **Business Critical** project.

</Admonition>

## Global topology\{#global-topology}

The **Global Topology** card on the global cluster page provides a real-time view of your global cluster's structure and health. 

![GbpRw8cuyhmqKLbVHmUcUugenNb](https://zdoc-images.s3.us-west-2.amazonaws.com/GbpRw8cuyhmqKLbVHmUcUugenNb.png)

The global topology card displays:

- The primary cluster and all secondary clusters with their regions, replica count information

- The current status of each cluster

- Synchronization status and lag between the primary and each secondary cluster

Use this view to verify that all secondary clusters are synchronized and healthy before performing operations such as switchovers.

## Cluster status\{#cluster-status}

Each individual cluster in a global cluster reports one of the following statuses:

| **Status** | **Description** | **Action** |
| --- | --- | --- |
| CREATING | The cluster is being provisioned. Also applies to secondary clusters being rebuilt or auto-recreated after a failover. | Wait for provisioning to complete. |
| RUNNING | The cluster is operating normally. | None. |
| ABNORMAL | An issue has been detected with the primary cluster. | Investigate the issue. If the primary is unreachable, consider initiating a [failover](./switchover-and-failover). [Contact support](http://support.zilliz.com/) if needed. |
| SWITCHING | A switchover or failover is in progress. The primary role is being transferred. | Wait for the operation to complete. Do not initiate additional switchovers. |

## Synchronization lag\{#synchronization-lag}

Synchronization lag measures the delay between a write committed on the primary cluster and that write becoming available on a secondary cluster. You can monitor the synchronization lag for each secondary cluster on the **Global Topology** tab.

- Under normal conditions, Synchronization lag is typically a few seconds.

- Lag may temporarily increase during heavy write workloads or large bulk imports.

The following table explains Synchronization lag levels and recommended actions.

| **Synchronization lag** | **Implication** |
| --- | --- |
| < 5 seconds | Normal. Secondary clusters are nearly up to date. |
| 5–30 seconds | Elevated. [Switchover](./switchover-and-failover#perform-a-switchover) is still permitted. Monitor for sustained increases. |
| > 30 seconds | [Switchover](./switchover-and-failover#perform-a-switchover) is blocked. Investigate write load or secondary cluster health. Resolves the root cause before attempting a switchover. |
| > 180 seconds | Critical. [Failover](./switchover-and-failover#perform-a-failover) RPO risk is significant. Immediate investigation required. |

If you perform a [failover](./switchover-and-failover#perform-a-failover) while synchronization lag is high, the new primary cluster may be missing recent writes. The amount of potential data loss (RPO) equals the synchronization lag at the time of failover.

## Cluster metrics and alerts\{#cluster-metrics-and-alerts}

Each cluster in a global cluster — both primary and secondary — exposes the same metrics as a regular Dedicated cluster. You can view these metrics on the cluster details page, create alerts for these metrics, or export them to an external monitoring system. For details, see [Metrics & Alerts](./undefined).

