---
title: "Migrate from Tencent Cloud to Zilliz Cloud | Cloud"
slug: /migrate-from-tencent-cloud
sidebar_label: "Tencent Cloud VectorDB"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how Zilliz Cloud handles data type mapping, JSON field conversion, and collection naming rules when migrating from Tencent Cloud VectorDB. | Cloud"
type: origin
token: SwgXwdHG6iqpbUknXrHcOPd7nRe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - tencent cloud
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval

---

import Admonition from '@theme/Admonition';


# Migrate from Tencent Cloud to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, JSON field conversion, and collection naming rules when migrating from [Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb).

## Prerequisites\{#prerequisites}

Before starting your Tencent Cloud VectorDB to Zilliz Cloud migration, ensure you meet these requirements:

### Tencent Cloud VectorDB requirements\{#tencent-cloud-vectordb-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Source VectorDB instance must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>API access</p></td>
     <td><p>Valid instance URL and API key with necessary permissions</p></td>
   </tr>
   <tr>
     <td><p>Data availability</p></td>
     <td><p>Source collections must contain data. Empty collections cannot be migrated.</p></td>
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

Understanding how Tencent Cloud VectorDB data types map to Zilliz Cloud is crucial for planning your migration:

<table>
   <tr>
     <th><p>VectorDB Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>VARCHAR (Primary key)</p></td>
     <td><p>The primary key from Tencent Cloud VectorDB is automatically mapped as the primary key in Zilliz Cloud.</p><p>When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source collection will be discarded.</p></td>
   </tr>
   <tr>
     <td><p>Dense vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Dense vector fields are transferred as FLOAT_VECTOR with no modifications required.</p></td>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>JSON (dynamic fields)</p></td>
     <td><p>Mapped as dynamic schema by default; can be converted to fixed fields.</p><p>Refer to <a href="./enable-dynamic-field">Dynamic Field</a> for more details.</p></td>
   </tr>
</table>

## JSON field conversion\{#json-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud samples 100 rows to detect JSON schema. You can manually add additional fields if needed.</p>

</Admonition>

Tencent Cloud VectorDB's JSON fields are initially mapped to Zilliz Cloud's dynamic schema for maximum flexibility. You can optionally convert JSON fields to fixed fields to gain:

- Enforced data types for stronger validation

- Optimized indexing for better query performance

- Structured schema for consistent data management

The following JSON field types can be automatically converted from dynamic to fixed fields:

<table>
   <tr>
     <th><p>VectorDB JSON Type</p></th>
     <th><p>Zilliz Fixed Field Type</p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p>string</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Maximum 65,535 bytes supported</p></td>
   </tr>
   <tr>
     <td><p>uint64</p></td>
     <td><p>INT32</p></td>
     <td><p>Numeric conversion with type adjustment</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>Direct type conversion</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>Supported with corresponding element types</p></td>
   </tr>
</table>

For JSON fields converted to fixed fields, you can configure additional attributes:

- **Nullable**: Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable attribute](./nullable-and-default#nullable-attribute).

- **Default Value**: Set fallback values when data is missing. For details, refer to [Default values](./nullable-and-default#default-values).

- **Partition Key**: Optionally designate an INT64 or VARCHAR field as the partition key. Note that each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to  [Use Partition Key](./use-partition-key).

## Tencent Cloud VectorDB-specific handling rules\{#tencent-cloud-vectordb-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

Tencent Cloud VectorDB collection names are transferred to Zilliz Cloud with the following considerations:

<table>
   <tr>
     <th><p>Scenario</p></th>
     <th><p>Impact</p></th>
     <th><p>Solution</p></th>
   </tr>
   <tr>
     <td><p>Default naming</p></td>
     <td><p>Collection names match source collection names exactly</p></td>
     <td><p>Names are preserved as-is from Tencent Cloud VectorDB</p></td>
   </tr>
   <tr>
     <td><p>Naming conflicts</p></td>
     <td><p>Cannot submit a migration job if a collection with the same name already exists in the database</p></td>
     <td><p>Delete existing collection, choose a different target database, or rename during migration configuration</p></td>
   </tr>
   <tr>
     <td><p>Special characters</p></td>
     <td><p>Collection names are preserved as-is from Qdrant</p></td>
     <td><p>Ensure collection names comply with Zilliz Cloud naming conventions</p></td>
   </tr>
</table>
