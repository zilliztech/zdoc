---
title: "listDatabases() | Node.js"
slug: /node/node/Database-listDatabases
sidebar_label: "listDatabases()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有现有 Database。 | Node.js"
type: docx
token: DZMUdKbtfoT1HbxaXEDcgFkJnsh
sidebar_position: 5
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - 云
  - listDatabases()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listDatabases()

此操作会列出所有现有 Database。

```javascript
await milvusClient.listDatabases(data?)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listDatabases({
    timeout?: number
})
```

**参数：**

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作将超时。

**返回值** *Promise&lt;ListDatabasesResponse&gt;*

此方法返回一个 promise，该 promise 解析为 **ListDatabasesResponse** 对象。

```typescript
{
    db_names: string[],
    db_ids: string[],
    created_timestamp: string[],
    status:  ResStatus
}
```

**参数：**

- **db_names** (*string[]*) -<br/>
  当前 Milvus 实例中定义的 Database 名称列表。

- **db_ids** (*string[]*) -<br/>
  Database 的内部标识符，顺序与 **db_names** 相同。

- **created_timestamp** (*string[]*) -<br/>
  Database 的创建时间戳，顺序与 **db_names** 相同。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listDatabases();
```
