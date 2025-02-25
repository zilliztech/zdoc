---
title: "Migrate from Tencent Cloud to Zilliz Cloud | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Migrate from Tencent Cloud"
beta: FALSE
notebook: FALSE
description: "Tencent Cloud VectorDB is a vector database solution designed for similarity searches. Migrating data from Tencent Cloud VectorDB to Zilliz Cloud allows users to take advantage of Zilliz Cloud's enhanced capabilities for vector analytics and scalable data management. | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - tencent cloud
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database

---

import Admonition from '@theme/Admonition';


# Migrate from Tencent Cloud to Zilliz Cloud

[Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb) is a vector database solution designed for similarity searches. Migrating data from Tencent Cloud VectorDB to Zilliz Cloud allows users to take advantage of Zilliz Cloud's enhanced capabilities for vector analytics and scalable data management.

This guide will help you migrate your data from Tencent Cloud VectorDB to Zilliz Cloud, including steps to establish the connection, configure data mappings, and troubleshoot potential issues.

## Considerations{#considerations}

- When you migrate data from Tencent Cloud VectorDB to Zilliz Cloud, vector fields are transferred directly, while scalar fields from Tencent Cloud VectorDB are stored as JSON in a dynamic field on Zilliz Cloud. For details on the dynamic field feature, refer to [Dynamic Field](./enable-dynamic-field).

- Each migration task is limited to a single source Tencent Cloud VectorDB instance. If you have data in multiple source clusters, you can set up separate migration jobs for each one.

## Before you start{#before-you-start}

- The source Tencent Cloud VectorDB instance is accessible from the public internet.

- You have obtained the necessary connection credentials for the source cluster: instance URL and API key.

- You have been granted the Organization Owner or Project Admin role on Zilliz Cloud. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from Tencent Cloud to Zilliz Cloud{#migrate-from-tencent-cloud-to-zilliz-cloud}

![migrate_from_vectordb](/img/migrate_from_vectordb.png)

You can migrate source data to a Zilliz Cloud cluster of any plan tier, provided its CU size can accommodate the source data.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Tencent Cloud VectorDB**.

1. In the **Connect to Data Source** step, enter **Instance URL** and **API Key**. Then, click **Next**.

1. In the **Select Source and Target** step, configure settings for the source Elasticsearch cluster and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source index you choose to migrate from Tencent Cloud VectorDB must include a vector field.</p>

    </Admonition>

1. In the **Configure Schema** step,

    1. In **Schema Preview**, verify the field mapping between your Tencent Cloud VectorDB collection and the corresponding Zilliz Cloud collection.

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>The Auto ID is disbaled and cannot be modified.</p></li>
        <li><p>The record ID from Tencent Cloud VectorDB will be mapped to a <code>VARCHAR</code> field on Zilliz Cloud as the primary field, with a <code>max_length</code> range of 1 to 65,535 characters. When inserting or upserting entities, ensure that <code>VARCHAR</code> field values stay within this limit.</p></li>
        <li><p>You may rename fields, but the data types are fixed and cannot be changed.</p></li>
        </ul>

        </Admonition>

    1. In **Advanced Settings**, verify the settings of **Dynamic Field** and **Partition Key**.

        1. **Dynamic Field**: Enabled by default and cannot be modified. It stores scalar fields from the source collection, ensuring consistency and maintaining flexibility.

        1. **Partition Key**: Disabled by default and cannot be modified. This is because scalar fields from Tencent Cloud VectorDB is stored as JSON in a dynamic field, which cannot serve as a partition key. In Zilliz Cloud, only scalar fields that are explicitly defined in the schema can be used as partition keys.

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

