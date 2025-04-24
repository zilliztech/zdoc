---
title: "Offline Migration | Cloud"
slug: /offline-migration
sidebar_label: "Offline Migration"
beta: FALSE
notebook: FALSE
description: "Offline Migration transfers all existing data from a source cluster to a target cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions. For migrations that require uninterrupted write operations, refer to Zero Downtime Migration. | Cloud"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters
  - offline
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store

---

import Admonition from '@theme/Admonition';


# Offline Migration

Offline Migration transfers all existing data from a source cluster to a target cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions. For migrations that require uninterrupted write operations, refer to Zero Downtime Migration.

## Considerations{#considerations}

The table outlines the migration capabilities and constraints between clusters of different plans:

<table>
   <tr>
     <th rowspan="2"><p><strong>Source</strong></p></th>
     <th colspan="3"><p><strong>Target</strong></p></th>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>Serverless cluster</p></td>
     <td><p>Dedicated cluster</p></td>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported (You can only upgrade a Free cluster to a Serverless cluster. Refer to <a href="./manage-cluster">Manage Cluster</a> for more details.)</p></td>
     <td><p>Supported (You can also upgrade a Free cluster to a dedicated cluster. Refer to <a href="./manage-cluster">Manage Cluster</a>for more details.)</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Supported</p></td>
     <td><p>Supported</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported</p></td>
     <td><p>Supported</p></td>
   </tr>
</table>

## Before you start{#before-you-start}

- The source Zilliz Cloud cluster is accessible from the public internet.

- For [cross-organization migration](./offline-migration#migrate-data-across-organizations), ensure you have the required connection information for the target Zilliz Cloud cluster, including the public endpoint, API key, or cluster username and password.

- You have been granted the **Organization Owner** or **Project Admin** role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud also provides RESTful API endpoints for you to migrate data across clusters programmatically. For details, refer to <a href="/reference/restful/migrate-to-existing-cluster-v2">Migrate to Existing Cluster</a> and <a href="/reference/restful/migrate-to-new-dedicated-cluster-v2">Migrate to New Dedicated Cluster</a>.</p>

</Admonition>

## Migrate data within the same organization{#migrate-data-within-the-same-organization}

You can migrate data to either a new or existing cluster within the same organization.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **In Current Organization**.

    ![F9PZbLbZGoQMDWxSg7kcrNfmnPg](/img/F9PZbLbZGoQMDWxSg7kcrNfmnPg.png)

1. In the dialog box that appears, configure the source cluster and database and the target cluster:

    - **Source Cluster**: Choose a source cluster and a database within it.

    - **Migrate to**: Choose **Existing Cluster** or **New Cluster** as the target.

        - **Existing Cluster**: Select a previously created cluster within the organization.

        - **New Cluster**: Create a new cluster for the migration.

    - **Migration Type**: Choose **Offline Migration**.

1. Click **Next** to proceed.

    - If migrating to an existing cluster, you’ll be redirected to the **Migrate to an Existing Cluster** page to select a target project and target cluster.

    - If migrating to a new cluster, you’ll be redirected to the cluster creation page to set up a new cluster.

1. Click **Migrate** to complete.

## Migrate data across organizations{#migrate-data-across-organizations}

Migrating data across organizations requires you to provide the necessary connection credentials (source cluster endpoint, API key, or username and password) to access the source cluster in a different organization.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **In Other Organization**.

    ![GVi8btCa1ovTDyxxS1fc6nyWnId](/img/GVi8btCa1ovTDyxxS1fc6nyWnId.png)

1. In the **Connect to Data Source** step, configure connection information for the source cluster. Then, click **Next**.

    ![Pxvpb8GqRo6nkUx6w3rcY9Bankc](/img/Pxvpb8GqRo6nkUx6w3rcY9Bankc.png)

1. In the **Select Source and Target** step, configure settings for the source database and cluster and the target cluster. Then, click **Next**.

    ![SIRKbfVHSoxh09xjwD5cJXm7nug](/img/SIRKbfVHSoxh09xjwD5cJXm7nug.png)

1. In the **Configure Schema** step, set up field mappings between Zilliz Cloud clusters.

    ![W7JobdgLooFpFFxk1BEc23odnrO](/img/W7JobdgLooFpFFxk1BEc23odnrO.png)

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

![DeX9b11ECoNJUCxo2RacvaKjnTg](/img/DeX9b11ECoNJUCxo2RacvaKjnTg.png)

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

