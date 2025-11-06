---
title: "Storage Cost | Cloud"
slug: /storage-cost
sidebar_label: "Storage"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, storage costs are incurred when you store data or backup files, regardless of whether your cluster is running. | Cloud"
type: origin
token: PNj2w5fY9ifr82kbX8ucKgXAn0r
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - storage
  - cost
  - billing
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';


# Storage Cost

In Zilliz Cloud, storage costs are incurred when you store data or backup files, regardless of whether your cluster is running.

## Sources of storage costs\{#sources-of-storage-costs}

You will be billed for storage in the following scenarios:

- Cluster data storage: raw data and indexes stored in your clusters. 

- [Backup](./backup-and-restore) storage: backup files you create for disaster recovery.

## Cost calculation\{#cost-calculation}

```plaintext
Storage Cost = Storage Unit Price x Data Size x Duration
```

- Storage Unit Price: Determined by the cloud region and the cluster type. For detailed rates, refer to [Zilliz Cloud Pricing](https://zilliz.com/pricing).

- Data Size: The size of all data stored or the size of backup files which is measured in GB.

- Duration: The length of time data or backup files are stored in Zilliz Cloud.

## Billing rules\{#billing-rules}

The billing rules of cluster storage is slightly different from backup storage.

- **Cluster Data Storage:** Billed hourly, minimum charge of 1 hour.

- **Backup Storage:** Billed daily, minimum charge of 1 day.

## Examples\{#examples}

The following are some examples to help you understand how storage costs are calculated.

### Example 1: Cluster storage cost\{#example-1-cluster-storage-cost}

Suppose your cluster configuration is as follows:

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized CU

- **Data Size**: 500 GB

- **Storage Duration**: 29 days 23 hours 30 minutes

With the cloud provider and region, and the cluster type information, you can find on the [Pricing Page](https://zilliz.com/pricing) that the storage unit price is **&#36;0.025/GB per month**.

Due to the [billing rule](./storage-cost#billing-rules), any partial hour is rounded up to a full hour. The storage duration, 29 days, 23 hours, and 30 minutes, will be rounded up to 30 days, which is equivalent to 1 month.

The total data storage cost is `#0.025 x 500 × 1 = #12.50`.

### Example 2: Backup storage cost\{#example-2-backup-storage-cost}

Suppose your cluster configuration is as follows:

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized CU

- **Backup File Size**: 20 GB

- **Backup File Retention Period**: 44 days 6 hours

With the cloud provider and region, and the cluster type information, you can find on the [Pricing Page](https://zilliz.com/pricing) that the storage unit price is **&#36;0.025/GB per month**.

Due to the [billing rule](./storage-cost#billing-rules), any partial day is rounded up to a full day. So, the retention period, 44 days and 6 hours, will be rounded up to 45 days, which is equivalent to 1.5 months.

The total backup storage cost of the example cluster is  `#0.025 x 20 x 1.5 = #0.75`.

## FAQs\{#faqs}

1. **Will I still be charged for storage if I suspend my cluster?**

    Yes. Storage costs apply as long as your cluster data, backups are retained, even when the cluster is suspended.

1. **Is there a minimum charge for storage?**
 Yes. There is a minimum charge for storage.

    - Cluster storage: Minimum 1 hour charge.

    - Backup storage: Minimum 1 day charge.

