---
title: "compact() | Node.js"
slug: /node/node/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、小さなセグメントを圧縮してより大きなセグメントにマージし、メモリ使用量を節約して検索パフォーマンスを向上させます。 | Node.js"
type: docx
token: DCK5d56UZop0kGxpQu8cLqlvndg
sidebar_position: 2
keywords: 
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍探索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# compact()

この操作は、小さなセグメントを圧縮してより大きなセグメントにマージし、メモリ使用量を節約して検索パフォーマンスを向上させます。

```javascript
await milvusClient.compact(data)
```

## リクエスト構文\{#request-syntax}

```javascript
milvusClient.compact()
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    エイリアスを再割り当てする対象 collection の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;CompactionResponse&gt;*

このメソッドは、**CompactionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    compactionID: string,
    compactionPlanCount: number,
    status:  ResStatus
}
```

**パラメーター:**

- **compactionID** (*string*) -
compaction 操作の識別子です。進行状況をポーリングするには、この値を `getCompactionState()` または `getCompactionStateWithPlans()` に渡します。

- **compactionPlanCount** (*number*) -
この操作のために生成された compaction plan の数。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.compact({
      collection_name: 'my_collection',
 });
```

