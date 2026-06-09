---
title: "Scale Global Cluster | Cloud"
slug: /scale-global-cluster
sidebar_label: "Scale Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Scaling a global cluster works differently from scaling a regular Dedicated cluster. Some resource settings are controlled centrally from the primary cluster, while others are configured independently per cluster. | Cloud"
type: origin
token: G6xpwyghRitwbqkwl86cpb3Gn2g
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - global cluster
  - scaling
  - query CU
  - replica
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Scale Global Cluster

Scaling a global cluster works differently from scaling a regular Dedicated cluster. Some resource settings are controlled centrally from the primary cluster, while others are configured independently per cluster.

This page explains the scaling behavior for global clusters and how to scale each resource type. 

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters in a <strong>Business Critical</strong> project.</p>

</Admonition>

## Before you start\{#before-you-start}

- Ensure you are a **Project Admin**.

## Scaling behavior overview\{#scaling-behavior-overview}

The following table provides an overview of the supported scaling behavior on a global cluster.

<table>
   <tr>
     <th><p><strong>Resource</strong></p></th>
     <th><p><strong>Primary Cluster</strong></p></th>
     <th><p><strong>Secondary cluster</strong></p></th>
   </tr>
   <tr>
     <td><p>Query CU</p></td>
     <td><p>Supported. </p><p>All scaling methods (manual, dynamic, scheduled) available.</p></td>
     <td><p>Auto-follows primary. Cannot be scaled independently.</p></td>
   </tr>
   <tr>
     <td><p>Replica</p></td>
     <td><p>Supported. </p><p>All scaling methods (manual, dynamic, scheduled) available.</p></td>
     <td><p>Supported. </p><p>All scaling methods (manual, dynamic, scheduled) available.</p><p>Configured independently per cluster.</p></td>
   </tr>
</table>

## Scale query CUs\{#scale-query-cus}

Query CU scaling is controlled at the primary cluster level. When you change the number of query CU on the primary, Zilliz Cloud automatically applies the new query CU count to all secondary clusters. You cannot scale a secondary cluster's query CU independently — it always matches the primary.

Scaling the query CU of a primary cluster follows the same procedure as a regular Dedicated cluster. For details, see [Scale Query CU](./scale-query-cu).

### Considerations\{#considerations}

- The same [resource limits](./limits#cus) apply as for regular Dedicated clusters (e.g., query CU × Replica ≤ 10,240).

- During query CU scaling, the cluster status changes to Modifying. [Switchover](./switchover-and-failover#perform-a-switchover) is blocked while scaling is in progress.

- [Failover](./switchover-and-failover#perform-a-failover) can still be triggered during query CU scaling as an emergency operation, but the scaling task will fail and be retried after failover completes.

## Scale replicas\{#scale-replicas}

Replica scaling is controlled independently per cluster. Each cluster in the global cluster — primary and secondary — can have a different replica count tailored to its regional workload. This allows you to allocate more resources in high-traffic regions without over-provisioning in others. 

The following is an example of configuration replicas for each cluster.

<table>
   <tr>
     <th><p><strong>Cluster</strong></p></th>
     <th><p><strong>Region</strong></p></th>
     <th><p><strong>Replica</strong></p></th>
     <th><p><strong>Reason</strong></p></th>
   </tr>
   <tr>
     <td><p>Primary</p></td>
     <td><p>us-west-2</p></td>
     <td><p>2</p></td>
     <td><p>Moderate read + all write traffic</p></td>
   </tr>
   <tr>
     <td><p>Secondary_01</p></td>
     <td><p>eu-west-1</p></td>
     <td><p>4</p></td>
     <td><p>High European read traffic</p></td>
   </tr>
   <tr>
     <td><p>Secondary_02</p></td>
     <td><p>ap-southeast-1</p></td>
     <td><p>1</p></td>
     <td><p>Low traffic, disaster recovery standby only</p></td>
   </tr>
</table>

Scaling the replica of a primary or secondary cluster follows the same procedure as a regular Dedicated cluster. For details, see [Scale Replica](./manage-replica).

### Considerations\{#considerations}

- The same [replica limits](./limits#replicas) apply as for regular Dedicated clusters:

    - Minimum 8 CUs required to enable multi-replicas

    - Maximum 10 replicas

    - CU × Replica ≤ 1,024

- During replica scaling, [switchover](./switchover-and-failover#perform-a-switchover) is blocked on the global cluster.

- [Failover](./switchover-and-failover#perform-a-failover) can still be triggered during replica scaling, but the scaling task will fail and be retried after failover completes.

## FAQs\{#faqs}

1. **Can I set different number of query CUs on the primary and secondary clusters?**

    No. CU scaling is always initiated on the primary, and all secondaries follow automatically. This ensures consistent capacity across the global cluster.

1. **Can I set different replica counts on different clusters?**

    Yes. Replica scaling is fully independent per cluster. This is useful when regions have different traffic patterns — for example, more replicas in a high-traffic region and fewer in a standby-only region.

1. **What happens to scaling settings after a switchover?**

    After a switchover, query CU scaling targets the new primary cluster. Replica configurations on each cluster remain unchanged.

