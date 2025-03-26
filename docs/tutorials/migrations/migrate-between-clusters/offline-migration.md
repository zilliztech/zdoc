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
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work

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
     <td><p>Not supported (You can only upgrade a Free cluster to a Serverless cluster. Refer to <a href="./manage-cluster#upgrade-plan">Manage Cluster</a> for more details.)</p></td>
     <td><p>Supported (You can also upgrade a Free cluster to a dedicated cluster. Refer to <a href="./manage-cluster#upgrade-plan">Manage Cluster</a>for more details.)</p></td>
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

![cross_cluster_migration_1](/img/cross_cluster_migration_1.png)

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **In Current Organization**.

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

![cross_cluster_migration_2](/img/cross_cluster_migration_2.png)

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **In Other Organization**.

1. In the **Connect to Data Source** step, configure connection information for the source cluster. Then, click **Next**.

1. In the **Select Source and Target** step, configure settings for the source database and cluster and the target cluster. Then, click **Next**.

1. In the **Configure Schema** step,

    1. Review the target collections and their field settings in the schema preview.

    1. (Optional) In **Advanced Settings**, configure **Dynamic Field** and **Partition Key**. For more information, refer to [Dynamic Field](./enable-dynamic-field) and [Use Partition Key](./use-partition-key).

    1. (Optional) In **General Information**, customize the target collection name and description. The collection name must be unique in each cluster. If the name duplicates an existing one, rename the collection.

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

