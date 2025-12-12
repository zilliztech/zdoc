---
title: "Migrate from Qdrant to Zilliz Cloud | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how Zilliz Cloud handles data type mapping, payload field conversion, and collection naming rules when migrating from Qdrant. | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - qdrant
  - Machine Learning
  - RAG
  - NLP
  - Neural Network

---

import Admonition from '@theme/Admonition';


# Migrate from Qdrant to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, payload field conversion, and collection naming rules when migrating from [Qdrant](https://qdrant.tech/).

## Prerequisites\{#prerequisites}

Before starting your Qdrant to Zilliz Cloud migration, ensure you meet these requirements:

### Qdrant requirements\{#qdrant-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Source Qdrant cluster must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>API access</p></td>
     <td><p>Cluster endpoint and API key with access permissions</p></td>
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

Understanding how Qdrant data types map to Zilliz Cloud is crucial for planning your migration:

<table>
   <tr>
     <th><p>Qdrant Field Type</p></th>
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
     <td><p>Payload</p></td>
     <td><p>JSON (dynamic fields)</p></td>
     <td><p>Mapped as dynamic schema by default; can be converted to fixed fields.</p><p>Refer to <a href="./enable-dynamic-field">Dynamic Field</a> for more details.</p></td>
   </tr>
</table>

## Payload field conversion\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud samples 100 rows to detect payload schema. You can manually add additional fields if needed.</p>

</Admonition>

Qdrant payload is initially mapped to Zilliz Cloud's dynamic schema for maximum flexibility. You can optionally convert payload fields to fixed fields to gain:

- Enforced data types for stronger validation

- Optimized indexing for better query performance

- Structured schema for consistent data management

When converting payload to fixed fields:

<table>
   <tr>
     <th><p>Qdrant Payload Type</p></th>
     <th><p>Zilliz Fixed Field Type</p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p>Integer</p></td>
     <td><p>INT64</p></td>
     <td><p>Direct type conversion</p></td>
   </tr>
   <tr>
     <td><p>Float</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>All float numbers become DOUBLE</p></td>
   </tr>
   <tr>
     <td><p>Bool</p></td>
     <td><p>BOOL</p></td>
     <td><p>Direct mapping</p></td>
   </tr>
   <tr>
     <td><p>Keyword</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Maximum 65,535 bytes supported</p></td>
   </tr>
   <tr>
     <td><p>Geo</p></td>
     <td><p>JSON</p></td>
     <td><p>Preserved as JSON structure; cannot convert to fixed fields</p></td>
   </tr>
   <tr>
     <td><p>Datetime</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Maximum 65,535 bytes supported</p></td>
   </tr>
   <tr>
     <td><p>UUID</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Maximum 65,535 bytes supported</p></td>
   </tr>
</table>

### Array type support\{#array-type-support}

Array types are not detected in existing payload data and cannot be converted from dynamic fields. However, most array types can be manually added as new fields during migration configuration:

<table>
   <tr>
     <th><p>Qdrant Array Type</p></th>
     <th><p>Zilliz Cloud Array Type</p></th>
     <th><p>Available for Manual Addition</p></th>
   </tr>
   <tr>
     <td><p>Array\<Integer></p></td>
     <td><p>ARRAY\<INT64></p></td>
     <td><p>✅ Can be added as new field</p></td>
   </tr>
   <tr>
     <td><p>Array\<Float></p></td>
     <td><p>ARRAY\<DOUBLE></p></td>
     <td><p>✅ Can be added as new field</p></td>
   </tr>
   <tr>
     <td><p>Array\<Bool></p></td>
     <td><p>ARRAY\<BOOL></p></td>
     <td><p>✅ Can be added as new field</p></td>
   </tr>
   <tr>
     <td><p>Array\<Keyword></p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>✅ Can be added as new field</p></td>
   </tr>
   <tr>
     <td><p>Array\<Geo></p></td>
     <td><p>Not supported</p></td>
     <td><p>❌ Not available</p></td>
   </tr>
   <tr>
     <td><p>Array\<Datetime></p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>✅ Can be added as new field</p></td>
   </tr>
   <tr>
     <td><p>Array\<UUID></p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>✅ Can be added as new field</p></td>
   </tr>
</table>

For payload fields converted to fixed fields, you can configure additional attributes:

- **Nullable**: Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable attribute](./nullable-and-default#nullable-attribute).

- **Default Value**: Set fallback values when data is missing. For details, refer to [Default values](./nullable-and-default#default-values).

- **Partition Key**: Optionally designate an INT64 or VARCHAR field as the partition key. Note that each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to  [Use Partition Key](./use-partition-key).

## Qdrant-specific handling rules\{#qdrant-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

Qdrant collection names are transferred to Zilliz Cloud with the following considerations:

<table>
   <tr>
     <th><p>Scenario</p></th>
     <th><p>Impact</p></th>
     <th><p>Solution</p></th>
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
