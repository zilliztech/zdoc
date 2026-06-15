---
title: "Migrate from PostgreSQL to Zilliz Cloud | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "PostgreSQL"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from PostgreSQL. | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Migrate from PostgreSQL to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from [PostgreSQL](https://www.postgresql.org/).

## Prerequisites\{#prerequisites}

Before starting your PostgreSQL to Zilliz Cloud migration, ensure you meet these requirements:

### PostgreSQL requirements\{#postgresql-requirements}

| Requirement | Details |
| --- | --- |
| Network access | Source PostgreSQL database must be accessible from the public internet |
| Database access | Valid database endpoint, username, and password with necessary permissions |
| pgvector extension | Tables must use pgvector extension for vector data storage |
| Vector field requirement | Each source table must contain at least one vector field, and vector fields cannot contain null values. |
| Data availability | Source tables must contain data. Empty tables cannot be migrated. |

### Zilliz Cloud requirements\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| User role | Organization Owner or Project Admin |
| Cluster capacity | Sufficient storage and compute resources (use the [CU calculator](https://zilliz.com/pricing#calculator) to estimate CU size) |
| Network access | Add [Zilliz Cloud IPs](./zilliz-cloud-ips) to allowlists if using network restrictions |

## Data type mapping\{#data-type-mapping}

Understanding how PostgreSQL data types map to Zilliz Cloud is crucial for planning your migration:

<table>
   <tr>
     <th><p>PostgreSQL Field Type</p></th>
     <th><p>Zilliz Cloud Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key / Auto ID</p></td>
     <td><ul><li><p><strong>Single-field primary key</strong>: Mapped directly as the target collection's primary key.</p></li><li><p><strong>Absence of primary key</strong>: Auto ID is enabled for the target collection to support tables without a primary key.</p></li><li><p><strong>Composite primary key:</strong> Auto ID is enabled; composite keys are treated as regular scalar fields.</p><p>When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source collection will be discarded.</p></li></ul></td>
   </tr>
   <tr>
     <td><p>vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Vector dimensions remain unchanged.</p></td>
   </tr>
   <tr>
     <td><p>text/varchar/date/time</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double precision</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>real</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## PostgreSQL-specific handling rules\{#postgresql-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

PostgreSQL table names are transferred to Zilliz Cloud with the following considerations:

| Scenario | Impact | Solution |
| --- | --- | --- |
| **Default naming** | Collection names match source table names exactly | Names are preserved as-is from PostgreSQL |
| **Naming conflicts** | Cannot submit job if a collection with the same name already exists | Delete existing collection, choose a different database, or rename during migration configuration |
| **Collection name modification** | Supported during migration | You can rename collections during the migration configuration process |

### Migration considerations\{#migration-considerations}

The following features are **not supported** for PostgreSQL migration:

| Limitation | Impact | Alternative |
| --- | --- | --- |
| Dynamic to fixed field conversion | Cannot convert existing dynamic fields to fixed types | Fields maintain their original dynamic nature |
| Add more fields | Cannot add new fields during migration | Only existing Elasticsearch fields are migrated |

