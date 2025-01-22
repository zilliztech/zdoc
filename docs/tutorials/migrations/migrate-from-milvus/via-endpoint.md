---
title: "Migrate from Milvus to Zilliz Cloud Via Endpoint | Cloud"
slug: /via-endpoint
sidebar_label: "Via Endpoint"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers Milvus as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. To enable smooth migration, you can migrate data from Milvus to Zilliz Cloud in these ways - connecting to source Milvus via database endpoint or uploading backup files directly. | Cloud"
type: origin
token: PlX3wo82Di6oWVkg2ercRWCUnvV
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - endpoint
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db

---

import Admonition from '@theme/Admonition';


# Migrate from Milvus to Zilliz Cloud Via Endpoint

Zilliz Cloud offers [Milvus](https://milvus.io/) as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. To enable smooth migration, you can migrate data from Milvus to Zilliz Cloud in these ways - connecting to source Milvus via database endpoint or uploading backup files directly.

This topic describes how to migrate from Milvus via database endpoint. For information on how to upload backup files, refer to [Via Backup Files](./via-backup-files).

## Considerations{#considerations}

- Each migration task is limited to a single source Milvus database. If you have data in multiple source databases, you can set up separate migration jobs for each one.

- During the migration process, Zilliz Cloud will replicate the exact collection schema from the source Milvus collection. Modifying the schema is not allowed while the migration is in progress.

## Before you start{#before-you-start}

- The source Milvus instance is running version 2.3.6 or later and is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- If authentication has been enabled for the source Milvus, make sure you have obtained necessary connection credentials. For details, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access).

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from Milvus via database endpoint{#migrate-from-milvus-via-database-endpoint}

You can migrate one or more collections from a single Milvus database at a time.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **Milvus** > **Via Endpoint**.

1. In the **Database Endpoint** field of the **Connect to Data Source** step, enter the server address of the source Milvus. If [authentication](https://milvus.io/docs/authenticate.md) has been enabled for the source Milvus, enter **Username** and **Password** as access credentials. Then, click **Next**.

1. In the **Select Source and Target** step, configure settings for the source Milvus and target Zilliz Cloud cluster. Then, click **Next**.

1. In the **Configure Schema** step,

    1. Review the target collections and their field settings in the schema preview.

    1. In **Advanced Settings**, verify **Dynamic Field** and **Partition Key** settings, which inherits the settings of the source collection and cannot be altered. For more information, refer to [Dynamic Field](./enable-dynamic-field) and [Use Partition Key](./use-partition-key).

    1. In **Target Collection Name** and **Description**, customize the target collection name and description. The collection name must be unique in each cluster. If the name duplicates an existing one, rename the collection.

1. Click **Migrate**.

![migrate_from_milvus_via_endpoint_1](/img/migrate_from_milvus_via_endpoint_1.png)

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the migration is complete.

<Admonition type="info" icon="📘" title="Notes">

<p>After migration, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## Cancel migration job{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

