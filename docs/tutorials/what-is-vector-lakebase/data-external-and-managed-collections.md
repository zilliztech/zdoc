---
title: "Data: External & Managed Collections | Cloud"
slug: /data-external-and-managed-collections
sidebar_key: data-external-and-managed-collections
sidebar_label: "Data: External & Managed Collections"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "A collection is a two-dimensional table with fixed columns and variable rows. Each column represents a field, and each row represents an entity. On Zilliz Cloud, collections come in two flavors managed and external. Which one you choose depends on where you are in your data lifecycle. | Cloud"
type: origin
token: FFamwfMozixhYlkwBoccOTBlnvj
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - data
  - external collection
  - managed collection
  - collection

---

import Admonition from '@theme/Admonition';


# Data: External & Managed Collections

A collection is a two-dimensional table with fixed columns and variable rows. Each column represents a field, and each row represents an entity. On Zilliz Cloud, collections come in two flavors: **managed** and **external**. Which one you choose depends on where you are in your data lifecycle.

## Overview\{#overview}

### Managed Collection\{#managed-collection}

A managed collection stores data in the Zilliz Cloud cluster's storage. You get the full feature set: continuous inserts, updates, real-time queries, and predictable low-latency serving. If you are running a production app that needs to stay online and mutate data, this is what you want.

### External Collection\{#external-collection}

An external collection leaves your data where it is (S3, in open formats like Parquet). Zilliz Cloud attaches to these files by generating a **manifest** that groups external files into segments. When your files change, run a **Refresh** to update the manifest. When you need indexes, **Build Index** reads data through the manifest without copying anything into the Zilliz Cloud cluster's storage. External collections are read-only.

### Comparison at a Glance\{#comparison-at-a-glance}

<table>
   <tr>
     <th><p>Dimension</p></th>
     <th><p>Managed Collection</p></th>
     <th><p>External Collection</p></th>
   </tr>
   <tr>
     <td><p>Storage</p></td>
     <td><p>Cluster-managed (binlog)</p></td>
     <td><p>Your lake (S3, Parquet/Lance/Iceberg)</p></td>
   </tr>
   <tr>
     <td><p>Read/Write</p></td>
     <td><p>Read and write</p></td>
     <td><p>Read-only</p></td>
   </tr>
   <tr>
     <td><p>Latency</p></td>
     <td><p>Predictable, low-latency serving</p></td>
     <td><p>On-demand, batch-oriented</p></td>
   </tr>
   <tr>
     <td><p>Data mutations</p></td>
     <td><p>Inserts, upserts, deletes, imports</p></td>
     <td><p>None (refresh to pick up changes)</p></td>
   </tr>
   <tr>
     <td><p>Primary key / AutoId</p></td>
     <td><p>Supported</p></td>
     <td><p>Not supported</p></td>
   </tr>
   <tr>
     <td><p>Dynamic field</p></td>
     <td><p>Supported</p></td>
     <td><p>Not supported</p></td>
   </tr>
   <tr>
     <td><p>Partition key</p></td>
     <td><p>Supported</p></td>
     <td><p>Not supported</p></td>
   </tr>
   <tr>
     <td><p>Functions</p></td>
     <td><p>Supported</p></td>
     <td><p>Not supported</p></td>
   </tr>
   <tr>
     <td><p>Schema changes</p></td>
     <td><p>Flexible</p></td>
     <td><p>Immutable after creation</p></td>
   </tr>
   <tr>
     <td><p>BM25 text match</p></td>
     <td><p>Supported</p></td>
     <td><p>Not supported</p></td>
   </tr>
   <tr>
     <td><p>Indexing</p></td>
     <td><p>Automatic or manual</p></td>
     <td><p>Requires refresh first</p></td>
   </tr>
   <tr>
     <td><p>Cost</p></td>
     <td><p>Serving cost</p></td>
     <td><p>No duplicate storage cost</p></td>
   </tr>
</table>

## Choosing Between Collection Types\{#choosing-between-collection-types}

The following decision matrix helps you choose among collection types.

<table>
   <tr>
     <th><p>Question</p></th>
     <th><p>If yes</p></th>
     <th><p>If no</p></th>
   </tr>
   <tr>
     <td><p>Do you need to insert, update, or delete data continuously?</p></td>
     <td><p><strong>Managed</strong></p></td>
     <td><p>External</p></td>
   </tr>
   <tr>
     <td><p>Is this a production serving workload requiring predictable low latency?</p></td>
     <td><p><strong>Managed</strong></p></td>
     <td><p>External</p></td>
   </tr>
   <tr>
     <td><p>Is the data already in S3/Parquet, and you want to avoid ETL?</p></td>
     <td><p><strong>External</strong></p></td>
     <td><p>Managed</p></td>
   </tr>
   <tr>
     <td><p>Is this an exploratory analysis or a batch retrieval?</p></td>
     <td><p><strong>External</strong></p></td>
     <td><p>Managed</p></td>
   </tr>
   <tr>
     <td><p>Do you need schema flexibility after creation?</p></td>
     <td><p><strong>Managed</strong></p></td>
     <td><p>External</p></td>
   </tr>
</table>

## Key Concepts\{#key-concepts}

### Schema and Fields\{#schema-and-fields}

A schema defines the structure of a collection. Each field has constraints like data type and vector dimensionality. Every entity you insert has to match the schema.

If you want some fields to be optional, make them nullable, set default values, or enable the dynamic field.

<Admonition type="info" icon="📘" title="Notes">

<p>External collections cannot use the dynamic field or define functions in the schema. Once created, the schema is locked.</p>

</Admonition>

### Primary Key and AutoId\{#primary-key-and-autoid}

The primary field distinguishes one entity from another. Its values are globally unique, and the field accepts only integers or strings.

Enable **AutoId** when creating the collection, and Zilliz Cloud generates primary values for insertion. In that case, do not include the primary field in your entity data.

<Admonition type="info" icon="📘" title="Notes">

<p>External collections do not support primary keys and cannot use the AutoId feature.</p>

</Admonition>

### Refresh\{#refresh}

Refresh scans your external data files and regenerates the manifest. It usually takes 150–250 ms. If your source data changes, run refresh again to keep your collection in sync.

<Admonition type="info" icon="📘" title="Notes">

<p>Only external collections require a refresh before creating indexes.</p>

</Admonition>

### Index\{#index}

Indexes speed up searches. Create them on every field your service depends on, and remember that vector field indexes are mandatory.

<Admonition type="info" icon="📘" title="Notes">

<p>For external collections, you must refresh before creating indexes.</p>

</Admonition>

### Entity\{#entity}

An entity is a data record, one row in your collection. All fields in that row make up the entity. 

<Admonition type="info" icon="📘" title="Notes">

<p>For external collections, you cannot insert, upsert, or delete entities. However, you can import data for those purposes.</p>

</Admonition>

### Load and Release\{#load-and-release}

You must load a collection before searching or querying it. Loading brings index files and raw data into memory for fast response. Release collections when they are not in use to save costs.

- For managed collections and external collections in serving clusters, Zilliz Cloud always loads index files and raw data into memory.

- For external collections in on-demand compute, Zilliz Cloud loads only the index files.

### Partition\{#partition}

Partitions are subsets of a collection. They share the same field set but contain different entities. Searching for specific partitions lets Zilliz Cloud ignore everything else, improving efficiency.

<Admonition type="info" icon="📘" title="Notes">

<p>Only managed collections support partitions.</p>

</Admonition>

### Shard\{#shard}

Shards are horizontal slices of a collection. Each shard is a data input channel. By default, every collection has one shard. Increase the shard count based on your expected throughput and data volume.

### Alias\{#alias}

A collection can have several aliases, but aliases cannot be shared across collections. Aliases are useful when you need to adapt your code to different scenarios without changing collection names everywhere.

### Consistency Level\{#consistency-level}

Set the consistency level when you create a collection, or override it during a specific search or query. The options are **Strong**, **Bounded Staleness**, **Session**, and **Eventually**.