---
slug: /schedule-automatic-backups
beta: FALSE
notebook: FALSE
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Schedule Automatic Backups

Zilliz Cloud allows you to enable automatic snapshots for your clusters, ensuring data recovery in case of unexpected mishaps. Regular snapshots prevent data loss and allow easy recovery to a specific point in time, giving you more control over data backups.

## Create snapshot schedule{#create-snapshot-schedule}

To create a snapshot schedule, follow these steps:

1. Go to the **Backups** tab of your cluster and click on **Snapshot Schedule**.

1. In the **Edit Snapshot Schedule** dialog box that appears, switch on **Schedule Automated Snapshots**.

1. Set the **Frequency**, **Backup Retention Period**, and the time window for automatic backups.

![create-snapshot-schedule](/img/create-snapshot-schedule.png)

## Adjust snapshot schedule settings{#adjust-snapshot-schedule-settings}

The snapshot schedule settings are cluster-specific and disabled by default. Since there is a cost for storing snapshots, you can determine when and how Zilliz Cloud creates snapshots on your behalf.

The default setting configures that Zilliz Cloud automatically creates a snapshot for your cluster every day (**Frequency**) between 8 a.m. and 10 a.m. (**Time Period**), and keeps the snapshot for 7 days (**Retention Period**). Change the settings as you see fit.

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

