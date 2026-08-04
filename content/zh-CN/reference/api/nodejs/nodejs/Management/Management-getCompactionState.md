---
title: "getCompactionState() | Node.js"
slug: /node/node/Management-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出在特定 collection 上收集的统计信息。 | Node.js"
type: docx
token: CRFLdvgkhoeRikxMcMAcJk3qnIc
sidebar_position: 9
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - getCompactionState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionState()

此操作列出在特定 collection 上收集的统计信息。

```javascript
await milvusClient.getCompactionState(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getCompactionState({ 
    compactionID: string | number,
    timeout?: number 
})
```

**参数：**

- **compactionID** (*string | number*) -

    **[必填]**

    由调用 [`compact()`](./Management-compact) 返回的 compaction 作业 ID。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

**返回值** *Promise&lt;GetCompactionStateResponse&gt;*

此方法返回一个 promise，解析为 **GetCompactionStateResponse** 对象。

```typescript
{
    state: CompactionState,
    executingPlanNo: string,
    timeoutPlanNo: string,
    completedPlanNo: string,
    failedPlanNo: string,
    status:  ResStatus
}
```

**参数：**

- **state** (*CompactionState*) -<br/>
  compaction 的聚合状态。可能的值包括 **UndefiedState**、**Executing** 和 **Completed**。

- **executingPlanNo** (*string*) -<br/>
  仍在执行中的计划数量。

- **timeoutPlanNo** (*string*) -<br/>
  已超时的计划数量。

- **completedPlanNo** (*string*) -<br/>
  已成功完成的计划数量。

- **failedPlanNo** (*string*) -<br/>
  失败的计划数量。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.getCompactionState({
    compactionID: 'your_compaction_id',
});
```

