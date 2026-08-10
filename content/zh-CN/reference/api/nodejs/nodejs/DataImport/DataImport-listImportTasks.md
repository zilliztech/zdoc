---
title: "listImportTasks() | Node.js"
slug: /node/node/DataImport-listImportTasks
sidebar_label: "listImportTasks()"
beta: false
added_since: inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "列出 Collection 的导入任务，显示批量导入操作的状态和详细信息。 | Node.js"
type: docx
token: KX8pd5PnGoo8UAx8QhhcI5YpnHg
sidebar_position: 15
keywords: 
  - milvus Database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listImportTasks()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listImportTasks()

列出 Collection 的导入任务，显示批量导入操作的状态和详细信息。

```javascript
await milvusClient.listImportTasks(data: ListImportTasksReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listImportTasks({
    collection_name: string,
    limit?: number,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    Collection 的名称。

- **limit** (*number*) -

    返回任务的最大数量。将其设置为 `0` 可返回所有任务。可选。

- **timeout** (*number*) -

    以毫秒为单位的 RPC 超时时间。可选。

**返回** *Promise&lt;ListImportTasksResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **ListImportTasksResponse** 对象。

```typescript
{
    tasks: GetImportStateResponse[],
    status:  ResStatus
}
```

**参数：**

- **tasks** (*GetImportStateResponse[]*) -<br/>
  导入任务描述符列表。每个条目都包含任务状态、行数、Segment ID 和创建时间戳。

    - **state** (*ImportState*) -

        任务状态。可能的值包括 **ImportPending**、**ImportFailed**、**ImportStarted**、**ImportPersisted**、**ImportCompleted** 和 **ImportFailedAndCleaned**。

    - **row_count** (*number*) -

        该任务导入的行数。

    - **id_list** (*number[]*) -

        导入行分配到的自动生成主键（如可用）。

    - **infos** (*KeyValuePair[]*) -

        诊断键值对（例如 **failed_reason**）。

    - **id** (*number*) -

        任务标识符。

    - **collection_id** (*number*) -

        接收此次导入的 Collection。

    - **segment_ids** (*number[]*) -

        该任务生成的 Segment ID。

    - **create_ts** (*number*) -

        任务的创建时间戳。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.listImportTasks({
    collection_name: 'my_collection',
});
console.log(res.tasks);
```
