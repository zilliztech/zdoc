---
slug: /cluster-collection-and-entities
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Cluster, Collection & Entities

A Zilliz Cloud cluster is a managed Milvus instance associated with certain computing resources. You can create collections in the cluster and insert entities into them. In comparison to a relational database, a collection in a cluster is similar to a table in the database, and an entity in a collection is similar to a record in the table.

## Cluster{#cluster}

When creating a cluster on Zilliz Cloud, you must specify the type of CU associated with the cluster. There are three types of CUs available: performance-optimized, capacity-optimized, and cost-optimized. You can learn how to choose among these types in [CU Types Explained](https://zilliverse.feishu.cn/wiki/RkNSwoi5AiD2DBkgptxcbz3anGc).

After determining the CU type, you must also specify its size. Note that the number of collections a cluster can hold varies based on its CU size. A cluster with less than 8 CUs can hold no more than 32 collections, while a cluster with more than 8 CUs can hold as many as 256 collections.

All collections in a cluster share the CUs associated with the cluster. To save CUs, you can unload some collections. When a collection is unloaded, its data is moved to disk storage and its CUs are freed up for use by other collections. You can load the collection back into memory when you need to query it. Keep in mind that loading a collection requires some time, so you should only do so when necessary.

## Collection{#collection}

A collection collects data in a two-dimensional table with a fixed number of columns and a variable number of rows. In the table, each column corresponds to a field, and each row represents an entity.

The following figure shows a sample collection that comprises six entities and eight fields.

### Fields{#fields}

In most cases, people describe an object in terms of its attributes, including size, weight, position, etc. These attributes of the object are similar to the fields in a collection.

Among all the fields in a collection, the primary key is one of the most special, because the values stored in this field are unique throughout the entire collection. Each primary key maps to a different record in the collection.

In the collection shown in Figure 1, the **id** field is the primary key. The first ID **0** maps to the article titled *The Mortality Rate of Coronavirus is Not Important*, and will not be used in any other records in this collection.

### Schema{#schema}

Fields have their own properties, such as data types and related constraints for storing data in the field, like vector dimensions and distance metrics. By defining fields and their order, you will get a skeletal data structure termed schema, which shapes a collection in a way that resembles constructing the structure of a data table.

For your reference, Zilliz Cloud supports the following field data types:

- Boolean value (BOOLEAN)

- 8-byte floating-point (DOUBLE)

- 4-byte floating-point (FLOAT)

- Float vector (FLOAT_VECTOR)

- 8-bit integer (INT8)

- 32-bit integer (INT32)

- 64-bit integer (INT64)

- Variable character (VARCHAR)

- [JSON](./javascript-object-notation-json-1)

Zilliz Cloud provides three types of CUs, each of which have its own application scenarios, and they are also the factor that impacts search performance.

<Admonition type="info" icon="📘" title="Notes">

**FLOAT_VECTOR** is the only data type that supports vector embeddings in Zilliz Cloud clusters.

</Admonition>

### Index{#index}

Unlike Milvus instances, Zilliz Cloud clusters only support the **AUTOINDEX** algorithm for indexing. This algorithm is optimized for the three types of computing units (CUs) supported by Zilliz Cloud. For more information, see [AUTOINDEX Explained](./autoindex-explained).

## Entities{#entities}

Entities in a collection are data records sharing the same set of fields, like a book in a library or a gene in a genome. As to an entity, the data stored in each field forms the entity.

By specifying a query vector, search metrics, and optional filtering conditions, you can conduct vector searches among the entities in a collection. For example, if you search with the keyword "Interesting Python demo", any article whose title implies such semantic meaning will be returned as a relevant result. During this process, the search is actually conducted on the vector field **title_vector** to retrieve the top K nearest results. For details on vector searches, see [Search and Query](./search-query-and-get).

You can add as many entities to a collection as you want. However, the size that an entity takes grows along with the increase of the dimensions of the vectors in the entity, reversely affecting the performance of searches within the collection. Therefore, plan your collection wisely on Zilliz Cloud by referring to [Schema Explained](./data-models-explained).