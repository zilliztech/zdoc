---
slug: /docs/use-recycle-bin
beta: FALSE
notebook: FALSE
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# Use Recycle Bin

Zilliz Cloud's Recycle Bin feature safeguards your data by keeping a record of every cluster that has been dropped, whether intentionally or as a result of trial expiration or service suspension. If you have changed your mind or dropped a cluster by mistake, the recycle bin offers a 30-day grace period for cluster restoration.

## Prerequisites{#prerequisites}

To restore a cluster in the recycle bin, you need to [add a payment method](https://docs.zilliz.com/docs/payment-billing). 

## Restore a dropped cluster in the recycle bin{#restore-a-dropped-cluster-in-the-recycle-bin}

1. Navigate to the organization the dropped cluster belongs to.

1. Access the **Recycle Bin** via the left navigation menu or the top navigation icon.

1. Locate the cluster to restore. From the **Actions** dropdown, select **Restore Cluster**.

1. Configure the restored cluster.
    1. You can restore the cluster to a different project under this organization, but not in a different cloud region.

    1. You can choose to retain the load status of the collections in the cluster.

    1. You can rename the cluster and reset its size and password for connection.  

1. Click **Restore**. Zilliz Cloud will start creating the cluster with the specified attributes and restore your data to the created cluster.

<Admonition type="info" icon="📘" title="Notes">

During restoration, the status of your cluster will change from **CREATING** to **RESTORING** and finally **RUNNING**. When the cluster is running, all your deleted data are restored.

</Admonition>

![recycle_bin](/img/recycle_bin.png)

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot) 

- [Schedule Automatic Backups](./schedule-automatic-backups) 

- [View Snapshot Details](./view-snapshot-details) 

- [Restore from Snapshot](./restore-from-snapshot) 
