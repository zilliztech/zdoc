---
title: "Zero Downtime Migration | Cloud"
slug: /zero-downtime-migration
sidebar_label: "Zero Downtime Migration"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zero Downtime Migration allows database services to remain operational throughout the migration, providing uninterrupted access to the database. It consists of these stages | Cloud"
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
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Zero Downtime Migration

Zero Downtime Migration allows database services to remain operational throughout the migration, providing uninterrupted access to the database. It consists of these stages:

1. **Initialization**: Select the source cluster and create a new target cluster.

1. **Migration**: Migrate existing data and sync incremental data.

1. **Finalization**: Stop sync when lag is under 10 seconds and switch over to the target cluster.

![PTB0wxmm2hCBc3b2dj1cCCJgnRb](https://zdoc-images.s3.us-west-2.amazonaws.com/PTB0wxmm2hCBc3b2dj1cCCJgnRb.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Zero Downtime Migration is in <strong>Private Preview</strong>. If you encounter any issues or want to learn about associated costs, contact <a href="https://support.zilliz.com/hc/en-us/requests/new">Zilliz Cloud support</a>.</p>

</Admonition>

## Migration capabilities\{#migration-capabilities}

### Cluster compatibility\{#cluster-compatibility}

The following table outlines the migration capabilities and constraints between clusters:

<table>
   <tr>
     <th><p>Source Cluster</p></th>
     <th><p>Target Cluster</p></th>
     <th><p>Migration Scope</p></th>
   </tr>
   <tr>
     <td><p>Dedicated</p></td>
     <td><p>New Dedicated cluster</p></td>
     <td><p>Migrates every database from the source cluster. Partially migrating specific databases is not supported.</p></td>
   </tr>
   <tr>
     <td><p>Serverless / Free</p></td>
     <td><p>New Dedicated cluster</p></td>
     <td><p>Migrate a single database from the source cluster, as Serverless/Free clusters contain at most one database.</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>You cannot migrate to a lower-tier cluster plan. In other words, the target cluster’s plan must be the same as or higher than the source cluster’s plan.</p>

</Admonition>

### Migration scope options\{#migration-scope-options}

<table>
   <tr>
     <th><p>Migration Type</p></th>
     <th><p>Description</p></th>
     <th><p>Use Cases</p></th>
   </tr>
   <tr>
     <td><p>Within same project</p></td>
     <td><p>Migrate between existing clusters in the same Zilliz Cloud project</p></td>
     <td><p>Cluster upgrades, performance optimization, data consolidation</p></td>
   </tr>
   <tr>
     <td><p>Cross-project or organization</p></td>
     <td><p>Migrate between existing clusters in different Zilliz Cloud projects or organizations</p></td>
     <td><p>Company mergers, department transfers, multi-tenant scenarios</p></td>
   </tr>
</table>

### Direct data transfer\{#direct-data-transfer}

Zero Downtime Migration performs direct data replication between Zilliz Cloud clusters with the following characteristics:

- **Schema preservation**: Source schema transferred unchanged to target cluster

- **No field modifications**: Cannot rename fields, change data types, or modify field attributes during migration

- **Automatic indexing**: AUTOINDEX automatically created for vector fields in target cluster

### Limits\{#limits}

- During migration, you cannot perform any of the following operations on the source cluster: **AlterCollection**, **AlterCollectionField**, **CreateAlias**, **DropAlias**, **AlterAlias**, **RenameCollection**, **AlterDatabase**, **Import**.

- Canceling an ongoing Zero Downtime Migration job is not supported. This functionality will be available in future releases.

- Zero Downtime Migration requires approximately 10 seconds of downtime for data sync to stop and the cluster transition to complete.

## Prerequisites\{#prerequisites}

Before starting your offline migration, ensure you meet these requirements:

### General requirements\{#general-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>User permissions</p></td>
     <td><p>Organization Owner or Project Admin role</p></td>
   </tr>
   <tr>
     <td><p>Source cluster access</p></td>
     <td><p>Source cluster must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>Target cluster capacity</p></td>
     <td><p>Sufficient CU size to accommodate source data (use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a>)</p></td>
   </tr>
</table>

### Cross-project or organization migration requirements\{#cross-project-or-organization-migration-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Connection credentials</p></td>
     <td><p>Public endpoint, API key, or cluster username and password for source cluster</p></td>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Ability to connect to source cluster from target organization</p></td>
   </tr>
</table>

## Getting started\{#getting-started}

The zero downtime migration process consists of three main phases that require your attention and action:

### Phase 1: Initialize\{#phase-1-initialize}

The following demo shows how to set up and start your zero downtime migration:

<Supademo id="cmb94ul040o06sn1ri0s8ydn5" title="Zilliz Cloud - Zero Downtime Migration Demo" />

Once you click **Migrate**, the source cluster will enter **Locked** state and cannot be deleted during migration.

### Phase 2: Monitor\{#phase-2-monitor}

After starting the migration, you'll be taken to the target cluster details page where you need to actively monitor the migration progress.

<Supademo id="cmba5mvlu1g20sn1rruotossj" title="Zilliz Cloud - Monitor Zero Downtime Migration Demo" />

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

### Phase 3: Switch\{#phase-3-switch}

When you receive the email notification that the sync lag has dropped below 10 seconds, you're ready for the final switchover. For instructions on connecting to a cluster, refer to [Connect to Cluster](./connect-to-cluster).

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>After migration, the source cluster <strong>will not be deleted automatically</strong>. We recommend keeping it for a period to verify data consistency before manual deletion.</p></li>
<li><p>The migrated collections are not immediately available for search or query operations. You must manually load the collections in Zilliz Cloud to enable search and query functionalities. For details, refer to <a href="./load-release-collections">Load & Release</a>.</p></li>
</ul>

</Admonition>