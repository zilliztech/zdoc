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
  - LLMs
  - Machine Learning
  - RAG
  - NLP

---

import Admonition from '@theme/Admonition';


# Migrate from Milvus to Zilliz Cloud Via Endpoint

Zilliz Cloud offers [Milvus](https://milvus.io/) as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. To enable smooth migration, you can migrate data from Milvus to Zilliz Cloud in these ways - connecting to source Milvus via database endpoint or uploading backup files directly.

This topic describes how to migrate from Milvus via the database endpoint. For information on how to upload backup files, refer to [Via Backup Files](./via-backup-files).

## Before you start{#before-you-start}

- The source Milvus instance is running version 2.3.6 or later and is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- If authentication has been enabled for the source Milvus, make sure you have obtained necessary connection credentials. For details, refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access).

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from Milvus via database endpoint{#migrate-from-milvus-via-database-endpoint}

You can migrate one or more collections from a single Milvus database at a time.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **Milvus** > **Via Endpoint**.

1. In the **Cluster Endpoint** field of the **Connect to Data Source** step, enter the server address of the source Milvus. If [authentication](https://milvus.io/docs/authenticate.md) has been enabled for the source Milvus, enter **Username** and **Password** as access credentials. Then, click **Next**.

    ![D2R5bHXGJoi7PSxMfxScbYdEnA5](/img/D2R5bHXGJoi7PSxMfxScbYdEnA5.png)

1. In the **Select Source and Target** step, configure settings for the source Milvus and target Zilliz Cloud cluster. Then, click **Next**.

    ![ZpTrbReOKoaGe4xY1xPc5DRNnFf](/img/ZpTrbReOKoaGe4xY1xPc5DRNnFf.png)

1. In the **Configure Schema** step, set up field mappings between Milvus and Zilliz Cloud.

    ![IEHEbdHi9o7IDsx5fKGcVQXSnDb](/img/IEHEbdHi9o7IDsx5fKGcVQXSnDb.png)

    1. **Verify primary key & vector field mappings:**

        - **Primary key**: The source collection’s primary key becomes the primary key in the target collection. You can enable **Auto ID** to generate new primary key values. If you do so, the original primary key values from your source index will be discarded.

        - **Vector fields**: Migrated unchanged. The vector dimension is fixed and cannot be edited.

    1. **Handle scalar fields:**

        For scalar fields, configure the following attributes:

        - **Nullable:** Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable & Default](./nullable-and-default).

        - **Default Value:** Specify a default value for a field. For details, refer to [Nullable & Default](./nullable-and-default).

        - **Partition Key:** Optionally designate an INT64 or VARCHAR field as the partition key. **Note:** Each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to [Use Partition Key](./use-partition-key).

    1. **Enable dynamic field:**

        - Dynamic fields are enabled by default for the target collection.

        - If you disable dynamic fields for your target collection, the dynamic fields from your source collection will not be migrated.

        - When a dynamic field’s structure stabilizes, convert it to a fixed field for index configuration and improved search performance.

    1. **(Optional) Adjust shards:**

        - Click **Advanced Settings** to configure the number of shards for your target collection.

        - For datasets of around 100 million rows, a single shard is typically sufficient.

        - If your dataset exceeds 1 billion rows, [contact us](https://zilliz.com/contact-sales) to discuss optimal shard configuration for your use case.

1. Click **Migrate**.

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

![RGsvb7oFpo7uzbxjSSFc6owNn0c](/img/RGsvb7oFpo7uzbxjSSFc6owNn0c.png)

## Post-migration{#post-migration}

After the migration job is completed, note the following:

- **Index Creation**: The migration process automatically creates [AUTOINDEX](./autoindex-explained) for the migrated collections.

- **Manual Loading Required**: Despite automatic indexing, the migrated collections are not immediately available for search or query operations. You must manually load the collections in Zilliz Cloud to enable search and query functionalities. For details, refer to [Load & Release](./load-release-collections).

<Admonition type="info" icon="📘" title="Notes">

<p>Once your collection is loaded, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.</p>

</Admonition>

## Cancel migration job{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

