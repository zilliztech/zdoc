---
title: "Migrate from Tencent Cloud to Zilliz Cloud | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Migrate from Tencent Cloud"
beta: FALSE
notebook: FALSE
description: "Tencent Cloud VectorDB is a vector database solution designed for similarity searches. Migrating data from Tencent Cloud VectorDB to Zilliz Cloud allows users to take advantage of Zilliz Cloud's enhanced capabilities for vector analytics and scalable data management. | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - tencent cloud
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss

---

import Admonition from '@theme/Admonition';


# Migrate from Tencent Cloud to Zilliz Cloud

[Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb) is a vector database solution designed for similarity searches. Migrating data from Tencent Cloud VectorDB to Zilliz Cloud allows users to take advantage of Zilliz Cloud's enhanced capabilities for vector analytics and scalable data management.

The migration process is structured into these steps:

1. **Connect to data source**: Enter your VectorDB instance URL and API key to establish a connection.

1. **Select source and target**:

    - Choose one or more source collections for migration.

    - Select an existing Zilliz Cloud cluster as the target.

1. **Configure schema**: Verify that field types are correctly mapped between Tencent Cloud VectorDB and Zilliz Cloud. For detailed mapping rules, refer to [Mapping rules](./migrate-from-tencent-cloud#mapping-rules).

![Pgs9wW56chr4CrbVTKmcQUHrn8b](/img/Pgs9wW56chr4CrbVTKmcQUHrn8b.png)

## Mapping rules{#mapping-rules}

The following table summarizes how field types in Tencent Cloud VectorDB are mapped to Zilliz Cloud field types, along with details on any customization options.

<table>
   <tr>
     <th><p>VectorDB Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key</p></td>
     <td><p>The primary key from Tencent Cloud VectorDB is automatically mapped as the primary key in Zilliz Cloud. When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source collection will be discarded.</p></td>
   </tr>
   <tr>
     <td><p>Dense vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Dense vector fields are transferred as FLOAT_VECTOR with no modifications required.</p></td>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>Dynamic field</p></td>
     <td><p>By default, Tencent Cloud VectorDB's JSON field is mapped as a dynamic schema in Zilliz Cloud. When migrating data, consider converting dynamic fields into fixed fields when their patterns have stabilized and you want to enforce strict data types and optimized index configurations for these fields.</p></td>
   </tr>
   <tr>
     <td><p>string</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>If a field in Tencent Cloud VectorDB's JSON field is of type string and you convert it to a fixed field, it becomes a VARCHAR type. <strong>Note:</strong> The maximum length for this field is fixed at 65,535 bytes and cannot be modified. The capacity calculation is determined by the actual field length.</p></td>
   </tr>
   <tr>
     <td><p>uint64</p></td>
     <td><p>INT32</p></td>
     <td><p>If a field in Tencent Cloud VectorDB's JSON field is of type uint64 and you convert it to a fixed field, it becomes an INT32 type.</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>If a field in Tencent Cloud VectorDB's JSON field is of type double and you convert it to a fixed field, it becomes a DOUBLE type.</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>If a field in Tencent Cloud VectorDB's JSON field is of type array and you convert it to a fixed field, it becomes an ARRAY type.</p></td>
   </tr>
</table>

## Before you start{#before-you-start}

- The source Tencent Cloud VectorDB instance is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have been granted the Organization Owner or Project Admin role on Zilliz Cloud. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

- Make sure the CU size can of the target cluster can accommodate your source data. To estimate the required CU size, use the [calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator).

## Migrate from Tencent Cloud to Zilliz Cloud{#migrate-from-tencent-cloud-to-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Tencent Cloud VectorDB**.

    ![HbbAbTbAPoCmUJxbCjbcTohKnXg](/img/HbbAbTbAPoCmUJxbCjbcTohKnXg.png)

1. In the **Connect to Data Source** step, enter **Instance URL** and **API Key**. Then, click **Next**.

    ![TFe1bizp3oGx9MxmaBQccuCEnQh](/img/TFe1bizp3oGx9MxmaBQccuCEnQh.png)

1. In the **Select Source and Target** step, configure settings for the source database and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source index you choose to migrate from Tencent Cloud VectorDB must include a vector field.</p>

    </Admonition>

    ![DOXobO4rdov3b8xuMlHcKXnZnFd](/img/DOXobO4rdov3b8xuMlHcKXnZnFd.png)

1. In the **Configure Schema** step, set up field mappings between Zilliz Cloud and Tencent Cloud VectorDB:

    ![GIcZb36l1o8l40xjE2Rcg9l2nyb](/img/GIcZb36l1o8l40xjE2Rcg9l2nyb.png)

    1. **Confirm field mappings:**

        - Zilliz Cloud automatically detects and displays your Tencent Cloud VectorDB fields alongside their corresponding target fields. For details on how these fields are mapped, refer to [Mapping rules](./migrate-from-tencent-cloud#mapping-rules).

        - Verify that each Tencent Cloud VectorDB field is correctly paired with its corresponding target field. You can rename fields as needed, but note that the data type cannot be changed.

    1. **Handle JSON fields:**

        - Your Tencent Cloud VectorDB JSON fields appear in the **Metadata** section and are set as dynamic fields by default.

            <Admonition type="info" icon="📘" title="Notes">

            <p><strong>Dynamic fields</strong> store metadata in a JSON format, enabling more flexible and evolving data structures. For details, refer to <a href="./enable-dynamic-field">Dynamic Field</a>.</p>
            <p><strong>Fixed fields</strong> are explicitly defined in your schema with a predetermined structure. They allow you to enforce specific data types and index configurations.</p>

            </Admonition>

        - To convert a JSON field into a fixed field, select the field and click the **Convert to Fixed Field** icon. Note that Zilliz Cloud samples only 100 rows to extract fields from payloads. To add more fields, click the Settings icon.

        - For JSON fields converted to fixed fields, configure the following attributes:

            - **Nullable:** Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable & Default](./nullable-and-default).

            - **Default Value:** Specify a default value for a field. For details, refer to [Nullable & Default](./nullable-and-default).

            - **Partition Key:** Optionally designate an INT64 or VARCHAR field as the partition key. **Note:** Each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to [Use Partition Key](./use-partition-key).

    1. **(Optional) Adjust shards:**

        - Click **Advanced Settings** to configure the number of shards for your target collection.

        - For datasets of around 100 million rows, a single shard is typically sufficient.

        - If your dataset exceeds 1 billion rows, [contact us](https://zilliz.com/contact-sales) to discuss optimal shard configuration for your use case.

1. Click **Migrate**.

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

![ALt3blv2MoUd04xhosXcYCWWnhg](/img/ALt3blv2MoUd04xhosXcYCWWnhg.png)

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

