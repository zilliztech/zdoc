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
token: Uj3wwkysGiBhfqk8jsMckyiTnBb
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - storage
  - cost
  - billing
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Storage Cost

In Zilliz Cloud, storage costs are incurred when you store data or backup files, regardless of whether your cluster is running.

## Sources of storage costs\{#sources-of-storage-costs}

You will be billed for storage in the following scenarios:

- Dedicated cluster: data stored in your Dedicated cluster.

- Serverless cluster: data stored in your Serverless cluster.

- [Database](./on-demand-database): data stored in your databases used for on-demand search.

    - Data and indexes in your managed collections.

    - Indexes in your external collections.

- [Backup](./undefined) storage: backup files you create for disaster recovery.

- [Managed volume](./managed-volume) storage: either structured data or collections of unstructured data files stored in a volume.

## Cost calculation\{#cost-calculation}

```plaintext
Storage Cost = Storage Unit Price x Data Size x Duration
```

- Storage Unit Price: Determined by the cloud region and the cluster type. For detailed rates, refer to [Zilliz Cloud Pricing](https://zilliz.com/pricing).

- Data Size: The size of all data stored or the size of backup files which is measured in GB.

- Duration: The length of time data or backup files are stored in Zilliz Cloud.

## Billing rules\{#billing-rules}

The billing rules of cluster, volume storage is slightly different from backup storage and cold data access.

- **Dedicated & Serverless Cluster, Volume, and Database Storage:** Billed hourly, minimum charge of 1 hour.

- **Backup Storage:** Billed daily, minimum charge of 1 day.

## Examples\{#examples}

The following are some examples to help you understand how storage costs are calculated.

### Example 1: Dedicated cluster storage cost\{#example-1-dedicated-cluster-storage-cost}

Suppose your serving cluster configuration is as follows:

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized

- **Data Size**: 500 GB

- **Storage Duration**: 29 days 23 hours 30 minutes

With the cloud provider and region, and the cluster type information, you can find on the [Pricing Page](https://zilliz.com/pricing) that the storage unit price is **&#36;0.025/GB per month**.

Due to the [billing rule](./storage-cost#billing-rules), any partial hour is rounded up to a full hour. The storage duration, 29 days, 23 hours, and 30 minutes, will be rounded up to 30 days, which is equivalent to 1 month.

The total data storage cost is `$0.025 x 500 × 1 = $12.50`.

### Example 2: Backup storage cost\{#example-2-backup-storage-cost}

Suppose your cluster configuration is as follows:

- **Cloud Provider & Region**: AWS us-east-1 (Virginia)

- **Cluster Type**: Performance-optimized

- **Backup File Size**: 20 GB

- **Backup File Retention Period**: 44 days 6 hours

With the cloud provider and region, and the cluster type information, you can find on the [Pricing Page](https://zilliz.com/pricing) that the storage unit price is **&#36;0.025/GB per month**.

Due to the [billing rule](./storage-cost#billing-rules), any partial day is rounded up to a full day. So, the retention period, 44 days and 6 hours, will be rounded up to 45 days, which is equivalent to 1.5 months.

The total backup storage cost of the example cluster is  `$0.025 x 20 x 1.5 = $0.75`.

### Example 3: Managed volume storage cost\{#example-3-managed-volume-storage-cost}

If you upload **10 GB** of data to a volume for import and keep it for **1 month**, with a unit price of **&#36;0.04/GB per month**, the cost is  `$0.04 × 10 × 1 = $0.40`.

## FAQs\{#faqs}

1. **Will I still be charged for storage if I suspend my cluster?**

    Yes. Storage costs apply as long as your cluster data, backups, or volume files are retained, even when the cluster is suspended.

1. **Is there a minimum charge for storage?**
 Yes. There is a minimum charge for storage.

    - Cluster and volume storage: Minimum 1 hour charge.

    - Backup storage: Minimum 1 day charge.

