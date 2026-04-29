---
title: "Compute: Realtime Serving & On-demand Compute | Cloud"
slug: /compute-real-time-serving-and-on-demand-compute
sidebar_key: compute-real-time-serving-and-on-demand-compute
sidebar_label: "Compute: Realtime Serving & On-demand Compute"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "AI applications need two kinds of compute compute that stays online for live traffic, and compute that runs only when teams evaluate, tune, or improve the system. Together, these workloads form a loop of Continuous Serving and Continuous Discovery. | Cloud"
type: origin
token: QiFhwuHoZiN891ks5IDcGABsnAd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - compute
  - real-time serving
  - on-demand compute

---

import Admonition from '@theme/Admonition';


# Compute: Realtime Serving & On-demand Compute

AI applications need two kinds of compute: compute that stays online for live traffic, and compute that runs only when teams evaluate, tune, or improve the system. Together, these workloads form a loop of **Continuous Serving** and **Continuous Discovery**.

In Continuous Serving, production systems answer live queries, generate recommendations, and power online RAG experiences. The signals produced by those systems, such as query patterns, relevance feedback, result quality metrics, and application events, can then be analyzed and validated before improvements are fed back into serving.

Zilliz Cloud supports this loop with two compute modes: **Realtime Serving** for always-on production workloads and **On-demand Compute** for elastic discovery workloads.

<Admonition type="info" icon="📘" title="Notes">

<p>Realtime Serving is the existing Zilliz Cloud serving capability for production workloads. On-demand Compute is a new compute capability introduced for elastic discovery workloads.</p>

</Admonition>

## Why Zilliz Cloud has two compute modes\{#why-zilliz-cloud-has-two-compute-modes}

Continuous Serving and Continuous Discovery place different demands on compute.

- **Serving** workloads need stable, low-latency compute that stays warm around the clock. Always-on compute is the right tradeoff for predictable production traffic.

- **Discovery** workloads, such as offline evaluation, recall testing, A/B experiments, index tuning, data quality checks, and notebook exploration, run in bursts and may stay idle between runs. Scale-to-zero compute helps avoid paying for idle resources between these bursts.

![NyYbbdU5doijRkxNCLkcLQD5n23](https://zdoc-images.s3.us-west-2.amazonaws.com/nyybbdu5doijrkxnclkclqd5n23.png "NyYbbdU5doijRkxNCLkcLQD5n23")

The diagram shows a typical week of AI workloads. The top lane shows Real-time Serving running continuously from Monday to Sunday to handle live queries, so it uses always-on compute and has a continuous cost baseline. The bottom lane shows On-demand Compute appearing only during discovery tasks, such as evaluation, A/B tests, reindexing, or notebook analysis, with idle periods between bursts.

## Choose a compute mode\{#choose-a-compute-mode}

Choose the compute mode based on where the workload fits in the Continuous Serving and Continuous Discovery loop.

<table>
   <tr>
     <th><p>Workload shape</p></th>
     <th><p>Realtime Serving</p></th>
     <th><p>On-demand Compute</p></th>
   </tr>
   <tr>
     <td><p>Role in the CS/CD loop</p></td>
     <td><p>Continuous Serving</p></td>
     <td><p>Continuous Discovery</p></td>
   </tr>
   <tr>
     <td><p>Best for</p></td>
     <td><p>Production search, real-time recommendation, online RAG</p></td>
     <td><p>Evaluation, experiments, batch search, notebooks, and one-off analysis</p></td>
   </tr>
   <tr>
     <td><p>Runtime behavior</p></td>
     <td><p>Always on until suspended or deleted</p></td>
     <td><p>Starts on demand and scales to zero after idle time</p></td>
   </tr>
   <tr>
     <td><p>Access pattern</p></td>
     <td><p>24/7 steady traffic</p></td>
     <td><p>Bursty, periodic, or ad-hoc workloads</p></td>
   </tr>
   <tr>
     <td><p>Latency expectation</p></td>
     <td><p>Low-latency production search, with a target of <code>p99 &lt;= 50 ms</code></p></td>
     <td><p>Cold start is acceptable</p></td>
   </tr>
   <tr>
     <td><p>Write operations</p></td>
     <td><p>Supports Insert, Upsert, and Delete</p></td>
     <td><p>Import only</p></td>
   </tr>
   <tr>
     <td><p>Cost model</p></td>
     <td><p>Billed while the cluster is running</p></td>
     <td><p>Billed while compute is active or waiting for idle timeout</p></td>
   </tr>
</table>

Common patterns:

- **Serving only**: Use Real-time Serving when your application has steady production traffic and needs predictable low latency.

- **On-demand only**: Use On-demand Compute when workloads are periodic or ad-hoc, such as offline evaluation, quality checks, and notebook analysis.

- **Both**: Use Real-time Serving for live traffic and On-demand Compute to analyze production signals, evaluate changes, and validate improvements before feeding them back into serving.

## Realtime Serving\{#realtime-serving}

Realtime Serving is always-on compute for Continuous Serving. In Zilliz Cloud, Real-time Serving is provided by a Serving Cluster: a long-running compute resource for production applications that need stable availability, low latency, and full write support.

Use Real-time Serving when your workload has one or more of the following requirements:

- The application serves live production traffic.

- Query latency must stay consistently low.

- Traffic is steady or expected around the clock.

- The application needs Insert, Upsert, or Delete operations.

- The workload benefits from compute that stays warm.

After a Serving Cluster is created, it keeps running until you explicitly change its lifecycle state. You can suspend it to stop compute billing, resume it when the workload should become available again, scale it while running, or delete it when it is no longer needed.

![WMDubXaLqoWIuvxsolzcyMTOnog](https://zdoc-images.s3.us-west-2.amazonaws.com/wmdubxalqowiuvxsolzcymtonog.png "WMDubXaLqoWIuvxsolzcyMTOnog")

For details on how a Serving Cluster handles data, see [Data: External & Managed Collections](./data-external-and-managed-collections).

For details on how to create a Serving Cluster, see Create Cluster.

## On-demand Compute | PUBLIC\{#on-demand-compute}

On-demand Compute is elastic compute for Continuous Discovery. It supports two access shapes: **On-demand Cluster** for shared discovery workloads and **On-demand Ephemeral** for isolated discovery sessions.

Use On-demand Compute when your workload has one or more of the following requirements:

- Queries run in bursts instead of continuously.

- The workload can tolerate cold-start latency.

- Idle cost should be minimized.

- The workload is exploratory, experimental, or scheduled.

- The workload analyzes production signals or validates improvements before they are applied to serving.

<Admonition type="info" icon="📘" title="Notes">

<p>For ingestion, On-demand Compute supports Import only. Insert, Upsert, and Delete are not available.</p>

</Admonition>

### On-demand Cluster\{#on-demand-cluster}

An On-demand Cluster is user-visible On-demand Compute for shared discovery workloads. It is useful when a team, application, or scheduled job repeatedly runs analysis or evaluation and can benefit from shared compute resources and shared cache.

An On-demand Cluster goes through the following lifecycle phases:

![QYqxb0zolooNXVx7F0ycrcrznxS](https://zdoc-images.s3.us-west-2.amazonaws.com/qyqxb0zoloonxvx7f0ycrcrznxs.png "QYqxb0zolooNXVx7F0ycrcrznxS")

<table>
   <tr>
     <th><p>Phase</p></th>
     <th><p>What happens</p></th>
     <th><p>Billed?</p></th>
   </tr>
   <tr>
     <td><ol><li>Provisioning</li></ol></td>
     <td><p>Platform prepares and warms compute</p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><ol start="2"><li>Compute</li></ol></td>
     <td><p>Actively serving your search requests</p></td>
     <td><p><strong>Yes</strong></p></td>
   </tr>
   <tr>
     <td><ol start="3"><li>Idle wait</li></ol></td>
     <td><p>No queries; waiting for idle timeout to expire</p></td>
     <td><p><strong>Yes</strong></p></td>
   </tr>
   <tr>
     <td><ol start="4"><li>Release</li></ol></td>
     <td><p>Compute scales to zero</p></td>
     <td><p>No</p></td>
   </tr>
</table>

The first query after compute has scaled to zero can experience cold-start latency. Use an On-demand Cluster when this startup delay is acceptable for the workload.

An On-demand Cluster is created and managed as a cluster, but its compute does not need to stay running continuously. It can scale to zero when idle and start again when new work arrives.

### On-demand Ephemeral\{#on-demand-ephemeral}

On-demand Ephemeral is isolated On-demand Compute for independent discovery sessions. It is useful when each script, notebook, or tool should get its own short-lived compute allocation without sharing session state with other users or jobs.

On-demand Ephemeral depends on an On-demand Cluster, but it is not itself a standalone cluster. For each session, Zilliz Cloud allocates isolated compute backed by the specified On-demand Cluster and releases the isolated compute after the session ends or becomes idle.

![KCahbqAjmo8K5NxOBFycKMV2nLc](https://zdoc-images.s3.us-west-2.amazonaws.com/kcahbqajmo8k5nxobfyckmv2nlc.png "KCahbqAjmo8K5NxOBFycKMV2nLc")

## Quick reference\{#quick-reference}

<table>
   <tr>
     <th><p>Dimension</p></th>
     <th><p>Serving Cluster</p></th>
     <th><p>On-demand Cluster</p></th>
     <th><p>On-demand Ephemeral</p></th>
   </tr>
   <tr>
     <td><p>Role in the CS/CD loop</p></td>
     <td><p>Continuous Serving</p></td>
     <td><p>Shared Continuous Discovery</p></td>
     <td><p>Isolated Continuous Discovery</p></td>
   </tr>
   <tr>
     <td><p>Best for</p></td>
     <td><p>Production search, recommendation, online RAG</p></td>
     <td><p>Shared exploration, scheduled batch search, repeated evaluation</p></td>
     <td><p>Notebooks, scripts, one-off analysis</p></td>
   </tr>
   <tr>
     <td><p>Runtime behavior</p></td>
     <td><p>Always on until suspended or deleted</p></td>
     <td><p>Starts on demand and scales to zero after idle time</p></td>
     <td><p>Allocated per session and released after the session ends or goes idle</p></td>
   </tr>
   <tr>
     <td><p>Lifecycle owner</p></td>
     <td><p>User manages the Serving Cluster lifecycle</p></td>
     <td><p>User manages the On-demand Cluster; compute auto-scales with workload</p></td>
     <td><p>Zilliz Cloud manages the session-scoped compute allocation</p></td>
   </tr>
   <tr>
     <td><p>Resource model</p></td>
     <td><p>Realtime production compute</p></td>
     <td><p>Shared On-demand Compute</p></td>
     <td><p>Isolated compute per session</p></td>
   </tr>
   <tr>
     <td><p>Cache behavior</p></td>
     <td><p>Warm compute for production traffic</p></td>
     <td><p>Shared cache across sessions or jobs</p></td>
     <td><p>Isolated compute per session</p></td>
   </tr>
   <tr>
     <td><p>Latency expectation</p></td>
     <td><p>Low-latency production search, with a target of p99 &lt;= 50 ms</p></td>
     <td><p>Cold start acceptable; repeated queries can benefit from shared cache</p></td>
     <td><p>Cold start acceptable; isolation matters more than shared warm cache</p></td>
   </tr>
   <tr>
     <td><p>Write operations</p></td>
     <td><p>Insert, Upsert, Delete</p></td>
     <td><p>Import only</p></td>
     <td><p>Import only</p></td>
   </tr>
   <tr>
     <td><p>Billing</p></td>
     <td><p>Billed while the cluster is running</p></td>
     <td><p>Billed during Compute and Idle wait phases</p></td>
     <td><p>Billed during session Compute and Idle wait phases</p></td>
   </tr>
</table>

