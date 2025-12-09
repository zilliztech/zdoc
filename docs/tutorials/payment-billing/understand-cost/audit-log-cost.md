---
title: "Audit Logs Cost | Cloud"
slug: /audit-log-cost
sidebar_label: "Audit Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "When you enable audit logs, Zilliz Cloud deploys a logging service. Collecting, processing, and forwarding these logs consumes additional system resources, which is why corresponding charges apply. | Cloud"
type: origin
token: GBfswoqhviHfTVk2qhHc4eGXnfh
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - audit log
  - cost
  - billing
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';


# Audit Logs Cost

When you enable [audit log](./audit-logs)s, Zilliz Cloud deploys a logging service. Collecting, processing, and forwarding these logs consumes additional system resources, which is why corresponding charges apply.

The total cost of using the audit log feature is the sum of the following components:

- [Audit logs CU cost](./audit-log-cost#audit-logs-cu-cost): the cost of the computer resources consumed by audit log collection and processing

- [Data transfer cost](./audit-log-cost#data-transfer-cost): the cost of forwarding logs to your object storage.

## Audit logs CU cost\{#audit-logs-cu-cost}

```plaintext
Audit Logs CU Cost = Audit Logs CU Unit Price x Total Number of Query CU x Audit Logs Runtime
```

- **Audit Logs CU Unit Price**: Determined by the cluster region and the project plan. For detailed rates, refer to [Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide).

- **Total Number of Query CU**: The total number of query CUs in the cluster, factoring in replicas.

    ```plaintext
    Total Number of Query CU = Query CU × Replica Count
    ```

    For example, a cluster with 2 query CUs and 2 replicas has a total of 4 CUs.

- **Audit Logs Runtime**: The total time the Audit Logs feature is enabled. Runtime is calculated as `Disable Time Point − Enable Time Point`. If the cluster is in a **Suspended** status, that time is excluded from the calculation because no compute resources are consumed by the audit logs feature during suspension. For an example of the calculation of runtime, see [Example](./audit-log-cost#example).

## Data transfer cost\{#data-transfer-cost}

Audit logs can be forwarded to an object storage bucket. Currently, Zilliz Cloud only supports forwarding logs to an object storage bucket created in the same cloud region as your cluster.

Intra-region data transfers currently incur no additional charges.

For details on data transfer pricing, see [Data Transfer](./data-transfer-cost).

## Example\{#example}

Suppose your cluster configuration is as follows:

- **Project Plan:** Enterprise

- **Cluster Deployment Option**: Dedicated

- **Cloud Provider & Region:** AWS us-east-1 (Virginia)

- **CU Size:** 8 CU

- **Replica Count:** 2

- **Audit Logs Runtime:** 

![JKGIwkjiyhRr2ebq4eKcUsZOn8d](https://zdoc-images.s3.us-west-2.amazonaws.com/JKGIwkjiyhRr2ebq4eKcUsZOn8d.png)

    As illustrated above, 

    - Audit logs enabled at 12:00 on Aug 1, 2025.

    - Cluster suspended at 24:00 on Aug 1, 2025.

    - Cluster Resumed at 12:00 on Aug 2, 2025, and runs until dropped at 12:00 on Aug 3, 2025.

    The total runtime is `(24 − 12) + 24 = 36 hours`.

With the project plan and cloud provider and region information, you can find on the [pricing guide page](https://zilliz.com/pricing/pricing-guide) that the audit logs unit price is **&#36;0.031/hour**.

According to the CU size and replica count information, the total query CU size is `8 CU x 2 Replica = 16 CU`.

The total audit logs CU cost is `$0.031 x 16 x 36 = $17.856`.

Data Transfer Cost is **&#36;0**  because of same-region forwarding. 

The total audit logs cost is `$17.856 + $0.00 = $17.856`.

## FAQs\{#faqs}

1. **Will I be charged for audit logs if my cluster is suspended?**
No. Audit logs CU charges only apply while the feature is enabled and the cluster is actively running. Time spent in the "Suspended" state is excluded.

1. **Do I pay for data transfer when forwarding audit logs?**
Intra-region forwarding is free. Cross-region transfer (not currently supported) may incur additional charges.

1. **If audit logs are enabled but no logs are actually generated, will I still be charged?**
Yes. Audit logs CU charges are based on the cluster query CU size and runtime while the feature is enabled, regardless of whether logs are generated. If no logs are generated, data transfer costs may be $0.

1. **Does the billing vary depending on the actual volume of logs generated (e.g., high QPS vs. low QPS workloads)?**
 No. Audit logs CU costs depend only on your cluster’s query CU size and runtime, not on the volume of logs generated.

