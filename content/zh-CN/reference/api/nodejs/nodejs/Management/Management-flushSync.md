---
title: "flushSync() | Node.js"
slug: /node/node/Management-flushSync
sidebar_label: "flushSync()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会手动封存一个 Segment，并将数据持久化到磁盘。建议在所有数据都插入到 Collection 后调用此操作。这是一个同步函数，可确保在函数返回前 flush 操作已完成。 | Node.js"
type: docx
token: QsTwdUbgyoZPV1xzCBxchX8Fnid
sidebar_position: 8
keywords: 
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - 向量化
  - zilliz
  - zilliz cloud
  - 云
  - flushSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushSync()

此操作会手动封存一个 Segment，并将数据持久化到磁盘。建议在所有数据都插入到 Collection 后调用此操作。这是一个同步函数，可确保在函数返回前 flush 操作已完成。

```javascript
await milvusClient.flushSync(data)
```

<Admonition type="info" icon="📘" title="Notes">

Milvus 会定期自动将数据 flush 到持久化存储中。建议您依赖这种自动数据持久化机制。

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

    目标 Collection 所属目标 Database 的名称。

- **collection_names** (*string[]*) -

    **[必需]**

    目标 Collection 名称列表。

- **timeout** (*number*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回** *Promise&lt;GetFlushStateResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **GetFlushStateResponse** 对象。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**参数：**

- **flushed** (*boolean*) -<br/>
  表示所有目标 Segment 是否都已 flush 到持久化存储。由于 `flushSync()` 会阻塞直至 flush 完成，因此成功时该值为 **true**。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的状态码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值保持为空字符串。

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

