---
title: "dropCollectionField() | Node.js"
slug: /node/node/Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从 Collection 的 Schema 中删除字段。 | Node.js"
type: docx
token: ANWZdmEMkocWK3xo2ZxcnqtLnUh
sidebar_position: 31
keywords: 
  - 删除字段
  - Schema
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropCollectionField()

此操作会按名称或 ID 从现有 Collection 中删除字段。

```javascript
await milvusClient.dropCollectionField(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropCollectionField({
    collection_name: string,
    field_name?: string,
    field_id?: number | string,
    db_name?: string,
    timeout?: number
})
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    包含该字段的 Collection 的名称。

- **field_name** （*string*） -

    要删除的字段名称。请提供 `field_name` 或 `field_id`，二者只能提供其一。

- **field_id** （*number* | *string*） -

    要删除的字段 ID。请提供 `field_name` 或 `field_id`，二者只能提供其一。

- **db_name** （*string*） -

    Collection 所在 Database 的名称。

- **timeout** （*number*） -

    此操作的超时时间，单位为毫秒。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个解析为 **ResStatus** 对象的 Promise。

**异常：**

- **Error**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.dropCollectionField({
    collection_name: 'my_collection',
    field_name: 'sparse_vector',
});
```
