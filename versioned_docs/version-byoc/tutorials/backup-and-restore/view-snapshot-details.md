---
slug: /view-snapshot-details
beta: FALSE
notebook: FALSE
type: origin
token: Fob2w8LZaifGSHkxjoZcHcTtngf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - files
  - view

---

import Admonition from '@theme/Admonition';


# View Backup Files

This guide walks you through how to view automatically or manually created backup files.

## Backup file status{#backup-file-status}

The status of a backup file can vary, and the possible statuses are as follows:

- **CREATING**

    If a backup file is in this status, you cannot create another one within the same cluster. However, you go to the [Jobs](./job-center) page can click **...** in the **Actions** column and choose **Cancel** to [terminate the process](./job-center#cancel-job).

- **AVAILABLE**

    After the status changes to this, you can click **...** in the Actions column to

If the status of your backup file is neither of the two, errors may occur. Please try again. If you continue to experience errors, please contact us without hesitation.

## View all backup files{#view-all-backup-files}

![view_all_backups](/byoc/view_all_backups.png)

## View backup file details{#view-backup-file-details}

![view_snapshot_details](/byoc/view_snapshot_details.png)

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

