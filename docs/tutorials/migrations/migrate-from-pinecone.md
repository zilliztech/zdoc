---
title: "Migrate from Pinecone to Zilliz Cloud | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Migrate from Pinecone"
beta: FALSE
notebook: FALSE
description: "Pinecone is a vector database that allows for similarity searches. Migrating data from Pinecone to Zilliz Cloud can enhance capabilities for managing both dense and sparse vectors while taking advantage of Zilliz Cloud’s high-performance search and analytics. | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - pinecone
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds

---

import Admonition from '@theme/Admonition';


# Migrate from Pinecone to Zilliz Cloud

[Pinecone](https://www.pinecone.io/) is a vector database that allows for similarity searches. Migrating data from Pinecone to Zilliz Cloud can enhance capabilities for managing both dense and sparse vectors while taking advantage of Zilliz Cloud’s high-performance search and analytics.

<Admonition type="info" icon="📘" title="Notes">

<p>This migration only supports Pinecone serverless indexes.</p>

</Admonition>

The migration process is structured into these steps:

1. **Connect to data source**: Enter your Pinecone API key to establish a connection.

1. **Select source and target**:

    - Choose one or more Pinecone indexes for migration.

    - Select an existing Zilliz Cloud cluster as the target. Each selected Pinecone index will become a new collection in Zilliz Cloud.

1. **Configure schema**: Verify that field types are correctly mapped between Pinecone and Zilliz Cloud. For detailed mapping rules, refer to [Mapping rules](./migrate-from-pinecone#mapping-rules).

![QKg9wIn2AhWcsyboFThcFPzdn5c](/img/QKg9wIn2AhWcsyboFThcFPzdn5c.png)

## Mapping rules{#mapping-rules}

The following table summarizes how field types in Pinecone are mapped to Zilliz Cloud field types, along with details on any customization options.

<table>
   <tr>
     <th><p>Pinecone Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key</p></td>
     <td><p>Pinecone's ID field is automatically mapped as the primary key in Zilliz Cloud.  When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source index will be discarded.</p></td>
   </tr>
   <tr>
     <td><p>Dense vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Dense vector fields are transferred as FLOAT_VECTOR with no modifications required.</p></td>
   </tr>
   <tr>
     <td><p>Sparse vector</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
     <td><p>If the sparse vector field in a sample row is non-empty, it is mapped by default; otherwise, it remains unselected in schema mapping.</p></td>
   </tr>
   <tr>
     <td><p>Metadata</p></td>
     <td><p>Dynamic field</p></td>
     <td><p>By default, Pinecone's metadata is mapped as a dynamic schema in Zilliz Cloud. For more information, refer to <a href="./enable-dynamic-field">Dynamic Field</a>. When migrating data, consider converting dynamic fields into fixed fields when their patterns have stabilized and you want to enforce strict data types and optimized index configurations for these fields.</p></td>
   </tr>
   <tr>
     <td><p>String</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>If a metadata field is of type string and you convert it to a fixed field, it becomes a VARCHAR type. <strong>Note:</strong> The maximum length for this field is fixed at 65,535 bytes and cannot be modified. The capacity calculation is determined by the actual field length.</p></td>
   </tr>
   <tr>
     <td><p>Number (integer or floating point)</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>If a metadata field is of type number and you convert it to a fixed field, it becomes a DOUBLE type.</p></td>
   </tr>
   <tr>
     <td><p>Boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>If a metadata field is of type boolean and you convert it to a fixed field, it becomes a BOOL type.</p></td>
   </tr>
   <tr>
     <td><p>List of strings</p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>If a metadata field is a list of strings and you convert it to a fixed field, it becomes an array of VARCHAR.</p></td>
   </tr>
</table>

## Before you start{#before-you-start}

- The source Pinecone index is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have obtained the API key to access the target Pinecone project.

- You have been granted the **Organization Owner** or **Project Admin** role on Zilliz Cloud. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

- Make sure the CU size can of the target cluster can accommodate your source data. To estimate the required CU size, use the [calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator).

## Migrate from Pinecone to Zilliz Cloud{#migrate-from-pinecone-to-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Pinecone**.

    ![AwZLbZ71dosG9vxO9ifcFA4gnwh](/img/AwZLbZ71dosG9vxO9ifcFA4gnwh.png)

1. In the **Connect to Data Source** step, enter the API key that can be used to access the target Pinecone project. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p><a href="https://docs.pinecone.io/reference/api/authentication">Authentication</a> can guide you in obtaining the required connection information.</p>

    </Admonition>

    ![SZjrbZ7otoOVpfx1eJNchs2Lnnb](/img/SZjrbZ7otoOVpfx1eJNchs2Lnnb.png)

1. In the **Select Source and Target** step, configure settings for the source Pinecone index and target database in your Zilliz Cloud cluster. Then, click **Next**.

    ![Oj8hb5IrQoMqKuxvoydcdma9nSo](/img/Oj8hb5IrQoMqKuxvoydcdma9nSo.png)

1. In the **Configure Schema** step, set up field mappings between Zilliz Cloud and Pinecone:

    ![S1XAbhpDaozBdXxmWWUcPcvwnzc](/img/S1XAbhpDaozBdXxmWWUcPcvwnzc.png)

    1. **Confirm field mappings:**

        - Zilliz Cloud automatically detects and displays your Pinecone fields alongside their corresponding target fields. For details on how these fields are mapped, refer to [Mapping rules](./migrate-from-pinecone#mapping-rules).

        - Verify that each Pinecone field is correctly paired with its corresponding target field. You can rename fields as needed, but note that the data type cannot be changed.

    1. **Handle metadata fields:**

        - Your Pinecone metadata fields appear in the **Metadata** section and are set as dynamic fields by default.

            <Admonition type="info" icon="📘" title="Notes">

            <p><strong>Dynamic fields</strong> store metadata in a JSON format, enabling more flexible and evolving data structures. For details, refer to <a href="./enable-dynamic-field">Dynamic Field</a>.</p>
            <p><strong>Fixed fields</strong> are explicitly defined in your schema with a predetermined structure. They allow you to enforce specific data types and index configurations.</p>

            </Admonition>

        - To convert a metadata field into a fixed field, select the field and click the **Convert to Fixed Field** icon. Note that Zilliz Cloud samples only 100 rows to extract fields from metadata. To add more fields, click the Settings icon.

        - For metadata fields converted to fixed fields, configure the following attributes:

            - **Nullable:** Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable & Default](./nullable-and-default).

            - **Default Value:** Specify a default value for a field. For details, refer to [Nullable & Default](./nullable-and-default).

    1. **Set namespace mapping:**

        In the **Namespace Mapping** section, the Pinecone namespace is configured as the partition key by default. We recommend you retaining this setting for enhanced performance.

        <Admonition type="info" icon="📘" title="Notes">

        <p>A partition is a subset of a collection containing part of the data, while a partition key is a scalar field that automatically distributes entities into partitions based on their hash values to optimize search performance. For more information, refer to <a href="./use-partition-key">Use Partition Key</a> and <a href="./manage-partitions">Manage Partitions</a>.</p>

        </Admonition>

    1. **(Optional) Adjust shards:**

        - Click **Advanced Settings** to configure the number of shards for your target collection.

        - For datasets of around 100 million rows, a single shard is typically sufficient.

        - If your dataset exceeds 1 billion rows, [contact us](https://zilliz.com/contact-sales) to discuss optimal shard configuration for your use case.

1. Click **Migrate**.

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

![PGMpbewoDo8oL4xOvoWcxHqunme](/img/PGMpbewoDo8oL4xOvoWcxHqunme.png)

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

