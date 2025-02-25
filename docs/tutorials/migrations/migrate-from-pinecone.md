---
title: "Migrate from Pinecone to Zilliz Cloud | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Migrate from Pinecone"
beta: FALSE
notebook: FALSE
description: "Pinecone is a vector database that allows for similarity searches. Migrating data from Pinecone to Zilliz Cloud can enhance capabilities for managing both dense and sparse vectors while taking advantage of Zilliz Cloud’s high-performance search and analytics. | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - pinecone
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database

---

import Admonition from '@theme/Admonition';


# Migrate from Pinecone to Zilliz Cloud

[Pinecone](https://www.pinecone.io/) is a vector database that allows for similarity searches. Migrating data from Pinecone to Zilliz Cloud can enhance capabilities for managing both dense and sparse vectors while taking advantage of Zilliz Cloud’s high-performance search and analytics.

This guide walks you through the process of migrating your data from Pinecone to Zilliz Cloud, including connecting to Pinecone, configuring data mappings, and troubleshooting potential issues.

## Considerations{#considerations}

- When you migrate data from Pinecone to Zilliz Cloud, vector fields are transferred directly, while metadata fields from Pinecone are stored as JSON in a dynamic field on Zilliz Cloud. For details on the dynamic field feature, refer to [Dynamic Field](./enable-dynamic-field).

- This migration only supports Pinecone serverless indexes.

- Each migration task is limited to a single source Pinecone index. If you have data in multiple source indexes, you can set up separate migration jobs for each one.

## Before you start{#before-you-start}

- The source Pinecone index is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have obtained the API key to access the target Pinecone project.

- You have been granted the Organization Owner or Project Admin role on Zilliz Cloud. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from Pinecone to Zilliz Cloud{#migrate-from-pinecone-to-zilliz-cloud}

![migrate_from_pinecone](/img/migrate_from_pinecone.png)

You can migrate source data to a Zilliz Cloud cluster of any plan tier, provided its CU size can accommodate the source data.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Pinecone**.

1. In the **Connect to Data Source** step, enter the API key that can be used to access the target Pinecone project. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p><a href="https://docs.pinecone.io/reference/api/authentication">Authentication</a> can guide you in obtaining the required connection information.</p>

    </Admonition>

1. In the **Select Source and Target** step, configure settings for the source Pinecone index and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source index you choose to migrate from Pinecone must include a vector field.</p>

    </Admonition>

1. In the **Configure Schema** step,

    1. In **Schema Preview**, verify the field mapping between your Pinecone index and the corresponding Zilliz Cloud collection.

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>The record ID from Pinecone will be mapped to a <code>VARCHAR</code> field on Zilliz Cloud as the primary field, with a <code>max_length</code> range of 1 to 65,535 bytes. When inserting or upserting entities, ensure that <code>VARCHAR</code> field values stay within this limit.</p></li>
        <li><p>You may rename fields, but the data types are fixed and cannot be changed.</p></li>
        </ul>

        </Admonition>

    1. In **Advanced Settings**, verify the settings of **Dynamic Field** and **Partition Key**.

        - **Dynamic Field**: Enabled by default and cannot be modified. It stores metadata from the source index, ensuring consistency and maintaining flexibility.

        - **Partition Key**: Enabled by default. When enabled, Zilliz Cloud maps Pinecone namespaces to partition keys; when disabled, it maps them to partitions. It is recommended to keep this feature enabled. In this state, the `namespace` appears as a scalar field in the target collection schema with a `VARCHAR` data type. For more information, refer to [Use Partition Key](./use-partition-key) and [Manage Partitions](./manage-partitions).

    1. In **Target Collection Name** and **Description**, customize the target collection name and description. The collection name must be unique in each cluster. If the name duplicates an existing one, rename the collection.

1. Click **Migrate**.

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

