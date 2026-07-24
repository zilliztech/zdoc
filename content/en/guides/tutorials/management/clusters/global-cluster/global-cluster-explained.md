---
title: "Global Cluster Explained | Cloud"
slug: /global-cluster-explained
sidebar_label: "Global Cluster Explained"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud global cluster lets you deploy a primary cluster and multiple read-only secondary clusters across multiple regions on the same cloud provider. | Cloud"
type: origin
token: AICcwQ55yiNqEPkjdV6cb2i8nqe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Global Cluster Explained

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is available in all AWS regions and in the following Google Cloud regions: gcp-us-central1 and gcp-us-east4. It is not available on Microsoft Azure.

</FeatureNote>

Zilliz Cloud **global cluster** lets you deploy a primary cluster and multiple read-only secondary clusters across multiple regions on the same cloud provider. 

This feature is designed for globally distributed, mission-critical applications and helps you achieve resilience against regional outage and low-latency local reads for users around the world.

## Overview\{#overview}

A Zilliz Cloud **global cluster** consists of one **primary cluster** and up to **five read-only** **secondary clusters** deployed in different regions on the same cloud provider.

- Primary cluster: The authoritative heart of your system. It handles all write operations. And its capability to handle read requests is the same as all secondary clusters.

- Secondary clusters: These are geographically distributed followers. They serve two critical purposes: acting as a standby for disaster recovery and serving local read-only traffic to users in that region.

All writes are directed to the primary cluster. Zilliz Cloud then automatically replicates data changes from the primary cluster to all secondary clusters. 

The following diagram shows how a global cluster works in Zilliz Cloud.

![UZjtwUeaxh2lDsb9eeOclNZ6nae](https://zdoc-images.s3.us-west-2.amazonaws.com/UZjtwUeaxh2lDsb9eeOclNZ6nae.png)

This multi-region setup provides the following benefits:

- **Resilience against regional outages**: If the primary cluster fails or experiences an outage, you can promote a secondary cluster as a primary cluster.

- **Low-latency reads**: Because a full copy of your data is available in multiple geographic locations, applications can read from the nearest region to minimize latency.

## Typical use cases\{#typical-use-cases}

The global cluster feature has 2 typical use cases:

- **Disaster recovery & high availability:** Deploy clusters in multiple regions for failover. In this case, connect through the **global** **endpoint** — a single, unified URL that never changes. Zilliz Cloud automatically routes write requests to the primary cluster and read requests to the nearest secondary based on latency. During switchover or failover, the endpoint re-routes automatically with no code changes required.

- **Data replication between environments:** Run multiple clusters (for example, production and testing) in the same or different regions and replicate data between them. In this case, connect to each cluster directly using its **public** **endpoint**.

For details, see [Connect to Global Cluster](./connect-to-global-cluster).

## Switchover and failover\{#switchover-and-failover}

Zilliz Cloud global clusters support switchover and failover. Both operations change which region hosts the primary cluster, and the global endpoint re-routes automatically.

For details, see [Switchover and Failover](./switchover-and-failover).

## Billing\{#billing}

In a global cluster, both the primary and secondary clusters are billed as regular Zilliz Cloud [Dedicated clusters](./dedicated-cluster-cost) for their compute and storage usage, plus additional [data transfer](./data-transfer-cost) charges for data replication between clusters. 

Suppose your global cluster configuration is as follows:

- A primary cluster cluster_01 in Region A

- Two secondary clusters:

    - cluster_02 in Region B

    - cluster_03 in Region C

You’ll be charged for the sum of the following:

- **Vector database (compute) costs** for cluster_01, cluster_02, and cluster_03

- **Storage costs** for `cluster_01`, `cluster_02`, and `cluster_03`.

- **Data transfer costs** from `cluster_01` to `cluster_02` and `cluster_03`

For detailed list prices, see [Zilliz Cloud List Price](https://zilliz.com/pricing/pricing-guide).

<Admonition type="info" icon="📘" title="Notes">

Discarded clusters in the recycle bin after a [failover](./switchover-and-failover) are billed for **storage** only.

</Admonition>

## Considerations\{#considerations}

- **Project plan availability**: You need to have a multi-regional project on the Business Critical plan to access the global cluster feature. In addition, secondary cluster regions in a Global Cluster are limited to the regions supported by your [project](./manage-projects).

- **Access Control**: You need to be a Project Admin to configure a global cluster

- **Cluster configuration**:

    - You can only add up to 5 secondary clusters.

    - Secondary clusters must use the same cloud provider and cluster type as the primary.

    - Query CU count is controlled by the primary; secondaries follow automatically.

    - Replica count is controlled independently per cluster. Dynamic Scaling and Schedule Scaling are also independent per cluster.

- **Cluster operations:**

    Not all cluster operations are available on both primary and secondary clusters. The following table summarizes what is supported on each.

    | **Operation** | **Primary** | **Secondary** | **Notes** |
    | --- | --- | --- | --- |
    | Read (search, query) | Yes | Yes | -- |
    | Write (insert, upsert, delete) | Yes | No | Only the primary cluster accepts write operations. Writing to a secondary cluster will fail. |
    | Query CU scaling | Yes | No | Query CU changes are applied to the primary; secondaries follow automatically. |
    | Replica scaling | Yes | Yes | Each cluster controls its own replica count. Dynamic scaling and schedule scaling configurations are also independent. |
    | Import | No | No | Will be supported soon. |
    | Migration | Yes | No | Migration is only supported on the primary cluster. All data migrated to the primary cluster will be replicated to secondary clusters. |
    | Backup | Yes | No | You can only create backups for a primary cluster.<br/>Automatic backup policies also run on the primary only. |
    | Restore | No | No | Will be supported soon. |
    | Suspend / Resume | No | No | All primary and secondary clusters cannot be suspended. |
    | Switchover | Yes | — | Can only be triggered when all of the primary and secondary clusters are RUNNING. |
    | Failover | Yes | — | Can be triggered anytime. This is a high-risk emergency operation. |

- **Unsupported features**

    - Setting up a private global endpoint is not supported. The global endpoint requires public internet access.

    - Customer-managed encryption key ([CMEK](./cmek)) is not supported for a global cluster. If a cluster has CMEK enabled, it cannot be converted to a global cluster.

