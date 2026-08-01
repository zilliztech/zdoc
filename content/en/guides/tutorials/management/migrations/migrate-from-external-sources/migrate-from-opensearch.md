---
title: "Migrate from OpenSearch to Zilliz Cloud | Cloud"
slug: /migrate-from-opensearch
sidebar_label: "OpenSearch"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from OpenSearch. | Cloud"
type: origin
token: VFMLwxpsniVGKYkE3DecmpQ2nrg
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Migrate from OpenSearch to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from [OpenSearch](https://opensearch.org/).

## Prerequisites\{#prerequisites}

Before starting your OpenSearch to Zilliz Cloud migration, ensure you meet these requirements:

### OpenSearch requirements\{#opensearch-requirements}

| Requirement | Details |
| --- | --- |
| Network access | Source OpenSearch cluster must be accessible from the public internet |
| Authentication | Valid cluster endpoint, username, and password with necessary permissions |
| Vector field requirement | Each source index must contain at least one k-NN vector field |
| Data availability | Source indexes must contain data. Empty indexes cannot be migrated. |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin |
| Cluster capacity | Sufficient storage and compute resources (use the [CU calculator](https://zilliz.com/pricing#calculator) to estimate CU size) |
| Network access | Add [Zilliz Cloud IPs](./zilliz-cloud-ips) to allowlists if using network restrictions |

## Data type mapping\{#data-type-mapping}

The following table summarizes how field types in OpenSearch are mapped to Zilliz Cloud field types, along with details on any customization options.

| **OpenSearch Field Type** | **Zilliz Cloud Field Type** | **Description** |
| --- | --- | --- |
| Primary key | Primary key | OpenSearch's primary key ([_id](https://opensearch.org/docs/latest/field-types/metadata-fields/id/)) is automatically mapped as the primary key in Zilliz Cloud.<br/>When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source table will be discarded. |
| [k-NN vector](https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/) | FLOAT_VECTOR | The `float` vector type from OpenSearch is mapped to `FLOAT_VECTOR` on Zilliz Cloud. Byte/Binary vectors from OpenSearch are not supported for migration.<br/>Vector dimensions remain unchanged. |
| [Alias](https://opensearch.org/docs/latest/field-types/supported-field-types/alias/) | Not supported | Alias fields are not supported. |
| [Binary](https://opensearch.org/docs/latest/field-types/supported-field-types/binary/) | VARCHAR | Binary data is stored as a string on Zilliz Cloud. |
| [Numeric](https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/) |  |  |
| `byte` | INT8 | Directly mapped. |
| `double` | DOUBLE | Directly mapped. |
| `float` | FLOAT | Directly mapped. |
| `half_float` | FLOAT | Mapped to `FLOAT`. |
| `integer` | INT32 | Directly mapped. |
| `long` | INT64 | Directly mapped. |
| `short` | INT16 | Directly mapped. |
| `unsigned_long` | Not supported | Not supported on Zilliz Cloud. |
| `scaled_float` | Not supported | Not supported on Zilliz Cloud. |
| [Boolean](https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/) | BOOL | Stores `true` or `false`. |
| [Date](https://opensearch.org/docs/latest/field-types/supported-field-types/dates/) | VARCHAR | Stored as a string. Ensure correct format conversion. |
| [IP address](https://opensearch.org/docs/latest/field-types/supported-field-types/ip/) | VARCHAR | Stored as a string. |
| [Range](https://opensearch.org/docs/latest/field-types/supported-field-types/range/) | JSON | Stored in JSON format. |
| [Object](https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/) |  |  |
| `object` | JSON | Stored in JSON format. |
| `nested` | JSON | Stored in JSON format. |
| `flat_object` | JSON | Stored in JSON format. |
| `join` | VARCHAR | Stored as a string. |
| [String](https://opensearch.org/docs/latest/field-types/supported-field-types/string/) |  |  |
| `keyword` | VARCHAR | Stored as a string. |
| `text` | VARCHAR | Mapped to `VARCHAR` . |
| `match_only_text` | VARCHAR | Stored as a string. |
| `token_count` | INT32 | Stored as INT32. |
| `wildcard` | Not supported | Not supported on Zilliz Cloud. |
| [Autocomplete](https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/) | VARCHAR | Stored as a string. |
| [Geographic](https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/) | VARCHAR | Stored as a string. |
| [Rank](https://opensearch.org/docs/latest/field-types/supported-field-types/rank/) | VARCHAR | Stored as a string. |
| [Percolator](https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/) | VARCHAR | Stored as a string. |
| [Derived](https://opensearch.org/docs/latest/field-types/supported-field-types/derived/) | Not supported | Derived fields are not supported on Zilliz Cloud. |
| [Star-tree](https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/) | Not supported | Star-tree fields are not supported on Zilliz Cloud. |
| [Arrays](https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#arrays) | Not supported | Arrays are not supported for migration. |
| [Multifields](https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#multifields) | Not supported | Multifields are not supported for migration. |

## OpenSearch-specific handling rules\{#opensearch-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

OpenSearch index names are transferred to Zilliz Cloud with the following considerations:

| Scenario | Impact | Solution |
| --- | --- | --- |
| Default naming | Collection names match source index names exactly | Names are preserved as-is from OpenSearch |
| Special characters | Index names with hyphens (-) or dots (.) will cause errors and prevent job submission | Manually rename indexes to use underscores or other valid characters |
| Naming conflicts | Cannot submit job if a collection with the same name already exists | Delete existing collection, choose a different database, or rename during migration configuration |

### Migration considerations\{#migration-considerations}

The following features are **not supported** for OpenSearch migration:

| Limitation | Impact | Alternative |
| --- | --- | --- |
| Dynamic to fixed field conversion | Cannot convert existing dynamic fields to fixed types | Fields maintain their original dynamic nature |
| Add more fields | Cannot add new fields during migration | Only existing Elasticsearch fields are migrated |
| Sparse vectors | Not supported in current release | Consider dense vector alternatives or contact support for roadmap |
