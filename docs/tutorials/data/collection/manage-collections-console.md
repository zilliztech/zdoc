---
title: "Manage Collections (Console) | Cloud"
slug: /manage-collections-console
sidebar_label: "Manage Collections (Console)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A collection is a two-dimensional table used to store vector embeddings and metadata. All entities in a collection share the same schema. You can create multiple collections for data management or multi-tenancy purposes. | Cloud"
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
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation

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

## Create collection\{#create-collection}

The Zilliz Cloud console provides 3 ways to create a collection, each designed for different scenarios:

- **Create your own collection:** Customize the schema and index parameters to fit your dataset and use case. Ideal for users who need fine-grained control over the schema.

- **Create sample collection:** Quickly set up a collection with a predefined schema and sample dataset. Recommended for new users exploring Zilliz Cloud.

- **Clone an existing collection with data:** Duplicate an existing collection within the same database. Useful in environment duplication scenarios where you need to copy both schema and data from a testing collection to a production collection.

- **Create from an existing schema**: Quickly create a new collection using the schema of an existing one, with the option to edit before finalizing.

The following demo shows you where to find the features on the web UI.

<Supademo id="cmap9as9900yyx80ihbaf3rqt" title="Create Collection" isShowcase="true" />

Below are some of the concepts you will encounter when creating a collection.

### Collection basic information\{#collection-basic-information}

The metadata of a collection contains:

- Collection name

- (Optional) Collection description

- The database to which the collection belongs. A [database](./database) is a layer between clusters and collections and serves as a logical container to manage and organize collections. You can group relevant collections under the same database.

### Collection schema\{#collection-schema}

A schema defines the data structure of your collection and must include:

- 1 primary key (PK) field

- At least 1 vector field. For limits on the number of vector fields allowed in a collection, see [Zilliz Cloud Limits](./limits#fields).

- (Optional) Scalar fields for metadata

- (Optional) Dynamic field. Enabling dynamic field provides flexibility to the collection schema because it allows you to add fields during data insertion without modifying the existing schema. It is recommended to enable dynamic field when your data structure is not fixed. For fields that are frequently used in filters or queries, define them in advance in the schema instead of using dynamic fields, as this can help maintain optimal query performance.

<Supademo id="cmaqefyds2e7aho3rna9w8trp" title="Zilliz Cloud - Create Collection Schema" />

<Admonition type="info" icon="📘" title="Notes">

<p>Most of the schema configurations cannot be modified once the collection is created. Design your schema carefully to ensure it meets current and future business needs. For best practices, see <a href="./schema-explained">Schema Explained</a>.</p>

</Admonition>

### Index\{#index}

An index is a data structure that organizes data to accelerate searches and queries. Zilliz Cloud supports two types of indexes:

- **Vector index**: Automatically created using [AUTOINDEX](./autoindex-explained) to accelerate vector searches. If you have multiple vector fields in the schema, you can create a separate index for each vector field. In addition, you can also edit the [metric type](./search-metrics-explained) used to calculate the distance between vectors and the index build level that controls the underlying quantization strategy for tradeoffs between index cost, performance and capacity. 

    <Supademo id="cmgk9ynaq290okrn90l496fq7?utm_source=link" title=""  />

- **Scalar index**: By default, Zilliz Cloud does not automatically create indexes for scalar fields. However, you can manually create indexes on scalar fields that are commonly used for filtering to accelerate searches and queries.

You can skip creating indexes during collection creation and add indexes later. For details, see [Manage Indexes](./manage-indexes).

### Function & analyzer\{#function-and-analyzer}

An analyzer is used in full-text search to tokenize and normalize raw text. It breaks input text into individual, searchable terms and removes irrelevant elements like stop words and punctuation to improve search precision. For details, see [Analyzer Overview](./analyzer-overview).

A function is used in full-text search to convert tokenized terms generated by an analyzer into sparse vectors with relevance scores. It applies scoring algorithms like BM25 to generate weighted representations for indexing and document ranking.

To use functions, you need to add both `SPARSE_FLOAT_VECTOR` and `VARCHAR` fields in the schema. For details, see [Full Text Search](./full-text-search).

### Partition & partition key\{#partition-and-partition-key}

**Partition:** A partition is a physical subset of a collection. A partition shares the same data schema with its parent collection but contains only a portion of the data in the collection. Each collection comes with one default partition. You can manually add more partitions for multi-tenancy and data management purposes. If no extra partition is created, all data inserted into a collection will fall into the default partition. For details, see [Manage Partitions](./manage-partitions)

**Partition key:** A partition key is a search optimization solution based on partitions. When you specify a non-primary key `INT64` or `VARCHAR` field as the partition key, 16 partitions will be automatically created by Zilliz Cloud and all inserted entities will fall into these 16 auto-generated partitions based on their partition key values. Once partition key is enabled for a collection, you will not be able to manually create partitions in this collection. For details, see [Use Partition Key](./use-partition-key).

<Admonition type="info" icon="📘" title="Notes">

<p>To decide whether you need to create partitions or use partition key, you can consider the following factors:</p>
<ul>
<li><p><strong>Multi-tenancy strategies:</strong> If you need to support millions of tenants, please use partition key. If you need strong physical data isolation between tenants, please use partitions. For details, refer to <a href="./multi-tenancy">Implement Multi-tenancy</a>.</p></li>
<li><p><strong>Resource management:</strong> If you prefer creating and managing partitions on you own, you can choose to use partitions. If you need automatic creation and management of partitions, please use partitions keys.</p></li>
<li><p><strong>Hot and cold data management:</strong> If you need efficient handling of hot and cold data, please use partition key. To use partition key for hot and cold data management in Dedicated clusters, please <a href="http://support.zilliz.com">contact us</a>.</p></li>
</ul>

</Admonition>

### mmap\{#mmap}

Memory mapping (mmap) is a memory usage optimization that enables direct access to large files on disk without loading them to memory. After enabling mmap, you can store more data under the same CU size specifications. As indicated below, mmap is configured with recommended defaults based on your CU type and plan.

- Free, Serverless, and Dedicated clusters with the extended-capacity CU type have mmap enabled by default. This setting is fixed and cannot be modified, so you may not see mmap configuration options during collection creation.

- Dedicated clusters with the performance-optimized CU type have mmap disabled by default.

- Dedicated clusters with the capacity-optimized CU type have mmap enabled by default.

For details about the cluster-level default mmap settings, see [Use mmap](./use-mmap#global-mmap-strategy).

During collection creation, you can optionally configure mmap settings at the **collection** or **field** level, depending on your use case. Settings at lower levels take precedence over higher levels: **Field > Collection > Cluster.** 

- **Collection-level mmap:** Enable mmap for raw data across the entire collection. This setting can be modified later, but requires releasing the collection first.

- **Field-level mmap:** Enable mmap for raw data and scalar indexes of selected fields via custom settings. Generally, it is recommended to enable mmap for fields whose data size is large and are not frequently filtered or queried. The setting applies only to the selected fields and can later be modified. To modify field-level mmap settings, you need to release the collection first.

<Admonition type="info" icon="📘" title="Notes">

<p>Please be cautious with mmap settings. Changing the default mmap settings may cause performance degradation or load failures due to out-of-memory (OOM) issues. For best practices, see <a href="./use-mmap#collection-specific-mmap-settings">Use mmap</a>.</p>

</Admonition>

The demo below shows the entrance of this feature on the Zilliz Cloud web console.

<Supademo id="cmbk94p4i8hm0sn1rhzrph2b5" title=""  />

### Shard\{#shard}

A shard is a horizontal slice of a collection that corresponds to a data input channel. Every collection comes with one shard by default. You can add more shards to increase write throughput. 

As a general guideline, consider adding 1 shard for every 100 million rows of data. The maximum number of shards allowed depends on the cluster plan and cluster CU size. For details, see [Zilliz Cloud Limits](./limits#shards).

The number of shards can be later edited via the [clone collection](./manage-collections-console#create-collection) feature once the collection is created.

### Full text search\{#full-text-search}

The Zilliz Cloud console supports configuring the functions and analyzer to use in a full text search. For details about full text search, see [Full Text Search](./full-text-search).

The demo below shows the entrance of this feature on the Zilliz Cloud web console.

<Supademo id="cmbj8ahun7j48sn1redlc3e93" title=""  />

### Text Match\{#text-match}

The Zilliz Cloud console also supports configuring the field and analyzer for text match. For details about text match, see [Text Match](./text-match).

The demo below shows the entrance of this feature on the Zilliz Cloud web console.

<Supademo id="cmbj80qyf7it8sn1r6lzo0g1c" title=""  />

## Manage collection\{#manage-collection}

Zilliz Cloud supports the following management operations on created collections via the web console.

<Supademo id="cmaqjykyn002myh0irk72q332?utm_source=link" title="" isShowcase />

- **Rename a collection:** You can change the name of an existing collection.

- **Edit collection schema and settings:** Currently, Zilliz Cloud only supports editing the following schema and settings.

    - You can edit the `max_length` value of an existing [VARCHAR field](./use-string-field).

    - You can edit the `max_capacity` value of an existing [ARRAY field](./use-array-fields) as well as the `max_length`value if the ARRAY type is VARCHAR.

    - You can add new scalar fields to an existing schema.

    - To change **shard** settings, use the [Clone collection](./manage-collections-console#create-collection) feature instead.

    - To modify **TTL**, **mmap**, or **partition key** settings, use the SDKs instead. For details, see [Modify Collection](./modify-collections).

    - If you have not enabled dynamic field when creating a collection, you can later enable it by using the SDK or web console. For details about the SDKs, see [Modify Collection](./modify-collections#example-4-enable-dynamic-field). For details about how to enable dynamic field on the web console, refer to the demo above.

    Other collection schema settings are not editable. To apply changes, create a new collection with the desired configuration and import the data into it.

- **Load & release collection:** On the Zilliz Cloud web console, collections are automatically loaded to memory and made available for search and query immediately after creation. To free up memory space, you can release unused collections.

- **Move collection to another database:** You can group related collections within the same database and move collections between databases as needed.

- **Manage partitions within a collection:** For collections with **partition key** **enabled**, you do not need to manually manage partitions. For collections with partition key **disabled**, you can manually manage partitions and perform the following operations:

    - **Create partition:** You can create a maximum of 1,024 partitions in each collection. For details, see [Zilliz Cloud Limits](./limits#collections).

    - **Drop partition:** The default partition cannot be dropped and dropping a partition irreversibly deletes all data within it. You must release a collection first before dropping any partitions in it.

- **View collection alias**: You can view the aliases of all collections in a cluster on the collection list page.

- **Drop collection:** To reduce resource overhead, you can drop collections that are no longer needed. Dropping a collection irreversibly deletes all data within it.

