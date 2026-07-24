---
title: "Manual Scaling | Cloud"
slug: /manual-scaling
sidebar_label: "Manual Scaling"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Manual scaling lets you resize a Dedicated serving cluster when you know the target resource configuration you need. You can increase or decrease Query CU to adjust cluster capacity, or increase or decrease replicas to adjust query throughput and availability. | Cloud"
type: origin
token: ByBTwOfgIie7e2k090Mc1EPknSf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Manual Scaling

Manual scaling lets you resize a Dedicated serving cluster when you know the target resource configuration you need. You can increase or decrease Query CU to adjust cluster capacity, or increase or decrease replicas to adjust query throughput and availability.

Manual scaling is useful for planned changes, such as production launches, load tests, migration windows, predictable traffic increases, or one-time cost optimization after traffic drops.

Note that manual scaling applies to serving clusters only. On-demand clusters scale automatically when requests arrive and scale back to zero when idle.

<Admonition type="info" icon="📘" title="Note">

Scaling Query CU manually is supported on all plans.

Scaling replicas manually is supported on the Enterprise plan and above.

Auto-scaling and scheduled scaling are supported on the Enterprise plan and above.

</Admonition>

## Before you start\{#before-you-start}

Before you start, read [Plan Cluster Scaling](./plan-cluster-scaling) to understand the key scaling concepts and choose the right scaling approach for your workload.

## Manual scaling via web console\{#manual-scaling-via-web-console}

### Scale Query CU manually\{#scale-query-cu-manually}

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Procedures>

1. Navigate to the **Cluster Details** page.

1. Click on **Scale** in the **Query** **CU Settings** card.

1. Select **Manual** as the scaling method and configure the desired new query CU size.

1. Click on **Save**.

</Procedures>

### Scale Replica manually\{#scale-replica-manually}

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

<Procedures>

1. Navigate to the **Cluster Details** page.

1. Click on **Scale** in the **Replica Settings** card.

1. Select **Manual** as the scaling method and configure the desired new replica count.

1. Click on **Save**.

</Procedures>

## Manual scaling via RESTful API\{#manual-scaling-via-restful-api}

With the RESTful API, you can manually scale Query CU and replica in a single [Modify Cluster](/reference/restful/modify-cluster-v2) request.

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2,
    "replica": 2
}'
```

## View scaling progress\{#view-scaling-progress}

After a manual scaling request is submitted, Zilliz Cloud creates a job record.

<Procedures>

1. In the Zilliz Cloud console, go to the target project.

1. Go to **Jobs**.

1. Find the scaling job for the target cluster.

1. Check the job status.

</Procedures>

When the scaling job is in progress, the cluster status is `Modifying`. When the job succeeds, the cluster status changes back to `Running`.

## FAQ\{#faq}

**When does the new configuration start billing?**

The new configuration starts billing only after the scaling job completes successfully. If the job is still running or does not complete, billing remains based on the previous configuration.

**What happens if scale-down is not allowed?**

A scale-down request may fail if the target Query CU size cannot support the current data volume, collection count, or partition count. In this case, keep the current size or choose a larger target configuration.

**Should I use manual scaling, scheduled scaling, or dynamic scaling?**

Use manual scaling when you know exactly when and how much to scale. Use scheduled scaling for recurring traffic patterns. Use dynamic scaling for unpredictable workloads where Zilliz Cloud should adjust resources automatically within a configured range.

