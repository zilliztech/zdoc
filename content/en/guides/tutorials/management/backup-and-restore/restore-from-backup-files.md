---
title: "Restore from Backup Files | Cloud"
slug: /restore-from-backup-files
sidebar_label: "Restore from Backup Files"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The restore feature in Zilliz Cloud lets you recover data from backup files in cases of accidental loss, corruption, or system failure—ensuring business continuity. It is a reliable way to recover from incidents, revert unintended changes, or clone a cluster for testing with minimal disruption. | Cloud"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Restore from Backup Files

The restore feature in Zilliz Cloud lets you recover data from backup files in cases of accidental loss, corruption, or system failure—ensuring business continuity. It is a reliable way to recover from incidents, revert unintended changes, or clone a cluster for testing with minimal disruption.

This guide walks you through how to restore a full or partial cluster from backup files.

<Admonition type="info" title="Notes">

This feature is available only to **Dedicated** clusters.

</Admonition>

## Limits\{#limits}

- **Access Control**: You must be a project admin, organization owner, or have a custom role with backup privileges.

## Restore a full cluster\{#restore-a-full-cluster}

You can restore an entire cluster, including all databases and collections, to a **new** cluster. This is useful for cloning environments for testing or recovery. To restore an entire cluster, the backup file must be a cluster backup.

During restoration, you may also configure the followings:

- Choose whether to include RBAC settings.

- Select the Milvus version of the restored new cluster.

    <NextChannel action="include">

    - Available options depend on the backup, the source cluster’s region, and backup and feature compatibility. Options may include a stable (GA) version, a public preview version, or the original version recorded in the backup.

    - The original version is available only if the backup is within the supported restore window and meets compatibility requirements.

    </NextChannel>

    <NextChannel action="exclude">

    </NextChannel>

- Select whether to enable encryption at rest with CMEK. For details, see [Customer-Managed Encryption Keys](./cmek).

After the restore, **a new password** is generated for the `db_admin` user. Use this password to connect to the restored cluster.

### Via web console\{#via-web-console}

The following demo shows how to restore a full cluster on the Zilliz Cloud web console.

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

<Procedures>

1. Navigate to your target project.

1. Click on **Backups** in the left navigation.

1. Find the cluster backup file you wish to restore and click on **...** under **Actions**.

1. Click on **Restore** and then select **Full Cluster**.

1. Configure the settings, including the Milvus version of the restored cluster, and click on **Restore**. Available versions depend on the backup and compatibility requirements.

</Procedures>

### Via RESTful API\{#via-restful-api}

The following example restores a full cluster for an existing backup file to a new cluster named `Dedicated-01-backup`. For details about the RESTful API, see [Restore Cluster Backup](/reference/restful/restore-cluster-backup-v2).

```bash
export API_KEY="YOUR_API_KEY"
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="your-cluster-id"
export BACKUP_ID="your-backup-id"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "projectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP",
        "restoreVersionPolicy": "ORIGINAL"
      }'
```

The following table explains the parameters.

<table>
   <tr>
     <th><p><strong>Parameter</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><code>projectId</code></p></td>
     <td><p>ID of the target project where the restored cluster will be created.</p></td>
   </tr>
   <tr>
     <td><p><code>clusterName</code></p></td>
     <td><p>Name of the restored cluster.</p></td>
   </tr>
   <tr>
     <td><p><code>cuSize</code></p></td>
     <td><p>Query CU size of the restored cluster.</p></td>
   </tr>
   <tr>
     <td><p><code>collectionStatus</code></p></td>
     <td><p>Whether to keep the collection load status after restore. Available options include:</p><ul><li><p><code>KEEP</code>: keeps the original collection status.</p></li><li><p><code>RELEASE</code>: releases all collections</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>restoreVersionPolicy</code></p></td>
     <td><p>The compatible Milvus version of the restored cluster. Available options include:</p><ul><li><p><code>ORIGINAL</code>: restores the cluster to its original compatible Milvus version.</p></li><li><p><code>LATEST</code>: restores the cluster to the latest GA Milvus version available.</p></li></ul> <NextChannel action="include"><p>Mutually exclusive with <code>version</code>. To select a specific Milvus version, see <a href="./restore-from-backup-files#restore-with-a-specific-milvus-version">Restore with a specific Milvus version</a> below.</p> </NextChannel></td>
   </tr>
</table>

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

<NextChannel action="include">

#### Restore with a specific Milvus version\{#restore-with-a-specific-milvus-version}

To restore a cluster with a specific Milvus version, first retrieve the available version options for the backup.

```bash
curl --request GET \
     --url "${BASE_URL}/v2/clusters/versions?backupId=${BACKUP_ID}" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json"
```

Select an option from the returned `versions` list, then include it as the `version` object in your restore request. For example, if the response includes the following option:

```json
{
  "majorVersion": "2.6",
  "channel": "ORIGIN"
}
```

Replace `restoreVersionPolicy` in the preceding restore request with:

```bash
"version": {
  "majorVersion": "2.6",
  "channel": "ORIGIN"
}
```

The `ORIGIN` channel restores the exact Milvus version recorded in the backup. Other available channels include `GA` and `PUBLIC_PREVIEW`. Use only an option returned for the backup you are restoring.

<Admonition type="info" title="Notes">

- `version` and `restoreVersionPolicy` are mutually exclusive. Do not include both in the same request.

- If you omit `version`, the existing restore policy applies.

- Use an SDK version compatible with the restored cluster’s Milvus version. For details, see [SDK Compatibility](/docs/install-sdks#sdk-compatibility).

</Admonition>

</NextChannel>

## Restore a partial cluster\{#restore-a-partial-cluster}

You can also select to only restore specific databases and collections to **an existing cluster**.

### Via web console\{#via-web-console}

The following demo shows how to restore specific databases and collections in a cluster on the Zilliz Cloud web console.

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

<Procedures>

1. Navigate to your target project.

1. Click on **Backups** in the left navigation.

1. Find the collection backup file you wish to restore and click on **...** under **Actions**.

1. Click on **Restore** **Collection**.

1. Configure the collections you wish to restore and click on **Restore**.

</Procedures>

### Via RESTful API\{#via-restful-api}

The following example restores a collection from backup file to an existing cluster `inxx-xxxxxxxxxxxxxxx`. For details about the RESTful API, see [Restore Collection Backup](/reference/restful/restore-collection-backup-v2).

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "destClusterId": "inxx-xxxxxxxxxxxxxxx",
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

## Restore from an encrypted backup file\{#restore-from-an-encrypted-backup-file}

When you restore an encrypted backup to a new cluster, Zilliz Cloud will use the KMS key associated with the backup file to decrypt the data before restoration. Therefore, you can restore the backup to a new cluster with or without encryption. 

<Admonition type="info" title="Notes">

This feature is available only to **Dedicated** clusters in a **Business Critical** project.

</Admonition>

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

The restoration procedure from an encrypted backup is almost the same as a normal restoration, except for whether to enable **Encryption at Rest with CMEK**.

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- When this option is enabled, the cluster created after the restoration is encrypted using the KMS key specified below.

- When this option is disabled, the cluster created after the restoration is unencrypted.

## FAQ\{#faq}

**What Milvus version will a restored cluster run?**

<NextChannel action="include">

The restored cluster’s Milvus version depends on the restore policy or explicit version selection. To select a specific version through the API, query the available options for your backup and include the selected option in your restore request. For details, see [Restore a full cluster](./restore-from-backup-files#restore-a-full-cluster).

</NextChannel>

<NextChannel action="exclude">

By default, a full-cluster restore creates the target cluster with the latest GA major version supported by Zilliz Cloud.

- For backup files created within the last 30 days, if the original cluster used an earlier Milvus GA version than the latest available GA version, you can choose the Milvus version for the restored cluster. By default, Zilliz Cloud restores the cluster to the latest GA Milvus version.

- For backup files created more than 30 days ago, or backup files already using the latest Milvus GA version, the target Milvus version cannot be changed.

For example, suppose the latest available Milvus GA version is 2.6.x.

- If you restore from a 2.5.x backup file created within the last 30 days, Zilliz Cloud restores the new cluster to 2.6.x by default, but you can choose to restore it to 2.5.x.

- If you restore from a 2.5.x backup file created more than 30 days ago, Zilliz Cloud restores the new cluster to 2.6.x by default, and you cannot change the target Milvus version.

- If you restore from a 2.6.x backup file, Zilliz Cloud restores the new cluster to 2.6.x, and you cannot change the target Milvus version.

</NextChannel>

