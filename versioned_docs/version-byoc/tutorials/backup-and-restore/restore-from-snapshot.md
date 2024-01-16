---
slug: /restore-from-snapshot
beta: FALSE
notebook: FALSE
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# Restore from Snapshot

This guide walks you through how to restore from a listed snapshot. You can only restore the snapshots in the **AVAILABLE** state.

To restore a snapshot, click **...** in the **Actions** column and select **Restore Cluster**.

Then you need to set certain attributes for the cluster to be restored from the snapshot.

![restore_cluster](/byoc/restore_cluster.png)

While setting these attributes, note that:

- You can restore from a snapshot to create a target cluster in a different project, but not in a different cloud region.

- You can choose to retain the load status of the collections in the target cluster.

- You can rename the target cluster and reset its size and password.

Once you click **Restore** in **Restore Database**, Zilliz Cloud will start creating the target cluster with the specified attributes and then restore the collections in the snapshot to the target cluster.

After the status of the target cluster changes from **CREATING** to **RESTORING**, a record appears in the **Restore History** list of the source cluster.

![restore_backups](/byoc/restore_backups.png)

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Delete Snapshot](./delete-snapshot) 

