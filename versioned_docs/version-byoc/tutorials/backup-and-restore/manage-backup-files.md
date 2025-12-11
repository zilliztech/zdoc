---
title: "Manage Backup Files | BYOC"
slug: /manage-backup-files
sidebar_label: "Manage Backup Files"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide walks you through how to view, rename, and delete existing backup files. | BYOC"
type: origin
token: Ml6dwBPTfiQOY9koK24cT1Sznge
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - manage
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage Backup Files

This guide walks you through how to view, rename, and delete existing backup files.

## Limits\{#limits}

- **Access Control**: You must be a project admin, organization owner, or have a custom role with backup privileges.

## View backup files\{#view-backup-files}

You can view a list of all backup files—either completed or in progress—and inspect their details.

### Via web console\{#via-web-console}

To view all backups files and their details on the Zilliz Cloud web console, click on "Backups" in the left navigation.

![Cdf2b3by2o6SlOxUhKXcbMrMnth](https://zdoc-images.s3.us-west-2.amazonaws.com/cdf2b3by2o6sloxuhkxcbmrmnth.png "Cdf2b3by2o6SlOxUhKXcbMrMnth")

### Via RESTful API\{#via-restful-api}

- View all backup files

    The following example lists all backup files in the current organization, as neither project ID nor cluster ID is specified. To view backups for a specific project or cluster, include the corresponding project ID or cluster ID in your request. For details about the RESTful API, see [List Backups](/reference/restful/list-backups-v2).

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/backups" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

The following is an example output.

- View details of a backup file

    The following example checks the details of a backup files. For details about the RESTful API, see [Describe Backup](/reference/restful/describe-backup-v2).

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    The following is an example output.

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

## Rename backup files\{#rename-backup-files}

Currently, renaming backup files is supported only via the web console.

The following demo shows how to rename a backup file on the Zilliz Cloud web console.

<Supademo id="cmcsspyv70hpq9st8rz5ro3qa" title=""  />

## Delete backup files\{#delete-backup-files}

Zilliz Cloud handles deletion differently based on how the backup was created:

- **Manual backups** are retained permanently, even if the cluster is deleted. To reduce costs, it is recommended to manually delete backups when they are no longer needed.

- **Automatic backups** are deleted automatically after their retention period ends or when the associated cluster is deleted. You can also delete them manually at any time.

### Via web console\{#via-web-console}

The following demo shows how to delete a back file on the Zilliz Cloud web console.

<Supademo id="cmcst9z5t0ics9st8bbvsrqkk" title=""  />

### Via RESTful API\{#via-restful-api}

The following example deletes a backup file. For details about the RESTful API, see [Delete Backup](/reference/restful/delete-backup-v2).

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

The following is an example output.

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup11_dbf5a40a6e5xxxx",
    "backupName": "medium_articles_backup4"
  }
}
```

