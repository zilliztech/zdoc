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
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - elasticsearch
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search

---

import Admonition from '@theme/Admonition';


# Migrate from Elasticsearch to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from [Elasticsearch](https://www.elastic.co/elasticsearch).

## Prerequisites\{#prerequisites}

Before starting your Elasticsearch to Zilliz Cloud migration, ensure you meet these requirements:

### Elasticsearch requirements\{#elasticsearch-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Version compatibility</p></td>
     <td><p>Elasticsearch 7.x or later</p></td>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Source cluster must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>API access</p></td>
     <td><p>Valid cluster endpoint or cloud ID with appropriate credentials</p></td>
   </tr>
   <tr>
     <td><p>Vector field requirement</p></td>
     <td><p>Each source index must contain at least one dense vector field</p></td>
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

Understanding how Elasticsearch data types map to Zilliz Cloud is crucial for planning your migration:

<table>
   <tr>
     <th><p><strong>Elasticsearch Field Type</strong></p></th>
     <th><p><strong>Zilliz Cloud Field Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key</p></td>
     <td><p>Automatically mapped. Enable Auto ID to generate new IDs (original values will be discarded).</p></td>
   </tr>
   <tr>
     <td><p>dense_vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Vector dimensions remain unchanged. Specify <strong>L2</strong> or <strong>IP</strong> as the metric type.</p></td>
   </tr>
   <tr>
     <td><p>text, string, keyword, ip, date, timestamp</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Set Max Length (1 to 65,535 bytes). Strings exceeding the limit can trigger migration errors.</p></td>
   </tr>
   <tr>
     <td><p>long</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>short</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>byte</p></td>
     <td><p>INT8</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>float</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>object</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>arrays</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Elasticsearch-specific handling rules\{#elasticsearch-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

Elasticsearch index names are transferred to Zilliz Cloud with the following considerations:

<table>
   <tr>
     <th><p>Scenario</p></th>
     <th><p>Impact</p></th>
     <th><p>Solution</p></th>
   </tr>
   <tr>
     <td><p>Default naming</p></td>
     <td><p>Collection names match source index names exactly</p></td>
     <td><p>Names are preserved as-is from OpenSearch</p></td>
   </tr>
   <tr>
     <td><p>Special characters</p></td>
     <td><p>Index names with hyphens (-) or dots (.) will cause errors and prevent job submission</p></td>
     <td><p>Manually rename indexes to use underscores or other valid characters</p></td>
   </tr>
   <tr>
     <td><p>Naming conflicts</p></td>
     <td><p>Cannot submit job if a collection with the same name already exists</p></td>
     <td><p>Delete existing collection, choose a different database, or rename during migration configuration</p></td>
   </tr>
</table>

### Migration considerations\{#migration-considerations}

The following features are **not supported** for Elasticsearch migration:

<table>
   <tr>
     <th><p>Limitation</p></th>
     <th><p>Impact</p></th>
     <th><p>Alternative</p></th>
   </tr>
   <tr>
     <td><p>Dynamic to fixed field conversion</p></td>
     <td><p>Cannot convert existing dynamic fields to fixed types</p></td>
     <td><p>Fields maintain their original dynamic nature</p></td>
   </tr>
   <tr>
     <td><p>Add more fields</p></td>
     <td><p>Cannot add new fields during migration</p></td>
     <td><p>Only existing Elasticsearch fields are migrated</p></td>
   </tr>
   <tr>
     <td><p>Sparse vectors</p></td>
     <td><p>Not supported in current release</p></td>
     <td><p>Consider dense vector alternatives or contact support for roadmap</p></td>
   </tr>
</table>
