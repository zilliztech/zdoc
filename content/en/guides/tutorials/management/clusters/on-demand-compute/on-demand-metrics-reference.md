---
title: "On-Demand Metrics Reference | Cloud"
slug: /on-demand-metrics-reference
sidebar_label: "Metrics Reference"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "This page describes metrics for on-demand compute databases and on-demand clusters. Use these metrics to monitor collection activity, compute readiness, request performance, and resource activity. | Cloud"
type: origin
token: Yvpwwtoywix0B6k3phVc5pQ0nSf
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# On-Demand Metrics Reference

This page describes metrics for on-demand compute databases and on-demand clusters. Use these metrics to monitor collection activity, compute readiness, request performance, and resource activity.

## On-demand database and collection metrics\{#on-demand-database-and-collection-metrics}

The following metrics are available in the console for managed and external collections in on-demand compute databases. The existing documentation states that Prometheus export is not supported for these database metrics in this release. Confirm any alert or other integration support separately.

### Performance\{#performance}

| Metric | Description | Recommended action |
| --- | --- | --- |
| QPS (Read) | The number of read requests, including searches and queries, per second. | Monitor read traffic and compare it with latency. |
| Search NQ per Second | The number of query vectors that search requests carry per second. | Track search workload volume alongside QPS. |
| Latency (Read) (ms) | The time elapsed between a client sending a read request and receiving a response. Includes average and P99 latency. | Track read latency and investigate sustained increases. |
| Request Failure Rate (Read) (%) | The percentage of read requests that fail per second. | Monitor read request failures. Confirm alert support for the relevant deployment. |

### Data\{#data}

| Metric | Description | Recommended action |
| --- | --- | --- |
| Entity Count | The total number of entities inserted into the collection, including single inserts and bulk inserts. | Investigate unexpected growth and plan storage and indexing. |

<Admonition type="info" title="Note">

Review: Existing online wording describes read latency as client-to-server-to-client time. Validate its actual measurement boundary with engineering before changing that definition. It should not be conflated with the Coordinator-side cluster request duration below. Entity Count wording for external collections should also be validated against the implementation.

</Admonition>

## On-demand cluster metrics\{#on-demand-cluster-metrics}

These metrics describe compute activation, request performance, outcomes, and CU activity for an individual on-demand cluster. They are distinct from the collection-level metrics available for on-demand compute databases. For instructions on inspecting requests and runs, see [Monitor On-Demand Clusters](./monitor-on-demand-cluster).

Duration percentiles are estimated from histograms. Use the associated sample count to assess how much data is represented. Do not add, subtract, or average percentiles from different distributions. A missing value means the measurement is unavailable; it is not necessarily zero.

### Readiness and request performance\{#readiness-and-request-performance}

| Metric | Description | Recommended action |
| --- | --- | --- |
| Compute readiness count | Number of successful compute activations observed as ready. Each physical activation contributes one sample, even if multiple requests wait for it. | Check the sample count before interpreting readiness percentiles. |
| Compute readiness duration (P50/P95, seconds) | Time from activation to the point when the QueryNode is ready and has joined the resource group. | Compare the usual and slower compute startup durations over time. |
| Collection readiness count | Number of observed collections that became queryable during activations. The same activation can contribute more than one collection sample. | Check how many collection readiness samples are represented. |
| Collection readiness duration (P50/P95, seconds) | Time from activation until an observed collection becomes queryable. This duration includes compute startup. | Assess how long it takes for data to become queryable after activation. |
| Request duration (P50/P95, seconds) | Total Coordinator-side duration of completed Search, HybridSearch, and Query requests, including preparation, waiting, and retries. Excludes client network and gateway time. | Compare overall backend latency over time. |
| Execution duration (P50/P95, seconds) | Accumulated duration of top-level execution attempts for completed requests that entered execution. Includes scheduling and internal retries; excludes preparation waits and intervals between outer retries. | Investigate execution behavior separately from compute and collection preparation. |
| Execution sample count | Number of completed requests that entered execution. Multiple top-level attempts for one request form one sample. | Check the amount of data represented by the execution-duration distribution. |
| Successful request duration by preparation state (P50/P95, seconds) | Total duration of successful requests, grouped by whether compute startup or collection loading was observed. | Compare requests that required preparation with those that did not. This is total duration, not wait time or a cache-hit measure. |
| Successful search duration by operation and topK (sample count, P50/P95) | Request and execution duration distributions for successful Search and HybridSearch requests, grouped by operation and mutually exclusive topK ranges. HybridSearch uses the final rank limit. | Compare similar search workloads and check each group's sample count. |

### Request outcomes and throughput\{#request-outcomes-and-throughput}

| Metric | Description | Recommended action |
| --- | --- | --- |
| Completed requests | Number of completed Search, HybridSearch, and Query requests, grouped into successful, failed, timed-out, and canceled outcomes. In-progress requests are excluded. | Track traffic and changes in outcomes. |
| Error rate (%) | Failed and timed-out requests divided by all completed requests. Canceled requests are included in the denominator. The value is unavailable when there are no completed requests. | Investigate increases alongside the request outcome counts. |
| QPS / QPM | Completed requests per second or per minute, including all completed outcomes. | Compare throughput with latency and outcomes. |

### Compute resources and lifecycle\{#compute-resources-and-lifecycle}

| Metric | Description | Recommended action |
| --- | --- | --- |
| Configured CU | Configured query CU capacity over time. The configured value remains when the cluster is suspended. | Compare configuration changes with workload and latency. |
| Active CU | Active CU history reconstructed from activity and billing events. It is zero while suspended. It is not CPU utilization or the number of ready pods. | Review when compute was active or suspended. |
| Accepted starts | Number of accepted transitions from zero compute replicas to a positive number. Acceptance does not mean compute is ready. | Review activation frequency. |
| Compute readiness count | Number of activations that reached compute readiness. | Compare with activation history, accounting for the different event times. |
| Start timeout / cancellation | Number of activations terminated before compute became ready because of a timeout or another stop operation. | Investigate activations that did not reach readiness. |
| Accepted stop commands / completed stops | Accepted stop commands and confirmed physical stops. Commands may be repeated. | Review resource shutdown behavior; do not treat command count as the number of physical stops. |
| Stop duration (P50/P95, seconds) | Time from an accepted stop command until the corresponding pods are confirmed gone, including observation delay. | Investigate slow resource release. |
| Start and stop command failures | Counts of failed, timed-out, or canceled start and stop command calls. Command outcomes do not by themselves establish the final resource state. | Investigate control operations alongside observed lifecycle outcomes. |
