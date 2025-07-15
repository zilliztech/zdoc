---
title: "Offline Migration | Cloud"
slug: /offline-migration
sidebar_label: "Offline Migration"
beta: FALSE
notebook: FALSE
description: "Offline Migration transfers all existing data from a source Zilliz Cloud cluster to a target Zilliz Cloud cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions. | Cloud"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters
  - offline
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Offline Migration

Offline Migration transfers all existing data from a source Zilliz Cloud cluster to a target Zilliz Cloud cluster. This method supports migrations both within the same organization and across different organizations. It is ideal for scenarios where temporary write interruptions are acceptable, such as during planned maintenance or smaller-scale database transitions.

For migrations that require uninterrupted write operations, refer to [Zero Downtime Migration](./zero-downtime-migration).

## Migration capabilities{#migration-capabilities}

### Cluster compatibility{#cluster-compatibility}

The following table outlines the migration capabilities and constraints between clusters of different plans: 

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
     <td><p>Supported</p><p>(You can also upgrade a Free cluster to a dedicated cluster. Refer to <a href="./manage-cluster">Manage Cluster</a>for more details.)</p></td>
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

### Migration scope options{#migration-scope-options}

<table>
   <tr>
     <th><p>Migration Type</p></th>
     <th><p>Description</p></th>
     <th><p>Use Cases</p></th>
   </tr>
   <tr>
     <td><p>Within same project</p></td>
     <td><p>Migrate between existing clusters in the same Zilliz Cloud project</p></td>
     <td><p>Cluster upgrades, performance optimization, data consolidation</p></td>
   </tr>
   <tr>
     <td><p>Cross-project or organization</p></td>
     <td><p>Migrate between existing clusters in different Zilliz Cloud projects or organizations</p></td>
     <td><p>Company mergers, department transfers, multi-tenant scenarios</p></td>
   </tr>
</table>

### Direct data transfer{#direct-data-transfer}

Offline migration performs direct data replication between Zilliz Cloud clusters with the following characteristics:

- **Schema preservation**: Source schema transferred unchanged to target cluster

- **No field modifications**: Cannot rename fields, change data types, or modify field attributes during migration

- **Automatic indexing**: AUTOINDEX automatically created for vector fields in target cluster

## Prerequisites{#prerequisites}

Before starting your offline migration, ensure you meet these requirements:

### General requirements{#general-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>User permissions</p></td>
     <td><p>Organization Owner or Project Admin role</p></td>
   </tr>
   <tr>
     <td><p>Source cluster access</p></td>
     <td><p>Source cluster must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>Target cluster capacity</p></td>
     <td><p>Sufficient CU size to accommodate source data (use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a>)</p></td>
   </tr>
</table>

### Cross-project or organization migration requirements{#cross-project-or-organization-migration-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Connection credentials</p></td>
     <td><p>Public endpoint, API key, or cluster username and password for source cluster</p></td>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Ability to connect to source cluster from target organization</p></td>
   </tr>
</table>

## Getting started{#getting-started}

The following demo walks you through the complete offline migration process:

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title="Zilliz Cloud - Offline Migration Demo" />

<Admonition type="info" icon="📘" title="Notes">

<p>The migrated collections are not immediately available for search or query operations. You must manually load the collections in Zilliz Cloud to enable search and query functionalities. For details, refer to <a href="./load-release-collections">Load & Release</a>.</p>

</Admonition>

