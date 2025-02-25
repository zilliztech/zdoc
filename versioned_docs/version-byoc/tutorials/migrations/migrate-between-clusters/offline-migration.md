---
title: "Offline Migration | BYOC"
slug: /offline-migration
sidebar_label: "Offline Migration"
beta: FALSE
notebook: FALSE
description: "Offline Migration transfers all existing data from a source cluster to a target cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions. For migrations that require uninterrupted write operations, refer to Zero Downtime Migration. | BYOC"
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
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


# Offline Migration

Offline Migration transfers all existing data from a source cluster to a target cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions. For migrations that require uninterrupted write operations, refer to Zero Downtime Migration.

## Before you start{#before-you-start}

- The source Zilliz Cloud cluster is accessible from the public internet.

- You have been granted the **Organization Owner** or **Project Admin** role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud also provides RESTful API endpoints for you to migrate data across clusters programmatically. For details, refer to <a href="/reference/restful/migrate-to-existing-cluster-v2">Migrate to Existing Cluster</a> and <a href="/reference/restful/migrate-to-new-dedicated-cluster-v2">Migrate to New Dedicated Cluster</a>.</p>

</Admonition>

## Migrate data within the same organization{#migrate-data-within-the-same-organization}

You can migrate data to either a new or existing cluster within the same organization.

![cross_cluster_migration_1](/byoc/cross_cluster_migration_1.png)

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

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the migration is complete.

<Admonition type="info" icon="📘" title="Notes">

<p>After migration, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.</p>

</Admonition>

![verify_collection](/byoc/verify_collection.png)

## Cancel migration job{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

