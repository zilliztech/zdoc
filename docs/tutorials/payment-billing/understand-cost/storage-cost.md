---
title: "Storage Cost | Cloud"
slug: /storage-cost
sidebar_label: "Storage"
beta: FALSE
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
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search

---

import Admonition from '@theme/Admonition';


# Storage Cost

In Zilliz Cloud, storage costs are incurred when you store data or backup files, regardless of whether your cluster is running.

## Sources of storage costs{#sources-of-storage-costs}

You will be billed for storage in the following scenarios:

- Cluster data storage: raw data and indexes stored in your clusters.

- [Backup](./backup-and-restore) storage: backup files you create for disaster recovery.

## Cost calculation{#cost-calculation}

```plaintext
Storage Cost = Storage Unit Price x Data Size x Duration
```

- Storage Unit Price: Determined by the cloud region and the cluster type. For detailed rates, refer to [Zilliz Cloud Pricing](https://zilliz.com/pricing).

- Data Size: The size of all data stored or the size of backup files which is measured in GB.

- Duration: The length of time data or backup files are stored in Zilliz Cloud.

## Billing rules{#billing-rules}

The billing rules of cluster, stage storage is slightly different from backup storage.

- **Cluster Data Storage:** Billed hourly, minimum charge of 1 hour.

- **Backup Storage:** Billed daily, minimum charge of 1 day.

## Examples{#examples}

The following are some examples to help you understand how storage costs are calculated.

### Example 1: Cluster storage cost{#example-1-cluster-storage-cost}

### Example 2: Backup storage cost{#example-2-backup-storage-cost}

## FAQs{#faqs}

1. **Will I still be charged for storage if I suspend my cluster?**

    Yes. Storage costs apply as long as your cluster data, backups, or stage files are retained, even when the cluster is suspended.

1. **Is there a minimum charge for storage?**
 Yes. There is a minimum charge for storage.

    - Cluster and stage storage: Minimum 1 hour charge.

    - Backup storage: Minimum 1 day charge.

