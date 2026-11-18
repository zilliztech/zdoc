---
title: "getPkFieldName() | Node.js"
slug: /node/node/Collections-getPkFieldName
sidebar_label: "getPkFieldName()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取 Collection 的主键字段名称。这是一种便捷方法，会描述该 Collection 并提取主键字段名称。 | Node.js"
type: docx
token: WiVnd8VXooFQ9PxVgiyc7FkqnAg
sidebar_position: 26
keywords: 
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - Zilliz
  - Zilliz Cloud
  - 云
  - getPkFieldName()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getPkFieldName()

此操作获取 Collection 的主键字段名称。这是一种便捷方法，会描述该 Collection 并提取主键字段名称。

```javascript
await milvusClient.getPkFieldName(data: DescribeCollectionReq)
```

## 请求语法\{#request-syntax}

```javascript
getPkFieldName({
    collection_name: string,
    db_name?: string,
    cache?: boolean,
    timeout: number
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    Collection 的名称。

- **db_name** (*string*) -

    保存目标 Collection 的 Database 名称。

- **cache** (*boolean*) -

    是否使用 Collection 的缓存描述。可选。

- **timeout** (*number*) -

    RPC 超时时间，单位为毫秒。可选。

**返回：**

*Promise&lt;string&gt;*

主键字段的名称。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

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
