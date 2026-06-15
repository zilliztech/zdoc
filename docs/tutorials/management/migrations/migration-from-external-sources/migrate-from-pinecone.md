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
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Migrate from Pinecone to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, field conversion, namespace processing, and collection naming rules when migrating from [Pinecone](https://www.pinecone.io/).

## Prerequisites\{#prerequisites}

Before starting your Pinecone to Zilliz Cloud migration, ensure you meet these requirements:

### Pinecone requirements\{#pinecone-requirements}

| Requirement | Details |
| --- | --- |
| Index type | Supports migrating from Pinecone Serverless indexes only |
| API access | Pinecone API key with access permissions |
| Data availability | Source indexes from Pinecone must contain data. Empty indexes cannot be migrated. |
| Vector dimension | Dimension must be > 1. Single-dimension vectors will cause migration failure |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin |
| Cluster capacity | Sufficient storage and compute resources (use the [CU calculator](https://zilliz.com/pricing#calculator) to estimate CU size) |
| Network access | Add [Zilliz Cloud IPs](./zilliz-cloud-ips) to allowlists if using network restrictions |

## Data type mapping\{#data-type-mapping}

Understanding how Pinecone data types map to Zilliz Cloud is crucial for planning your migration:

| Pinecone Field Type | Zilliz Cloud Field Type | Notes |
| --- | --- | --- |
| Primary key | VARCHAR (primary key) | Automatically mapped. Enable Auto ID to generate new IDs (original values will be discarded). |
| Dense vector | FLOAT_VECTOR | Dimensions preserved exactly, no modifications needed |
| Sparse vector | SPARSE_FLOAT_VECTOR | Only mapped if non-empty in sample data. |
| Metadata | Dynamic fields | Mapped as dynamic schema by default; can be converted to fixed fields.<br/>Refer to [Dynamic Field](./enable-dynamic-field) for more details. |
| Namespace | Partition key / partition | Recommended for performance optimization.<br/>Refer to [Namespace processing](./migrate-from-pinecone#namespace-processing) for more details. |

## Metadata field conversion\{#metadata-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud samples 100 rows to detect metadata schema. You can manually add additional fields if needed.

</Admonition>

Pinecone metadata is initially mapped to Zilliz Cloud's dynamic schema for maximum flexibility. You can optionally convert metadata fields to fixed fields to gain:

- Enforced data types for stronger validation

- Optimized indexing for better query performance

- Structured schema for consistent data management

When converting metadata to fixed fields:

| Pinecone Metadata Type | Zilliz Fixed Field Type | Notes |
| --- | --- | --- |
| String | VARCHAR | Maximum 65,535 bytes supported |
| Number (int/float) | DOUBLE | All numeric types become DOUBLE |
| Boolean | BOOL | Direct mapping |
| List of strings | ARRAY&lt;VARCHAR&gt; | Nested arrays supported |

For metadata fields converted to fixed fields, you can configure additional attributes:

- **Nullable**: Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable attribute](./nullable-fields).

- **Default Value**: Set fallback values when data is missing. For details, refer to [Default values](./nullable-fields).

## Pinecone-specific handling rules\{#pinecone-specific-handling-rules}

### Namespace processing\{#namespace-processing}

Pinecone namespaces can be migrated using two strategies:

| Strategy | Implementation | Performance Impact | Use Case |
| --- | --- | --- | --- |
| **Namespace as Partition Key** *(Recommended)* | Namespaces become values in a partition key field | Automatic optimization for search performance | Most scenarios with multiple namespaces |
| **Namespace as Partition** | Each namespace becomes a separate partition | Manual partition management required | Simple scenarios with few, stable namespaces |

<Admonition type="info" icon="📘" title="Notes">

Pinecone's `default` namespace handling:

- **As Partition**: Becomes `_default` partition in Zilliz Cloud

- **As Partition Key**: Becomes empty string `""` value

For more information on partition and partition key concepts, refer to [Manage Partitions](./manage-partitions) and [Use Partition Key](./use-partition-key).

</Admonition>

### Collection naming rules\{#collection-naming-rules}

Pinecone index names are automatically processed for Zilliz Cloud compatibility:

| Pinecone Index Name | Zilliz Cloud Collection Name | Rule Applied |
| --- | --- | --- |
| `my-vector-index` | `my_vector_index` | Hyphens (`-`) converted to underscores (`_`) to comply with Zilliz Cloud collection naming conventions |
| `product_search` | `product_search` | No change needed |

**Naming conflicts**: If a collection with the same name already exists in the target database, you must:

- Delete the existing collection, or

- Choose a different target database, or

- Rename the target collection during migration configuration

