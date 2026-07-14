---
title: "getFlushState() | Node.js"
slug: /node/node/Management-getFlushState
sidebar_label: "getFlushState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の segment の flush ステータスを返します。 | Node.js"
type: docx
token: X8qWdMHg5oQQK6xZdBYcGNOnn3c
sidebar_position: 10
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - getFlushState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getFlushState()

この操作は、特定の segment の flush ステータスを返します。

```javascript
await milvusClient.getFlushState(data)
```

<Admonition type="info" icon="📘" title="注意">

Milvus は一定間隔でデータを自動的に永続ストレージへ flush します。この自動データ永続化メカニズムを利用することを推奨します。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getFlushState({
    segment_ids: number[],
    timeout?: number
})
```

**PARAMETERS:**

- **segment_ids** (*number[]*) -

    **[REQUIRED]**

    対象となる segment ID のリスト。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;GetFlushStateResponse&gt;*

このメソッドは、**GetFlushStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **flushed** (*boolean*) -
すべての対象 segment が永続ストレージに flush 済みかどうか。要求されたすべての segment ID が sealed され、永続化されている場合は **true**、そうでない場合は **false** です。

- **ResStatus**
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
const flushState = await milvusClient.getFlushState({
    segmentIDs: [1,2,3,4],
});
```

