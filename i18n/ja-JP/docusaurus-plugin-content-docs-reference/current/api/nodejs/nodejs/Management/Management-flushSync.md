---
title: "flushSync() | Node.js"
slug: /node/node/Management-flushSync
sidebar_label: "flushSync()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、セグメントを手動でシールし、データをディスクに永続化します。すべてのデータをコレクションに挿入した後にこの操作を呼び出すことを推奨します。これは、関数が戻る前に flush 操作が完了していることを保証する同期関数です。 | Node.js"
type: docx
token: QsTwdUbgyoZPV1xzCBxchX8Fnid
sidebar_position: 8
keywords: 
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - クラウド
  - flushSync()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# flushSync()

この操作は、セグメントを手動でシールし、データをディスクに永続化します。すべてのデータをコレクションに挿入した後にこの操作を呼び出すことを推奨します。これは、関数が戻る前に flush 操作が完了していることを保証する同期関数です。

```javascript
await milvusClient.flushSync(data)
```

<Admonition type="info" title="Notes">

Milvus は一定間隔でデータを永続ストレージに自動的に flush します。この自動データ永続化メカニズムに依存することを推奨します。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.flushSync({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**パラメーター:**

- **db_name** (*string*) -

    対象のコレクションが属する対象データベースの名前です。

- **collection_names** (*string[]*) -

    **[REQUIRED]**

    対象のコレクション名のリストです。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点で、この操作がタイムアウトすることを示します。

**戻り値** *Promise&lt;GetFlushStateResponse&gt;*

このメソッドは、**GetFlushStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメーター:**

- **flushed** (*boolean*) -<br/>
  対象のすべてのセグメントが永続ストレージに flush されているかどうかです。`flushSync()` は flush が完了するまでブロックするため、成功時にはこの値は **true** です。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const flushSyncStatus = await milvusClient.flushSync({
    collection_names: ['my_collection'],
});
```

