---
title: "Migrate from Milvus to Zilliz Cloud Via Endpoint | BYOC"
slug: /via-endpoint
sidebar_label: "Via Endpoint"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers Milvus as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. To enable smooth migration, you can migrate data from Milvus to Zilliz Cloud  by connecting to source Milvus via database endpoint | BYOC"
type: origin
token: PlX3wo82Di6oWVkg2ercRWCUnvV
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - endpoint
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Migrate from Milvus to Zilliz Cloud Via Endpoint

Zilliz Cloud offers [Milvus](https://milvus.io/) as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. To enable smooth migration, you can migrate data from Milvus to Zilliz Cloud  by connecting to source Milvus via database endpoint

This topic describes how to migrate from Milvus via the database endpoint. 

## Prerequisites{#prerequisites}

Before starting your Milvus to Zilliz Cloud migration, ensure you meet these requirements:

### Milvus requirements{#milvus-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Version compatibility</p></td>
     <td><p>Milvus 2.3.6 or later</p></td>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Source Milvus instance must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>Authentication credentials</p></td>
     <td><p>Username and password if authentication is enabled (refer to <a href="https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access">Authenticate User Access</a>)</p></td>
   </tr>
</table>

### Zilliz Cloud requirements{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>User role</p></td>
     <td><p>Organization Owner or Project Admin</p></td>
   </tr>
   <tr>
     <td><p>Cluster capacity</p></td>
     <td><p>Sufficient storage and compute resources (use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a> to estimate CU size)</p></td>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Add <a href="./zilliz-cloud-ips">Zilliz Cloud IPs</a> to allowlists if using network restrictions</p></td>
   </tr>
</table>

## Getting started{#getting-started}

The following demo walks you through how to start migrating from Milvus via endpoint:

<Supademo id="cmbkiuxw98p13sn1rc65tt6b0" title="Zilliz Cloud - Migrate from Milvus via Endpoint" />

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

![RGsvb7oFpo7uzbxjSSFc6owNn0c](/img/RGsvb7oFpo7uzbxjSSFc6owNn0c.png)

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

