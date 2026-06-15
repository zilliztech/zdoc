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
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Migrate from Tencent Cloud to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, JSON field conversion, and collection naming rules when migrating from [Tencent Cloud VectorDB](https://www.tencentcloud.com/products/vdb).

## Prerequisites\{#prerequisites}

Before starting your Tencent Cloud VectorDB to Zilliz Cloud migration, ensure you meet these requirements:

### Tencent Cloud VectorDB requirements\{#tencent-cloud-vectordb-requirements}

| Requirement | Details |
| --- | --- |
| Network access | Source VectorDB instance must be accessible from the public internet |
| API access | Valid instance URL and API key with necessary permissions |
| Data availability | Source collections must contain data. Empty collections cannot be migrated. |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin |
| Cluster capacity | Sufficient storage and compute resources (use the [CU calculator](https://zilliz.com/pricing#calculator) to estimate CU size) |
| Network access | Add [Zilliz Cloud IPs](./zilliz-cloud-ips) to allowlists if using network restrictions |

## Data type mapping\{#data-type-mapping}

Understanding how Tencent Cloud VectorDB data types map to Zilliz Cloud is crucial for planning your migration:

| VectorDB Field Type | Zilliz Cloud Field Type | Description |
| --- | --- | --- |
| Primary key | VARCHAR (Primary key) | The primary key from Tencent Cloud VectorDB is automatically mapped as the primary key in Zilliz Cloud.<br/>When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source collection will be discarded. |
| Dense vector | FLOAT_VECTOR | Dense vector fields are transferred as FLOAT_VECTOR with no modifications required. |
| JSON | JSON (dynamic fields) | Mapped as dynamic schema by default; can be converted to fixed fields.<br/>Refer to [Dynamic Field](./enable-dynamic-field) for more details. |

## JSON field conversion\{#json-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud samples 100 rows to detect JSON schema. You can manually add additional fields if needed.

</Admonition>

Tencent Cloud VectorDB's JSON fields are initially mapped to Zilliz Cloud's dynamic schema for maximum flexibility. You can optionally convert JSON fields to fixed fields to gain:

- Enforced data types for stronger validation

- Optimized indexing for better query performance

- Structured schema for consistent data management

The following JSON field types can be automatically converted from dynamic to fixed fields:

| VectorDB JSON Type | Zilliz Fixed Field Type | Notes |
| --- | --- | --- |
| string | VARCHAR | Maximum 65,535 bytes supported |
| uint64 | INT32 | Numeric conversion with type adjustment |
| double | DOUBLE | Direct type conversion |
| array | ARRAY | Supported with corresponding element types |

For JSON fields converted to fixed fields, you can configure additional attributes:

- **Nullable**: Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable attribute](./nullable-fields).

- **Default Value**: Set fallback values when data is missing. For details, refer to [Default values](./nullable-fields).

- **Partition Key**: Optionally designate an INT64 or VARCHAR field as the partition key. Note that each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to  [Use Partition Key](./use-partition-key).

## Tencent Cloud VectorDB-specific handling rules\{#tencent-cloud-vectordb-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

Tencent Cloud VectorDB collection names are transferred to Zilliz Cloud with the following considerations:

| Scenario | Impact | Solution |
| --- | --- | --- |
| Default naming | Collection names match source collection names exactly | Names are preserved as-is from Tencent Cloud VectorDB |
| Naming conflicts | Cannot submit a migration job if a collection with the same name already exists in the database | Delete existing collection, choose a different target database, or rename during migration configuration |
| Special characters | Collection names are preserved as-is from Qdrant | Ensure collection names comply with Zilliz Cloud naming conventions |
