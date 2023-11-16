---
slug: /monitor-metrics
beta: FALSE
notebook: FALSE
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# View Cluster Metrics

Zilliz Cloud offers a dashboard for observing cluster-specific metrics. To access this feature, navigate to the **Metrics** tab within one of your clusters, as illustrated in the figure below.

![view_system_metrics](/img/view_system_metrics.png)

## Understanding Metrics{#understanding-metrics}

The **Metrics** tab presents various graphical representations, including:

- **CU**
    This graph depicts fluctuations in usage, measured as a percentage per second, of either CPU or memory—whichever is higher—over a chosen time frame.

- **Storage Use**
    This chart shows changes in block storage consumption, calculated in gigabytes per second, throughout a selected time period.

- **QPS**
    This curve illustrates variations in the number of queries processed per second during a defined time interval.

- **Query Latency**
    This graph represents shifts in query latency, measured in milliseconds, over a chosen duration.

## Modify Curve Window Size{#modify-curve-window-size}

To alter the curve window size, opt for a suitable time range from the drop-down menu positioned in the upper-right corner of the **All Metrics** area. Your choices include:

- Last 10 minutes

- Last hour

- Last day

- Last week

- Last month

## Related topics{#related-topics}

- [Monitor CU Resources](./cu-resource-monitor) 

- [QPS Resource Monitor](./qps-resource-monitor) 

- [Query Latency Monitor](./query-latency-monitor) 

- [Load Capacity Resource Monitor](./load-capacity-resource-monitor) 

- [Credit Card Expiration Monitor](./credit-card-expiration-monitor) 

- [Advance Pay Balance Monitor](./advance-pay-balance-monitor) 
