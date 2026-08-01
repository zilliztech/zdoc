---
title: "Auto-scaling | Cloud"
slug: /auto-scaling
sidebar_label: "Auto-scaling"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Auto-scaling automatically adjusts a Dedicated serving cluster within the minimum and maximum limits that you configure. It helps protect query performance during workload spikes and reduce resource usage when traffic decreases. | Cloud"
type: origin
token: I5qmw4fxDiBxBQksrNwcLHQpnTc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Auto-scaling

Auto-scaling automatically adjusts a Dedicated serving cluster within the minimum and maximum limits that you configure. It helps protect query performance during workload spikes and reduce resource usage when traffic decreases.

Auto-scaling is most useful for workloads with unpredictable traffic, such as AI agents, interactive search applications, customer support bots, and multimodal search systems. These workloads may stay idle for long periods and then trigger bursts of retrieval requests.

To keep serving utilization within a healthy range, Zilliz Cloud uses target tracking instead of reacting to every raw metric spike. The system evaluates smoothed monitoring signals and applies safety checks before creating a scaling job.

<Admonition type="info" icon="📘" title="Note">

Scaling Query CU manually is supported on all plans.

Scaling replicas manually is supported on the Enterprise plan and above.

Auto-scaling and scheduled scaling are supported on the Enterprise plan and above.

</Admonition>

## Understand auto-scaling behavior\{#understand-auto-scaling-behavior}

Zilliz Cloud does not trigger auto-scaling from a single instantaneous metric spike. The system evaluates whether the scaling metric stays above or below a threshold for a required duration, and applies a cooldown between scaling events to avoid frequent resource changes.

| Scaling target | Metric | Target value | Scale-out condition | Scale-in condition |
| --- | --- | --- | --- | --- |
| Query CU | Query CU Capacity, with CU Computation checked during scale-in | Query CU Capacity: 70% | Greater than 80% for 10 minutes, or reaches 100% immediately | Less than 60% for 30 minutes, and the target Query CU can safely handle current CU Computation |
| Replica | Query CU Computation | CU Computation: 50% | Greater than 60% for 2 minutes | Less than 40% for 10 minutes |

<Admonition type="info" icon="📘" title="Note">

The values in this table are the default auto-scaling settings and may be adjusted by Zilliz Cloud as needed. If you have questions, [contact us](http://support.zilliz.com).

</Admonition>

Auto-scaling requires enough valid monitoring data within the evaluation window. If the window has no data, insufficient data, or was reset after a recent configuration change, Zilliz Cloud skips the scaling decision and continues monitoring.

Therefore, a metric crossing the threshold does not always trigger scaling immediately. The metric must remain above or below the threshold for the required duration, the cooldown period must have ended, and the evaluation window must contain enough valid monitoring data.

## Calculate the target size\{#calculate-the-target-size}

When auto-scaling is triggered, Zilliz Cloud calculates a target configuration automatically.

- For Query CU scale-out, Zilliz Cloud tends to scale step by step to avoid jumping to an unnecessarily large configuration.

- For Query CU scale-in, Zilliz Cloud applies more conservative checks before scaling down. The system verifies that the target specification can still hold the current data and loaded content, and that the target configuration will not cause CU Computation to become too high. If scaling down would create excessive computation pressure, the scale-in action is skipped and the cluster continues monitoring.

- For replica scale-in, Zilliz Cloud can scale directly to the calculated target replica count instead of removing only one replica per scaling action. This helps clusters recover to the expected size faster after temporary traffic spikes.

- If the calculated target is not an available specification or does not result in an actual configuration change, the scaling action is skipped.

The target size must pass specification mapping and safety checks before a scaling job is created.

## Avoid scaling oscillation\{#avoid-scaling-oscillation}

Auto-scaling balances responsiveness and stability. Scale-out is more sensitive to protect performance, while scale-in is more conservative to avoid scaling down too early and then scaling out again.

| Mechanism | Purpose |
| --- | --- |
| Duration window | Requires metrics to stay above or below the threshold for a period of time. |
| Separate scale-out and scale-in thresholds | Prevents the cluster from repeatedly scaling around a single threshold. |
| Cooldown between scaling events | Prevents back-to-back scaling actions caused by short-term traffic changes. |
| Target size calculation | Maps metric pressure to a practical target configuration. |
| Safety checks | Ensures the target configuration is available and can safely serve the current workload. |

Short spikes do not trigger scale-out. Short low-traffic periods do not trigger scale-in. This design reduces oscillation and keeps the cluster stable during normal traffic fluctuations.

## Handle query CU and replica Conflicts\{#handle-query-cu-and-replica-conflicts}

Zilliz Cloud does not modify both Query CU and replica configurations in the same scaling action. This reduces the risk of changing multiple resource dimensions at once.

- A single modify request cannot change Query CU and replica at the same time.

- If both dimensions meet scaling conditions, Zilliz Cloud applies priority handling.

    - When query parallelism pressure is high, Zilliz Cloud usually prioritizes scaling replica.

    - When replica scale-in conflicts with a Query CU adjustment, Zilliz Cloud prioritizes the Query CU adjustment.

    - If the target configuration is unavailable or unchanged, Zilliz Cloud skips the action.

## Set the scaling range\{#set-the-scaling-range}

Auto-scaling requires minimum and maximum ranges for Query CU or Replica. These ranges define the boundaries within which Zilliz Cloud can scale cluster capacity and query throughput.

| Setting | Purpose | Recommended guidance |
| --- | --- | --- |
| Minimum Query CU | Defines the baseline capacity that remains available during low-traffic periods. | Use a value that can handle administrative tasks, background jobs, loaded data, and the minimum expected serving workload.<br/>By default, this value is the current Query CU value. |
| Maximum Query CU | Defines the cost and capacity ceiling for automatic Query CU scale-up. | Use a value that provides enough room for expected data growth while protecting against runaway workloads, recursive query bugs, or unexpected traffic surges.<br/>By default, this value is four times the current Query CU value. |
| Minimum Replica | Defines the baseline query-serving redundancy and throughput during low-traffic periods. | Use a value that preserves the minimum availability and QPS required by your application.<br/>For production workloads, avoid setting this lower than the minimum replica count required for your availability target. |
| Maximum Replica | Defines the cost and throughput ceiling for automatic replica scale-out. | Use a value that can absorb expected traffic peaks while preventing uncontrolled cost growth from unexpected query spikes. |

<Admonition type="info" icon="📘" title="Note">

Do not set the maximum value higher than your operational or budget limit. Auto-scaling can scale up to the configured maximum when sustained workload pressure requires it.

</Admonition>

## Configure auto-scaling\{#configure-auto-scaling}

After auto-scaling is enabled, Zilliz Cloud continuously evaluates the relevant metrics and creates scaling jobs when the configured conditions are met.

### Via web console\{#via-web-console}

- **Configure query CU auto-scaling**

    <Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

    <Procedures>

    1. Navigate to **Cluster Details** page.

    1. Click on **Scale** in the **CU Settings** card.

    1. Select Auto-scaling as the scaling method and configure the **minimum and maximum Query CU Sizes**.

    1. Click on **Save**.

    </Procedures>

- **Configure replica auto-scaling**

    <Supademo id="cmk2agfmh01n4zk0iy6iu4vix" title=""  />

    <Procedures>

    1. Navigate to **Cluster Details** page.

    1. Click on **Scale** in the **Replica Settings** card.

    1. Select Auto-scaling as the scaling method and configure the minimum and maximum replica.

    1. Click on **Save**.

    </Procedures>

### Via RESTful API\{#via-restful-api}

With the RESTful API, you can configure auto-scaling for both Query CU and replica in a single [Modify Cluster](/reference/restful/modify-cluster-v2) request.

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
        },
        "replica": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## View scaling progress\{#view-scaling-progress}

Once a scaling event is triggered, Zilliz Cloud generates a job record. You can check the progress on the Jobs page.

<Procedures>

1. In the Zilliz Cloud console, go to the target project.

1. Go to **Jobs**.

1. Find the scaling job for the target cluster.

1. Check the job status.

</Procedures>

When the scaling job is in progress, the cluster status is `Modifying`. When the job succeeds, the cluster status changes back to `Running`.

<Admonition type="info" icon="📘" title="Note">

During a scaling job, Zilliz Cloud continues to bill the cluster based on the previous configuration. The new Query CU or replica configuration is used for billing only after the scaling job completes successfully. This applies to both scale-up and scale-down operations.

</Admonition>

## Troubleshoot auto-scaling\{#troubleshoot-auto-scaling}

| Observation | Possible reason | Action |
| --- | --- | --- |
| The metric exceeded the threshold, but scaling did not start. | The metric did not remain above the threshold for the required duration, the cooldown is active, or the evaluation window has insufficient data. | Check the metric trend over the full evaluation window and review recent configuration changes. |
| The cluster did not scale down even though traffic dropped. | Scale-in uses a longer and more conservative window, or the target configuration cannot safely hold the current data and loaded content. | Check Query CU Capacity, data volume, loaded collections, and collection or partition limits. |
| Replica did not scale out under high traffic. | The Query CU Computation threshold may not have been sustained, or another scaling action may have higher priority. | Check Query CU Computation over time and review scaling job history. |
| Auto-scaling skipped an action. | The target specification was unavailable, unchanged, or failed safety checks. | Adjust the min/max range or choose a valid cluster configuration. |

## Limits and considerations\{#limits-and-considerations}

- Auto-scaling applies to Dedicated serving clusters.

- On-demand clusters scale automatically and do not require auto-scaling configuration.

- Replica scaling requires a minimum Query CU configuration of 4 CUs.

- Query CU × replica has an upper limit. For details, see [Zilliz Cloud Limits](./limits#replicas).

- Scale-down succeeds only when the current data volume and the current number of collections and partitions fit within the target specification.

- Scheduled scaling requires schedule intervals greater than 30 minutes.

