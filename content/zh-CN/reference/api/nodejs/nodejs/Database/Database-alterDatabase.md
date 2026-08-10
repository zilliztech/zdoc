---
title: "alterDatabase() | Node.js"
slug: /node/node/Database-alterDatabase
sidebar_label: "alterDatabase()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会修改 Database 属性，例如设置或删除配置键值对。 | Node.js"
type: docx
token: HTGgd3icQo2ssuxywUocz02Enhe
sidebar_position: 1
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabase()

此操作会修改 Database 属性，例如设置或删除配置键值对。

```javascript
await milvusClient.alterDatabase(data: AlterDatabaseRequest)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterDatabase({
    db_name: string,
    db_id?: string,
    properties: object,
    delete_keys?: string[],
    timeout?: number,
})
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    Database 的名称。

- **db_id** (*string*) -

    要修改的 Database 的 ID。可选。

- **properties** (*object*) -

    **[必需]**

    要设置的属性对象（例如，`{ "database.resource_groups": "rg1" }` 用于设置 Database 资源组）。

- **delete_keys** (*string[]*) -

    要删除的属性键。可选。

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
await client.alterDatabase({
    db_name: 'my_database',
    properties: { 'database.resource_groups': 'rg1' },
});
```
