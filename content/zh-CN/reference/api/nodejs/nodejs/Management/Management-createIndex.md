---
title: "createIndex() | Node.js"
slug: /node/node/Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "此操作为特定 Collection 创建索引。 | Node.js"
type: docx
token: Nu0Id3wzGoJIFyxkC7IcmjAznNf
sidebar_position: 3
keywords: 
  - knn
  - 图像搜索
  - LLMs
  - 机器学习
  - zilliz
  - zilliz cloud
  - cloud
  - createIndex()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createIndex()

此操作为特定 Collection 创建索引。

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

**参数：**

- **db_name** (*string*) -

    目标 Collection 所属的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **field_name** (*string*) -

    **[必需]**

    要在其中创建索引的字段名称。

- **index_name** (*string*) -

    要创建的索引名称。

- **index_type** (*string*) -

    要创建的索引类型。请参见 [IndexType](./Management-IndexType)。

- **metric_type** (*string*) -

    用于度量向量距离的度量类型。可选值：`IP`、`L2`、`COSINE`、`HAMMING`、`JACCARD`、`BM25`（仅用于全文搜索）。请参见 [MetricType](./Management-MetricType)。

    仅当指定字段是向量字段时可用。

- **params** (*keyValueObj*) -

    其他索引特定参数。

- **extra_params** (*CreateIndexParam*) -

    替代索引参数，用于省略了 `index_type` 和 `metric_type` 的请求形式。该对象包含 `index_type`、`metric_type` 和 `params`。请参见 [IndexType](./Management-IndexType) 和 [MetricType](./Management-MetricType)。

- **timeout** (number) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 promise，该 promise 解析为 **ResStatus** 对象。

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

    表示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.createIndex({
   collection_name: "my_collection",
   field_name: "vector_field",
   index_name: "vector_index",
   index_type: IndexType.AUTOINDEX,
   metric_type: MetricType.COSINE,
 });
```
