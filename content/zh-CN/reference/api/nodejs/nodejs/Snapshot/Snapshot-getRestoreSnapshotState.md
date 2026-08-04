---
title: "getRestoreSnapshotState() | Node.js"
slug: /node/node/Snapshot-getRestoreSnapshotState
sidebar_label: "getRestoreSnapshotState()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于检查快照恢复任务的状态。使用 restoreSnapshot() 返回的 job_id。 | Node.js"
type: docx
token: IHY0di5uzooBe8xOCJqci9vinNh
sidebar_position: 4
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getRestoreSnapshotState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getRestoreSnapshotState()

此操作用于检查快照恢复任务的状态。使用 restoreSnapshot() 返回的 `job_id`。

```typescript
await milvusClient.getRestoreSnapshotState(data: GetRestoreSnapshotStateReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.getRestoreSnapshotState({
    job_id: number | string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **job_id** (*number | string*) -<br/>
  **[必需]**<br/>
  restoreSnapshot() 返回的恢复任务 ID。

- **timeout** (*number*) -<br/>
  可选，允许 RPC 持续的时间长度，单位为毫秒。如果设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回值** *Promise&lt;GetRestoreSnapshotStateResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **GetRestoreSnapshotStateResponse** 对象。

```typescript
{
    info: RestoreSnapshotJobInfo,
    status:  ResStatus
}
```

**参数：**

- **info** (*RestoreSnapshotJobInfo*) -<br/>
  恢复任务的当前状态。

    - **job_id** (*string*) -

        任务标识符。

    - **snapshot_name** (*string*) -

        正在恢复的快照。

    - **db_name** (*string*) -

        目标数据库。

    - **collection_name** (*string*) -

        目标集合名称。

    - **state** (*RestoreSnapshotState*) -

        当前任务状态。可能的值包括 **RestoreSnapshotNone**、**RestoreSnapshotPending**、**RestoreSnapshotExecuting**、**RestoreSnapshotCompleted** 和 **RestoreSnapshotFailed**。

    - **progress** (*number*) -

        完成百分比，为 **0** 到 **100** 之间的整数。

    - **reason** (*string*) -

        当 **state** 为 **RestoreSnapshotFailed** 时的失败原因；否则为空字符串。

    - **start_time** (*string*) -

        任务开始的时间。

    - **time_cost** (*string*) -

        自任务开始以来经过的总耗时。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则始终为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.getRestoreSnapshotState({
    job_id: 'job_12345',
});
```
