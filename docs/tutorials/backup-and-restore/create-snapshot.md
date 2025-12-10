---
title: "Create Backup | Cloud"
slug: /create-snapshot
sidebar_label: "Create Backup"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, a backup is a copy of the data that allows you to restore the entire cluster or specific collections in the event of data loss or system failure. | Cloud"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - LLMs
  - Machine Learning
  - RAG
  - NLP

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create Backup

In Zilliz Cloud, a backup is a copy of the data that allows you to restore the entire cluster or specific collections in the event of data loss or system failure.

Backup creation incurs additional [charges](./storage-cost), with pricing based on the cloud region where the backup is stored. All backup files are stored in the same cloud region as the source cluster. For example, a cluster in `AWS us-west-2` will have its backups stored in `AWS us-west-2`.

This guide explains how to **manually create backups**. To automate backup creation, see [Schedule Automatic Backups](./schedule-automatic-backups).

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Limits\{#limits}

- **Access control**: You must be a **project admin**, **organization owner**, or have a **custom role** with backup privileges.

- **Excluded from backup**:

    - Collection TTL settings

    - Password for the default user `db_admin` (a new password is generated during [restore](./restore-from-snapshot))

    - Cluster dynamic and scheduled scaling settings

- **Cluster shard settings**: Backed up but may be adjusted during restore if the cluster CU size is reduced, due to shard-per-CU limits. See [Zilliz Cloud Limits](./limits#shards) for details.

- **Backup job restrictions**:

    - Only **one manual backup** can be active or pending at a time.

    - If **automatic backups** are enabled:

        - Manual backups cannot start while an automatic backup is in progress.

        - Automatic backups will still run if a manual backup is already in progress.

## Create cluster backup\{#create-cluster-backup}

You can create a backup of an entire cluster and later restore either the whole cluster or selected collections. If you need to copy your backup file to other cloud regions for disaster recover, you can configure the copy policies while creating a backup. For details, refer to [Copy To Other Regions](./backup-to-other-regions).

### Via web console\{#via-web-console}

The following demo shows how to create a cluster backup on the Zilliz Cloud web console.

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### Via RESTful API\{#via-restful-api}

The following example creates a backup for the cluster `in01-xxxxxxxxxxxxxx`. For details about the RESTful API, see [Create Backup](/reference/restful/create-backup-v2).

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Content-Type: application/json" \
     --data-raw '{
            "backupType": "CLUSTER"
      }'
```

The following is an example output. A backup job is generated and you can check the progress in the [project job center](./job-center).

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

## Create collection backup\{#create-collection-backup}

To back up a specific collection or a subset of collections in a cluster, create a collection-level backup. If you need to copy your backup file to other cloud regions for disaster recover, you can configure the copy policies while creating a backup. For details, refer to [Copy To Other Regions](./backup-to-other-regions).

### Via web console\{#via-web-console}

The following demo shows how to create a collection backup on the web console.

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### Via RESTful API\{#via-restful-api}

The following example creates a backup for the collection `medium_articles` in the cluster `in01-xxxxxxxxxxxxxx`. For details about the RESTful API, see [Create Backup](/reference/restful/create-backup-v2).

```bash
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

The following is an example output. A backup job is generated and you can check the progress in the [project job center](./job-center).

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

## FAQs\{#faqs}

**How long does a backup job take?**

Backup duration depends on the size of your data. As a reference, backing up 700 MB typically takes about 1 second. If your cluster contains more than 1,000 collections, the process may take slightly longer.

**Can I perform DDL (Data Definition Language) operations during a backup?**

It is recommended to avoid major DDL (Data Definition Language) operations—such as creating or dropping collections—while a backup is in progress, as they may interfere with the process or lead to inconsistent results.

**Will backup files be deleted if the original cluster is dropped?**

This depends on the creation method of the backup file. All [automatic backups](./schedule-automatic-backups) are deleted along with the original cluster. But manual cluster backups are retained permanently and will not be deleted when the cluster is deleted. You must delete them manually if no longer needed.

