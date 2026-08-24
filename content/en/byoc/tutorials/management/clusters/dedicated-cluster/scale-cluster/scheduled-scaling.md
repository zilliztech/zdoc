---
title: "Scheduled Scaling | BYOC"
slug: /scheduled-scaling
sidebar_label: "Scheduled Scaling"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Scheduled scaling lets you resize a Dedicated serving cluster at predefined times. Use it when your workload has recurring patterns, such as weekday business-hour traffic, weekend low-traffic periods, or predictable batch/query windows. | BYOC"
type: origin
token: ZACVwXqTbiCqR3kS9YAccuaQnId
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Scheduled Scaling

Scheduled scaling lets you resize a Dedicated serving cluster at predefined times. Use it when your workload has recurring patterns, such as weekday business-hour traffic, weekend low-traffic periods, or predictable batch/query windows.

<Admonition type="info" icon="📘" title="Note">

Scaling Query CU manually is supported on all plans.

Scaling replicas manually is supported on the Enterprise plan and above.

Auto-scaling and scheduled scaling are supported on the Enterprise plan and above.

</Admonition>

## Before you start\{#before-you-start}

Before you start, read [Plan Cluster Scaling](./plan-cluster-scaling) to understand key scaling concepts and choose the right scaling approach for your workload.

## How scheduled scaling works\{#how-scheduled-scaling-works}

Scheduled scaling changes cluster resources according to schedules that you define. Each schedule includes a time expression and a target resource value.

| Resource | What the schedule changes | Use it when |
| --- | --- | --- |
| Query CU | Changes the cluster Query CU count to the scheduled target value. | You need more capacity during recurring peak periods, or lower capacity during predictable low-traffic periods. |
| Replica | Changes the cluster replica count to the scheduled target value. | You need more query throughput or availability during recurring traffic peaks. |

Scheduled scaling is different from [dynamic scaling](./auto-scaling). Scheduled scaling runs at the times you configure. Dynamic scaling adjusts resources automatically within a minimum and maximum range based on workload metrics.

## When to use scheduled scaling\{#when-to-use-scheduled-scaling}

| Scenario | Recommended schedule |
| --- | --- |
| Your application has higher traffic during weekday business hours. | Set scheduled scaling to trigger scaling up before business hours and scaling down after business hours. |
| Your workload is lighter on weekends. | Set scheduled scaling to trigger scaling down on weekends and restore capacity before Monday traffic starts. |
| You run recurring batch search, evaluation, or analytics jobs. | Set scheduled scaling to trigger scaling up before the job window and scaling down after the job completes. |
| You have predictable traffic peaks but do not need metric-based automatic scaling. | Use scheduled scaling instead of dynamic scaling for deterministic resource changes. |

## Configure scheduled scaling via web console\{#configure-scheduled-scaling-via-web-console}

The interval between schedules should be greater than 30 minutes. 

### Query CU scheduled scaling\{#query-cu-scheduled-scaling}

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

<Procedures>

1. Navigate to the **Cluster Details** page.

1. Click on **Scale** in the **CU Settings** card.

1. Enable scheduled scaling.

1. Configure the timezone and schedules.  You can use either the basic mode or advanced mode (write cron expressions) for setting the schedules. For details about how to use the advanced mode to write cron expressions, see [Understand cron expressions](./scheduled-scaling).

1. Click on **Save**.

</Procedures>

### Replica scheduled scaling\{#replica-scheduled-scaling}

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

<Procedures>

1. Navigate to the **Cluster Details** page.

1. Click on **Scale** in the **Replica Settings** card.

1. Enable scheduled scaling.

1. Configure the timezone and schedules.  You can use either the basic mode or advanced mode (write cron expressions) for setting the schedules. For details about how to use the advanced mode to write cron expressions, see [Understand cron expressions](./scheduled-scaling).

1. Click on **Save**.

</Procedures>

## Configure scheduled scaling via RESTful API\{#configure-scheduled-scaling-via-restful-api}

With the RESTful API, you can configure scheduled scaling for both Query CU and replica in a single [Modify Cluster](/reference/restful/modify-cluster-v2) request.

For details about how to use the advanced mode to write cron expressions, see [Understand cron expressions](./scheduled-scaling).

```bash
export BASE_URL="https://api.cloud.zilliz.com"
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
            "cron": "0 9 * * 1-5",
            "target": 2
          }
        ]
      },
      "replica": {
        "schedules": [
          {
            "cron": "0 9 * * 1-5",
            "target": 2
          }
        ]
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

## FAQ\{#faq}

**What happens if two schedules are too close to each other?**

The interval between schedules should be greater than 30 minutes. Avoid creating schedules that trigger too frequently or overlap with each other.

**What timezone does cron use?**

Cron schedules are evaluated in the timezone you select when configuring scheduled scaling.

