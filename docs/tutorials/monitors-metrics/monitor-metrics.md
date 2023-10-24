---
slug: /monitor-metrics
beta: FALSE
notebook: FALSE
sidebar_position: 7
---



# View Cluster Metrics

Zilliz Cloud provides a dashboard where you can view cluster-specific metrics. To access it, go to the Metrics tab in one of your cluster, as shown in the following figure.

![view_system_metrics](/img/view_system_metrics.png)

## Metrics explained{#metrics-explained}

On the **Metrics** tab, you can find the following curves:

- CU usage
    This metric displays the percentage fluctuation of either CPU or memory usage, whichever is greater, per second during a specified time duration.

- Storage usage
    This metric displays the variation in consumed block storage size, measured in gigabytes per second, over a specified time period.

- Queries per second (QPS)
    This metric displays the fluctuation in the number of queries per second during a specified time duration.

- Query latency
    This metric displays the fluctuation of query latency, measured in milliseconds, over a specified time period.

## Adjust curve window size{#adjust-curve-window-size}

To adjust the size of the curve window, select an appropriate time range from the drop-down menu located in the upper-right corner of the **All Metrics** area. The available options are:

- Last 10 minutes

- Last hour

- Last day

- Last week

- Last month

## Related topics{#related-topics}

- [CU Resource Monitor](./monitor-cu-resources) 

- [QPS Resource Monitor](./monitor-qps) 

- [Query Latency Monitor](./monitor-query-latency) 

- [Load Capacity Resource Monitor](./monitor-load-capacity) 

- [Credit Card Expiration Monitor](./stay-informed-on-credit-card-expiration) 

- [Advance Pay Balance Monitor](./check-advance-pay-balance) 
