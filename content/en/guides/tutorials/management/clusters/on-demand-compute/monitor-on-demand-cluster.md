---
title: "Monitor On-Demand Clusters | Cloud"
slug: /monitor-on-demand-cluster
sidebar_label: "Monitor On-Demand Clusters"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "Use the Zilliz Cloud console to monitor an on-demand cluster's activity, investigate individual requests, and review the requests associated with a compute run. These views help you distinguish the time spent preparing resources from the time spent processing a request. | Cloud"
type: origin
token: NcIMw9y7Wi8O6BkRc7HcBbbrnPg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Monitor On-Demand Clusters

Use the Zilliz Cloud console to monitor an on-demand cluster's activity, investigate individual requests, and review the requests associated with a compute run. These views help you distinguish the time spent preparing resources from the time spent processing a request.

## View cluster activity\{#view-cluster-activity}

![VpjfwSufrhMjnpbRM9LccQYKngc](https://zdoc-images.s3.us-west-2.amazonaws.com/VpjfwSufrhMjnpbRM9LccQYKngc.png)

<Procedures>

1. In the Zilliz Cloud console, open the project containing your on-demand cluster.

1. Go to **On-Demand Compute > Clusters** and select the cluster you want to inspect.

1. Select a time range and review the cluster activity charts and summaries.

</Procedures>

The activity view shows request volume and outcomes, request latency, compute and collection readiness, and CU activity. Compare these metrics over time to identify changes in workload or readiness. For definitions and calculation details, see [Metrics Reference](/docs/metrics-alerts-reference).

A percentile summarizes a distribution of observed durations. For example, P50 is the value at or below which approximately 50% of the observations fall; P95 is the corresponding value for approximately 95%. Check the sample count when interpreting percentiles, especially for clusters that start infrequently. Percentile values are estimated from histograms and cannot be added, subtracted, or averaged to obtain another percentile.

## Inspect a request\{#inspect-a-request}

The request history shows recorded Search, HybridSearch, and Query requests. Use it to find a request and inspect where it spent time.

![N9qmwYpQFhuBhkbAT8Kc2HHDnmc](https://zdoc-images.s3.us-west-2.amazonaws.com/N9qmwYpQFhuBhkbAT8Kc2HHDnmc.png)

<Procedures>

1. In the cluster's request history, select a time range. The time filter applies to the request start time.

1. Narrow the list by operation, outcome, or minimum duration as needed.

1. Select a request to view its outcome, total duration, phase durations, and associated run, if available.

</Procedures>

A request can be in progress, successful, failed, timed out, canceled, or unknown. An unknown outcome means that the final result could not be confirmed. An error code may be available for an unsuccessful request.

Request durations are measured from when the Coordinator receives the request. They do not include client-side network or gateway time. The duration you measure in your application may therefore differ from the duration shown in the console.

### Understand request phases\{#understand-request-phases}

| Phase | What it measures |
| --- | --- |
| Prepare | Other work needed to prepare the request. |
| Compute | Time this request spends waiting for compute resources to become ready. |
| Load | Time this request spends waiting for the target collection to become queryable. |
| Queue | Time waiting to be scheduled and dequeued. |
| Execute | Request processing after it leaves the queue, including preprocessing and postprocessing. |

A request may skip a phase if the required resources are already ready. Retries can cause a request to enter a phase more than once; the displayed phase duration accumulates time spent in that phase. A missing phase value is different from a measured duration of zero. Depending on the execution path, phases can overlap, so do not assume that all phase durations add up to the total.

The **Compute** phase is the time the selected request waited. If the request arrived after a compute activation had already started, its wait is shorter than the duration of the full activation. Multiple requests can wait for the same activation.

The request-level **Execute** phase starts after dequeue. Its boundary differs from the aggregate execution-duration metric, which accumulates top-level execution attempts and includes scheduling and internal retries. Neither should be interpreted as pure QueryNode compute time.

## Inspect a run\{#inspect-a-run}

A run groups the requests associated with one compute activation. It starts when compute is woken and ends when that compute stops. The run view shows the compute state, observed start and stop times, and counts of associated recorded requests by outcome.

![AwvAwHtaBh2NSCbwdYZcXKvlnPD](https://zdoc-images.s3.us-west-2.amazonaws.com/AwvAwHtaBh2NSCbwdYZcXKvlnPD.png)

<Procedures>

1. Open the run list for the cluster and select a time range.

1. Select a run to inspect its details and associated requests. You can also follow the run associated with a request, when available.

1. Compare the run's readiness time and request outcomes with the request details.

</Procedures>

A request is associated with the first run it actually enters or waits for. An internal retry that reaches another run is marked as a cross-run retry and is not counted again in the original request's run statistics. A request without a reliable run association is not included in a run's request count. A run created by prewarming can have no associated requests.

Run counts reflect recorded, associated requests. They are not billing figures. A billing session ID identifies a billing interval and is different from a run ID. For billing details, see [On-Demand Compute Cost](/docs/on-demand-compute-cost).

## Interpret readiness and missing data\{#interpret-readiness-and-missing-data}

**Compute readiness** is measured from the start of an activation until the QueryNode is ready and has joined the resource group. **Collection readiness** is measured from the start of an activation until a particular collection is queryable; it includes compute startup. One activation can produce multiple collection-readiness samples. A queryable collection does not necessarily mean its cache is warm.

Request records are written asynchronously and may be delayed or incomplete. If records are unavailable or marked incomplete, do not interpret an empty list or a zero count as proof that no requests occurred. In-progress requests can change state while you inspect the list. Requests rejected before recording begins are outside the request history.