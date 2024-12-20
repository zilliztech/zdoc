---
title: "Cross-Cluster Migrations | Cloud"
slug: /migrate-between-clusters
sidebar_label: "Cross-Cluster Migrations"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to migrate data between clusters, whether they are within the same organization or across different organizations. This capability ensures flexibility in managing and scaling your resources. When migrating data to a cluster in a different organization, you must provide the appropriate authentication credentials, such as an API key or a token consisting of a username and its password. | Cloud"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters

---

import Admonition from '@theme/Admonition';


# Cross-Cluster Migrations

Zilliz Cloud allows you to migrate data between clusters, whether they are within the same organization or across different organizations. This capability ensures flexibility in managing and scaling your resources. When migrating data to a cluster in a different organization, you must provide the appropriate authentication credentials, such as an API key or a token consisting of a username and its password.

## Considerations{#considerations}

- For optimal performance, migrations from a higher plan tier to a lower one (e.g., **Dedicated** to **Serverless**, **Dedicated** to **Free**, **Free** to **Free** clusters) are not supported.

- For each migration task, you can select only one vector field from each source collection.

## Before you start{#before-you-start}

- The source Zilliz Cloud cluster is accessible from the public internet.

- For [cross-organization migration](./migrate-between-clusters#migrate-data-across-organizations), ensure you have the required connection information for the target Zilliz Cloud cluster, including the public endpoint, API key, or cluster username and password.

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud also provides RESTful API endpoints for you to migrate data across clusters programmatically. For details, refer to <a href="/reference/restful/migrate-to-existing-cluster-v2">Migrate to Existing Cluster</a> and <a href="/reference/restful/migrate-to-new-dedicated-cluster-v2">Migrate to New Dedicated Cluster</a>.</p>

</Admonition>

## Migrate data within the same organization{#migrate-data-within-the-same-organization}

You can migrate data to either a new or existing cluster within the same organization.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **In Current Organization**.

1. In the **Migration Settings** dialog box, configure the source cluster and database and the target cluster, and then click **Confirm**. Ensure the plan tier of the target cluster is not lower than that of the source cluster (e.g., migration from a **Dedicated** cluster to a **Free** or **Serverless** cluster is not supported). For more information on cluster plans, refer to [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

    <Admonition type="info" icon="📘" title="Notes">

    <p>When migrating data, you have the option to create a new target cluster or use an existing one within the same organization. The source cluster should be selected from the available clusters in the current project.</p>

    </Admonition>

1. Click **Migrate**.

![cross_cluster_migration_1](/img/cross_cluster_migration_1.png)

## Migrate data across organizations{#migrate-data-across-organizations}

Migrating data across organizations requires you to provide the necessary connection credentials (source cluster endpoint, API key, or username and password) to access the source cluster in a different organization.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **In Other Organization**.

1. In the **Connect to Data Source** step, configure connection information for the source cluster. Then, click **Next**.

1. In the **Select Source and Target** step, configure settings for the source database and cluster and the target cluster. Then, click **Next**.

1. In the **Configure Schema** step,

    1. Review the target collections and their field settings in the schema preview.

    1. (Optional) In **Advanced Settings**, configure **Dynamic Field** and **Partition Key**. For more information, refer to [Dynamic Field](./enable-dynamic-field) and [Use Partition Key](./use-partition-key).

    1. (Optional) In **General Information**, customize the target collection name and description. The collection name must be unique in each cluster. If the name duplicates an existing one, rename the collection.

1. Click **Migrate**.

![cross_cluster_migration_2](/img/cross_cluster_migration_2.png)

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

