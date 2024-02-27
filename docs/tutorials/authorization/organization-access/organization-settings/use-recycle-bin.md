---
slug: /use-recycle-bin
beta: FALSE
notebook: FALSE
type: origin
token: Tr5lwpgrCiETZzkaFSYcBTDjnlz
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# Use Recycle Bin

Zilliz Cloud's Recycle Bin feature safeguards your data by keeping a record of every cluster that has been dropped, whether intentionally or as a result of trial expiration or service suspension. If you have changed your mind or dropped a cluster by mistake, the recycle bin offers a 30-day grace period for cluster restoration.

## Prerequisites{#prerequisites}

To restore a cluster in the recycle bin, you need to [add a payment method](/docs/payment-billing). 

## Restore a dropped cluster in the recycle bin{#restore-a-dropped-cluster-in-the-recycle-bin}

1. Navigate to the organization the dropped cluster belongs to.

1. Access the __Recycle Bin__ via the left navigation menu or the top navigation icon.

1. Locate the cluster to restore. From the __Actions__ dropdown, select __Restore Cluster__.

1. Configure the restored cluster.

    1. You can restore the cluster to a different project under this organization, but not in a different cloud region.

    1. You can choose to retain the load status of the collections in the cluster.

    1. You can rename the cluster and reset its size and password for connection.

1. Click __Restore__. Zilliz Cloud will start creating the cluster with the specified attributes and restore your data to the created cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>During restoration, the status of your cluster will change from <strong>CREATING</strong> to <strong>RESTORING</strong> and finally <strong>RUNNING</strong>. When the cluster is running, all your deleted data are restored.</p>

</Admonition>

![recycle_bin](/img/recycle_bin.png)

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot) 

