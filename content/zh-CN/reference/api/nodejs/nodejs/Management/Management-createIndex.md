---
title: "createIndex() | Node.js"
slug: /node/node/Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "此操作为指定集合创建索引。 | Node.js"
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

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createIndex()

此操作为指定集合创建索引。

```javascript
await milvusClient.createIndex(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.createIndex([
    {
       db_name?: string,
       collection_name: string,
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type: string,
       params?: KeyValueObj,
       timeout?: number
     }
 ] | {
       db_name?: string,
       collection_name: string,
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type: string,
       params?: KeyValueObj,
       timeout?: number    
 });
```

**参数：**

- **db_name** (*string*) -

    目标集合所属数据库的名称。

- **collection_name** (*string*) -

    **[必需]**

    现有集合的名称。

- **field_name** (*string*) -

    **[必需]**

    要在其中创建索引的字段名称。

- **index_name** (*string*) -

    要创建的索引名称。

- **index_type** (*string*) -

    要创建的索引类型。

- **metric_type** (*string*) -

    用于度量向量距离的度量类型。可能的值包括：`IP`、`L2`、`COSINE`、`HAMMING`、`JACCARD`、`BM25`（仅用于全文检索）。更多信息，请参阅 [Metric Types](https://milvus.io/docs/metric.md)。

    仅当指定字段是向量字段时，此参数才可用。

- **params** (*string*) -

    其他特定于索引的参数。

- **timeout** (number) -

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

**返回：** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
await milvusClient._createIndex({
   collection_name: "my_collection",
   field_name: "vector_field",
   index_name: "vector_index"
 });
```

