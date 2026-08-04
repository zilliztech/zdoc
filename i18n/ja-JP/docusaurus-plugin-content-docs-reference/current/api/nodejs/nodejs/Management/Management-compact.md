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

## Request Syntax\{#request-syntax}

```javascript
milvusClient.compact()
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    エイリアスを再割り当てする対象 collection の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**RETURNS** *Promise&lt;CompactionResponse&gt;*

このメソッドは、**CompactionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    compactionID: string,
    compactionPlanCount: number,
    status:  ResStatus
}
```

**PARAMETERS:**

- **compactionID** (*string*) -<br/>
  圧縮操作の識別子。この値を `getCompactionState()` または `getCompactionStateWithPlans()` に渡して進行状況をポーリングします。

- **compactionPlanCount** (*number*) -<br/>
  この操作のために生成された圧縮プランの数。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.compact({
      collection_name: 'my_collection',
 });
```

