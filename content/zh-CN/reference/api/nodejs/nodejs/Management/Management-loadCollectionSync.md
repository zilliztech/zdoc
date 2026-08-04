---
title: "loadCollectionSync() | Node.js"
slug: /node/node/Management-loadCollectionSync
sidebar_label: "loadCollectionSync()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将特定 collection 的数据加载到内存中。这是一个同步函数，有助于确保指定的 collection 已完成加载。 | Node.js"
type: docx
token: XXUAdI8T2oOmw2x7iITc8vJgnjm
sidebar_position: 18
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollectionSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadCollectionSync()

此操作会将特定 collection 的数据加载到内存中。这是一个同步函数，有助于确保指定的 collection 已完成加载。

```javascript
loadCollectionSync: ((data) => Promise<ResStatus>) = ...
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.loadCollectionSync({ 
    db_name: string,
    collection_name: string,
    refresh?: boolean,
    replica_number?: number,
    resource_groups?: string[],
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    包含目标 collection 的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    collection 的名称。

- **refresh** (*boolean*) -

    是否刷新已加载 collection 的加载状态。

- **replica_number** (*number*) -

    要加载的 collection 的副本数量。

- **resource_groups** (*string[]*) -

    要加载该 collection 所使用的资源组数量。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示此操作会在收到任意响应或发生错误时超时。

**返回值** *Promise\<ResStatus>*

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

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.loadCollectionSync({ collection_name: 'my_collection' });
```

