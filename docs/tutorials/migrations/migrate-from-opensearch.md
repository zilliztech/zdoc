---
title: "Migrate from OpenSearch to Zilliz Cloud | Cloud"
slug: /migrate-from-opensearch
sidebar_label: "Migration from OpenSearch"
beta: FALSE
notebook: FALSE
description: "OpenSearch is a distributed search and analytics engine that supports various use cases, from implementing a search box on a website to analyzing security data for threat detection. Zilliz Cloud enables seamless migration from OpenSearch, allowing you to leverage advanced analytics and AI-driven insights. This guide outlines how to transfer your OpenSearch data to Zilliz Cloud. | Cloud"
type: origin
token: VFMLwxpsniVGKYkE3DecmpQ2nrg
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - amazon
  - opensearch
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search

---

import Admonition from '@theme/Admonition';


# Migrate from OpenSearch to Zilliz Cloud

[OpenSearch](https://opensearch.org/) is a distributed search and analytics engine that supports various use cases, from implementing a search box on a website to analyzing security data for threat detection. Zilliz Cloud enables seamless migration from OpenSearch, allowing you to leverage advanced analytics and AI-driven insights. This guide outlines how to transfer your OpenSearch data to Zilliz Cloud.

The migration process is structured into these steps:

1. **Connect to data source**: Enter your OpenSearch cluster endpoint to establish a connection.

1. **Select source and target**:

    - Choose one or more OpenSearch tables for migration.

    - Select an existing Zilliz Cloud cluster as the target.

1. **Configure schema**: Verify that field types are correctly mapped between OpenSearch and Zilliz Cloud. For detailed mapping rules, refer to [Mapping rules](./migrate-from-opensearch#mapping-rules).

![AOMywyBdthmZ3lbTS1NcFCwtnIe](/img/AOMywyBdthmZ3lbTS1NcFCwtnIe.png)

## Mapping rules{#mapping-rules}

The following table summarizes how field types in OpenSearch are mapped to Zilliz Cloud field types, along with details on any customization options.

<table>
   <tr>
     <th><p><strong>OpenSearch Field Type</strong></p></th>
     <th><p><strong>Zilliz Cloud Field Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key</p></td>
     <td><p>OpenSearch's primary key (<a href="https://opensearch.org/docs/latest/field-types/metadata-fields/id/">_id</a>) is automatically mapped as the primary key in Zilliz Cloud. When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source table will be discarded.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/">k-NN vector</a></p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>The <code>float</code> vector type from OpenSearch is mapped to <code>FLOAT_VECTOR</code> on Zilliz Cloud. Byte/Binary vectors from OpenSearch are not supported for migration. Vector dimensions remain unchanged.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/alias/">Alias</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Alias fields are not supported.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/binary/">Binary</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Binary data is stored as a string on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/">Numeric</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>byte</code></p></td>
     <td><p>INT8</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>double</code></p></td>
     <td><p>DOUBLE</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>float</code></p></td>
     <td><p>FLOAT</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>half_float</code></p></td>
     <td><p>FLOAT</p></td>
     <td><p>Mapped to <code>FLOAT</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>integer</code></p></td>
     <td><p>INT32</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>long</code></p></td>
     <td><p>INT64</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>short</code></p></td>
     <td><p>INT16</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>unsigned_long</code></p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><code>scaled_float</code></p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/">Boolean</a></p></td>
     <td><p>BOOL</p></td>
     <td><p>Stores <code>true</code> or <code>false</code>.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/dates/">Date</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string. Ensure correct format conversion.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/ip/">IP address</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/range/">Range</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/">Object</a></p></td>
     <td><p>JSON</p></td>
     <td><p>Serialized into JSON format.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/string/">String</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>keyword</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>text</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Mapped to <code>VARCHAR</code> .</p></td>
   </tr>
   <tr>
     <td><p><code>match_only_text</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>token_count</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>wildcard</code></p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/">Autocomplete</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/">Geographic</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/rank/">Rank</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/">Percolator</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/derived/">Derived</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Derived fields are not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/">Star-tree</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Star-tree fields are not supported on Zilliz Cloud.</p></td>
   </tr>
</table>

## Before you start{#before-you-start}

- The source OpenSearch cluster is accessible from the internet.

-  If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have been granted the **Organization Owner** or **Project Admin** role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from OpenSearch to Zilliz Cloud{#migrate-from-opensearch-to-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **OpenSearch**.

    ![XoMYbw3o0oxyk3xNEaYcXgxUnOd](/img/XoMYbw3o0oxyk3xNEaYcXgxUnOd.png)

1. In the **Connect to Data Source** step, enter **Cluster Endpoint** (e.g. `https://<ID>.<region>.es.amazonaws.com` for AWS OpenSearch, `https://<ip>:<port>` for OpenSearch Community Edition), **Username**, and **Password** of the source OpenSearch cluster to establish connections. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Need help finding your OpenSearch credentials? Check <a href="https://opensearch.org/docs/latest/getting-started/communicate/">Communicate with OpenSearch</a>.</p>

    </Admonition>

    ![L4oVb5Ty4oyXj6xxoJtcxMIinve](/img/L4oVb5Ty4oyXj6xxoJtcxMIinve.png)

1. In the **Select Source and Target** step, configure settings for the source OpenSearch cluster and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source index you choose to migrate from OpenSearch must include a vector field.</p>

    </Admonition>

    ![A6CRbwM89okma2xlZzScyG89nvg](/img/A6CRbwM89okma2xlZzScyG89nvg.png)

1. In the **Configure Schema** step, set up field mappings between Zilliz Cloud and OpenSearch:

    ![Tbzlb2Pmooa2GXx3A23coKFCnof](/img/Tbzlb2Pmooa2GXx3A23coKFCnof.png)

    1. **Confirm field mappings:**

        - Zilliz Cloud automatically detects and displays your OpenSearch fields alongside their corresponding target fields. For details on how these fields are mapped, refer to [Mapping rules](./migrate-from-opensearch#mapping-rules).

        - Verify that each OpenSearch field is correctly paired with its corresponding target field. You can rename fields as needed, but note that the data type cannot be changed.

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

![X6wQbMfoaorfpAxUAaLcEeuEnoe](/img/X6wQbMfoaorfpAxUAaLcEeuEnoe.png)

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

