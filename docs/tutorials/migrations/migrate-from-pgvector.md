---
title: "Migrate from PostgreSQL to Zilliz Cloud | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "Migrate from PostgreSQL"
beta: FALSE
notebook: FALSE
description: "PostgreSQL](https//www.postgresql.org/) is a robust, open-source, object-relational database engine renowned for its extensibility, data integrity, and performance. By utilizing the [pgvector extension, PostgreSQL gains the capability to store and manage vector data. | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - postgresql
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense

---

import Admonition from '@theme/Admonition';


# Migrate from PostgreSQL to Zilliz Cloud

[PostgreSQL](https://www.postgresql.org/) is a robust, open-source, object-relational database engine renowned for its extensibility, data integrity, and performance. By utilizing the [pgvector](https://github.com/pgvector/pgvector) extension, PostgreSQL gains the capability to store and manage vector data.

If you have PostgreSQL databases with [pgvector](https://github.com/pgvector/pgvector) installed—whether on-premises or cloud-hosted, you can seamlessly migrate them to your Zilliz Cloud cluster. This migration process involves establishing a connection with your existing source database and replicating its data from the source tables to the corresponding target collections on Zilliz Cloud.

## Considerations{#considerations}

- You can migrate the following PostgreSQL data types: **vector**, **text**/**varchar**/**date**/**time**/**json**, **bigint**, **integer**, **smallint**, **double precision**, **real**, **boolean**, **array**. If your table has fields with unsupported data types, you can choose not to migrate those fields or submit a [support ticket](https://support.zilliz.com/hc/en-us/requests/new). For information on how PostgreSQL data types are mapped to Zilliz Cloud, refer to [Field mapping reference](./migrate-from-pgvector#field-mapping-reference).

- For each migration task, you can select only one vector field from each source table.

- Each migration task is limited to a single source PostgreSQL database. You may enable multiple migration jobs if you have data in multiple source databases.

## Before you start{#before-you-start}

Make sure the following prerequisites are met:

- The source PostgreSQL database is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from PostgreSQL to Zilliz Cloud{#migrate-from-postgresql-to-zilliz-cloud}

You can migrate source data to a Zilliz Cloud cluster of any plan tier, provided its CU size can accommodate the source data.

![migrate_from_pgvector](/img/migrate_from_pgvector.png)

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **PostgreSQL**.

1. In the **Connect to Data Source** step, enter the endpoint of the source PostgreSQL database in the **Database Endpoint** field, provide the username and password associated with the database, and click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For details on connection information, refer to <a href="https://jdbc.postgresql.org/documentation/use/#connecting-to-the-database">Connecting to the Database</a>.</p>

    </Admonition>

1. In the **Select Source and Target** step, configure settings for the source database and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each table you choose to migrate from PostgreSQL must include a vector field.</p>

    </Admonition>

1. In the **Configure Schema** step,

    1. Verify the data mapping between your PostgreSQL data and the corresponding Zilliz Cloud data types. Zilliz Cloud has a default mechanism for mapping PostgreSQL data types to its own, but you can review and make necessary adjustments. Currently, you can rename fields, but cannot change the underlying data types.

    1. In **Advanced Settings**, configure **Dynamic Field** and **Partition Key**. For more information, refer to [Dynamic Field](./enable-dynamic-field) and [Use Partition Key](./use-partition-key).

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

## Field mapping reference{#field-mapping-reference}

Review the table below to understand how PostgreSQL field types map to Zilliz Cloud field types.

<table>
   <tr>
     <th><p>PostgreSQL Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>vector</p></td>
     <td><p><code>FLOAT_VECTOR</code></p></td>
     <td><p>Vector dimensions remain unchanged.</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p><code>INT64</code></p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p><code>INT32</code></p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p><code>INT16</code></p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double precision</p></td>
     <td><p><code>DOUBLE</code></p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>real</p></td>
     <td><p><code>FLOAT</code></p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p><code>BOOL</code></p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p><code>ARRAY</code></p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p><code>JSON</code></p></td>
     <td><p>-</p></td>
   </tr>
</table>

