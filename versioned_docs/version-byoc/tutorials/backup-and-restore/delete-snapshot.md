---
title: "Delete Backup File | BYOC"
slug: /delete-snapshot
sidebar_label: "Delete Backup File"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud supports creating backups either manually or automatically. | BYOC"
type: origin
token: SPTewoNSwiQe6MkBLjMcilNynOg
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - delete
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete Backup File

Zilliz Cloud supports creating backups either manually or automatically. 

For manually created backup files, Zilliz Cloud permanently retains them. Dropping a cluster will not remove the manually created backup files. Therefore, you can only manually delete them when they are no longer needed.

For automatically created backup files, Zilliz Cloud automatically removes them when they reach the end of their retention period or the corresponding cluster is dropped . However, you have the option to manually delete each auto-created backup file before then.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./organization-users) or [Project Admin](./project-users) role in the target organization.

## Procedures{#procedures}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

![delete_backups](/byoc/delete_backups.png)

You will be prompted to verify your request to delete a backup file before Zilliz Cloud actually performs the deletion.

</TabItem>
<TabItem value="Bash">

Delete a backup file. For details on parameters, refer to [Delete Backup](/reference/restful/delete-backup-v2).

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

Expected output:

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup11_dbf5a40a6e5xxxx",
    "backupName": "medium_articles_backup4"
  }
}
```

</TabItem>
</Tabs>

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot) 

