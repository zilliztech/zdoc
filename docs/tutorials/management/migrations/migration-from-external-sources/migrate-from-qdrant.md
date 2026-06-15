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
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Migrate from Qdrant to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, payload field conversion, and collection naming rules when migrating from [Qdrant](https://qdrant.tech/).

## Prerequisites\{#prerequisites}

Before starting your Qdrant to Zilliz Cloud migration, ensure you meet these requirements:

### Qdrant requirements\{#qdrant-requirements}

| Requirement | Details |
| --- | --- |
| Network access | Source Qdrant cluster must be accessible from the public internet |
| API access | Cluster endpoint and API key with access permissions |
| Data availability | Source collections must contain data. Empty collections cannot be migrated. |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin |
| Cluster capacity | Sufficient storage and compute resources (use the [CU calculator](https://zilliz.com/pricing#calculator) to estimate CU size) |
| Network access | Add [Zilliz Cloud IPs](./zilliz-cloud-ips) to allowlists if using network restrictions |

## Data type mapping\{#data-type-mapping}

Understanding how Qdrant data types map to Zilliz Cloud is crucial for planning your migration:

| Qdrant Field Type | Zilliz Cloud Field Type | Notes |
| --- | --- | --- |
| Primary key | VARCHAR (primary key) | Automatically mapped. Enable Auto ID to generate new IDs (original values will be discarded). |
| Dense vector | FLOAT_VECTOR | Dimensions preserved exactly, no modifications needed |
| Sparse vector | SPARSE_FLOAT_VECTOR | Only mapped if non-empty in sample data. |
| Payload | JSON (dynamic fields) | Mapped as dynamic schema by default; can be converted to fixed fields.<br/>Refer to [Dynamic Field](./enable-dynamic-field) for more details. |

## Payload field conversion\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud samples 100 rows to detect payload schema. You can manually add additional fields if needed.

</Admonition>

Qdrant payload is initially mapped to Zilliz Cloud's dynamic schema for maximum flexibility. You can optionally convert payload fields to fixed fields to gain:

- Enforced data types for stronger validation

- Optimized indexing for better query performance

- Structured schema for consistent data management

When converting payload to fixed fields:

| Qdrant Payload Type | Zilliz Fixed Field Type | Notes |
| --- | --- | --- |
| Integer | INT64 | Direct type conversion |
| Float | DOUBLE | All float numbers become DOUBLE |
| Bool | BOOL | Direct mapping |
| Keyword | VARCHAR | Maximum 65,535 bytes supported |
| Geo | JSON | Preserved as JSON structure; cannot convert to fixed fields |
| Datetime | VARCHAR | Maximum 65,535 bytes supported |
| UUID | VARCHAR | Maximum 65,535 bytes supported |

### Array type support\{#array-type-support}

Array types are not detected in existing payload data and cannot be converted from dynamic fields. However, most array types can be manually added as new fields during migration configuration:

| Qdrant Array Type | Zilliz Cloud Array Type | Available for Manual Addition |
| --- | --- | --- |
| Array&lt;Integer&gt; | ARRAY&lt;INT64&gt; | ✅ Can be added as new field |
| Array&lt;Float&gt; | ARRAY&lt;DOUBLE&gt; | ✅ Can be added as new field |
| Array&lt;Bool&gt; | ARRAY&lt;BOOL&gt; | ✅ Can be added as new field |
| Array&lt;Keyword&gt; | ARRAY&lt;VARCHAR&gt; | ✅ Can be added as new field |
| Array&lt;Geo&gt; | Not supported | ❌ Not available |
| Array&lt;Datetime&gt; | ARRAY&lt;VARCHAR&gt; | ✅ Can be added as new field |
| Array&lt;UUID&gt; | ARRAY&lt;VARCHAR&gt; | ✅ Can be added as new field |

For payload fields converted to fixed fields, you can configure additional attributes:

- **Nullable**: Decide whether a field can accept null values. This feature is enabled by default. For details, refer to [Nullable attribute](./nullable-fields).

- **Default Value**: Set fallback values when data is missing. For details, refer to [Default values](./nullable-fields).

- **Partition Key**: Optionally designate an INT64 or VARCHAR field as the partition key. Note that each collection supports only one partition key, and the selected field cannot be nullable. For details, refer to  [Use Partition Key](./use-partition-key).

## Qdrant-specific handling rules\{#qdrant-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

Qdrant collection names are transferred to Zilliz Cloud with the following considerations:

| Scenario | Impact | Solution |
| --- | --- | --- |
| Naming conflicts | Cannot submit a migration job if a collection with the same name already exists in the database | Delete existing collection, choose a different target database, or rename during migration configuration |
| Special characters | Collection names are preserved as-is from Qdrant | Ensure collection names comply with Zilliz Cloud naming conventions |
