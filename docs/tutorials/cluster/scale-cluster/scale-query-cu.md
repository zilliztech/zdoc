---
title: "Scale Query CU | Cloud"
slug: /scale-query-cu
sidebar_key: scale-query-cu
sidebar_label: "Scale Query CU"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "As your workload grows and more data is written, the serving cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail. | Cloud"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - scale
  - manage
  - query cu

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Scale Query CU

As your workload grows and more data is written, the serving cluster may reach its capacity limit. In such cases, read operations will continue to function, but new write operations may fail.

To proactively manage this, you can monitor **Query** **CU Capacity** on the [metrics](./metrics-alerts-reference) page to determine when query CU scaling is needed. Based on your business needs and patterns, you can increase the number of query CUs to expand cluster capacity or reduce it when demand decreases to save on costs.

Please note that for serving clusters with 1 - 12 CUs, you can directly scale query CU. For serving clusters with more than 12 CUs, please increase [replicas](./manage-replica).

This guide explains how to resize a serving cluster to suit your changing workload.

The content on this page applies to serving clusters only.  On-demand clusters scale automatically — they spin up when a request arrives and scale back to zero when idle, with no manual intervention required.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters.

</Admonition>

## Considerations\{#considerations}

- **Resource Limitations**: 

    - **Scale up**

        - Dedicated (Standard) clusters: Up to 32 CUs

            Dedicated (Enterprise) clusters: Up to 1,024 CUs

        - The product of **Number of Query CU** × **Replica count** must not exceed 10,240

        For larger query CU, [contact sales](http://zilliz.com/contact-sales).

    - **Scale down**

        - Clusters with replicas cannot scale down to less than 12 CUs

        - A scale-down request only succeeds if:

            - Current data volume < 80% of the CU capacity of the new CU size.

            - Current number of collections and partitions < the [maximum number of collections and partitions](./limits#collections) allowed in the new CU size.

- **During Scaling**: The cluster status changes to “Modifying,” during which no operations can be performed. If multiple scaling tasks are triggered, they will be processed sequentially based on trigger timestamp. Completion time depends on data volume.

- **Billing during scaling:** During a query CU scaling job, Zilliz Cloud continues to bill the cluster based on the previous query CU configuration. The new query CU count is used for billing only after the scaling job is completed successfully. If the scaling job is still in progress or does not complete, billing remains based on the previous query CU configuration.

- **Performance Impact**: Scaling may cause slight service jitter.

- **Backup Limitations**: Dynamic and scheduled scaling settings are not included in [backups](./create-backup). After restoring a cluster, reconfigure these settings manually.

## Manual scaling\{#manual-scaling}

You can manually scale your cluster up or down via the Zilliz Cloud console or RESTful API.

The following demo shows how to manually scale up and down a cluster on the Zilliz Cloud web console.

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

In addition, you can use the RESTful API to manually scale query CU.

The following example scales an existing cluster to 2 CU. For details, see [Modify Cluster](/reference/restful/modify-cluster-v2).

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```

## Scheduled scaling\{#scheduled-scaling}

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters in an **Enterprise** project.

</Admonition>

The interval between schedules should be greater than 30 minutes. 

For details about how to use the advanced mode to write cron expressions, see [Cron Expression](./cron-expression).

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

In addition, you can also enable scheduled scaling as follows. For details, see [Modify Cluster](/reference/restful/modify-cluster-v2).

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "cu": {
            "schedules": [
                {
                    "cron": "10 0 0 0 0 ?",
                    "target": 2
                }
            ]
        }
    }
}'
```

## Dynamic scaling\{#dynamic-scaling}

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters in an **Enterprise** project.

</Admonition>

Zilliz Cloud supports dynamic scaling to help you maintain performance while eliminating manual intervention. When enabled, the system automatically adjusts the **query CU** resources based on the real-time **CU capacity** metric, ensuring your workload is served efficiently without service disruption.

When setting up dynamic scaling, you can configure the following bounds:

- **Minimum Query CU**: Defaults to the current size.

- **Maximum Query CU**: Defaults to 4× the current CU size.

<Admonition type="info" icon="📘" title="Notes">

- Selecting a maximum query CU below the current value triggers an immediate scale-down.

- Selecting a minimum query CU above the current value triggers an immediate scale-up.

</Admonition>

### Trigger conditions\{#trigger-conditions}

- Scale Up: Triggered when CU capacity exceeds 80% for 10 minutes. Or when CU capacity reaches 100%, a scale up will be triggered immediately.

- Scale Down: Triggered when CU capacity stays below 60% for 30 minutes.

- A cooldown period of 10 minutes applies between scale-up events, and 30 minutes between scale-down events. Scaling down will execute on a size-by-size basis until the target metric value has been achieved.

### Scaling size calculation\{#scaling-size-calculation}

The following formula explains how Zilliz Cloud calculates the target number of query CU for a dynamic scaling event. The dynamic scaling formula aims to maintain your CU capacity at a target value of 70%.

```plaintext
Target Query CU Number = Current Query CU Number × (Current Metric Value / Target Metric Value) 
```

<table>
   <tr>
     <th><p>Variable Name</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Target Query CU Number</p></td>
     <td><p>The new size the system aims to scale the cluster to.</p></td>
   </tr>
   <tr>
     <td><p>Current Query CU Number</p></td>
     <td><p>The current query CU number of the cluster.</p></td>
   </tr>
   <tr>
     <td><p>Current Metric Value</p></td>
     <td><p>The current measured value of the CU capacity metric.</p></td>
   </tr>
   <tr>
     <td><p>Target Metric Value</p></td>
     <td><p>Expected CU capacity value after scaling, which is 70.</p></td>
   </tr>
</table>

For example, if query CU dynamic scaling is enabled and the following conditions are met:

- **Current Query CU Number:** 60 CU

- **Cluster CU Capacity:** Above 80% for 10 minutes

A dynamic scaling event will be triggered. The target query CU number is calculated as:

```plaintext
60 × (80 / 70) ≈ 68.57 CU
```

This value is then rounded up to the next available CU number, resulting in a new size of **72 CU**.

### Procedures\{#procedures}

The following demo shows how to configure dynamic auto-scaling on the Zilliz Cloud web console. 

<Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

In addition, you can configure dynamic scaling using RESTful API. For details, see [Modify Cluster](/reference/restful/modify-cluster-v2).

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "cu": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## View scaling progress\{#view-scaling-progress}

Once a manual scaling request is sent or a scheduled or dynamic scaling event is triggered, a job record will be generated. You can check the progress on the [Jobs](./job-center) page.

When a scaling job is in progress, you cluster status will change to "Modifying". Once the scaling job is successful, the cluster status will change to "Running".

## FAQ\{#faq}

**What are the limitations when scaling down a cluster?**

Clusters with replicas cannot scale down to fewer than 8 CUs.

A scale-down request will only succeed if both of the following conditions are met:

- The current data volume is less than 80% of the new CU size's capacity.

- The number of collections and partitions is within the limit allowed by the new CU size.

**When I scale a Dedicated cluster, am I billed based on the old configuration or the new configuration during scaling?**

During [scaling](./scale-cluster), you are billed based on the previous configuration. The new configuration is used for billing only after the scaling job completes successfully. 

