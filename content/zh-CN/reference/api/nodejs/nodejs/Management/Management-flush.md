---
title: "flush() | Node.js"
slug: /node/node/Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会手动封存一个 segment 并将数据持久化到磁盘。建议在所有数据都已插入到集合后调用此操作。 | Node.js"
type: docx
token: E2XJd4ZHvoc7QlxyrEJcrOJOn9f
sidebar_position: 7
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flush()

此操作会手动封存一个 segment 并将数据持久化到磁盘。建议在所有数据都已插入到集合后调用此操作。

```javascript
await milvusClient.flush(data)
```

<Admonition type="info" icon="📘" title="说明">

Milvus 会按时间间隔自动将数据刷新到持久化存储中。建议您依赖这种自动数据持久化机制。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.flush({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    目标数据库的名称，目标集合隶属于该数据库。

- **collection_names** (*string[]*) -

    **[必填]**

    目标集合名称列表。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise&lt;FlushResult&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **FlushResult** 对象。

```typescript
{
    coll_segIDs: Record<string, { data: number[] }>,
    status:  ResStatus
}
```

**参数：**

- **coll_segIDs** (*Record&lt;string, \{ data: number[] }&gt;*) -<br/>
  从集合名称到此次 flush 所封存的 segment ID 的映射。使用返回的 ID 配合 `getFlushState()` 确认持久化状态。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

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
const flushStatus = await milvusClient.flush({
    collection_names: ['my_collection'],
});
```

