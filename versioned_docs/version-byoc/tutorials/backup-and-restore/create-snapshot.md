---
title: "Create Backup | BYOC"
slug: /create-snapshot
sidebar_label: "Create Backup"
beta: FALSE
notebook: FALSE
description: "Backups are point-of-time copies of a managed cluster or a specific collection on Zilliz Cloud. You can use it as a baseline for new clusters and collections or just for data backup. | BYOC"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - knn
  - Image Search
  - LLMs
  - Machine Learning

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Backup

Backups are point-of-time copies of a managed cluster or a specific collection on Zilliz Cloud. You can use it as a baseline for new clusters and collections or just for data backup.

Manually created backups are permanently retained on Zilliz Cloud, which means they will not be automatically deleted.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./organization-users) or [Project Admin](./project-users) role in the target organization.

## Create backup{#create-backup}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

You can create a backup file of your cluster or collection based on the following figure. Your cluster is still in service while Zilliz Cloud is creating the backup file.

![create-snapshot](/byoc/create-snapshot.png)

</TabItem>
<TabItem value="Bash">

You can create a backup for an entire cluster or a specific collection. For details on parameters, refer to [Create Backup](/reference/restful/create-backup-v2).

- Create a backup for an entire cluster.

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxx"
    
    curl --request POST \
         --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Content-Type: application/json" \
         --data-raw '{
                "backupType": "CLUSTER"
          }'
    ```

    Expected output:

    ```bash
    {
      "code": 0,
      "data": {
        "backupId": "backup0_c7b18539b97xxxx",
        "backupName": "Dedicated-01_backup2",
        "jobId": "job-031a8e3587ba7zqkadxxxx"
      }
    }
    ```

- Create a backup for a specific collection.

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxx"
    
    curl --request POST \
    --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "backupType": "COLLECTION",
        "dbCollections": [
            {
                "collectionNames": [
                    "medium_articles"
                ]
            }
        ]
    }'
    ```

    Expected output:

    ```bash
    {
      "code": 0,
      "data": {
        "backupId": "backup11_4adb19e3f9exxxx",
        "backupName": "medium_articles_bacxxxx",
        "jobId": "job-039dbc113c5ozfwunvxxxx"
      }
    }
    ```

</TabItem>
</Tabs>

A backup job will be generated. You can check the backup progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the backup is created successfully.

<Admonition type="info" icon="📘" title="Notes">

<p>Within the same cluster, only one manually created backup job can be in progress or pending at a time. You can manually create another backup file when the previously requested job is completed. </p>

</Admonition>

Please note that the time it takes to create a backup varies. For cluster backups, it depends on the size of the cluster and the size of the CUs accommodating the cluster. For example, a single-collection cluster holding over 120 million records of 128-dimensional vectors on a 4-CU instance takes approximately 5 minutes to create a backup file.

## Adjust backup file retention period{#adjust-backup-file-retention-period}

You can determine how long Zilliz Cloud keeps your backup file by setting **Retention Period** in days. Currently, the default retention period is 7 days, with a maximum of 30 days.

## Related topics{#related-topics}

- [Schedule Automatic Backups](./schedule-automatic-backups)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

