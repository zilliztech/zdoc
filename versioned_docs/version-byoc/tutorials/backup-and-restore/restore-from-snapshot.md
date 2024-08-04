---
title: "Restore from Backup Files | BYOC"
slug: /restore-from-snapshot
sidebar_label: "Restore from Backup Files"
beta: FALSE
notebook: FALSE
description: "This guide walks you through how to restore clusters or collections from a listed backup file. You can only restore the backup files in the AVAILABLE state. | BYOC"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - restore

---

import Admonition from '@theme/Admonition';


# Restore from Backup Files

This guide walks you through how to restore clusters or collections from a listed backup file. You can only restore the backup files in the **AVAILABLE** state.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./user-roles) or [Project Owner](./user-roles) role in the target organization.

## Restore a cluster{#restore-a-cluster}

Navigate to the **Backups** page, locate your target backup file. If you need to restore a cluster, the type of the target backup file should be **Cluster**. Click **...** in the **Actions** column and select **Restore Cluster**.

Set the attributes for the cluster to be restored from the backup file.

![restore_collection](/byoc/restore_collection.png)

While setting these attributes, note that:

- You can restore from a backup file to create a target cluster in a different project, but not in a different cloud provider and region.

- You can choose to retain the load status of the collections in the target cluster.

- You can rename the target cluster and reset its CU size and password, but not its CU type.

Once you click **Restore**, Zilliz Cloud will start creating the target cluster with the specified attributes and then restore the collections in the backup file to the target cluster. A new restoration job will be generated. You can check the cluster restoration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the restoration is complete.

## Restore a collection{#restore-a-collection}

Navigate to the **Backups** page, locate your target backup file. If you need to restore a collection, the type of the target backup file should be **Collection**. Click **...** in the **Actions** column and select **Restore Collection**.

Set the attributes for the collection to be restored from the backup file.

![restore_collection](/byoc/restore_collection.png)

While setting these attributes, note that:

- You can restore from a backup file to create a target collection in a different project and a different running cluster.

- You can choose to load or unload the target collection.

- You can rename the target collection.

Once you click **Restore**, Zilliz Cloud will start creating the target collection with the specified attributes. A new restoration job will be generated. You can check the collection restoration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the restoration is complete.

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Delete Snapshot](./delete-snapshot) 

