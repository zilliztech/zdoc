---
title: "getFlushState() | Node.js"
slug: /node/node/Management-getFlushState
sidebar_label: "getFlushState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回特定 Segment 的 flush 状态。 | Node.js"
type: docx
token: X8qWdMHg5oQQK6xZdBYcGNOnn3c
sidebar_position: 10
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - zilliz
  - zilliz cloud
  - 云
  - getFlushState()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# getFlushState()

此操作返回特定 Segment 的 flush 状态。

```javascript
await milvusClient.getFlushState(data)
```

<Admonition type="info" icon="📘" title="Notes">

Milvus 会定期自动将数据 flush 到持久化存储中。建议您依赖这种自动数据持久化机制。

</Admonition>

## 请求语法\{#request-syntax}

<NextChannel action="exclude">

```javascript
await milvusClient.getFlushState({
    segmentIDs?: number[],
    flush_ts?: number,
    db_name?: string,
    collection_name?: string,
    timeout?: number
})
```

</NextChannel>

<NextChannel action="include">

```javascript
await milvusClient.getFlushState({
    segmentIDs?: number[],
    flush_ts?: number | string,
    db_name?: string,
    collection_name?: string,
    timeout?: number
})
```

</NextChannel>

**参数：**

<NextChannel action="exclude">

- **segmentIDs** (*number[]*) -

    目标 Segment ID 列表。

- **flush_ts** (*number*) -

    用于对照检查的 flush 时间戳。

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    要检查其 flush 状态的 Collection 名称。请至少提供 **segmentIDs**、**flush_ts** 和 **collection_name** 中的一项。

- **timeout** (*number*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

</NextChannel>

<NextChannel action="include">

- **segmentIDs** (*number[]*) -

    目标 Segment ID 列表。

- **flush_ts** (*number* | *string*) -

    用于对照检查的 flush 时间戳。要获得完整精度，请将 int64 值作为十进制字符串传入。

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    要检查其 flush 状态的 Collection 名称。请至少提供 **segmentIDs**、**flush_ts** 和 **collection_name** 中的一项。

- **timeout** (*number*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

</NextChannel>

**返回：**

*Promise&lt;GetFlushStateResponse&gt;*

此方法返回一个 promise，解析为 **GetFlushStateResponse** 对象。

```javascript
{
    flushed: boolean,
    status:  ResStatus
}
```

**参数：**

- **flushed** (*boolean*) -
所有目标 Segment 是否都已 flush 到持久化存储。当每个请求的 Segment ID 均已封存并持久化时，该值为 **true**；否则为 **false**。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值保持为空字符串。

**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const flushState = await milvusClient.getFlushState({
    segmentIDs: [1,2,3,4],
});
```
