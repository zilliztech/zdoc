---
title: "refreshLoad() | Node.js"
slug: /node/node/Management-refreshLoad
sidebar_label: "refreshLoad()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会刷新特定 collection 的加载状态。 | Node.js"
type: docx
token: Jc43d397doxCRkxal2XcQ1Wyn2g
sidebar_position: 19
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - refreshLoad()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# refreshLoad()

此操作会刷新特定 collection 的加载状态。

```javascript
await milvusClient.refreshLoad(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.refreshLoad({
   db_name?: string,
   collection_name: string,
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    包含目标 collection 的数据库名称。

- **collection_name** (*string*) -

    **[必填]**

    collection 的名称。

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

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

    表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.refreshLoad({ collection_name: 'my_collection' });
```

