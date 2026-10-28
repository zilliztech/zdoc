---
title: "Migrate from Chroma to Zilliz Cloud | Cloud"
slug: /migrate-from-chroma
sidebar_label: "Chroma"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how Zilliz Cloud handles data type mapping, metadata field conversion, and collection naming rules when migrating from Chroma. | Cloud"
type: origin
token: JaTxw9EtHivMv9kMSAnckG0vn1b
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Migrate from Chroma to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, metadata field conversion, and collection naming rules when migrating from Chroma.

For the console migration workflow, index settings, and post-migration verification, see [External Migration Basics](./external-migration-basics).

## Prerequisites\{#prerequisites}

### Chroma requirements\{#chroma-requirements}

| Requirement | Details |
| --- | --- |
| Deployment | Chroma Cloud or a self-hosted Chroma server that exposes the Chroma REST API v2. |
| Network access | The source endpoint must be reachable by the Zilliz Cloud migration service. For network restrictions, allow inbound connections from [Zilliz Cloud IP addresses](./zilliz-cloud-ips). A local embedded database must be exposed through a reachable Chroma server before console migration. |
| Connection details | Source endpoint, tenant, database, and authentication credentials. Chroma Cloud uses an API key with X Chroma Token authentication; obtain the connection details from its Connect panel. Self-hosted Chroma supports no authentication, X Chroma Token, bearer tokens, or Basic authentication with a username and password. The default tenant and database names are `default_tenant` and `default_database`. |
| Data availability | Source collections must contain data and embeddings. Empty collections cannot be migrated because they do not have a usable vector dimension. |
| Data consistency | Pause inserts, updates, and deletes on the source collections during migration. Reading the source does not create a snapshot. |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin. |
| Target | An existing cluster and database with sufficient capacity for the source data. |
| Collection names | Use target collection names that are not already in use in the target database. You can rename the target collections when reviewing mappings. |

## Data type mapping\{#data-type-mapping}

Each source collection maps to a target collection. Review the following default mappings before starting the migration.

| Chroma field | Zilliz Cloud field | Notes |
| --- | --- | --- |
| `id` | `id`, VARCHAR primary key | Preserves the original string IDs with the default mapping. |
| `embedding` | `embedding`, FLOAT_VECTOR | Preserves the vector values and source dimension. No re-embedding is required. |
| `document` | `document`, nullable VARCHAR | Preserves document text. The default maximum length is 65,535 UTF-8 bytes. |
| `uri` | `uri`, nullable VARCHAR | Preserves the URI string. The default maximum length is 65,535 UTF-8 bytes. Files referenced by the URI are not copied. |
| Metadata | Dynamic field | Stores metadata keys as dynamic fields by default. Selected keys can be converted to fixed fields. |

## Metadata field conversion\{#metadata-field-conversion}

Keep metadata in the dynamic field when keys vary between entities. Convert a key to a fixed field when you need an explicit field name, type, or constraint. For details about dynamic fields, see [Dynamic Field](./enable-dynamic-field).

The mapping page represents metadata values using the following target types:

| Metadata value | Target type shown in mappings |
| --- | --- |
| Integer | INT64 |
| Floating-point number | DOUBLE |
| Boolean | BOOL |
| String | VARCHAR |
| Array | JSON |

When converting metadata to fixed fields, select types and constraints that cover the entire source collection. Allow null values for fields that may be missing. String length limits are measured in UTF-8 bytes, not characters. Keep keys with mixed or changing value types in the dynamic field.

## Chroma-specific handling rules\{#chroma-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

By default, target collections use the source names, with hyphens (`-`) replaced by underscores (`_`). For example, `support-docs` becomes `support_docs`.

Review each target name before submitting the job. Rename a collection if its name does not meet Zilliz Cloud naming requirements or is already in use. Also check for source names that become identical after conversion, such as `support-docs` and `support_docs`.

### Embeddings and distance metrics\{#embeddings-and-distance-metrics}

Existing embeddings are copied without being generated again. The Chroma embedding function is not migrated. Applications must continue to generate embeddings with the same model.

The corresponding distance metric names are:

| Chroma distance space | Zilliz Cloud metric type |
| --- | --- |
| `cosine` | `COSINE` |
| `l2` | `L2` |
| `ip` | `IP` |

Use the corresponding metric when configuring the target vector index. This table describes metric correspondence; it does not imply that source index configuration is migrated.