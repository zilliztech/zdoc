---
slug: /create-snapshot
beta: FALSE
notebook: FALSE
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup

---

import Admonition from '@theme/Admonition';


# Create Backup

Backups are point-of-time copies of a managed cluster or a specific collection on Zilliz Cloud. You can use it as a baseline for new clusters and collections or just for data backup.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./user-roles) or [Project Owner](./user-roles) role in the target organization.

- Your cluster runs on the **Dedicated** tier.

<Admonition type="info" icon="📘" title="Notes">

<p>Backups are available only to the <strong>Dedicated</strong> clusters. If your cluster runs on the <strong>Free</strong>, <a href="./manage-cluster#upgrade-plan">upgrade</a> it first. If your cluster runs on the <strong>Serverless</strong> tier, <a href="./migrate-between-clusters#from-serverless-to-dedicated-cluster">migrate</a> it to a dedicated cluster first. Creating backups may incur charges. For more information about backup cost, please refer to <a href="./understand-cost#backup-costs">Understand Cost</a>.</p>

</Admonition>

## Create backup{#create-backup}

You can create a backup file of your cluster or collection based on the following figure. Your cluster is still in service while Zilliz Cloud is creating the backup file.

![create-snapshot](/img/create-snapshot.png)

A backup job will be generated. You can check the backup progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the backup is created successfully.

<Admonition type="info" icon="📘" title="Notes">

<p>Within the same cluster, only one manually created backup job can be in progress or pending at a time. You can manually create another backup file when the previously requested job is completed. </p>

</Admonition>

Please note that the time it takes to create a backup varies. For cluster backups, it depends on the size of the cluster and the size of the CUs accommodating the cluster. For example, a single-collection cluster holding over 120 million records of 128-dimensional vectors on a 4-CU instance takes approximately 5 minutes to create a backup file.

## Related topics{#related-topics}

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

