---
title: "View Backup Files | Cloud"
slug: /view-snapshot-details
sidebar_label: "View Backup Files"
beta: FALSE
notebook: FALSE
description: "This guide walks you through how to view automatically or manually created backup files. | Cloud"
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
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# View Backup Files

This guide walks you through how to view automatically or manually created backup files.

## View all backup files{#view-all-backup-files}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view_all_backups](/img/view_all_backups.png)

</TabItem>
<TabItem value="Bash">

List backup files created for a cluster. For details on parameters, refer to [List Backups](/reference/restful/list-backups-v2).

```bash
curl --request GET \
     --url "${BASE_URL}/v2/backups" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

Expected output:

```bash
{
  "code": 0,
  "data": {
    "count": 10,
    "currentPage": 1,
    "pageSize": 10,
    "backups": [
      {
        "backupId": "backup1_0b9d15a0ddexxxx",
        "projectId": "proj-20e13e974c7d659a83xxxx",
        "backupName": "Dedicated-01_backup3",
        "backupType": "CLUSTER",
        "creationMethod": "AUTO",
        "status": "CREATING",
        "size": 0,
        "expireTime": "2024-09-02T02:27:51Z",
        "clusterId": "in01-3e5ad8adc38xxxx",
        "clusterName": "Dedicated-01",
        "createTime": "2024-08-26T02:27:51Z"
      },
      ...
    ]
  }
}
```

</TabItem>
</Tabs>

## View backup file details{#view-backup-file-details}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view_snapshot_details](/img/view_snapshot_details.png)

</TabItem>
<TabItem value="Bash">

View the details of a specific backup file. For details on parameters, refer to [Describe Backup](/reference/restful/describe-backup-v2).

```bash
curl --request GET \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

Expected output:

```bash
{
  "code": 0,
  "data": {
    "clusterId": "in01-3e5ad8adc38xxxx",
    "clusterName": "Dedicated-01",
    "regionId": "aws-us-west-2",
    "projectId": "proj-20e13e974c7d659a83xxxx",
    "backupId": "backup1_0b9d15a0ddexxxx",
    "backupName": "Dedicated-01_backup3",
    "backupType": "CLUSTER",
    "creationMethod": "AUTO",
    "status": "AVAILABLE",
    "size": 0,
    "collections": [],
    "createTime": "2024-08-26T02:27:51Z",
    "expireTime": "2024-09-02T02:27:51Z"
  }
}
```

</TabItem>
</Tabs>

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

