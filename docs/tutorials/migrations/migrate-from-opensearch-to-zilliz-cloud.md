---
title: "Migrate from OpenSearch to Zilliz Cloud | Cloud"
slug: /migrate-from-opensearch-to-zilliz-cloud
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
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';


# Migrate from OpenSearch to Zilliz Cloud

[OpenSearch](https://opensearch.org/) is a distributed search and analytics engine that supports various use cases, from implementing a search box on a website to analyzing security data for threat detection. Zilliz Cloud enables seamless migration from OpenSearch, allowing you to leverage advanced analytics and AI-driven insights. This guide outlines how to transfer your OpenSearch data to Zilliz Cloud.

## Considerations{#considerations}

- Zilliz Cloud supports migrating most OpenSearch data types. Before starting, verify that your data types are compatible. If your table has fields with unsupported data types, you can choose not to migrate those fields or submit a [support ticket](https://support.zilliz.com/hc/en-us/requests/new). For a full list of supported data types, [Field mapping reference](./migrate-from-opensearch-to-zilliz-cloud).

- Each migration task is limited to a single source OpenSearch cluster. If you have data in multiple source clusters, you can set up separate migration jobs for each one.

## Before you start{#before-you-start}

- The source OpenSearch cluster is accessible from the internet.

-  If you have an allowlist configured in your network environment, ensure that Zilliz Cloud IP addresses are added to it. For more information, refer to [Zilliz Cloud IPs](./zilliz-cloud-ips).

- You have been granted the **Organization Owner** or **Project Admin** role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from OpenSearch to Zilliz Cloud{#migrate-from-opensearch-to-zilliz-cloud}

You can migrate source data to a Zilliz Cloud cluster of any plan tier, provided its CU size can accommodate the source data.

![migrate_from_opensearch](/img/migrate_from_opensearch.png)

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **OpenSearch**.

1. In the **Connect to Data Source** step, enter **Cluster Endpoint** (e.g. `https://<ID>.<region>.es.amazonaws.com` for AWS OpenSearch, `https://<ip>:<port>` for OpenSearch Community Edition), **Username**, and **Password** of the source OpenSearch cluster to establish connections. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Need help finding your OpenSearch credentials? Check <a href="https://opensearch.org/docs/latest/getting-started/communicate/">Communicate with OpenSearch</a>.</p>

    </Admonition>

1. In the **Select Source and Target** step, configure settings for the source OpenSearch cluster and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source index you choose to migrate from OpenSearch must include a vector field.</p>

    </Admonition>

1. In the **Configure Schema** step,

    1. Verify the data mapping between your OpenSearch data and the corresponding Zilliz Cloud data types. Zilliz Cloud has a default mechanism for mapping OpenSearch data types to its own, but you can review and make necessary adjustments. Currently, you can rename fields, but cannot change the underlying data types.

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

Review the table below to understand how OpenSearch data types map to Zilliz Cloud field types.

<table>
   <tr>
     <th><p><strong>OpenSearch Field Type</strong></p></th>
     <th><p><strong>Zilliz Cloud Field Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/">k-NN vector</a></p></td>
     <td><p><code>FLOAT_VECTOR</code></p></td>
     <td><p>The <code>float</code> vector type from OpenSearch is mapped to <code>FLOAT_VECTOR</code> on Zilliz Cloud. Byte/Binary vectors from OpenSearch are not supported for migration. Vector dimensions remain unchanged.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/alias/">Alias</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Alias fields are not supported.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/binary/">Binary</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Binary data is stored as a string on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/">Numeric</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>byte</code></p></td>
     <td><p><code>INT8</code></p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>double</code></p></td>
     <td><p><code>DOUBLE</code></p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>float</code></p></td>
     <td><p><code>FLOAT</code></p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>half_float</code></p></td>
     <td><p><code>FLOAT</code></p></td>
     <td><p>Mapped to <code>FLOAT</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>integer</code></p></td>
     <td><p><code>INT32</code></p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>long</code></p></td>
     <td><p><code>INT64</code></p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>short</code></p></td>
     <td><p><code>INT16</code></p></td>
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
     <td><p><code>BOOL</code></p></td>
     <td><p>Stores <code>true</code> or <code>false</code>.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/dates/">Date</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string. Ensure correct format conversion.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/ip/">IP address</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/range/">Range</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/">Object</a></p></td>
     <td><p><code>JSON</code></p></td>
     <td><p>Serialized into JSON format.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/string/">String</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>keyword</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>text</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Mapped to <code>VARCHAR</code> .</p></td>
   </tr>
   <tr>
     <td><p><code>match_only_text</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>token_count</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>wildcard</code></p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/">Autocomplete</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/">Geographic</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/rank/">Rank</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/">Percolator</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
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

- **Potential data loss or truncation**: When storing fields like Date, Range, IP address, or large text content in a `VARCHAR` column, consider any length limitations or indexing requirements on Zilliz Cloud.

- **Unsupported field types**: For OpenSearch types that are **not supported**, transform or exclude them before migrating to Zilliz Cloud.

