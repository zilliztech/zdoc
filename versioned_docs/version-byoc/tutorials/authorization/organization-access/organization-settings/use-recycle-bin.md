---
title: "Use Recycle Bin | BYOC"
slug: /use-recycle-bin
sidebar_label: "Use Recycle Bin"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud's Recycle Bin feature safeguards your data by keeping a record of every cluster that has been dropped, whether intentionally or as a result of trial expiration or service suspension. If you have changed your mind or dropped a cluster by mistake, the recycle bin offers a 30-day grace period for cluster restoration. | BYOC"
type: origin
token: Tr5lwpgrCiETZzkaFSYcBTDjnlz
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - recycle bin

---

import Admonition from '@theme/Admonition';


# Use Recycle Bin

Zilliz Cloud's Recycle Bin feature safeguards your data by keeping a record of every cluster that has been dropped, whether intentionally or as a result of trial expiration or service suspension. If you have changed your mind or dropped a cluster by mistake, the recycle bin offers a 30-day grace period for cluster restoration.

## Restore a dropped cluster in the recycle bin{#restore-a-dropped-cluster-in-the-recycle-bin}

1. Navigate to the organization the dropped cluster belongs to.

1. Access the **Recycle Bin** via the left navigation menu or the top navigation icon.

1. Locate the cluster to restore. From the **Actions** dropdown, select **Restore Cluster**.

1. Configure the restored cluster.

    1. You can restore the cluster to a different project under this organization, but not in a different cloud region.

    1. You can rename the cluster and reset its size and password for connection.

    1. 

    <Admonition type="info" icon="📘" title="Notes">

    <p>The load status of the collections in the cluster will be retained.</p>

    </Admonition>

1. Click **Restore**. Zilliz Cloud will start creating the cluster with the specified attributes and restore your data to the created cluster.

1. A new restoration job will be generated. You can check the cluster restoration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the restoration is complete.

![byoc-use-recycle-bin](/byoc/byoc-use-recycle-bin.png)

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot) 

