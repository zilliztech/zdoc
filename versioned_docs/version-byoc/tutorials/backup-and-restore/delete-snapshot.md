---
title: "Delete Backup File | BYOC"
slug: /delete-snapshot
sidebar_label: "Delete Backup File"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud supports creating backups either manually or automatically. | BYOC"
type: origin
token: SPTewoNSwiQe6MkBLjMcilNynOg
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - delete

---

import Admonition from '@theme/Admonition';


# Delete Backup File

Zilliz Cloud supports creating backups either manually or automatically. 

For manually created backup files, Zilliz Cloud permanently retains them. Dropping a cluster will not remove the manually created backup files. Therefore, you can only manually delete them when they are no longer needed.

For automatically created backup files, Zilliz Cloud automatically removes them when they reach the end of their retention period or the corresponding cluster is dropped . However, you have the option to manually delete each auto-created backup file before then.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./user-roles) or [Project Owner](./user-roles) role in the target organization.

## Procedures{#procedures}

![delete_backups](/byoc/delete_backups.png)

You will be prompted to verify your request to delete a backup file before Zilliz Cloud actually performs the deletion.

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot) 

