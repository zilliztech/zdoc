---
title: "compact() | Node.js"
slug: /node/node/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会对小型 Segment 进行 Compaction 并将其合并为更大的 Segment，以节省内存使用并提升搜索性能。 | Node.js"
type: docx
token: DCK5d56UZop0kGxpQu8cLqlvndg
sidebar_position: 2
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - 云
  - compact()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# compact()

此操作会对小型 Segment 进行 Compaction 并将其合并为更大的 Segment，以节省内存使用并提升搜索性能。

```javascript
await milvusClient.compact(data)
```

## 请求语法\{#request-syntax}

```javascript
milvusClient.compact({
    collection_name: string,
    db_name?: string,
    timetravel?: number | string,
    majorCompaction?: boolean,
    partition_id?: number | string,
    channel?: string,
    segment_ids?: number[],
    l0Compaction?: boolean,
    target_size?: number | string,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必填]**

    要执行 Compaction 的 Collection 名称。

- **db_name** (*string*) -

    包含目标 Collection 的 Database 名称。

- **timetravel** (*number* | *string*) -

    过去的时间戳。Compaction 会丢弃此时间戳之前提交的已删除数据。

- **majorCompaction** (*boolean*) -

    是否运行 major Compaction，同时对该 Collection 的已删除数据执行 Compaction。

- **partition_id** (*number* | *string*) -

    要执行 Compaction 的 Partition ID。

- **channel** (*string*) -

    要执行 Compaction 的 Segment 的消息通道。

- **segment_ids** (*number[]*) -

    要执行 Compaction 的 Segment ID 列表。

- **l0Compaction** (*boolean*) -

    是否运行 L0 级 Compaction。

- **target_size** (*number* | *string*) -

    Compaction 后 Segment 的目标大小。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回：**

*Promise&lt;CompactionResponse&gt;*

此方法返回一个 promise，该 promise 解析为 **CompactionResponse** 对象。

```javascript
{
    compactionID: string,
    compactionPlanCount: number,
    status:  ResStatus
}
```

**参数：**

- **compactionID** (*string*) -
Compaction 操作的标识符。将此值传递给 `getCompactionState()` 或 `getCompactionStateWithPlans()` 以轮询进度。

- **compactionPlanCount** (*number*) -
为此操作生成的 Compaction 计划数量。

- **ResStatus**
**ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.compact({
      collection_name: 'my_collection',
 });
```
