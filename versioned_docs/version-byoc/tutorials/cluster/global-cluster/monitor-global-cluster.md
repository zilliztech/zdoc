---
title: "Monitor Global Cluster | BYOC"
slug: /monitor-global-cluster
sidebar_key: monitor-global-cluster
sidebar_label: "Monitor Global Cluster"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Monitor Global Cluster | BYOC"
type: origin
token: ZQqowpu4Oi0xIPkyRSTconB6nnb
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - global cluster
  - monitoring
  - metrics

---

import Admonition from '@theme/Admonition';


# Monitor Global Cluster

This page explains how to monitor the health, replication status, and performance of your global cluster.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

This feature is available in all AWS regions and in the following Google Cloud regions: gcp-us-central1 and gcp-us-east4. It is not available on Microsoft Azure.

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

<table>
   <tr>
     <th><p><strong>Status</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Action</strong></p></th>
   </tr>
   <tr>
     <td><p>CREATING</p></td>
     <td><p>The cluster is being provisioned. Also applies to secondary clusters being rebuilt or auto-recreated after a failover.</p></td>
     <td><p>Wait for provisioning to complete.</p></td>
   </tr>
   <tr>
     <td><p>RUNNING</p></td>
     <td><p>The cluster is operating normally.</p></td>
     <td><p>None.</p></td>
   </tr>
   <tr>
     <td><p>ABNORMAL</p></td>
     <td><p>An issue has been detected with the primary cluster.</p></td>
     <td><p>Investigate the issue. If the primary is unreachable, consider initiating a <a href="./switchover-and-failover">failover</a>. <a href="http://support.zilliz.com/">Contact support</a> if needed.</p></td>
   </tr>
   <tr>
     <td><p>SWITCHING</p></td>
     <td><p>A switchover or failover is in progress. The primary role is being transferred.</p></td>
     <td><p>Wait for the operation to complete. Do not initiate additional switchovers.</p></td>
   </tr>
</table>

## Synchronization lag\{#synchronization-lag}

Synchronization lag measures the delay between a write committed on the primary cluster and that write becoming available on a secondary cluster. You can monitor the synchronization lag for each secondary cluster on the **Global Topology** tab.

- Under normal conditions, Synchronization lag is typically a few seconds.

- Lag may temporarily increase during heavy write workloads or large bulk imports.

The following table explains Synchronization lag levels and recommended actions.

<table>
   <tr>
     <th><p><strong>Synchronization lag</strong></p></th>
     <th><p><strong>Implication</strong></p></th>
   </tr>
   <tr>
     <td><p>&lt; 5 seconds</p></td>
     <td><p>Normal. Secondary clusters are nearly up to date.</p></td>
   </tr>
   <tr>
     <td><p>5–30 seconds</p></td>
     <td><p>Elevated. <a href="./switchover-and-failover#perform-a-switchover">Switchover</a> is still permitted. Monitor for sustained increases.</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>30 seconds</p></blockquote></td>
     <td><p><a href="./switchover-and-failover#perform-a-switchover">Switchover</a> is blocked. Investigate write load or secondary cluster health. Resolves the root cause before attempting a switchover.</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>180 seconds</p></blockquote></td>
     <td><p>Critical. <a href="./switchover-and-failover#perform-a-failover">Failover</a> RPO risk is significant. Immediate investigation required.</p></td>
   </tr>
</table>

If you perform a [failover](./switchover-and-failover#perform-a-failover) while synchronization lag is high, the new primary cluster may be missing recent writes. The amount of potential data loss (RPO) equals the synchronization lag at the time of failover.

## Cluster metrics and alerts\{#cluster-metrics-and-alerts}

Each cluster in a global cluster — both primary and secondary — exposes the same metrics as a regular Dedicated cluster. You can view these metrics on the cluster details page, create alerts for these metrics, or export them to an external monitoring system. For details, see [Metrics Reference](./metrics-alerts-reference).
