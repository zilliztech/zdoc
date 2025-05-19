---
title: "Migrate from Elasticsearch to Zilliz Cloud | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Migrate from Elasticsearch"
beta: FALSE
notebook: FALSE
description: "Elasticsearch is a highly scalable search and analytics engine known for its speed and flexibility in handling large volumes of data. By leveraging Zilliz Cloud's migration capabilities, you can seamlessly transfer data from your Elasticsearch instances to your Zilliz Cloud cluster. | Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - elasticsearch
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index

---

import Admonition from '@theme/Admonition';


# Migrate from Elasticsearch to Zilliz Cloud

[Elasticsearch](https://www.elastic.co/elasticsearch) is a highly scalable search and analytics engine known for its speed and flexibility in handling large volumes of data. By leveraging Zilliz Cloud's migration capabilities, you can seamlessly transfer data from your Elasticsearch instances to your Zilliz Cloud cluster.

The migration process is structured into these steps:

1. **Connect to data source**: Enter your Elasticsearch cluster endpoint or cloud ID to establish a connection.

1. **Select source and target**:

    - Choose one or more Elasticsearch indexes for migration.

    - Select an existing Zilliz Cloud cluster as the target.

1. **Configure schema**: Verify that field types are correctly mapped between Elasticsearch and Zilliz Cloud. For detailed mapping rules, refer to [Mapping rules](./migrate-from-elasticsearch#mapping-rules).

![AxBLwbKFhhiwQXbZocqcjp8qnFj](/img/AxBLwbKFhhiwQXbZocqcjp8qnFj.png)

## Mapping rules{#mapping-rules}

The following table summarizes how field types in Elasticsearch are mapped to Zilliz Cloud field types, along with details on any customization options.

<table>
   <tr>
     <th><p><strong>Elasticsearch Field Type</strong></p></th>
     <th><p><strong>Zilliz Cloud Field Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key</p></td>
     <td><p>Elasticsearch's ID field is automatically mapped as the primary key in Zilliz Cloud. When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source index will be discarded.</p></td>
   </tr>
   <tr>
     <td><p>dense_vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Vector dimensions remain unchanged. Specify <strong>L2</strong> or <strong>IP</strong> as the metric type.</p></td>
   </tr>
   <tr>
     <td><p>text, string, keyword, ip, date, timestamp</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Set Max Length (1 to 65,535). Strings exceeding the limit can trigger migration errors.</p></td>
   </tr>
   <tr>
     <td><p>long</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>short</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>byte</p></td>
     <td><p>INT8</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>float</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>object</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>arrays</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, migrating sparse vectors from Elasticsearch indexes are not supported.</p>

</Admonition>

## Before you start{#before-you-start}

- The source Elasticsearch cluster is running version 7.x or later and is accessible from the public internet.

- If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

- Make sure the CU size can of the target cluster can accommodate your source data. To estimate the required CU size, use the [calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator).

## Migrate from Elasticsearch to Zilliz Cloud{#migrate-from-elasticsearch-to-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Elasticsearch**.

    ![FfnzbqCmmo0ZxqxEwy6czqcHnYf](/img/FfnzbqCmmo0ZxqxEwy6czqcHnYf.png)

1. In the **Connect to Data Source** step, enter connection information to the source Elasticsearch cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p><a href="https://www.elastic.co/guide/en/cloud-enterprise/current/ece-connect.html#ece-connect">Connect to your cluster</a> and <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-get-api-key.html">Get API key information</a> can guide you on obtaining the required connection information.</p>

    </Admonition>

    ![BGO8brYeTo4KgfxjCnDc7aCnnXe](/img/BGO8brYeTo4KgfxjCnDc7aCnnXe.png)

1. In the **Select Source and Target** step, configure settings for the source Elasticsearch cluster and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source index you choose to migrate from Elasticsearch must contain a vector field.</p>

    </Admonition>

    ![Lf3DbhwFooUqDxxf0S5cDiypnhb](/img/Lf3DbhwFooUqDxxf0S5cDiypnhb.png)

1. In the **Configure Schema** step, set up field mappings between Zilliz Cloud and Elasticsearch:

    ![MYEebcXTGo0S3lxgudDc7Pr0nig](/img/MYEebcXTGo0S3lxgudDc7Pr0nig.png)

    1. **Confirm field mappings:**

        - Zilliz Cloud automatically detects and displays your Elasticsearch fields alongside their corresponding target fields. For details on how these fields are mapped, refer to [Mapping rules](./migrate-from-elasticsearch#mapping-rules).

        - Verify that each Elasticsearch field is correctly paired with its corresponding target field. You can rename fields as needed, but note that the data type cannot be changed.

    1. **Handle scalar fields:**

        For scalar fields, configure the following attributes:

        - **Nullable:** Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable & Default](./nullable-and-default).

        - **Default Value:** Specify a default value for a field. For details, refer to [Nullable & Default](./nullable-and-default).

        - **Partition Key:** Optionally designate an INT64 or VARCHAR field as the partition key. **Note:** Each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to [Use Partition Key](./use-partition-key).

    1. **Enable dynamic field:**

        - Dynamic fields are enabled by default. This allows you to include any scalar fields that are not defined in the collection schema.

        - If you disable it, you need to explicitly define each field in your entity before inserting data. For more information, refer to [Dynamic Field](./enable-dynamic-field).

    1. **(Optional) Adjust shards:**

        - Click **Advanced Settings** to configure the number of shards for your target collection.

        - For datasets of around 100 million rows, a single shard is typically sufficient.

        - If your dataset exceeds 1 billion rows, [contact us](https://zilliz.com/contact-sales) to discuss optimal shard configuration for your use case.

1. Click **Migrate**.

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

![FowgbDSakogJ3JxNQBsc36gLnGd](/img/FowgbDSakogJ3JxNQBsc36gLnGd.png)

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

