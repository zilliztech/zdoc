---
title: "Create Backup | BYOC"
slug: /create-snapshot
sidebar_label: "Create Backup"
beta: FALSE
notebook: FALSE
description: "Backups are point-of-time copies of a managed cluster or a specific collection on Zilliz Cloud. You can use it as a baseline for new clusters and collections or just for data backup. | BYOC"
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

Manually created backups are permanently retained on Zilliz Cloud, which means they will not be automatically deleted.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./user-roles) or [Project Owner](./user-roles) role in the target organization.

## Create backup{#create-backup}

You can create a backup file of your cluster or collection based on the following figure. Your cluster is still in service while Zilliz Cloud is creating the backup file.

![create-snapshot](/byoc/create-snapshot.png)

A backup job will be generated. You can check the backup progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the backup is created successfully.

<Admonition type="info" icon="📘" title="Notes">

<p>Within the same cluster, only one manually created backup job can be in progress or pending at a time. You can manually create another backup file when the previously requested job is completed. </p>

</Admonition>

Please note that the time it takes to create a backup varies. For cluster backups, it depends on the size of the cluster and the size of the CUs accommodating the cluster. For example, a single-collection cluster holding over 120 million records of 128-dimensional vectors on a 4-CU instance takes approximately 5 minutes to create a backup file.

## Adjust backup file retention period{#adjust-backup-file-retention-period}

You can determine how long Zilliz Cloud keeps your backup file by setting **Retention Period** in days. Currently, the default retention period is 7 days, with a maximum of 30 days.

## Related topics{#related-topics}

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

