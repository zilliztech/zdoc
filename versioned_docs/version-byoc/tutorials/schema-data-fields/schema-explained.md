---
title: "Schema Explained | BYOC"
slug: /schema-explained
sidebar_label: "Schema Explained"
beta: FALSE
notebook: FALSE
description: "A schema defines the data structure of a collection. Before creating a collection, you need to work out a design of its schema. This page helps you understand the collection schema and design an example schema on your own. | BYOC"
type: origin
token: Vs4YwNnvzitoQ8kunlGcWMJInbf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema explained

---

import Admonition from '@theme/Admonition';


# Schema Explained

A schema defines the data structure of a collection. Before creating a collection, you need to work out a design of its schema. This page helps you understand the collection schema and design an example schema on your own.

## Overview{#overview}

On Zilliz Cloud, a collection schema assembles a table in a relational database, which defines how Zilliz Cloud organizes data in the collection. 

A well-designed schema is essential as it abstracts the data model and decides if you can achieve the business objectives through a search. Furthermore, since every row of data inserted into the collection must follow the schema, it helps maintain data consistency and long-term quality. From a technical perspective, a well-defined schema leads to well-organized column data storage and a cleaner index structure, boosting search performance.

A collection schema has a primary key, a maximum of four vector fields, and several scalar fields. The following diagram illustrates how to map an article to a list of schema fields.

![RoJFbyTsuoY8mHxoBBicgBH9nTc](/byoc/RoJFbyTsuoY8mHxoBBicgBH9nTc.png)

The data model design of a search system involves analyzing business needs and abstracting information into a schema-expressed data model. For instance, searching a piece of text must be "indexed" by converting the literal string into a vector through "embedding" and enabling vector search. Beyond this essential requirement, storing other properties such as publication timestamp and author may be necessary. This metadata allows for semantic searches to be refined through filtering, returning only texts published after a specific date or by a particular author. You can also retrieve these scalars with the main text to render the search result in the application. Each should be assigned a unique identifier to organize these text pieces, expressed as an integer or string. These elements are essential for achieving sophisticated search logic.

Refer to [Schema Design Hands-On](./schema-design-hands-on) to figure out how to make a well-designed schema.

## Create Schema{#create-schema}

The following code snippet demonstrates how to create a schema.

[Unsupported block type]

## Add Primary Field{#add-primary-field}

The primary field in a collection uniquely identifies an entity. It only accepts **Int64** or **VarChar** values. The following code snippets demonstrate how to add the primary field.

[Unsupported block type]

When adding a field, you can explicitly clarify the field as the primary field by setting its `is_primary` property to `True`. A primary field accepts **Int64** values by default. In this case, the primary field value should be integers similar to `12345`. If you choose to use **VarChar** values in the primary field, the value should be strings similar to `my_entity_1234`.

You can also set the `autoId` properties to `True` to make Zilliz Cloud automatically allocate primary field values upon data insertions.

For details, refer to [Primary Field & AutoId](./primary-field-auto-id).

## Add Vector Fields{#add-vector-fields}

Vector fields accept various sparse and dense vector embeddings. On Zilliz Cloud, you can add four vector fields to a collection. The following code snippets demonstrate how to add a vector field.

[Unsupported block type]

The `dim` paramter in the above code snippets indicates the dimensionality of the vector embeddings to be held in the vector field. The `FLOAT_VECTOR` value indicates that the vector field holds a list of 32-bit floating numbers, which are usually used to represent antilogarithms.In addition to that, Zilliz Cloud also supports the following types of vector embeddings:

- `FLOAT16_VECTOR`

    A vector field of this type holds a list of 16-bit half-precision floating numbers and usually applies to memory- or bandwidth-restricted deep learning or GPU-based computing scenarios.

- `BFLOAT16_VECTOR`

    A vector field of this type holds a list of 16-bit floating-point numbers that have reduced precision but the same exponent range as Float32. This type of data is commonly used in deep learning scenarios, as it reduces memory usage without significantly impacting accuracy.

- `BINARY_VECTOR`

    A vector field of this type holds a list of 0s and 1s. They serve as compact features for representing data in image processing and information retrieval scenarios.

- `SPARSE_FLOAT_VECTOR`

    A vector field of this type holds a list of non-zero numbers and their sequence numbers to represent sparse vector embeddings.

## Add Scalar Fields{#add-scalar-fields}

In common cases, you can use scalar fields to store the metadata of the vector embeddings stored in Milvus, and conduct ANN searches with metadata filtering to improve the correctness of the search results. Zilliz Cloud supports multiple scalar field types, including **VarChar**, **Boolean**, **Int**, **Float**, **Double**, **Array**, and **JSON**.

### Add String Fields{#add-string-fields}

In Milvus, you can use VarChar fields to store strings. For more on the VarChar field, refer to [String Field](./use-string-field).

[Unsupported block type]

### Add Number Fields{#add-number-fields}

The types of numbers that Milvus supports are `Int8`, `Int16`, `Int32`, `Int64`, `Float`, and `Double`. For more on the number fields, refer to [Number Field](./use-number-field).

[Unsupported block type]

### Add Boolean Fields{#add-boolean-fields}

Milvus supports boolean fields. The following code snippets demonstrate how to add a boolean field.

[Unsupported block type]

### Add JSON fields{#add-json-fields}

A JSON field usually stores half-structured JSON data. For more on the JSON fields, refer to [JSON Field](./use-json-fields).

[Unsupported block type]

### Add Array Fields{#add-array-fields}

An array field stores a list of elements. The data types of all elements in an array field should be the same. For more on the array fields, refer to [Array Field](./use-array-fields).

[Unsupported block type]

