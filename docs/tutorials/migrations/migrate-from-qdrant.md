---
title: "Migrate from Qdrant to Zilliz Cloud | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Migrate from Qdrant"
beta: FALSE
notebook: FALSE
description: "Qdrant is a vector database that provides similarity search capabilities. Migrating data from Qdrant to Zilliz Cloud allows users to leverage Zilliz Cloud's advanced search and analytics features while maintaining compatibility with the multi-vector structure supported by Qdrant. | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - qdrant

---

import Admonition from '@theme/Admonition';


# Migrate from Qdrant to Zilliz Cloud

[Qdrant](https://qdrant.tech/) is a vector database that provides similarity search capabilities. Migrating data from Qdrant to Zilliz Cloud allows users to leverage Zilliz Cloud's advanced search and analytics features while maintaining compatibility with the multi-vector structure supported by Qdrant.

This guide provides step-by-step instructions for migrating your data from Qdrant to Zilliz Cloud, including establishing the connection, configuring data mappings, and troubleshooting any issues that arise during the process.

## Considerations{#considerations}

- When you migrate data from Qdrant to Zilliz Cloud, vector fields are transferred directly, while payloads from Qdrant are stored as JSON in a dynamic field on Zilliz Cloud. For details on the dynamic field feature, refer to [Enable Dynamic Field](./enable-dynamic-field).

- Null payload values are not supported for migration. Instead of setting a key to hold a null value, remove the key from the payload.

- To ensure compatibility, Auto ID will be disabled and cannot be modified for each target collection on Zilliz Cloud.

- Each migration task is limited to a single source Qdrant cluster. You may enable multiple migration jobs if you have data in multiple source clusters.

## Before you start{#before-you-start}

- The source Qdrant cluster is accessible from the public internet.

- You have obtained the cluster endpoint and API key with necessary permissions to access the target Qdrant cluster.

- You have been granted the Organization Owner or Project Admin role on Zilliz Cloud. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from Qdrant to Zilliz Cloud{#migrate-from-qdrant-to-zilliz-cloud}

![migrate_from_qdrant](/img/migrate_from_qdrant.png)

You can migrate source data to a Zilliz Cloud cluster of any plan tier, provided its CU size can accommodate the source data.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Qdrant**.

1. In the **Connect to Data Source** step, enter the **Cluster Endpoint** and **API Key** that can be used as credentials to access the target Qdrant cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p><a href="https://qdrant.tech/documentation/cloud/authentication/?q=api+key">Database Authentication</a> can guide you on obtaining the required connection information.</p>

    </Admonition>

1. In the **Select Source and Target** step, configure settings for the source Qdrant cluster and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source collection you choose to migrate from Qdrant must include at least one vector field and can include up to four vector fields.</p>

    </Admonition>

1. In the **Configure Schema** step,

    1. In **Schema Preview**, verify the field mapping between your Qdrant collection and the corresponding Zilliz Cloud collection.

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>The Auto ID is disbaled and cannot be modified.</p></li>
        <li><p>You may rename fields, but the data types are fixed and cannot be changed.</p></li>
        </ul>

        </Admonition>

    1. In **Advanced Settings**, verify the settings of **Dynamic Field** and **Partition Key**.

        1. **Dynamic Field**: Enabled by default and cannot be modified. It stores payloads from the source index, ensuring consistency and maintaining flexibility.

        1. **Partition Key**: Disabled by default and cannot be modified. This is because payloads from Qdrant are stored as JSON in a dynamic field, which cannot serve as a partition key. In Zilliz Cloud, only scalar fields that are explicitly defined in the schema can be used as partition keys.

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

