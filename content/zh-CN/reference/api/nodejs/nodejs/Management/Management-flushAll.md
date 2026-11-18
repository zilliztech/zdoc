---
title: "flushAll() | Node.js"
slug: /node/node/Management-flushAll
sidebar_label: "flushAll()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会刷新所有 Collection，封存所有 Segment，并将数据持久化到磁盘。 | Node.js"
type: docx
token: Zyi9dGUnQodt7MxIq17cyN54nOd
sidebar_position: 22
keywords: 
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - Embedding 模型
  - zilliz
  - zilliz cloud
  - 云
  - flushAll()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# flushAll()

此操作会刷新所有 Collection，封存所有 Segment，并将数据持久化到磁盘。

```javascript
await milvusClient.flushAll(data?: FlushAllReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.flushAll({
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **db_name** (*string*) -
Database 的名称。可选。

- **timeout** (*number*) -
允许 RPC 执行的可选时长，以毫秒为单位。如果将其设置为 undefined，则客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -
用于请求跟踪的 trace ID。可选。

**返回：**

*Promise&lt;FlushAllResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **FlushAllResponse** 对象。

```javascript
{
    flush_all_ts: number,
    flush_all_tss: Record<string, number>,
    flush_all_msgs: Record<string, any>,
    cluster_info: FlushClusterInfo,
    status:  ResStatus
}
```

**参数：**

- **flush_all_ts** (*number*) -
用于标识此次 flush 的单个混合时间戳。已弃用；对于多集群部署，优先使用 **flush_all_tss**。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -
从集群 ID 到该集群中 flush 完成时的混合时间戳的映射。

- **flush_all_msgs** (*Record&lt;string, any&gt;*) -
从物理通道名称到存储层所用 flush 元数据的映射。

- **cluster_info** (*FlushClusterInfo*) -
参与此次 flush 的集群拓扑。

    - **cluster_id** (*string*) -

        集群标识符。

    - **cchannel** (*string*) -

        控制通道名称。

    - **pchannels** (*string[]*) -

        此次 flush 涵盖的物理通道。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则该值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因说明。如果此操作成功，则该值始终为空字符串。


**异常：**

- **Error**

    此操作过程中发生任何错误时都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.flushAll();
```
