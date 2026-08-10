---
title: "getPkField() | Node.js"
slug: /node/node/Collections-getPkField
sidebar_label: "getPkField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取 Collection 的完整主字段 Schema。这是一种便捷方法，用于描述 Collection 并提取主键字段。 | Node.js"
type: docx
token: LmnudtyV5owY2zx5D9WcENcsnFg
sidebar_position: 25
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - getPkField()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPkField()

此操作获取 Collection 的完整主字段 Schema。这是一种便捷方法，用于描述 Collection 并提取主键字段。

```javascript
await milvusClient.getPkField(data: DescribeCollectionReq)
```

## 请求语法\{#request-syntax}

```javascript
getPkField({
    collection_name: string,
    timeout: number
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    Collection 的名称。

- **timeout** (*number*) -

    RPC 超时时间，单位为毫秒。可选。

**返回：**

*Promise\<FieldSchema\>*

主键的完整字段 Schema 对象，包括名称、数据类型、字段 ID 和其他属性。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkField = await client.getPkField({
    collection_name: 'my_collection',
});
console.log(pkField.name, pkField.data_type);
```
