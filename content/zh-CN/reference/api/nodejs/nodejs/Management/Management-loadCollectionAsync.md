---
title: "loadCollectionAsync() | Node.js"
slug: /node/node/Management-loadCollectionAsync
sidebar_label: "loadCollectionAsync()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 Collection 数据加载到查询节点中，随后您就可以对该 Collection 执行向量搜索。这是一个异步函数——请使用 `getLoadState()` 或 `getLoadingProgress()` 检查加载状态。 | Node.js"
type: docx
token: SqSZdmSoVoBuiSxe1a1cdOuZnDd
sidebar_position: 30
keywords: 
  - Pinecone 对比 Milvus
  - Chroma 对比 Milvus
  - Annoy 向量搜索
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollectionAsync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadCollectionAsync()

此操作会将 Collection 数据加载到查询节点中，随后您就可以对该 Collection 执行向量搜索。这是一个异步函数——请使用 `getLoadState()` 或 `getLoadingProgress()` 检查加载状态。

```javascript
await milvusClient.loadCollectionAsync(data: LoadCollectionReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.loadCollectionAsync({
    collection_name: string,
    db_name?: string,
    replica_number?: number,
    resource_groups?: string[],
    refresh?: boolean,
    load_fields?: string[],
    skip_load_dynamic_field?: boolean,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    要加载的 Collection 名称。

- **db_name** (*string*) -

    Database 名称。可选。

- **replica_number** (*number*) -

    要加载的副本数量。可选。

- **resource_groups** (*string[]*) -

    用于负载均衡的资源组名称。可选。

- **refresh** (*boolean*) -

    是否刷新加载以包含新字段。可选。

- **load_fields** (*string[]*) -

    要加载的特定字段名称。可选。

- **skip_load_dynamic_field** (*boolean*) -

    是否跳过加载动态字段。可选。

- **timeout** (*number*) -

    以毫秒为单位的 RPC 超时时间。可选。

**返回：**

*Promise\<ResStatus\>*

**异常：**

- **MilvusError**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.loadCollectionAsync({
    collection_name: 'my_collection',
});

// Check loading progress
const state = await client.getLoadState({
    collection_name: 'my_collection',
});
```
