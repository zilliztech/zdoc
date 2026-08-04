---
title: "flushSync() | Node.js"
slug: /node/node/Management-flushSync
sidebar_label: "flushSync()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会手动封存一个 segment，并将数据持久化到磁盘。建议在将所有数据插入到集合后调用此操作。这是一个同步函数，可确保在函数返回前 flush 操作已完成。 | Node.js"
type: docx
token: QsTwdUbgyoZPV1xzCBxchX8Fnid
sidebar_position: 8
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - flushSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushSync()

此操作会手动封存一个 segment，并将数据持久化到磁盘。建议在将所有数据插入到集合后调用此操作。这是一个同步函数，可确保在函数返回前 flush 操作已完成。

```javascript
await milvusClient.flushSync(data)
```

<Admonition type="info" icon="📘" title="说明">

Milvus 会按时间间隔自动将数据刷写到持久化存储中。建议依赖这种自动数据持久化机制。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.flushSync({
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

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise&lt;GetFlushStateResponse&gt;*

此方法返回一个 promise，解析为一个 **GetFlushStateResponse** 对象。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**参数：**

- **flushed** (*boolean*) -<br/>
  是否所有目标 segment 都已刷写到持久化存储中。由于 `flushSync()` 会阻塞直到 flush 完成，因此成功时该值为 **true**。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。若此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。若此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。若此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const flushSyncStatus = await milvusClient.flushSync({
    collection_names: ['my_collection'],
});
```

