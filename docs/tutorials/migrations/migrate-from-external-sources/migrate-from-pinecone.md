---
title: "Migrate from Pinecone to Zilliz Cloud | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how Zilliz Cloud handles data type mapping, field conversion, namespace processing, and collection naming rules when migrating from Pinecone. | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - pinecone
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense

---

import Admonition from '@theme/Admonition';


# Migrate from Pinecone to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, field conversion, namespace processing, and collection naming rules when migrating from [Pinecone](https://www.pinecone.io/).

## Prerequisites\{#prerequisites}

Before starting your Pinecone to Zilliz Cloud migration, ensure you meet these requirements:

### Pinecone requirements\{#pinecone-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Index type</p></td>
     <td><p>Supports migrating from Pinecone Serverless indexes only</p></td>
   </tr>
   <tr>
     <td><p>API access</p></td>
     <td><p>Pinecone API key with access permissions</p></td>
   </tr>
   <tr>
     <td><p>Data availability</p></td>
     <td><p>Source indexes from Pinecone must contain data. Empty indexes cannot be migrated.</p></td>
   </tr>
   <tr>
     <td><p>Vector dimension</p></td>
     <td><p>Dimension must be &gt; 1. Single-dimension vectors will cause migration failure</p></td>
   </tr>
</table>

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

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

## Data type mapping\{#data-type-mapping}

Understanding how Pinecone data types map to Zilliz Cloud is crucial for planning your migration:

<table>
   <tr>
     <th><p>Pinecone Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>VARCHAR (primary key)</p></td>
     <td><p>Automatically mapped. Enable Auto ID to generate new IDs (original values will be discarded).</p></td>
   </tr>
   <tr>
     <td><p>Dense vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Dimensions preserved exactly, no modifications needed</p></td>
   </tr>
   <tr>
     <td><p>Sparse vector</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
     <td><p>Only mapped if non-empty in sample data.</p></td>
   </tr>
   <tr>
     <td><p>Metadata</p></td>
     <td><p>Dynamic fields</p></td>
     <td><p>Mapped as dynamic schema by default; can be converted to fixed fields.</p><p>Refer to <a href="./enable-dynamic-field">Dynamic Field</a> for more details.</p></td>
   </tr>
   <tr>
     <td><p>Namespace</p></td>
     <td><p>Partition key / partition</p></td>
     <td><p>Recommended for performance optimization.</p><p>Refer to <a href="./migrate-from-pinecone#namespace-processing">Namespace processing</a> for more details.</p></td>
   </tr>
</table>

## Metadata field conversion\{#metadata-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud samples 100 rows to detect metadata schema. You can manually add additional fields if needed.</p>

</Admonition>

Pinecone metadata is initially mapped to Zilliz Cloud's dynamic schema for maximum flexibility. You can optionally convert metadata fields to fixed fields to gain:

- Enforced data types for stronger validation

- Optimized indexing for better query performance

- Structured schema for consistent data management

When converting metadata to fixed fields:

<table>
   <tr>
     <th><p>Pinecone Metadata Type</p></th>
     <th><p>Zilliz Fixed Field Type</p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p>String</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Maximum 65,535 bytes supported</p></td>
   </tr>
   <tr>
     <td><p>Number (int/float)</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>All numeric types become DOUBLE</p></td>
   </tr>
   <tr>
     <td><p>Boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>Direct mapping</p></td>
   </tr>
   <tr>
     <td><p>List of strings</p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>Nested arrays supported</p></td>
   </tr>
</table>

For metadata fields converted to fixed fields, you can configure additional attributes:

- **Nullable**: Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable attribute](./nullable-and-default#nullable-attribute).

- **Default Value**: Set fallback values when data is missing. For details, refer to [Default values](./nullable-and-default#default-values).

## Pinecone-specific handling rules\{#pinecone-specific-handling-rules}

### Namespace processing\{#namespace-processing}

Pinecone namespaces can be migrated using two strategies:

<table>
   <tr>
     <th><p>Strategy</p></th>
     <th><p>Implementation</p></th>
     <th><p>Performance Impact</p></th>
     <th><p>Use Case</p></th>
   </tr>
   <tr>
     <td><p><strong>Namespace as Partition Key</strong> <em>(Recommended)</em></p></td>
     <td><p>Namespaces become values in a partition key field</p></td>
     <td><p>Automatic optimization for search performance</p></td>
     <td><p>Most scenarios with multiple namespaces</p></td>
   </tr>
   <tr>
     <td><p><strong>Namespace as Partition</strong></p></td>
     <td><p>Each namespace becomes a separate partition</p></td>
     <td><p>Manual partition management required</p></td>
     <td><p>Simple scenarios with few, stable namespaces</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Pinecone's <code>default</code> namespace handling:</p>
<ul>
<li><p><strong>As Partition</strong>: Becomes <code>_default</code> partition in Zilliz Cloud</p></li>
<li><p><strong>As Partition Key</strong>: Becomes empty string <code>""</code> value</p></li>
</ul>
<p>For more information on partition and partition key concepts, refer to <a href="./manage-partitions">Manage Partitions</a> and <a href="./use-partition-key">Use Partition Key</a>.</p>

</Admonition>

### Collection naming rules\{#collection-naming-rules}

Pinecone index names are automatically processed for Zilliz Cloud compatibility:

<table>
   <tr>
     <th><p>Pinecone Index Name</p></th>
     <th><p>Zilliz Cloud Collection Name</p></th>
     <th><p>Rule Applied</p></th>
   </tr>
   <tr>
     <td><p><code>my-vector-index</code></p></td>
     <td><p><code>my_vector_index</code></p></td>
     <td><p>Hyphens (<code>-</code>) converted to underscores (<code>_</code>) to comply with Zilliz Cloud collection naming conventions</p></td>
   </tr>
   <tr>
     <td><p><code>product_search</code></p></td>
     <td><p><code>product_search</code></p></td>
     <td><p>No change needed</p></td>
   </tr>
</table>

**Naming conflicts**: If a collection with the same name already exists in the target database, you must:

- Delete the existing collection, or

- Choose a different target database, or

- Rename the target collection during migration configuration

