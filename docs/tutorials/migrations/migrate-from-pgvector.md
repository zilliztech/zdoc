---
title: "Migrate from PostgreSQL to Zilliz Cloud | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "Migrate from PostgreSQL"
beta: FALSE
notebook: FALSE
description: "PostgreSQL](https//www.postgresql.org/) is a robust, open-source, object-relational database engine renowned for its extensibility, data integrity, and performance. By utilizing the [pgvector extension, PostgreSQL gains the capability to store and manage vector data. Migrating from PostgreSQL to Zilliz Cloud allows users to leverage Zilliz Cloud's advanced search and analytics features. | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - postgresql
  - IVF
  - knn
  - Image Search
  - LLMs

---

import Admonition from '@theme/Admonition';


# Migrate from PostgreSQL to Zilliz Cloud

[PostgreSQL](https://www.postgresql.org/) is a robust, open-source, object-relational database engine renowned for its extensibility, data integrity, and performance. By utilizing the [pgvector](https://github.com/pgvector/pgvector) extension, PostgreSQL gains the capability to store and manage vector data. Migrating from PostgreSQL to Zilliz Cloud allows users to leverage Zilliz Cloud's advanced search and analytics features.

The migration process is structured into these steps:

1. **Connect to data source**: Enter your PostgreSQL database endpoint and username & password to establish a connection.

1. **Select source and target**:

    - Choose one or more PostgreSQL tables for migration.

    - Select an existing Zilliz Cloud cluster as the target.

1. **Configure schema**: Verify that field types are correctly mapped between PostgreSQL and Zilliz Cloud. For detailed mapping rules, refer to [Mapping rules](./migrate-from-pgvector#mapping-rules).

![MJ9rws5kfhq1bObPxAJcy1J0nQc](/img/MJ9rws5kfhq1bObPxAJcy1J0nQc.png)

## Mapping rules{#mapping-rules}

The following table summarizes how field types in PostgreSQL are mapped to Zilliz Cloud field types, along with details on any customization options.

<table>
   <tr>
     <th><p>PostgreSQL Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key / Auto ID</p></td>
     <td><ul><li><p><strong>Single-field primary key</strong>: Mapped directly as the target collection's primary key.</p></li><li><p><strong>Absence of primary key</strong>: Auto ID is enabled for the target collection to support tables without a primary key.</p></li><li><p><strong>Composite primary key:</strong> Auto ID is enabled; composite keys are treated as regular scalar fields.</p><p>When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source collection will be discarded.</p></li></ul></td>
   </tr>
   <tr>
     <td><p>vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Vector dimensions remain unchanged.</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double precision</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>real</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Before you start{#before-you-start}

- The source PostgreSQL database is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from PostgreSQL to Zilliz Cloud{#migrate-from-postgresql-to-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **PostgreSQL**.

    ![LO5fbYivuoVHvZxpTMZcWb1antb](/img/LO5fbYivuoVHvZxpTMZcWb1antb.png)

1. In the **Connect to Data Source** step, enter connection information to the source PostgreSQL database, and click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For details on connection information, refer to <a href="https://jdbc.postgresql.org/documentation/use/#connecting-to-the-database">Connecting to the Database</a>.</p>

    </Admonition>

    ![EJPNbGfT7oi1g7x0mJTcet2FnOc](/img/EJPNbGfT7oi1g7x0mJTcet2FnOc.png)

1. In the **Select Source and Target** step, configure settings for the source database and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each table you choose to migrate from PostgreSQL must include a vector field.</p>

    </Admonition>

    ![S6ZIbOXYzokEjJx7OtHcjKO0n3b](/img/S6ZIbOXYzokEjJx7OtHcjKO0n3b.png)

1. In the **Configure Schema** step, set up field mappings between Zilliz Cloud and PostgreSQL:

    ![Hyl1bjFDEoQjXwx7S9mcvrCmnHb](/img/Hyl1bjFDEoQjXwx7S9mcvrCmnHb.png)

    1. **Confirm field mappings:**

        - Zilliz Cloud automatically detects and displays your PostgreSQL fields alongside their corresponding target fields. For details on how these fields are mapped, refer to [Mapping rules](./migrate-from-pgvector#mapping-rules).

        - Verify that each PostgreSQL field is correctly paired with its corresponding target field. You can rename fields as needed, but note that the data type cannot be changed.

    1. **Handle scalar fields:**

        For scalar fields, optionally configure the following attributes:

        - **Nullable:** Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable & Default](./nullable-and-default).

        - **Default Value:** Specify a default value for a field. For details, refer to [Nullable & Default](./nullable-and-default).

        - **Partition Key:** Optionally designate an INT64 or VARCHAR field as the partition key. **Note:** Each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to [Use Partition Key](./use-partition-key).

    1. **Enable dynamic field:**

        - Dynamic fields are enabled by default. This allows you to include any scalar fields that are not defined in the collection schema.

        - If you disable it, you need to explicitly define each field in your entity before inserting data. For more information, refer to [Dynamic Field](./enable-dynamic-field).

    1. **(Optional) Adjust shards:**

        - Click **Advanced Settings** to configure the number of shards for your target collection.

        - For datasets of around 200 million rows with 768 dimensions, a single shard is typically sufficient.

        - If your dataset exceeds 1 billion rows, [contact us](https://zilliz.com/contact-sales) to discuss optimal shard configuration for your use case.

1. Click **Migrate**.

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

![LfRgbw383olVaIxMEaCc6LVNned](/img/LfRgbw383olVaIxMEaCc6LVNned.png)

## Post-migration{#post-migration}

After the migration job is completed, note the following:

- **Index Creation**: The migration process does not automatically create indexes for vector fields when migrating from external data sources. You must manually create the index for each vector field. For details, refer to [Index Vector Fields](./index-vector-fields).

- **Manual Loading Required**: After creating the necessary indexes, manually load the collections to make them available for search and query operations. For details, refer to [Load & Release](./load-release-collections).

<Admonition type="info" icon="📘" title="Notes">

<p>Once you have completed indexing and loading, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.</p>

</Admonition>

## Cancel migration job{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

