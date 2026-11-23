---
title: "getCompactionStateWithPlans() | Node.js"
slug: /node/node/Management-getCompactionStateWithPlans
sidebar_label: "getCompactionStateWithPlans()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作获取指定 Compaction ID 的 Compaction 状态，包括显示将合并哪些 Segment 的合并计划。 | Node.js"
type: origin
token: shared-Management-getCompactionStateWithPlans
keywords: 
  - Compaction
  - Compaction 状态
  - 合并计划
  - zilliz
  - Zilliz Cloud
  - 云
  - getCompactionStateWithPlans()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getCompactionStateWithPlans()

此操作获取指定 Compaction ID 的 Compaction 状态，包括显示将合并哪些 Segment 的合并计划。

```javascript
await milvusClient.getCompactionStateWithPlans(data: GetCompactionPlansReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getCompactionStateWithPlans({
    compactionID: number | string,
    timeout?: number,
})
```

**参数：**

- **compactionID** (*number | string*) -

    **[必需]**

    由 `compact()` 返回的 Compaction 操作 ID。

- **timeout** (*number*) -

    RPC 超时时间，单位为毫秒。可选。

**返回：**

*Promise&lt;GetCompactionPlansResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **GetCompactionPlansResponse** 对象。

```javascript
{
    state: CompactionState,
    mergeInfos: { sources: string[], target: string }[],
    status:  ResStatus
}
```

**参数：**

- **state** (*[CompactionState](./Management-CompactionState)*) -

Compaction 的聚合状态。可能的值包括 **UndefiedState**、**Executing** 和 **Completed**。

- **mergeInfos** (*\{ sources: string[], target: string }[]*) -
由 Compaction 分发的合并计划列表。

    - **sources** (*string[]*) -

        正在合并的 Segment ID。

    - **target** (*string*) -

        合并后生成的新 Segment ID。

- **ResStatus**
**ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        指示已发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的原因说明。如果此操作成功，则该值保持为空字符串。


**异常：**

- **Error**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const compactRes = await client.compact({ collection_name: 'my_collection' });
const plans = await client.getCompactionStateWithPlans({
    compactionID: compactRes.compactionID,
});
console.log(plans.state, plans.mergeInfos);
```
