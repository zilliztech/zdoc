---
title: "dropFunctionField() | Node.js"
slug: /node/node/Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从 Collection Schema 中删除一个函数。 | Node.js"
type: docx
token: MmABd2rdooxiLZxYzwEciyTanOg
sidebar_position: 32
keywords: 
  - 删除函数
  - 函数
  - Schema
  - zilliz
  - zilliz cloud
  - 云
  - dropFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropFunctionField()

此操作会从 Collection 中删除一个函数及其输出字段和索引。

```javascript
await milvusClient.dropFunctionField(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropFunctionField({
    collection_name: string,
    function_name: string,
    db_name?: string,
    timeout?: number
})
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    包含该函数的 Collection 的名称。

- **function_name** （*string*） -

    **[必需]**

    要删除的函数的名称。

- **db_name** （*string*） -

    Collection 所在 Database 的名称。

- **timeout** （*number*） -

    此操作的超时时长，单位为毫秒。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 promise，该 promise 解析为 **ResStatus** 对象。

**异常：**

- **Error**

    在此操作期间发生任何错误时，都将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.dropFunctionField({
    collection_name: 'my_collection',
    function_name: 'my_bm25_function',
});
```
