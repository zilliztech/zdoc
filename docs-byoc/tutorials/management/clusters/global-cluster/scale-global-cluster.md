---
title: "Scale Global Cluster | BYOC"
slug: /scale-global-cluster
sidebar_label: "Scale Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Scaling a global cluster works differently from scaling a regular Dedicated cluster. Some resource settings are controlled centrally from the primary cluster, while others are configured independently per cluster. | BYOC"
type: origin
token: G6xpwyghRitwbqkwl86cpb3Gn2g
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Scale Global Cluster

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is available in all AWS regions and in the following Google Cloud regions: gcp-us-central1 and gcp-us-east4. It is not available on Microsoft Azure.

</FeatureNote>

Scaling a global cluster works differently from scaling a regular Dedicated cluster. Some resource settings are controlled centrally from the primary cluster, while others are configured independently per cluster.

This page explains the scaling behavior for global clusters and how to scale each resource type. 

## Before you start\{#before-you-start}

- Ensure you are a **Project Admin**.

## Scaling behavior overview\{#scaling-behavior-overview}

The following table provides an overview of the supported scaling behavior on a global cluster.

| **Resource** | **Primary Cluster** | **Secondary cluster** |
| --- | --- | --- |
| Query CU | Supported.<br/>All scaling methods (manual, dynamic, scheduled) available. | Auto-follows primary. Cannot be scaled independently. |
| Replica | Supported.<br/>All scaling methods (manual, dynamic, scheduled) available. | Supported.<br/>All scaling methods (manual, dynamic, scheduled) available.<br/>Configured independently per cluster. |

## Scale query CUs\{#scale-query-cus}

Query CU scaling is controlled at the primary cluster level. When you change the number of query CU on the primary, Zilliz Cloud automatically applies the new query CU count to all secondary clusters. You cannot scale a secondary cluster's query CU independently — it always matches the primary.

Scaling the query CU of a primary cluster follows the same procedure as a regular Dedicated cluster. For details, see:

- [Manual Scaling](./manual-scaling#scale-query-cu-manually) (web console)

- [Dynamic Scaling](./auto-scaling#via-web-console)(web console)

- [Scheduled Scaling](./scheduled-scaling#query-cu-scheduled-scaling)(web console)

-  [Modify Global Cluster CU](/reference/restful/modify-global-cluster-cu-v2) (RESTful API)

### Considerations\{#considerations}

- The same [resource limits](./limits#cus) apply as for regular Dedicated clusters (e.g., query CU × Replica ≤ 10,240).

- During query CU scaling, the cluster status changes to Modifying. [Switchover](./switchover-and-failover#perform-a-switchover) is blocked while scaling is in progress.

- [Failover](./switchover-and-failover#perform-a-failover) can still be triggered during query CU scaling as an emergency operation, but the scaling task will fail and be retried after failover completes.

## Scale replicas\{#scale-replicas}

Replica scaling is controlled independently per cluster. Each cluster in the global cluster — primary and secondary — can have a different replica count tailored to its regional workload. This allows you to allocate more resources in high-traffic regions without over-provisioning in others. 

The following is an example of configuration replicas for each cluster.

| **Cluster** | **Region** | **Replica** | **Reason** |
| --- | --- | --- | --- |
| Primary | us-west-2 | 2 | Moderate read + all write traffic |
| Secondary_01 | eu-west-1 | 4 | High European read traffic |
| Secondary_02 | ap-southeast-1 | 1 | Low traffic, disaster recovery standby only |

Scaling the replica of a primary or secondary cluster follows the same procedure as a regular Dedicated cluster. For details, see:

- [Manual Scaling](./manual-scaling#scale-replica-manually) (web console)

- [Dynamic Scaling](./auto-scaling#via-web-console) (web console)

- [Scheduled Scaling](./scheduled-scaling#replica-scheduled-scaling) (web console)

- [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2) (RESTful API)

### Considerations\{#considerations}

- The same [replica limits](./limits#replicas) apply as for regular Dedicated clusters:

    - Minimum 8 CUs required to enable multi-replicas

    - Maximum 10 replicas

    - CU × Replica ≤ 10,240

- During replica scaling, [switchover](./switchover-and-failover#perform-a-switchover) is blocked on the global cluster.

- [Failover](./switchover-and-failover#perform-a-failover) can still be triggered during replica scaling, but the scaling task will fail and be retried after failover completes.

## FAQs\{#faqs}

1. **Can I set different number of query CUs on the primary and secondary clusters?**

    No. CU scaling is always initiated on the primary, and all secondaries follow automatically. This ensures consistent capacity across the global cluster.

1. **Can I set different replica counts on different clusters?**

    Yes. Replica scaling is fully independent per cluster. This is useful when regions have different traffic patterns — for example, more replicas in a high-traffic region and fewer in a standby-only region.

1. **What happens to scaling settings after a switchover?**

    After a switchover, query CU scaling targets the new primary cluster. Replica configurations on each cluster remain unchanged.

