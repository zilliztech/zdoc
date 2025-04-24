---
title: "Zero Downtime Migration | BYOC"
slug: /zero-downtime-migration
sidebar_label: "Zero Downtime Migration"
beta: PRIVATE
notebook: FALSE
description: "Zero Downtime Migration allows database services to remain operational throughout the migration, providing uninterrupted access to the database. It consists of these stages | BYOC"
type: origin
token: XDoSwZodyigAEVkjkWfc9nsfnCg
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters
  - zero downtime
  - Unstructured Data
  - vector database
  - IVF
  - knn

---

import Admonition from '@theme/Admonition';


# Zero Downtime Migration

Zero Downtime Migration allows database services to remain operational throughout the migration, providing uninterrupted access to the database. It consists of these stages:

1. **Initialization**: Select the source cluster and create a new target cluster.

1. **Migration**: Migrate existing data and sync incremental data.

1. **Finalization**: Stop sync when lag is under 10 seconds and switch over to the target cluster.

![PTB0wxmm2hCBc3b2dj1cCCJgnRb](/img/PTB0wxmm2hCBc3b2dj1cCCJgnRb.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Zero Downtime Migration is in <strong>Private Preview</strong>. If you encounter any issues or want to learn about associated costs, contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Limits{#limits}

- Zero Downtime Migration supports migrations within the same organization only. Migrations across organizations are not supported.

- The migration process will transfer all databases within the source cluster. Partially migrating specific databases is not supported.

- During migration, you cannot perform any of the following operations on the source cluster: **AlterCollection**, **AlterCollectionField**, **CreateAlias**, **DropAlias**, **AlterAlias**, **RenameCollection**, **AlterDatabase**, **Import**.

- This feature is available only for migration to a new **Dedicated** cluster.

- Canceling an ongoing Zero Downtime Migration job is not supported. This functionality will be available in future releases.

- Zero Downtime Migration requires approximately 10 seconds of downtime for data sync to stop and the cluster transition to complete.

## Before you start{#before-you-start}

- The source cluster is accessible from the public internet.

- You have been granted the **Organization Owner** or **Project Admin** role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Step 1: Start migration{#step-1-start-migration}

1. Log in to  the [Zilliz Cloud console](https://cloud.zilliz.com/login/).

1. On the project page, choose **Migrations** > **In Current Organization**.

    ![NbgobV5xKoFz3Sxd0jPcOs2XnMf](/img/NbgobV5xKoFz3Sxd0jPcOs2XnMf.png)

1. In the dialog box that appears, configure migration settings:

    ![zero-downtime-migration-1](/img/zero-downtime-migration-1.png)

    - **Source Cluster**: Choose the cluster from which you want to migrate.

    - **Migrate to**: Choose **New Cluster**. Zero Downtime Migration currently requires the target to be a new Dedicated cluster.

    - **Migration Type**: Choose **Zero Downtime Migration**.

1. After configuring these settings, click **Next**. You'll be redirected to the cluster creation page.

## Step 2: Configure the target cluster{#step-2-configure-the-target-cluster}

![zero-downtime-migration-2](/img/zero-downtime-migration-2.png)

1. On the **Migrate to a New Cluster** page, set up your target cluster:

    - **Cluster Name:** Enter a name for your new target cluster (e.g., `cluster01`).

    - **Cloud Provider Settings:** Select the cloud provider (AWS, Google Cloud, or Microsoft Azure) and configure additional settings according to your project needs.

    For details on cluster configurations, refer to [Create Cluster](./create-cluster).

1. Click **Migrate**. Then, the migration job starts:

    - The source cluster will enter the **Locked** state. During this period, you cannot delete the source cluster.

    - You will be redirected to the details page of the target Dedicated cluster.

## Step 3: Monitor the migration job in progress{#step-3-monitor-the-migration-job-in-progress}

![zero-downtime-migration-3](/img/zero-downtime-migration-3.png)

1. On the details page of the target cluster, click **View Progress** at the top to open the migration progress dialog.

1. In the **Migration Progress** dialog box, monitor the following migration stages:

    **Stage 1: Prepare the target cluster and migrate the existing data**

    This stage migrates the existing data from the source cluster to the target cluster. The duration depends on the volume of data being transferred and may take several hours for large datasets. 

    <Admonition type="info" icon="📘" title="Notes">

    <p>If the process is taking a while, feel free to leave this page and work on other tasks. You can return at any time to continue monitoring the incremental data syncing progress.</p>

    </Admonition>

    **Stage 2: Sync incremental data**

    During this stage, the system continuously syncs new data inserted into the source cluster to the target cluster. The target cluster will display a **Syncing** state, indicating that it does not accept external data writes. At this stage, follow these steps:

    1. **Monitor sync lag**

        - Track the **Lag Behind Source** (in seconds) to monitor sync progress. This indicator shows the time difference between the most recent data in the source and target clusters.

        - When the **Lag Behind Source** drops below 10s, you'll receive an email notification indicating you can proceed with stopping data sync.

        - **Important**: If the sync lag never reaches below 10s after a reasonable waiting period, contact [Zilliz Cloud support](https://zilliz.com/contact-sales).

    1. **Stop data sync**

        - Before proceeding, stop all writes to the source cluster and plan for approximately 10 seconds of maintenance window for sync stopping and cluster switchover.

        - When the **Lag Behind Source** reaches an acceptable threshold, select the checkbox: **I confirm that I have stopped writes to the source cluster** and then click **Stop Data Sync**.

        <Admonition type="info" icon="📘" title="Notes">

        <p>If you do not manually stop data sync, Zilliz Cloud will continue syncing for up to 7 days. After this period, the system will automatically stop sync to prevent resource wastage, resulting in the migration job failing.</p>

        </Admonition>

## Switch your connection to the target cluster{#switch-your-connection-to-the-target-cluster}

![zero-downtime-migration-4](/img/zero-downtime-migration-4.png)

Once data sync has stopped, proceed to the **Switch the endpoint in your application code** step:

1. In the **Migration Progress** dialog box, click **View Connection Details**. You'll be redirected to the details page of the target cluster.

1. On the cluster details page, verify the status of the target cluster. If it shows as **Running**, the migration is successful.

1. Switch the endpoint in your application code to connect to the target cluster. This ensures your services operate on the new cluster without disruptions. For instructions on connecting to a cluster, refer to [Connect to Cluster](./connect-to-cluster).

<Admonition type="info" icon="📘" title="Notes">

<p>After migration, the source cluster <strong>will not be deleted automatically</strong>. We recommend keeping it for a period to verify data consistency before manual deletion.</p>

</Admonition>

## Post-migration{#post-migration}

After the migration job is completed, note the following:

- **Index Creation**: The migration process automatically creates [AUTOINDEX](./autoindex-explained) for the migrated collections.

- **Manual Loading Required**: Despite automatic indexing, the migrated collections are not immediately available for search or query operations. You must manually load the collections in Zilliz Cloud to enable search and query functionalities. For details, refer to [Load & Release](./load-release-collections).

