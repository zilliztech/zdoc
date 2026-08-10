---
title: "getImportState() | Node.js"
slug: /node/node/DataImport-getImportState
sidebar_label: "getImportState()"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检索特定导入任务的当前状态和元数据。在调用 `bulkInsert()` 后，可使用此操作轮询任务是否完成。| Node.js"
type: docx
token: DJ4NdIIQ4oeA7gx4bDQcxT3gn0c
sidebar_position: 17
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - zilliz
  - zilliz cloud
  - 云
  - getImportState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getImportState()

此操作检索特定导入任务的当前状态和元数据。在调用 `bulkInsert()` 后，可使用此操作轮询任务是否完成。

```typescript
await milvusClient.getImportState(data)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.getImportState({
    task: number,
    timeout?: number
})
```

**参数：**

- **task** (*number*) -

    **[必需]** 由 `bulkInsert()` 返回的导入任务 ID。

- **timeout** (*number*) -

    RPC 允许的可选时长，单位为毫秒。

**返回** *Promise&lt;GetImportStateResponse&gt;*

此方法返回一个 Promise，解析为 **GetImportStateResponse** 对象。

```typescript
{
    state: ImportState,
    row_count: number,
    id_list: number[],
    infos: KeyValuePair[],
    id: number,
    collection_id: number,
    segment_ids: number[],
    create_ts: number,
    status: ResStatus
}
```

**参数：**

- **state** (*ImportState*) -

    导入任务的当前状态。可能的值包括 **ImportPending**、**ImportStarted**、**ImportPersisted**、**ImportCompleted**、**ImportFailed** 和 **ImportFailedAndCleaned**。

- **row_count** (*number*) -

    已导入或已解析的行数。

- **id_list** (*number[]*) -

    如果主键使用 autoID，则返回自动生成的 ID 列表。

- **infos** (*KeyValuePair[]*) -

    有关导入任务的附加信息，例如进度、文件路径或失败原因。

- **id** (*number*) -

    导入任务的 ID。

- **collection_id** (*number*) -

    与导入任务关联的 Collection ID。

- **segment_ids** (*number[]*) -

    导入任务创建的 Segment ID。

- **create_ts** (*number*) -

    导入任务创建时的时间戳。

- **ResStatus**

    一个 **ResStatus** 对象。

    - **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

    - **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

    - **reason** (*string*) -

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.getImportState({ task: 123456 });
```
