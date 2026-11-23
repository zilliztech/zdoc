---
title: "getCompactionStateWithPlans() | Node.js"
slug: /node/node/Management-getCompactionStateWithPlans
sidebar_label: "getCompactionStateWithPlans()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、対象の Compaction ID の Compaction 状態を取得します。これには、どのセグメントが結合されるかを示すマージプランが含まれます。 | Node.js"
type: origin
token: shared-Management-getCompactionStateWithPlans
keywords: 
  - Compaction
  - Compaction 状態
  - マージプラン
  - zilliz
  - zilliz cloud
  - クラウド
  - getCompactionStateWithPlans()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getCompactionStateWithPlans()

この操作は、対象の Compaction ID の Compaction 状態を取得します。これには、どのセグメントが結合されるかを示すマージプランが含まれます。

```javascript
await milvusClient.getCompactionStateWithPlans(data: GetCompactionPlansReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getCompactionStateWithPlans({
    compactionID: number | string,
    timeout?: number,
})
```

**パラメーター：**

- **compactionID** (*number | string*) -

    **[必須]**

    `compact()` によって返される Compaction 操作の ID です。

- **timeout** (*number*) -

    RPC タイムアウト（ミリ秒単位）。省略可能です。

**戻り値：**

*Promise&lt;GetCompactionPlansResponse&gt;*

このメソッドは、**GetCompactionPlansResponse** オブジェクトに解決される promise を返します。

```javascript
{
    state: CompactionState,
    mergeInfos: { sources: string[], target: string }[],
    status:  ResStatus
}
```

**パラメーター：**

- **state** (*[CompactionState](./Management-CompactionState)*) -

Compaction の集約状態です。指定できる値は **UndefiedState**、**Executing**、**Completed** です。

- **mergeInfos** (*\{ sources: string[], target: string }[]*) -
Compaction によって送信されるマージプランのリストです。

    - **sources** (*string[]*) -

        マージ対象のセグメント ID です。

    - **target** (*string*) -

        マージによって生成される新しいセグメント ID です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、この値は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、この値は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合、この値は空の文字列のままです。


**例外：**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

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
