---
title: "Plan Cluster Scaling | BYOC"
slug: /plan-cluster-scaling
sidebar_label: "Plan Cluster Scaling"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Scaling helps you keep a Dedicated serving cluster healthy as your data volume, collection count, traffic, or availability requirements grow. In Zilliz Cloud, you usually scale for two reasons | BYOC"
type: origin
token: GOCJwJktXizGTXkRfCEc9GGLnsb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Plan Cluster Scaling

Scaling helps you keep a Dedicated serving cluster healthy as your data volume, collection count, traffic, or availability requirements grow. In Zilliz Cloud, you usually scale for two reasons:

- **Capacity pressure**: The cluster needs more resources to hold and serve data, collections, partitions, or indexes.

- **Query compute pressure**: The cluster can hold the data, but query concurrency, QPS, or latency requires more parallel serving capabilities.

For Dedicated serving clusters, you can scale Query CUs or replicas manually, or configure auto-scaling or scheduled scaling. 

On-demand clusters scale automatically and do not require manual scaling.

<Admonition type="info" icon="📘" title="Note">

Scaling Query CU manually is supported on all plans.

Scaling replicas manually is supported on the Enterprise plan and above.

Auto-scaling and scheduled scaling are supported on the Enterprise plan and above.

</Admonition>

## Understand what to scale\{#understand-what-to-scale}

Choose the scaling target based on the type of pressure affecting the cluster:

- Scale Query CU when the cluster needs more capacity to hold and serve loaded data, collections, partitions, or indexes.

- Scale replicas when the cluster can already hold the data, but query traffic requires more parallel serving capacity.

In most cases:

- Query CU addresses capacity pressure.

- Replicas address throughput and availability pressure.

<Admonition type="info" icon="📘" title="Note">

For small clusters with limited Query CUs, increasing **Query CU** can also improve QPS. However, in most cases, scale **replicas** to improve search throughput and availability.

</Admonition>

## Identify scaling signals\{#identify-scaling-signals}

Use the following symptoms to determine whether scaling is needed and which resource to adjust.

| Symptom | Possible cause | Recommended action |
| --- | --- | --- |
| Write operations start to fail, but queries still work. | The cluster is approaching its capacity limit. | Increase Query CU. |
| Data volume keeps growing. | Capacity requirements are increasing. | Increase Query CU. |
| The number of collections or partitions approaches the limit of the current specification. | The current cluster size does not provide enough capacity. | Increase Query CU. |
| QPS increases and query latency becomes higher. | Query concurrency pressure is increasing. | Increase replica. |
| Queries are slow during peak hours but normal during off-peak hours. | Resources are insufficient during predictable peaks. | Enable scheduled scaling or auto-scaling. |
| Traffic is unpredictable. | The workload fluctuates significantly. | Enable  auto-scaling. |
| Resources are idle during off-peak hours. | The cluster is over-provisioned. | Enable scheduled scaling or auto-scaling. |

## Use metrics to guide scaling\{#use-metrics-to-guide-scaling}

Zilliz Cloud provides two metrics to help you decide whether to scale Query CU or replicas.

| Metric | Description | Scaling Guidance |
| --- | --- | --- |
| Query CU Capacity | Measures how close the current Query CU is to its capacity limit. It uses the higher of two signals: memory used by loaded data, and stored data size relative to the cluster storage quota. | A sustained high value indicates that the current Query CU size may not have enough capacity. If auto scaling is enabled, Zilliz Cloud may scale up Query CU to provide more capacity. |
| Query CU Computation | Measures how heavily query execution is using CPU resources. It is calculated from QueryNode CPU usage relative to its CPU limit. | A sustained high value means query execution is CPU-bound. Zilliz Cloud may scale out replicas to increase parallel query processing capacity. |

## Choose a scaling method\{#choose-a-scaling-method}

Choose a scaling method based on workload predictability and operational intent.

| Scaling method | Best for | Example |
| --- | --- | --- |
| Manual scaling | One-time changes where the timing and target size are known, such as launches, load tests, migrations, or large data imports. | Before launching a new RAG application, increase Query CU and replica to reserve capacity and query throughput for the first wave of users. |
| Scheduled scaling | Predictable traffic patterns, recurring business-hour peaks, or fixed-time batch search and evaluation jobs. | An internal AI Agent or knowledge-base application receives most traffic during weekday office hours, so the cluster scales up in the morning and scales down in the evening. |
| Auto-scaling | Unpredictable workloads, AI agents, interactive applications, customer support bots, and multimodal search. | An AI Agent may stay idle for hours, then trigger many searches while processing a complex prompt or retrieving long-term memory. Auto-scaling adds resources during the spike and scales down afterward. |

## Understand scaling behavior\{#understand-scaling-behavior}

When a scaling request is submitted or triggered, Zilliz Cloud validates the requested configuration and creates a scaling job.

During the scaling job:

- The cluster status changes to **Modifying**.

- Some management operations, such as suspend, migrate, and drop, are temporarily unavailable.

- The current configuration continues serving until the new configuration is ready.

- Zilliz Cloud uses a [canary upgrade](./canary-upgrade) mechanism for scaling, which validates the new configuration on a limited scope before progressively rolling it out. As a result, existing connections are not dropped during scaling.

- The new configuration takes effect only after the scaling job completes successfully.

- If the scaling job does not complete, the cluster continues to use the previous configuration.

Scaling operations may cause temporary service jitter.

You can track progress on the Jobs page. After the job completes, the cluster status returns to Running.

## Review limits and requirements\{#review-limits-and-requirements}

Review the following limits before configuring scaling.

- Replica scaling requires a minimum Query CU configuration of 4 CUs.

- Query CU × replica has an upper limit. For details, see [Zilliz Cloud Limits](./limits#replicas).

- Scale-down succeeds only when the current data volume and the current number of collections and partitions fit within the target specification.

- Scheduled scaling requires schedule intervals greater than 30 minutes.

## Validate scaling results\{#validate-scaling-results}

After scaling, check the following signals to confirm that the change worked as expected.

| Signal | Validation |
| --- | --- |
| Query CU Capacity | Capacity pressure decreased. |
| Query CU Computation | Query compute pressure decreased. |
| QPS and read latency | Query performance improved. |
| Job status | The scaling job completed successfully. |
| Cluster status | The cluster returned from **Modifying** to **Running**. |
| Billing or usage data | Billing switched to the new configuration after the job completed. |

## Plan global cluster scaling\{#plan-global-cluster-scaling}

Global Cluster scaling follows different rules from regular Dedicated cluster scaling.

- Scale **Query CU** from the primary cluster.

- When you scale Query CU on the primary, Zilliz Cloud automatically applies the same Query CU count to all secondary clusters.

- Secondary clusters cannot scale Query CU independently.

- Scale **Replica** independently for each primary or secondary cluster.

- Use independent replica settings to allocate more serving capacity in high-traffic regions and fewer replicas in low-traffic or standby regions.

For details, see [Scale Global Cluster](/docs/scale-global-cluster).