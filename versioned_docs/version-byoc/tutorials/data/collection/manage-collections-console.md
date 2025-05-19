---
title: "Manage Collections (Console) | BYOC"
slug: /manage-collections-console
sidebar_label: "Manage Collections (Console)"
beta: FALSE
notebook: FALSE
description: "A collection is a two-dimensional table used to store vector embeddings and metadata. All entities in a collection share the same schema. You can create multiple collections for data management or multi-tenancy purposes. | BYOC"
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - manage
  - console
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage Collections (Console)

A collection is a two-dimensional table used to store vector embeddings and metadata. All entities in a collection share the same schema. You can create multiple collections for data management or multi-tenancy purposes. 

This guide walks you through the collection creation and management operations on the web console. It is intended for users who prefer a visual interface. If you are familiar with SDKs, you can also create and manage collections through them. For details, see [Create Collection](./manage-collections-sdks).

<Admonition type="info" icon="📘" title="Notes">

<p>If you need strong data isolation and manage only a small number of tenants, you can create a separate collection for each tenant.</p>
<p>However, you can only create a maximum of 16,384 collections depending on your <a href="./limits">cluster plan</a>. Therefore, for large-scale multi-tenancy, consider using alternative strategies such as partition-based or partition-key-based multi-tenancy, depending on your use case. For details, see <a href="./multi-tenancy">Implement Multi-tenancy</a>.</p>

</Admonition>

## Create collection{#create-collection}

The Zilliz Cloud console provides 3 ways to create a collection, each designed for different scenarios:

- **Create your own collection:** Customize the schema and index parameters to fit your dataset and use case. Ideal for users who need fine-grained control over the schema.

- **Create sample collection:** Quickly set up a collection with a predefined schema and sample dataset. Recommended for new users exploring Zilliz Cloud.

- **Clone existing collection:** Duplicate an existing collection within the same database. Useful in environment duplication scenarios where you need to copy both schema and data from a testing collection to a production collection. Alternatively, you can also use cloning to modify the shard settings of a created collection.

The following demo shows you where to find the features on the web UI.

<Supademo id="cmap9as9900yyx80ihbaf3rqt" title="Create Collection" isShowcase="true" />

Below are some of the concepts you will encounter when creating a collection.

### Collection Metadata{#collection-metadata}

The metadata of a collection contains:

- Collection name

- (Optional) Collection description

- The database to which the collection belongs. A [database](./database) is a layer between clusters and collections and serves as a logical container to manage and organize collections. You can group relevant collections under the same database.

### Collection Schema{#collection-schema}

A schema defines the data structure of your collection and must include:

- 1 primary key (PK) field

- At least 1 vector field. You can include up to four vector fields by default. To include up to 10, [contact us](https://zilliz.com/contact-sales).

- (Optional) Scalar fields for metadata

- (Optional) Dynamic field. Enabling dynamic field provides flexibility to the collection schema because it allows you to add fields during data insertion without modifying the existing schema. It is recommended to enable dynamic field when your data structure is not fixed. For fields that are frequently used in filters or queries, define them in advance in the schema instead of using dynamic fields, as this can help maintain optimal query performance.

<Supademo id="cmaqefyds2e7aho3rna9w8trp" title="Zilliz Cloud - Create Collection Schema" />

<Admonition type="info" icon="📘" title="Notes">

<p>Most of the schema configurations cannot be modified once the collection is created. Design your schema carefully to ensure it meets current and future business needs. For best practices, see <a href="./schema-explained">Schema Explained</a>.</p>

</Admonition>

### Index{#index}

An index is a data structure that organizes data to accelerate searches and queries. Zilliz Cloud supports two types of indexes:

- **Vector index**: Automatically created using [AUTOINDEX](./autoindex-explained) to accelerate vector searches. If you have multiple vector fields in the schema, you can create a separate index for each vector field. In addition, you can also edit the metric type used to calculate the distance between vectors.

- **Scalar index**: By default, Zilliz Cloud does not automatically create indexes for scalar fields. However, you can manually create indexes on scalar fields that are commonly used for filtering to accelerate searches and queries.

You can skip creating indexes during collection creation and add indexes later. For details, see [Manage Indexes](./manage-indexes).

### Function{#function}

A function is used in full-text search to convert tokenized terms into sparse vectors with relevance scores. It applies scoring algorithms like BM25 to generate weighted representations for indexing and document ranking.

To use functions, you need to add both `SPARSE_FLOAT_VECTOR` and `VARCHAR` fields in the schema. For details, see [Full Text Search](./full-text-search).

### Partition/ Partition key{#partition-partition-key}

**Partition:** A partition is a physical subset of a collection. A partition shares the same data schema with its parent collection but contains only a portion of the data in the collection. Each collection comes with one default partition. You can manually add more partitions for multi-tenancy and data management purposes. If no extra partition is created, all data inserted into a collection will fall into the default partition. For details, see [Manage Partitions](./manage-partitions)

**Partition key:** A partition key is a search optimization solution based on partitions. When you specify a non-primary key `INT64` or `VARCHAR` field as the partition key, 16 partitions will be automatically created by Zilliz Cloud and all inserted entities will fall into these 16 auto-generated partitions based on their partition key values. Once partition key is enabled for a collection, you will not be able to manually create partitions in this collection. For details, see [Use Partition Key](./use-partition-key).

<Admonition type="info" icon="📘" title="Notes">

<p>To decide whether you need to create partitions or use partition key, you can consider the following factors:</p>
<ul>
<li><p><strong>Multi-tenancy strategies:</strong> If you need to support millions of tenants, please use partition key. If you need strong physical data isolation between tenants, please use partitions. For details, refer to <a href="./multi-tenancy">Implement Multi-tenancy</a>.</p></li>
<li><p><strong>Resource management:</strong> If you prefer creating and managing partitions on you own, you can choose to use partitions. If you need automatic creation and management of partitions, please use partitions keys.</p></li>
<li><p><strong>Hot and cold data management:</strong> If you need efficient handling of hot and cold data, please use partitions as you can partially load certain partitions with cold data while releasing partitions with cold data to save memory usage.</p></li>
</ul>

</Admonition>

### mmap{#mmap}

Memory mapping (mmap) is a memory usage optimization that enables direct access to large files on disk without loading them to memory. After enabling mmap, you can store more data under the same CU size specifications. As indicated below, mmap is configured with recommended defaults based on your CU type and plan. You can adjust it as needed:

- For Free, Serverless, and Dedicated clusters with the extended-capacity CU type, mmap is enabled by default and can not be adjusted. Therefore, you may not see the mmap settings during collection creation.

- For Dedicated clusters with performance-optimized CU type, mmap is disabled by default while for Dedicated clusters with capacity-optimized CU type, mmap is enabled by default.

During collection creation, you can optionally set mmap for the following 3 types of targets based on your needs.

- **The whole collection:** Enable mmap for raw data in the collection. The setting applies to the entire collection and can later be modified. To modify collection-level mmap settings, you need to release the collection first.

- **Particular fields in the collection:** Enable mmap for raw data in selected fields. Generally, it is recommended to enable mmap for fields whose data size is large and are not frequently filtered or queried. The setting applies only to the selected fields and can later be modified. To modify field-level mmap settings, you need to release the collection first.

- **Scalar indexes created in the collection:** Enable mmap for scalar indexes to further optimize storage capacity.

<Admonition type="info" icon="📘" title="Notes">

<p>Please be cautious with mmap settings. Changing the default mmap settings may cause performance degradation or load failures due to out-of-memory (OOM) issues. For best practices, see <a href="./use-mmap#collection-specific-mmap-settings">Use mmap</a>.</p>

</Admonition>

### Shard{#shard}

A shard is a horizontal slice of a collection that corresponds to a data input channel. Every collection comes with one shard by default. You can add more shards to increase write throughput.

As a general guideline, consider adding 1 shard for every 100 million rows of data. The maximum number of shards allowed depends on the cluster plan and cluster CU size. For details, see [Zilliz Cloud Limits](./limits#shards).

The number of shards can be later edited via the [clone collection](./manage-collections-console#create-collection) feature once the collection is created.

## Manage collection{#manage-collection}

Zilliz Cloud supports the following management operations on created collections via the web console.

<Supademo id="cmaqjykyn002myh0irk72q332" title="Manage Collection" isShowcase="true" />

- **Rename a collection:** You can change the name of an existing collection.

- **Edit collection schema and settings:** Currently, Zilliz Cloud only supports editing the following schema and settings.

    - You can edit the `max_length` value of an existing [VARCHAR field](./use-string-field).

    - You can edit the `max_capacity` value of an existing [ARRAY field](./use-array-fields) as well as the `max_length`value if the ARRAY type is VARCHAR.

    - To change **shard** settings, use the [Clone collection](./manage-collections-console#create-collection) feature instead.

    - To modify **TTL**, **Mmap**, or **partition key** settings, use the SDKs instead. For details, see [Modify Collection](./modify-collections).

    Other collection schema settings are not editable. To apply changes, create a new collection with the desired configuration and import the data into it.

- **Load & release collection:** On the Zilliz Cloud web console, collections are automatically loaded to memory and made available for search and query immediately after creation. To free up memory space, you can release unused collections.

- **Move collection to another database:** You can group related collections within the same database and move collections between databases as needed.

- **Manage partitions within a collection:** For collections with **partition key** **enabled**, you do not need to manually manage partitions. For collections with partition key **disabled**, you can manually manage partitions and perform the following operations:

    - **Create partition:** You can create a maximum of 1,024 partitions in each collection. For details, see [Zilliz Cloud Limits](./limits#collections).

    - **Drop partition:** The default partition cannot be dropped and dropping a partition irreversibly deletes all data within it. You must release a collection first before dropping any partitions in it.

- **Drop collection:** To reduce resource overhead, you can drop collections that are no longer needed. Dropping a collection irreversibly deletes all data within it.

