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
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - amazon
  - opensearch
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search

---

import Admonition from '@theme/Admonition';


# Migrate from OpenSearch to Zilliz Cloud

This topic describes how Zilliz Cloud handles data type mapping, collection naming rules, and considerations when migrating from [OpenSearch](https://opensearch.org/).

## Prerequisites\{#prerequisites}

Before starting your OpenSearch to Zilliz Cloud migration, ensure you meet these requirements:

### OpenSearch requirements\{#opensearch-requirements}

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Details</p></th>
   </tr>
   <tr>
     <td><p>Network access</p></td>
     <td><p>Source OpenSearch cluster must be accessible from the public internet</p></td>
   </tr>
   <tr>
     <td><p>Authentication</p></td>
     <td><p>Valid cluster endpoint, username, and password with necessary permissions</p></td>
   </tr>
   <tr>
     <td><p>Vector field requirement</p></td>
     <td><p>Each source index must contain at least one k-NN vector field</p></td>
   </tr>
   <tr>
     <td><p>Data availability</p></td>
     <td><p>Source indexes must contain data. Empty indexes cannot be migrated.</p></td>
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

The following table summarizes how field types in OpenSearch are mapped to Zilliz Cloud field types, along with details on any customization options.

<table>
   <tr>
     <th><p><strong>OpenSearch Field Type</strong></p></th>
     <th><p><strong>Zilliz Cloud Field Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Primary key</p></td>
     <td><p>Primary key</p></td>
     <td><p>OpenSearch's primary key (<a href="https://opensearch.org/docs/latest/field-types/metadata-fields/id/">_id</a>) is automatically mapped as the primary key in Zilliz Cloud.</p><p>When migrating data, you can enable Auto ID. However, if you do so, the original primary key values from your source table will be discarded.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/">k-NN vector</a></p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>The <code>float</code> vector type from OpenSearch is mapped to <code>FLOAT_VECTOR</code> on Zilliz Cloud. Byte/Binary vectors from OpenSearch are not supported for migration.</p><p>Vector dimensions remain unchanged.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/alias/">Alias</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Alias fields are not supported.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/binary/">Binary</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Binary data is stored as a string on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/">Numeric</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>byte</code></p></td>
     <td><p>INT8</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>double</code></p></td>
     <td><p>DOUBLE</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>float</code></p></td>
     <td><p>FLOAT</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>half_float</code></p></td>
     <td><p>FLOAT</p></td>
     <td><p>Mapped to <code>FLOAT</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>integer</code></p></td>
     <td><p>INT32</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>long</code></p></td>
     <td><p>INT64</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>short</code></p></td>
     <td><p>INT16</p></td>
     <td><p>Directly mapped.</p></td>
   </tr>
   <tr>
     <td><p><code>unsigned_long</code></p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><code>scaled_float</code></p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/">Boolean</a></p></td>
     <td><p>BOOL</p></td>
     <td><p>Stores <code>true</code> or <code>false</code>.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/dates/">Date</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string. Ensure correct format conversion.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/ip/">IP address</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/range/">Range</a></p></td>
     <td><p>JSON</p></td>
     <td><p>Stored in JSON format.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/">Object</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>object</code></p></td>
     <td><p>JSON</p></td>
     <td><p>Stored in JSON format.</p></td>
   </tr>
   <tr>
     <td><p><code>nested</code></p></td>
     <td><p>JSON</p></td>
     <td><p>Stored in JSON format.</p></td>
   </tr>
   <tr>
     <td><p><code>flat_object</code></p></td>
     <td><p>JSON</p></td>
     <td><p>Stored in JSON format.</p></td>
   </tr>
   <tr>
     <td><p><code>join</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/string/">String</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>keyword</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>text</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Mapped to <code>VARCHAR</code> .</p></td>
   </tr>
   <tr>
     <td><p><code>match_only_text</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><code>token_count</code></p></td>
     <td><p>INT32</p></td>
     <td><p>Stored as INT32.</p></td>
   </tr>
   <tr>
     <td><p><code>wildcard</code></p></td>
     <td><p>Not supported</p></td>
     <td><p>Not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/">Autocomplete</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/">Geographic</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/rank/">Rank</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/">Percolator</a></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Stored as a string.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/derived/">Derived</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Derived fields are not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/">Star-tree</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Star-tree fields are not supported on Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#arrays">Arrays</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Arrays are not supported for migration.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#multifields">Multifields</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>Multifields are not supported for migration.</p></td>
   </tr>
</table>

## OpenSearch-specific handling rules\{#opensearch-specific-handling-rules}

### Collection naming rules\{#collection-naming-rules}

OpenSearch index names are transferred to Zilliz Cloud with the following considerations:

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

The following features are **not supported** for OpenSearch migration:

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
