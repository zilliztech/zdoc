---
title: "Restore from Backup Files | BYOC"
slug: /restore-from-snapshot
sidebar_label: "Restore from Backup Files"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The restore feature in Zilliz Cloud lets you recover data from backup files in cases of accidental loss, corruption, or system failure—ensuring business continuity. It is a reliable way to recover from incidents, revert unintended changes, or clone a cluster for testing with minimal disruption. | BYOC"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - restore
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Restore from Backup Files

The restore feature in Zilliz Cloud lets you recover data from backup files in cases of accidental loss, corruption, or system failure—ensuring business continuity. It is a reliable way to recover from incidents, revert unintended changes, or clone a cluster for testing with minimal disruption.

This guide walks you through how to restore a full or partial cluster from backup files.

## Limits\{#limits}

- **Access Control**: You must be a project admin, organization owner, or have a custom role with backup privileges.

## Restore a full cluster\{#restore-a-full-cluster}

You can restore an entire cluster—including all databases and collections—to a **new cluster**. This is useful for cloning environments for testing or recovery. To restore an entire cluster, the backup file must be a cluster backup.

During restoration, you may choose whether to include RBAC settings. 

<Admonition type="info" icon="📘" title="Notes">

<p>RBAC restoration is currently supported only via the web console; the RESTful API does not support it yet.</p>

</Admonition>

After the restore, **a new password** is generated for the `db_admin` user. Use this password to connect to the restored cluster.

### Via web console\{#via-web-console}

The following demo shows how to restore a full cluster on the Zilliz Cloud web console.

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### Via RESTful API\{#via-restful-api}

The following example restores a full cluster for an existing backup file to a new cluster named `Dedicated-01-backup`. For details about the RESTful API, see [Restore Cluster Backup](/reference/restful/restore-cluster-backup-v2).

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP"
      }'
```

The following is an example output. A restore job is generated and you can check the progress in the [project job center](./job-center).

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "username": "db_admin",
    "password": "xxxxxxxxx",
    "jobId": "job-xxxxxxxxxxxxxx"
  }
}
```

## Restore a partial cluster\{#restore-a-partial-cluster}

You can also select to only restore specific databases and collections to **an existing cluster**.

### Via web console\{#via-web-console}

The following demo shows how to restore specific databases and collections in a cluster on the Zilliz Cloud web console.

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### Via RESTful API\{#via-restful-api}

The following example restores a collection from backup file to an existing cluster `in01-3e5ad8adc38xxxx`. For details about the RESTful API, see [Restore Collection Backup](/reference/restful/restore-collection-backup-v2).

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "destClusterId": "in01-xxxxxxxxxxxxxx",
    "dbCollections": [
        {
            "collections": [
                {
                    "collectionName": "medium_articles",
                    "destCollectionName": "restore_medium_articles",
                    "destCollectionStatus": "LOADED"
                }
            ]
        }
    ]
}'
```

The following is an example output. A restore job is generated and you can check the progress in the [project job center](./job-center).

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

