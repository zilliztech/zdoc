---
title: "Migrate from Elasticsearch to Zilliz Cloud | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Elasticsearch"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from Elasticsearch. | Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Migrate from Elasticsearch to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from [Elasticsearch](https://www.elastic.co/elasticsearch).

## Prerequisites\{#prerequisites}

Before starting your Elasticsearch to Zilliz Cloud migration, ensure you meet these requirements:

### Elasticsearch requirements\{#elasticsearch-requirements}

| Requirement | Details |
| --- | --- |
| Version compatibility | Elasticsearch 7.x or later |
| Network access | Source cluster must be accessible from the public internet |
| API access | Valid cluster endpoint or cloud ID with appropriate credentials |
| Vector field requirement | Each source index must contain at least one dense vector field |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin |
| Cluster capacity | Sufficient storage and compute resources (use the [CU calculator](https://zilliz.com/pricing#calculator) to estimate CU size) |
| Network access | Add [Zilliz Cloud IPs](./zilliz-cloud-ips) to allowlists if using network restrictions |

## Data type mapping\{#data-type-mapping}

Understanding how Elasticsearch data types map to Zilliz Cloud is crucial for planning your migration:

| **Elasticsearch Field Type** | **Zilliz Cloud Field Type** | **Description** |
| --- | --- | --- |
| Primary key | Primary key | Automatically mapped. Enable Auto ID to generate new IDs (original values will be discarded). |
| dense_vector | FLOAT_VECTOR | Vector dimensions remain unchanged. Specify **L2** or **IP** as the metric type. |
| text, string, keyword, ip, date, timestamp | VARCHAR | Set Max Length (1 to 65,535 bytes). Strings exceeding the limit can trigger migration errors. |
| long | INT64 | - |
| integer | INT32 | - |
| short | INT16 | - |
| byte | INT8 | - |
| double | DOUBLE | - |
| float | FLOAT | - |
| boolean | BOOL | - |
| object | JSON | - |
| arrays | ARRAY | - |

## Elasticsearch-specific handling rules\{#elasticsearch-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

Elasticsearch index names are transferred to Zilliz Cloud with the following considerations:

| Scenario | Impact | Solution |
| --- | --- | --- |
| Default naming | Collection names match source index names exactly | Names are preserved as-is from OpenSearch |
| Special characters | Index names with hyphens (-) or dots (.) will cause errors and prevent job submission | Manually rename indexes to use underscores or other valid characters |
| Naming conflicts | Cannot submit job if a collection with the same name already exists | Delete existing collection, choose a different database, or rename during migration configuration |

### Migration considerations\{#migration-considerations}

The following features are **not supported** for Elasticsearch migration:

| Limitation | Impact | Alternative |
| --- | --- | --- |
| Dynamic to fixed field conversion | Cannot convert existing dynamic fields to fixed types | Fields maintain their original dynamic nature |
| Add more fields | Cannot add new fields during migration | Only existing Elasticsearch fields are migrated |
| Sparse vectors | Not supported in current release | Consider dense vector alternatives or contact support for roadmap |
