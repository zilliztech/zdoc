---
title: "On-Demand Compute Cost | Cloud"
slug: /on-demand-compute-cost
sidebar_label: "On-Demand Compute"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "On-demand compute in Zilliz Cloud follows a usage-based billing model. You are charged for query compute and index-building compute consumed by your workloads. | Cloud"
type: origin
token: XOonwITB7idiV8kT3cpc8Bi5nrb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# On-Demand Compute Cost

On-demand compute in Zilliz Cloud follows a usage-based billing model. You are charged for query compute and index-building compute consumed by your workloads.

The total on-demand compute cost is the sum of the following components:

- Query CU cost

- Indexing CU cost

## Query CU cost\{#query-cu-cost}

Query CU cost measures the compute resources consumed by your on-demand clusters.

### Cost calculation\{#cost-calculation}

```plaintext
Query CU Cost = Query CU Unit Price × Number of Query CU × Active Runtime
```

- **Query CU Unit Price**: Determined by your cloud region and project plan. For detailed rates, refer to [Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide).

- **Number of Query CU**: The number of query CUs configured for the on-demand cluster.

- **Active Runtime**: The billable runtime when the compute resources of an on-demand cluster is used.

    - Billing starts when the on-demand cluster is in the **Running** status.

    - Billing stops when the on-demand cluster is auto-suspended (in the **Suspending** or **Suspended** status) due to inactivity.

    - The minimum billing unit is **1 minute**. Any usage shorter than 1 minute is billed as 1 minute.

## Indexing CU cost\{#indexing-cu-cost}

Indexing CU cost measures compute resources consumed when you build indexes for data in both managed and external collections in on-demand compute.

### Sources of indexing CU cost\{#sources-of-indexing-cu-cost}

You incur Indexing CU cost in the following scenarios:

- Initial `CreateIndex` builds for data in both managed and external collections

- Incremental index builds triggered by `Refresh`

### Cost calculation\{#cost-calculation}

```plaintext
Indexing CU Cost = Indexing CU Unit Price × Number of Indexing CU x Time
```

- **Indexing CU Unit Price**: Determined by cloud region and project plan. For detailed rates, refer to [Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide).

- **Number of Indexing CU**: The system automatically allocates the most appropriate amount of indexing CUs. You cannot specify the number of indexing CUs to use.

- **Time**: The time it takes to complete the index building job. Note that only the job execution time is counted. Queue waiting time and failed jobs are not billed. The minimum billing unit is 1 minute. Any usage shorter than 1 minute is billed as 1 minute.

<Admonition type="info" icon="📘" title="**Note**">

<p>On the Usage and <a href="./view-invoice">Invoice</a> pages, indexing CU costs are shown as totals by database rather than by individual job.  </p>

</Admonition>

## Example\{#example}

Suppose your on-demand compute usage is as follows:

- **Region**: AWS us-west-2

- **Project Plan**: Enterprise

- **Query CU Quantity**: 8 CU

- **On-demand cluster Runtime**: 30 minutes

- **Indexing Usage**: 120 CU-minutes

According to the information above, you can find the following unit prices on the [List Price](https://zilliz.com/pricing/pricing-guide?plan=Enterprise&provider=aws&region=aws-us-west-2) page.

- **Query CU Unit Price** = &#36;0.41 / CU / hour

- **Indexing CU Unit Price** = &#36;0.41 / CU / hour

Then:

`Query CU Cost = 8 x 30 x $0.41 = $98.40`

`Indexing CU Cost = 120 x $0.41 = $49.20`

`Total On-demand Compute Cost = $98.40+ $49.20 = $147.60`

