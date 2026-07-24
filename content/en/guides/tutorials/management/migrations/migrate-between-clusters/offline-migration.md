---
title: "Offline Migration | Cloud"
slug: /offline-migration
sidebar_label: "Offline Migration"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Offline Migration transfers all existing data from a source Zilliz Cloud cluster to a target Zilliz Cloud cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions. | Cloud"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Offline Migration

Offline Migration transfers all existing data from a source Zilliz Cloud cluster to a target Zilliz Cloud cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions.

<Admonition type="info" icon="📘" title="Notes">

If your application keeps writing to the source cluster during cutover, the target cluster might miss new entities, especially entities inserted after the migration job completes. To keep the target data complete, schedule a cutover window, pause writes to the source cluster, wait for the migration job to complete, validate the target cluster, and then resume writes on the target cluster only.

</Admonition>

## Migration capabilities\{#migration-capabilities}

### Cluster compatibility\{#cluster-compatibility}

The following table outlines the migration capabilities and constraints between clusters of different deployment options: 

<table>
   <tr>
     <th rowspan="2"><p><strong>Source</strong></p></th>
     <th colspan="3"><p><strong>Target</strong></p></th>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>Serverless cluster</p></td>
     <td><p>Dedicated cluster</p></td>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported</p><p>(You can only upgrade a Free cluster to a Serverless cluster. Refer to <a href="./manage-cluster">Manage Cluster</a> for more details.)</p></td>
     <td><p>Supported</p><p>(You can also upgrade a Free cluster to a dedicated cluster. Refer to <a href="./manage-cluster">Manage Cluster</a> for more details.)</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Supported</p></td>
     <td><p>Supported</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported</p></td>
     <td><p>Supported</p></td>
   </tr>
</table>

### Migration scope options\{#migration-scope-options}

| Migration Type | Description | Use Cases |
| --- | --- | --- |
| Within same project | Migrate between existing clusters in the same Zilliz Cloud project | Cluster upgrades, performance optimization, data consolidation |
| Cross-project or organization | Migrate between existing clusters in different Zilliz Cloud projects or organizations | Company mergers, department transfers, multi-tenant scenarios |

### Direct data transfer\{#direct-data-transfer}

Offline migration performs direct data replication between Zilliz Cloud clusters with the following characteristics:

- **Schema preservation**: Source schema transferred unchanged to target cluster

- **No field modifications**: Cannot rename fields, change data types, or modify field attributes during migration

- **Automatic indexing**: AUTOINDEX automatically created for vector fields in target cluster

- **One-time data copy**: Offline Migration copies data from the source cluster during the migration job. It does not keep the target cluster synchronized with new writes after the migration job completes.

## Prerequisites\{#prerequisites}

Before starting your offline migration, ensure you meet these requirements:

### General requirements\{#general-requirements}

| Requirement | Details |
| --- | --- |
| User permissions | Organization Owner or Project Admin role |
| Source cluster access | Source cluster must be accessible from the public internet |
| Target cluster capacity | Sufficient CU size to accommodate source data (use the [CU calculator](https://zilliz.com/pricing#calculator)) |

### Cross-project or organization migration requirements\{#cross-project-or-organization-migration-requirements}

| Requirement | Details |
| --- | --- |
| Connection credentials | Public endpoint, API key, or cluster username and password for source cluster |
| Network access | Ability to connect to source cluster from target organization |

### Plan the cutover\{#plan-the-cutover}

Before starting an offline migration, choose a cutover window when your application can temporarily stop writing to the source cluster. Use the following process to avoid missing data:

1. Pause writes to the source cluster before the final migration and validation window.

1. Run the migration job and wait until the job status changes to **Successful**.

1. Validate the data in the target cluster, such as by checking the number of entities and sampling recently inserted entities.

1. Switch application reads and writes to the target cluster.

1. Resume writes only on the target cluster.

Keep the source cluster available until you confirm that the migrated data is complete.

## Getting started\{#getting-started}

The following demo walks you through the complete offline migration process:

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title=""  />

<Admonition type="info" icon="📘" title="Notes">

The migrated collections are not immediately available for search or query operations. You must manually load the collections in Zilliz Cloud to enable search and query functionalities. For details, refer to [Load & Release](./load-release-collections).

</Admonition>

