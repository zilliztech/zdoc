---
title: "createIndex() | Node.js"
slug: /node/node/Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation creates an index for a specific collection. | Node.js"
type: docx
token: Nu0Id3wzGoJIFyxkC7IcmjAznNf
sidebar_position: 3
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - createIndex()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createIndex()

This operation creates an index for a specific collection.

```javascript
await milvusClient.createIndex(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.createIndex([
    {
       db_name?: string,
       collection_name: string,
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type: string,
       params?: keyValueObj,
       timeout?: number
     }
 ] | {
       db_name?: string,
       collection_name: string,
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type: string,
       params?: keyValueObj,
       extra_params?: CreateIndexParam,
       timeout?: number    
 });
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to which the target collection belongs.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **field_name** (*string*) -

    **[REQUIRED]**

    The name of the field in which to create an index.

- **index_name** (*string*) -

    The name of the index to create.

- **index_type** (*string*) -

    The type of the index to create. See [IndexType](./Management-IndexType).

- **metric_type** (*string*) -

    The metric type used to measure vector distance. Possible values: `IP`, `L2`, `COSINE`, `HAMMING`, `JACCARD`, `BM25` (used only for full text search). See [MetricType](./Management-MetricType).

    This is available only when the specified field is a vector field.

- **params** (*keyValueObj*) -

    Other index-specific parameters.

- **extra_params** (*CreateIndexParam*) -

    Alternative index parameters, used with the request form that omits `index_type` and `metric_type`. The object carries `index_type`, `metric_type`, and `params`. See [IndexType](./Management-IndexType) and [MetricType](./Management-MetricType).

- **timeout** (number) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS:**

*Promise\<ResStatus\>*

This method returns a promise that resolves to a **ResStatus** object.

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    A code that indicates the operation result. It remains **0** if this operation succeeds.

- **error_code** (*string* | *number*) -

    An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

- **reason** (*string*) - 

    The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
await milvusClient.createIndex({
   collection_name: "my_collection",
   field_name: "vector_field",
   index_name: "vector_index",
   index_type: IndexType.AUTOINDEX,
   metric_type: MetricType.COSINE,
 });
```

