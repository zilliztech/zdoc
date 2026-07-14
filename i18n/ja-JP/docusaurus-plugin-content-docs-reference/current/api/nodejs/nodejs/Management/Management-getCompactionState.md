---
title: "getCompactionState() | Node.js"
slug: /node/node/Management-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection で収集された統計情報を一覧表示します。 | Node.js"
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

この操作は、特定の collection で収集された統計情報を一覧表示します。

```javascript
await milvusClient.getCompactionState(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getCompactionState({ 
    compactionID: string | number,
    timeout?: number 
})
```

**パラメーター:**

- **compactionID** (*string | number*) -

    **[必須]**

    [`compact()`](./Management-compact) の呼び出しによって返される compaction ジョブの ID。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが返された時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;GetCompactionStateResponse&gt;*

このメソッドは、**GetCompactionStateResponse** オブジェクトに解決される promise を返します。

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

**パラメーター:**

- **state** (*CompactionState*) -
compaction の集約状態。取り得る値は **UndefiedState**、**Executing**、および **Completed** です。

- **executingPlanNo** (*string*) -
現在も実行中のプラン数。

- **timeoutPlanNo** (*string*) -
タイムアウトしたプラン数。

- **completedPlanNo** (*string*) -
正常に完了したプラン数。

- **failedPlanNo** (*string*) -
失敗したプラン数。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.getCompactionState({
    compactionID: 'your_compaction_id',
});
```

