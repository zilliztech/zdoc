---
title: "Cross-Region Backup | Cloud"
slug: /backup-to-other-regions
sidebar_label: "Cross-Region Backup"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Cross-region backup in Zilliz Cloud enhances data protection by copying backups to multiple cloud regions. It safeguards against regional outages and supports disaster recovery, business continuity, and high availability by minimizing risks from localized failures. | Cloud"
type: origin
token: ESVGwTkn8iLfUakSSrkc5dWJnye
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - files
  - view
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Cross-Region Backup

Cross-region backup in Zilliz Cloud enhances data protection by copying backups to multiple cloud regions. It safeguards against regional outages and supports disaster recovery, business continuity, and high availability by minimizing risks from localized failures.

This guide walks you through how to use cross-region backup on Zilliz Cloud. 

Currently, clusters on Azure do not support cross-region backup.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Limits\{#limits}

- **Access control**: You must be a **project admin**, **organization owner**, or have a **custom role** with backup privileges.

- **Excluded from backup**:

    - Collection TTL settings

    - Password for the default user `db_admin` (a new password is generated during [restore](./restore-from-snapshot))

    - Cluster dynamic and scheduled scaling settings

- **Cluster shard settings**: Backed up but may be adjusted during restore if the cluster CU size is reduced, due to shard-per-CU limits. See [Zilliz Cloud Limits](./limits#shards) for details.

- **Backup job restrictions**: Cross-region backup copy job will start after original backup job is completed.

## Procedures\{#procedures}

You can enable cross-region backup either when [creating a backup manually](./create-snapshot) or when [scheduling automatic backups](./schedule-automatic-backups).

- **Manual backup:** If you choose cross-region backup during manual creation, all copied backups are permanently retained.

- **Scheduled backup:** If you choose cross-region backup during scheduled backups, you must configure a retention period for the copied backup file in each region.

<Admonition type="info" icon="📘" title="Notes">

<p>You can select regions only for the same cloud provider as the original region.</p>

</Admonition>

The following demo shows how to use cross-region backup when manually creating a backup. For details about how to use cross-region backup while scheduling automatic backups, refer to [Schedule Automatic Backups](./schedule-automatic-backups).

<Supademo id="cmgkg6um62deokrn973s89qfx?utm_source=link" title=""  />

In the [Jobs](./job-center) list, you will first see the original backup job. Once it completes, additional jobs appear for copying the backup file to each selected region, with one record per region.

## Billing implications\{#billing-implications}

When you choose cross-region backup, two types of charges may apply:

- **Storage cost:** Based on the region where the copied backup file is stored. To understand how storage cost is calculated, see [Storage Cost](./storage-cost).

- **Data transfer cost:** Based on the traffic between the source region and the target regions. To understand how storage cost is calculated, see [Data Transfer Cost](./data-transfer-cost).

For detailed rates, see [Pricing Guide](https://zilliz.com/pricing/pricing-guide).

### Example\{#example}

Suppose your cluster is deployed in **GCP us-west1 (Oregon)** and you need to copy the backup file of this cluster to two different regions, **GCP us-east4 (Virginia, USA)** and **GCP europe-west3 (Frankfurt)**:

- **Original Backup File Size**: 20 GB

- **Retention Period of Copied Backups**: 1 Month

- **Unit Price**: 

    - The unit price of backup storage on GCP is **&#36;0.02/GB per month**.

    - Data transfer from GCP us-west1 (Oregon) to GCP us-central1 (Iowa) is billed at the same-continent cross-region rate of **&#36;0.02/GB**.

    - Data transfer from GCP us-west1 (Oregon) to GCP europe-west3 (Frankfurt) is billed at the different-continent cross-region rate of **&#36;0.08/GB**.

The following is the cost calculation:

- **Storage cost:** `20 GB × $0.02/GB per month × 1 month × 2 copies = $0.80`

- **Data transfer cost:** `(20 GB × $0.02/GB) + (20 GB × $0.08/GB) = $2.00`

- **Total cost:** `$0.80 (storage) + $2.00 (data transfer) = $2.80`

