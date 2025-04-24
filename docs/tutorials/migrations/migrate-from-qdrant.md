---
title: "Migrate from Qdrant to Zilliz Cloud | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Migrate from Qdrant"
beta: FALSE
notebook: FALSE
description: "Qdrant is a vector database that provides similarity search capabilities. Migrating data from Qdrant to Zilliz Cloud allows users to leverage Zilliz Cloud's advanced search and analytics features while maintaining compatibility with the multi-vector structure supported by Qdrant. | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - qdrant
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension

---

import Admonition from '@theme/Admonition';


# Migrate from Qdrant to Zilliz Cloud

[Qdrant](https://qdrant.tech/) is a vector database that provides similarity search capabilities. Migrating data from Qdrant to Zilliz Cloud allows users to leverage Zilliz Cloud's advanced search and analytics features while maintaining compatibility with the multi-vector structure supported by Qdrant.

The migration process is structured into these steps:

1. **Connect to data source**: Enter your Qdrant cluster endpoint and API key to establish a connection.

1. **Select source and target**:

    - Choose one or more Qdrant collections for migration.

    - Select an existing Zilliz Cloud cluster as the target.

1. **Configure schema**: Verify that field types are correctly mapped between Qdrant and Zilliz Cloud. For detailed mapping rules, refer to [Mapping rules](./migrate-from-qdrant#mapping-rules).

![Xz5bwiuU6hW8pdbSOZ1cjypan4g](/img/Xz5bwiuU6hW8pdbSOZ1cjypan4g.png)

## Mapping rules{#mapping-rules}

The following table summarizes how field types in Pinecone are mapped to Zilliz Cloud field types, along with details on any customization options.

<table>
   <tr>
     <th><p>Qdrant Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key</p></td>
     <td><p>The primary key from Qdrant is automatically mapped as the primary key in Zilliz Cloud. When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source collection will be discarded.</p></td>
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
     <td><p>Payload</p></td>
     <td><p>Dynamic field</p></td>
     <td><p>By default, Qdrant's payload is mapped as a dynamic schema in Zilliz Cloud. For more information, refer to <a href="./enable-dynamic-field">Dynamic Field</a>. When migrating data, consider converting dynamic fields into fixed fields when their patterns have stabilized and you want to enforce strict data types and optimized index configurations for these fields.</p></td>
   </tr>
   <tr>
     <td><p>Keyword</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>If a payload field is of type Keyword and you convert it to a fixed field, it becomes a VARCHAR type. <strong>Note:</strong> The maximum length for this field is fixed at 65,535 bytes and cannot be modified. The capacity calculation is determined by the actual field length.</p></td>
   </tr>
   <tr>
     <td><p>Geo</p></td>
     <td><p>JSON</p></td>
     <td><p>If a payload field is of type Geo and you convert it to a fixed field, it becomes a JSON type.</p></td>
   </tr>
   <tr>
     <td><p>Datetime</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>If a payload field is of type Datetime and you convert it to a fixed field, it becomes a VARCHAR type. <strong>Note:</strong> The maximum length for this field is fixed at 65,535 bytes and cannot be modified. The capacity calculation is determined by the actual field length.</p></td>
   </tr>
   <tr>
     <td><p>UUID</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>If a payload field is of type UUID and you convert it to a fixed field, it becomes a VARCHAR type. <strong>Note:</strong> The maximum length for this field is fixed at 65,535 bytes and cannot be modified. The capacity calculation is determined by the actual field length.</p></td>
   </tr>
</table>

## Before you start{#before-you-start}

- The source Qdrant cluster is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have obtained the cluster endpoint and API key with necessary permissions to access the target Qdrant cluster.

- You have been granted the Organization Owner or Project Admin role on Zilliz Cloud. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from Qdrant to Zilliz Cloud{#migrate-from-qdrant-to-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Qdrant**.

    ![Y5SbbAfSVoa91Px86kwcE2V1n4c](/img/Y5SbbAfSVoa91Px86kwcE2V1n4c.png)

1. In the **Connect to Data Source** step, enter the **Cluster Endpoint** and **API Key** that can be used as credentials to access the target Qdrant cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p><a href="https://qdrant.tech/documentation/cloud/authentication/?q=api+key">Database Authentication</a> can guide you on obtaining the required connection information.</p>

    </Admonition>

    ![Zg7ubMYwfosUFtxapvVckXgOnLg](/img/Zg7ubMYwfosUFtxapvVckXgOnLg.png)

1. In the **Select Source and Target** step, configure settings for the source Qdrant cluster and target Zilliz Cloud cluster. Then, click **Next**.

    ![Kp6mbfnbto6ARMxSNB6c3d45nCg](/img/Kp6mbfnbto6ARMxSNB6c3d45nCg.png)

1. In the **Configure Schema** step, set up field mappings between Zilliz Cloud and Qdrant:

    ![ZtsIbfZ3poyGm6xN2nXcy3yWnxc](/img/ZtsIbfZ3poyGm6xN2nXcy3yWnxc.png)

    1. **Confirm field mappings:**

        - Zilliz Cloud automatically detects and displays your Qdrant fields alongside their corresponding target fields. For details on how these fields are mapped, refer to [Mapping rules](./migrate-from-qdrant#mapping-rules).

        - Verify that each Qdrant field is correctly paired with its corresponding target field. You can rename fields as needed, but note that the data type cannot be changed.

    1. **Handle metadata fields:**

        - Your Qdrant payload fields appear in the **Metadata** section and are set as dynamic fields by default.

            <Admonition type="info" icon="📘" title="Notes">

            <p><strong>Dynamic fields</strong> store metadata in a JSON format, enabling more flexible and evolving data structures. For details, refer to <a href="./enable-dynamic-field">Dynamic Field</a>.</p>
            <p><strong>Fixed fields</strong> are explicitly defined in your schema with a predetermined structure. They allow you to enforce specific data types and index configurations.</p>

            </Admonition>

        - To convert a payload field into a fixed field, select the field and click the **Convert to Fixed Field** icon. Note that Zilliz Cloud samples only 100 rows to extract fields from payloads. To add more fields, click the Settings icon.

        - For payload fields converted to fixed fields, configure the following attributes:

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

![GKNQbWUSVojWH9xfhxdc1j7Lncb](/img/GKNQbWUSVojWH9xfhxdc1j7Lncb.png)

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

