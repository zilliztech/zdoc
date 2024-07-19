---
slug: /schedule-automatic-backups
beta: FALSE
notebook: FALSE
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - automatic

---

import Admonition from '@theme/Admonition';


# Schedule Automatic Backups

Zilliz Cloud allows you to enable automatic backups for your clusters, ensuring data recovery in case of unexpected mishaps. Regular backup prevent data loss and allow easy recovery to a specific point in time, giving you more control over your data.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./user-roles) or [Project Owner](./user-roles) role in the target organization.

- Your cluster runs on the **Dedicated** tier.

## Create backup schedule{#create-backup-schedule}

To create a backup schedule, follow these steps:

1. Go to the **Backups** tab of your cluster and click on **Backup Schedule**.

1. In the **Edit Backup Schedule** dialog box that appears, switch on **Schedule Automated Backup**.

1. Set the **Frequency**, **Backup Retention Period**, and the time window for automatic backups.

![create-snapshot-schedule](/img/create-snapshot-schedule.png)

<Admonition type="info" icon="📘" title="Notes">

<p>For more information about backup cost, please refer to <a href="./understand-cost#backup-costs">Understand Cost</a>.</p>

</Admonition>

## Adjust automated backup schedule{#adjust-automated-backup-schedule}

The automated backup schedule settings are cluster-specific and disabled by default. Since there is a [cost](./understand-cost#backup-costs) for storing backup files, you can determine when and how Zilliz Cloud creates backup files on your behalf.

The default setting configures that Zilliz Cloud automatically creates a backup file for your cluster every day (**Frequency**) between 8 a.m. and 10 a.m. (**Time Period**), and keeps the backup file for 7 days (**Retention Period**). Change the settings as you see fit.

<Admonition type="info" icon="📘" title="Notes">

<p>The maximum retention period for automatically created backups is 30 days.</p>

</Admonition>

## Delete automatically created backup file{#delete-automatically-created-backup-file}

Dropping a cluster will remove all auto-created backup files of this cluster. Also, the auto-created backup files are removed when they reach the end of their retention period. If you need to manually delete auto-created backup files, refer to [Delete Backup File](./delete-snapshot).

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

