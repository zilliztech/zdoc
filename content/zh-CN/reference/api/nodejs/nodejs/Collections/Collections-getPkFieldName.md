---
title: "getPkFieldName() | Node.js"
slug: /node/node/Collections-getPkFieldName
sidebar_label: "getPkFieldName()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取集合的主键字段名称。这是一个便捷方法，用于描述集合并提取主键字段名称。 | Node.js"
type: docx
token: WiVnd8VXooFQ9PxVgiyc7FkqnAg
sidebar_position: 26
keywords: 
  - milvus 的工作原理
  - Zilliz 向量数据库
  - Zilliz 数据库
  - 非结构化数据
  - zilliz
  - zilliz cloud
  - cloud
  - getPkFieldName()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPkFieldName()

此操作获取集合的主键字段名称。这是一个便捷方法，用于描述集合并提取主键字段名称。

```javascript
await milvusClient.getPkFieldName(data: DescribeCollectionReq)
```

## 请求语法\{#request-syntax}

```javascript
getPkFieldName({
    collection_name: string,
    timeout: number
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    集合的名称。

- **timeout** (*number*) -

    RPC 超时时间，单位为毫秒。可选。

**返回：**

*Promise\<string\>*

主键字段的名称。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkName = await client.getPkFieldName({
    collection_name: 'my_collection',
});
console.log(pkName); // e.g., "id"
```
