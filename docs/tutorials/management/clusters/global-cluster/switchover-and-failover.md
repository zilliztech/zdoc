---
title: "Switchover and Failover | Cloud"
slug: /switchover-and-failover
sidebar_label: "Switchover and Failover"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A Zilliz Cloud global cluster supports two operations that change which region hosts the primary cluster | Cloud"
type: origin
token: D7F1wYcfVinn92kK0l5cTZDLnLf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Switchover and Failover

A Zilliz Cloud global cluster supports two operations that change which region hosts the primary cluster:

- **Switchover**: A planned, zero-data-loss operation that promotes a synchronized secondary cluster to primary.

- **Failover**: An emergency recovery operation that promotes a secondary cluster to primary after an outage in the primary region.

This page explains when to use each operation, how to perform them, and what to expect during and after.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters in a <strong>Business Critical</strong> project.</p>

</Admonition>

## Overview\{#overview}

### Switchover vs. failover\{#switchover-vs-failover}

The following table compares the two operations.

<table>
   <tr>
     <th></th>
     <th><p><strong>Switchover</strong></p></th>
     <th><p><strong>Failover</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>When to use</strong></p></td>
     <td><p>Planned operations: regional rotation, compliance requirements, data residency changes.</p></td>
     <td><p>Unplanned outage or failure in the primary region.</p></td>
   </tr>
   <tr>
     <td><p><strong>Trigger</strong></p></td>
     <td><p>Manually initiated when all primary and secondary clusters are running.</p></td>
     <td><p>Manually initiated as a recovery action when the primary cluster becomes abnormal</p></td>
   </tr>
   <tr>
     <td><p><strong>Data loss (RPO)</strong></p></td>
     <td><p>0 — no data loss. Promotion occurs only after full  data synchronization.</p></td>
     <td><p>Equals the synchronization lag at the time of failover.</p></td>
   </tr>
   <tr>
     <td><p><strong>Downtime (RTO)</strong></p></td>
     <td><p>Near zero. The global endpoint re-routes automatically.</p></td>
     <td><p>Typically about a few minutes.</p></td>
   </tr>
   <tr>
     <td><p><strong>Prerequisites</strong></p></td>
     <td><ul><li><p>All clusters must be in RUNNING status.</p></li><li><p>Synchronization lag must be ≤ 30 seconds. Switchover is rejected if the lag exceeds this threshold.</p></li></ul></td>
     <td><ul><li><p>Can be triggered at any time (high-risk operation).</p></li><li><p>At least one secondary cluster must be reachable.</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Handling of the old primary cluster</strong></p></td>
     <td><p>Demoted to a secondary cluster.</p></td>
     <td><p>Discarded and moved to the <a href="./use-recycle-bin">recycle bin</a>. A new secondary is automatically created.</p></td>
   </tr>
   <tr>
     <td><p><strong>Application changes</strong></p></td>
     <td><p>None if using the global endpoint. Routing updates automatically. For details, see <a href="./connect-to-global-cluster">Connect to Global Cluster</a></p></td>
     <td><p>None if using the global endpoint. Routing updates automatically. For details, see <a href="./connect-to-global-cluster">Connect to Global Cluster</a></p></td>
   </tr>
</table>

### Cluster status transitions\{#cluster-status-transitions}

The following diagram shows how cluster statuses change during switchover, failover, and auto-recovery operations.

![JO4VwcCq5hlf7Qb6khwcmdDKnJf](https://zdoc-images.s3.us-west-2.amazonaws.com/JO4VwcCq5hlf7Qb6khwcmdDKnJf.png)

- **Switchover:**

    - A switchover transitions the clusters from **RUNNING** to **SWITCHING** while the target secondary synchronizes with the current primary. Once synchronization completes, the target secondary is promoted to the new primary, and the original primary is demoted to a secondary. Both clusters return to **RUNNING** with their new roles.

    - If synchronization does not complete within the timeout period, the switchover is rolled back. Both clusters return to **RUNNING** with their original roles preserved.

- **Failover**:

    - When the primary cluster enters **ABNORMAL** status due to a failure or outage, you can trigger a failover. The target secondary is promoted to the new primary, and the old primary is discarded and moved to the recycle bin.

    - After the failover completes, Zilliz Cloud automatically creates a new secondary cluster to restore the full topology. The new secondary and all the remaining secondary clusters start in **CREATING** status and transitions to **RUNNING** once provisioning and data sync are complete. If creation fails, the cluster enters **REBUILD_FAILED** status. You can retry the rebuild or [contact us](http://support.zilliz.com) for assistance.

    - If the failover itself fails, the cluster remains in **ABNORMAL** status. You can retry the failover or [contact us](http://support.zilliz.com) for assistance.

- **Auto-recovery**:

    If the primary cluster issue resolves on its own, the cluster transitions from **ABNORMAL** back to **RUNNING** without manual intervention. In this case, no failover is needed.

## Perform a switchover\{#perform-a-switchover}

For planned regional rotation, you can perform a switchover to promote a secondary cluster to the primary role.

### Before you start\{#before-you-start}

- All clusters in the global cluster must be in **RUNNING** status.

- Synchronization lag must be ≤ 30 seconds. Switchover is rejected if the lag exceeds this threshold. Check the lag on the [Global Topology](./monitor-global-cluster#global-topology) tab.

- No Query CU or Replica [scaling](./scale-global-cluster) operation is in progress.

### Procedures\{#procedures}

The following demo shows how to perform a switchover.

<Supademo id="cmnpic07n84n2aburnc12drnr" title=""  />

<Procedures>

1. Navigate to the **Global Cluster** page.

1. Click **Switchover or Failover**.

1. Select the target secondary cluster to promote.

1. Choose Switchover.

1. Confirm the operation in the dialog.

</Procedures>

Once you initiate the switchover, Zilliz Cloud waits for the target secondary to fully synchronize with the current primary, then promotes it to the new primary. 

### After the switchover\{#after-the-switchover}

- The original primary becomes a secondary cluster and begins receiving replicated data from the new primary.

- The global endpoint routing updates automatically to direct writes to the new primary.

- You can verify the new **Global Topology** view. All clusters should return to RUNNING status.

- Reconfigure your backup policy on the new primary cluster. Backup policies do not automatically transfer to the new primary.

## Perform a failover\{#perform-a-failover}

Use a failover when the primary region experiences an outage and the primary cluster is in ABNORMAL status.

Failover is an emergency operation. Unlike a switchover, it does not wait for full data synchronization. Any writes that were committed on the primary but not yet replicated to the target secondary will be lost. The amount of data loss equals the synchronization lag at the time of failover.

### Before you start\{#before-you-start}

- Confirm that the primary cluster is unreachable and in ABNORMAL status.

- Identify which secondary cluster to promote. If multiple secondaries are available, choose the one with the lowest synchronization lag (closest to the primary's latest state).

### Procedures\{#procedures}

The following demo shows how to perform a failover.

<Supademo id="cmnpile4s01nlzz0j6ryixd11" title=""  />

<Procedures>

1. Navigate to the **Global Cluster** page.

1. Click **Switchover or Failover**.

1. Select the target secondary cluster to promote.

1. Choose Failover.

1. Confirm the operation in the dialog.

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<p>If the failover fails, the cluster remains in ABNORMAL status. You can retry the failover operation or <a href="http://support.zilliz.com">create a support ticket</a>.</p>

</Admonition>

### After the failover\{#after-the-failover}

- The original primary is discarded and moved to the recycle bin. It no longer appears in the **Global Topology** view.

- A new secondary cluster is automatically created to restore the full global topology. While the new secondary is being provisioned, it is invisible from the global topology. Instead, a banner appears on the global cluster page: *"A new secondary cluster will be created and become available shortly."*

- The remaining secondary clusters also transition to the CREATING status for rebuild and becomes RUNNING once the rebuild completes.

- The global endpoint updates to direct writes to the new primary.

- Reconfigure your backup policy on the new primary cluster. Backup policies do not automatically transfer to the new primary.

## Routing behavior\{#routing-behavior}

The following table summarizes how the global endpoint and public endpoints behave during and after each operation.

<table>
   <tr>
     <th><p><strong>Endpoint type</strong></p></th>
     <th><p><strong>During switchover</strong></p></th>
     <th><p><strong>During failover</strong></p></th>
     <th><p><strong>After completion</strong></p></th>
   </tr>
   <tr>
     <td><p>Global endpoint</p></td>
     <td><ul><li><p>Writes briefly paused, then routed to the new primary.</p></li><li><p>Reads continue.</p></li></ul></td>
     <td><ul><li><p>Writes unavailable until the new primary is promoted.</p></li><li><p>Reads available on secondaries.</p></li></ul></td>
     <td><ul><li><p>Writes and reads route to the new primary and secondaries automatically.</p></li><li><p>No code changes required.</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Public endpoint</p></td>
     <td><ul><li><p>Each cluster's public endpoint remains unchanged.</p></li><li><p>The old primary becomes a secondary.</p></li></ul></td>
     <td><ul><li><p>The old primary is discarded.</p></li><li><p>The new primary's public endpoint accepts writes.</p></li></ul></td>
     <td><ul><li>Update your application to use the new primary's public endpoint for writes.</li></ul></td>
   </tr>
</table>

## Impact on in-progress tasks\{#impact-on-in-progress-tasks}

The following table summarizes how in-progress tasks are handled during switchover and failover.

<table>
   <tr>
     <th><p><strong>Task</strong></p></th>
     <th><p><strong>During switchover</strong></p></th>
     <th><p><strong>During failover</strong></p></th>
   </tr>
   <tr>
     <td><p>Backup</p></td>
     <td><p>Task fails. Automatically retried on the new primary after the switchover completes.</p></td>
     <td><p>Task fails. Automatically retried on the new primary after the failover completes.</p></td>
   </tr>
   <tr>
     <td><p>Query CU scaling</p></td>
     <td><p>Switchover is blocked while scaling is in progress.</p></td>
     <td><p>Task fails. Retried after failover completes.</p></td>
   </tr>
   <tr>
     <td><p>Replica scaling</p></td>
     <td><p>Switchover is blocked while scaling is in progress.</p></td>
     <td><p>Task fails. Retried after failover completes.</p></td>
   </tr>
</table>
