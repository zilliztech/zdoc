---
title: "flushSync() | Node.js"
slug: /node/node/Management-flushSync
sidebar_label: "flushSync()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はセグメントを手動でシールし、データをディスクに永続化します。すべてのデータがコレクションに挿入された後にこの操作を呼び出すことを推奨します。これは、関数が戻る前にフラッシュ操作が完了したことを保証する同期関数です。 | Node.js"
type: docx
token: QsTwdUbgyoZPV1xzCBxchX8Fnid
sidebar_position: 8
keywords: 
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - flushSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushSync()

この操作はセグメントを手動でシールし、データをディスクに永続化します。すべてのデータがコレクションに挿入された後にこの操作を呼び出すことを推奨します。これは、関数が戻る前にフラッシュ操作が完了したことを保証する同期関数です。

```javascript
await milvusClient.flushSync(data)
```

<Admonition type="info" icon="📘" title="注意">

Milvus は一定間隔でデータを自動的に永続ストレージへフラッシュします。この自動データ永続化メカニズムに依存することを推奨します。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.flushSync({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    対象コレクションが属する対象データベースの名前です。

- **collection_names** (*string[]*) -

    **[必須]**

    対象コレクション名のリストです。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;GetFlushStateResponse&gt;*

このメソッドは、**GetFlushStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **flushed** (*boolean*) -
すべての対象セグメントが永続ストレージにフラッシュ済みかどうかを示します。`flushSync()` はフラッシュが完了するまでブロックするため、成功時にはこの値は **true** です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

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

