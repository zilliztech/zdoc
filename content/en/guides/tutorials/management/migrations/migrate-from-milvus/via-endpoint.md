---
title: "Migrate from Milvus to Zilliz Cloud Via Endpoint | Cloud"
slug: /via-endpoint
sidebar_label: "Via Endpoint"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud offers Milvus as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. This topic describes how to migrate from Milvus via the database endpoint. | Cloud"
type: origin
token: PlX3wo82Di6oWVkg2ercRWCUnvV
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Migrate from Milvus to Zilliz Cloud Via Endpoint

Zilliz Cloud offers [Milvus](https://milvus.io/) as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. This topic describes how to migrate from Milvus via the database endpoint. 

## Prerequisites\{#prerequisites}

Before starting your Milvus to Zilliz Cloud migration, ensure you meet these requirements:

### Milvus requirements\{#milvus-requirements}

| Requirement | Details |
| --- | --- |
| Version compatibility | Milvus 2.3.6 or later |
| Network access | Source Milvus instance must be accessible from the public internet |
| Authentication credentials | Username and password if authentication is enabled (refer to [Authenticate User Access](https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access)) |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin |
| Cluster capacity | Sufficient storage and compute resources (use the [CU calculator](https://zilliz.com/pricing#calculator) to estimate CU size) |
| Network access | Add [Zilliz Cloud IPs](./zilliz-cloud-ips) to allowlists if using network restrictions |

## Getting started\{#getting-started}

The following demo walks you through how to start migrating from Milvus via endpoint:

<Supademo id="cmbkiuxw98p13sn1rc65tt6b0" title="Zilliz Cloud - Migrate from Milvus via Endpoint" />

<Admonition type="info" title="Notes">

- If full text search is already enabled for the source collection, Zilliz Cloud will preserve its Function settings in the target collection after migration. These inherited settings cannot be modified.

- You can also enable full text search for other VARCHAR fields during migration. For details, refer to [Full Text Search](./full-text-search).

</Admonition>

### Index settings\{#index-settings}

At the final confirmation step, use **Index settings** to choose how this migration job handles indexes for the target collections.

- **Create indexes after migration** is enabled by default. Leave it on to automatically create indexes according to the existing migration rules.

- Turn it off to skip index creation and build indexes later, for example during a planned maintenance window.

<Admonition type="info" title="Note">

If you turn off Create indexes after migration, no vector or scalar indexes are created by the migration job. Migrated collections remain Unloaded and cannot be searched or queried until you manually create indexes and load the collections.

</Admonition>

Review the index setting in the confirmation information before clicking **Migrate**.

## Monitor the migration process\{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

If you skip index creation, the job details show **Indexes skipped** after a successful migration. Follow the [post-migration steps](./via-endpoint#post-migration) to create indexes and load the collections.

![RGsvb7oFpo7uzbxjSSFc6owNn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/rgsvb7ofpo7uzbxjssfc6ownn0c.png "RGsvb7oFpo7uzbxjSSFc6owNn0c")

## Post-migration\{#post-migration}

After the migration job completes successfully, prepare the target collections for searches and queries:

- **Automatic index creation enabled:** The migration job creates [AUTOINDEX](./autoindex-explained) according to the existing Milvus migration rules. Verify that index creation succeeded in the job details.

- **Index creation skipped:** The migration job creates neither vector nor scalar indexes. Manually create indexes on all vector fields, and create scalar indexes as needed for your workload. For a REST API example, see [Create Index (V2)](/reference/restful/create-index-v2).

- **Manual loading required:** After index creation completes, manually load each collection and wait until it is loaded before running searches or queries. This step is required whether indexes were created automatically or manually. See [Load & Release](./load-release-collections).

<Admonition type="info" title="Notes">

Once your collection is loaded, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.

</Admonition>

## Cancel migration job\{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

<Procedures>

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

</Procedures>