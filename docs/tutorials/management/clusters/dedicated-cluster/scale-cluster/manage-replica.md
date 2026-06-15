---
title: "Scale Replica | Cloud"
slug: /manage-replica
sidebar_label: "Scale Replica"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud supports cluster-level replication. Each replica is an exact copy of the resources and data in a cluster. Using replicas can increase query throughput and availability. | Cloud"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Scale Replica

Zilliz Cloud supports cluster-level replication. Each replica is an exact copy of the resources and data in a cluster. Using replicas can increase query throughput and availability.

For users experiencing QPS bottlenecks, adding replicas can distribute the query workload, enhancing overall query throughput. To proactively optimize performance, you can monitor **Query** **CU Computation** on the [metrics](./metrics-alerts-reference) page to determine when replica scaling is needed.

Note that adding replicas will not increase the cluster capacity because the capacity is only determined by the number of query CUs of each cluster. If you want to increase the cluster capacity, please refer to [Scale Cluster](./scale-query-cu).

This guide outlines the procedures of configuring replicas for a **serving cluster** in Zilliz Cloud.

The content on this page applies to serving clusters only.  On-demand clusters scale automatically — they spin up when a request arrives and scale back to zero when idle, with no manual intervention required.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters in an **Enterprise** project.

</Admonition>

## Considerations\{#considerations}

- **Resource Limitations**: You can configure replicas for an existing Dedicated cluster as long as the following conditions are met:

    - The cluster has 12 query CUs or more

    - The product of the cluster query CU count x replica count should not exceed 10,240.

- **Billing during scaling:** During a replica scaling job, Zilliz Cloud continues to bill the cluster based on the previous replica configuration. The new replica count is used for billing only after the scaling job is completed successfully. If the scaling job is still in progress or does not complete, billing remains based on the previous replica configuration.

- **Performance Impact**: Scaling may cause slight service jitter and may temporarily affect data reads.

## Manual scaling\{#manual-scaling}

You can adjust the number of replicas for an existing Dedicated cluster either manually on the console or programmatically.

The following demo shows how to configure replicas on the Zilliz Cloud web console.

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

You can also use the RESTful API to manually adjust the number of replicas in a cluster. For details, refer to [Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2).

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "replica": 2
}'
```

## Scheduled scaling\{#scheduled-scaling}

You can configure scaling of replicas based on a predefined time schedule via the Zilliz Cloud web console or RESTful API. 

The interval between schedules should be greater than 30 minutes. 

For details about how to use the advanced mode to write cron expressions, see [Cron Expression](./cron-expression).

The following demo shows how to enable replica auto-scaling.

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

You can also use the RESTful API to configure replica scheduled scaling. For details, refer to [Modify Cluster](/reference/restful/modify-cluster-v2).

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
        "replica": {
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

Zilliz Cloud supports dynamic scaling of replicas to help you maintain performance while eliminating manual intervention. When enabled, the system automatically adjusts the **replica count** based on the real-time **CU computation** metric, ensuring your workload is served efficiently without service disruption.

When setting up dynamic scaling, you can configure the following bounds:

- **Minimum Replica**: Defaults to the current count.

- **Maximum Replica**: Defaults to 1× the current CU size. The maximum replica cannot exceed 10. [Contact support](http://support.zilliz.com) if you need this limit increased.

<Admonition type="info" icon="📘" title="Notes">

- Selecting a maximum replica below the current value triggers an immediate scale-in.

- Selecting a minimum replica above the current value triggers an immediate scale-out.

</Admonition>

### Trigger conditions\{#trigger-conditions}

- Scale Out: Triggered when CU computation exceeds 60% for 2 minutes.

- Scale In: Triggered when CU computation stays below 40% for 10 minutes.

### Scaling size calculation\{#scaling-size-calculation}

The following formula explains how Zilliz Cloud calculates the target replica count for a dynamic scaling event. The dynamic scaling formula aims to maintain your CU computation at a target value of 50%.

```plaintext
Target Replica Count = Current Replica Count × (Current Metric Value / Target Metric Value) 
```

| Variable Name | Description |
| --- | --- |
| Target Replica Count | The new replica count that the system aims to scale to. |
| Current Replica Count | The current replica count of the cluster. |
| Current Metric Value | The current measured value of the CU computation metric. |
| Target Metric Value | Expected CU compuation value after scaling, which is 50%. |

For example, if replica dynamic scaling is enabled and the following conditions are met:

- **Current Replica Count: 1**

- **Cluster CU Computation:** Above 60% for 10 minutes

A dynamic scaling event will be triggered. The target query CU number is calculated as:

```plaintext
1 × (60 / 50) = 1.2
```

This value is then rounded up to 2, resulting in a new replica count of **2**.

### Procedures\{#procedures}

The following demo shows how to configure dynamic auto-scaling on the Zilliz Cloud web console. 

<Supademo id="cmk2agfmh01n4zk0iy6iu4vix" title=""  />

In addition, you can configure dynamic scaling using RESTful API. For details, refer to [Modify Cluster](/reference/restful/modify-cluster-v2).

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
        "replica": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## View scaling progress\{#view-scaling-progress}

Once a manual scaling request is sent or a scheduled or dynamic scaling event is triggered, a job record will be generated. You can check the progress on the [Jobs](./job-center) page.

When a scaling job is in progress, you cluster status will change to "Modifying". Once the scaling job is successful, the cluster status will change to "Running".