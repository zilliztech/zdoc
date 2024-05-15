---
slug: /create-snapshot
beta: FALSE
notebook: FALSE
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1

---

import Admonition from '@theme/Admonition';


# Create Snapshot

Snapshots are point-of-time backup copies of a managed cluster on Zilliz Cloud. You can use it as a baseline for new clusters or just for data backup.

## Create snapshot{#create-snapshot}

Snapshots occur asynchronously and the time it takes to take varies depending on the size of the cluster and the size of the CUs accommodating the cluster. For example, a single-collection cluster holding over 120 million records of 128-dimensional vectors on a 4-CU instance takes approximately 5 minutes to create a snapshot.

You can take a snapshot of your cluster based on the following figure. Your cluster is still in service while Zilliz Cloud is taking the snapshot.

![create-snapshot](/byoc/create-snapshot.png)

## Adjust snapshot retention period{#adjust-snapshot-retention-period}

You can determine how long Zilliz Cloud keeps your snapshot by setting **Retention Period** in days. Currently, the default retention period is 7 days, with a maximum of 30 days.

## Related topics{#related-topics}

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

