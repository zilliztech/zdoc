---
title: "flushSync() | Node.js"
slug: /node/node/Management-flushSync
sidebar_label: "flushSync()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、segment を手動で seal し、データをディスクに永続化します。すべてのデータが collection に挿入された後にこの操作を呼び出すことを推奨します。これは、関数が戻る前に flush 操作が完了していることを保証する同期関数です。 | Node.js"
type: docx
token: QsTwdUbgyoZPV1xzCBxchX8Fnid
sidebar_position: 8
keywords: 
  - マルチモーダル vector database retrieval
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - zilliz
  - zilliz cloud
  - クラウド
  - flushSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flushSync()

この操作は、segment を手動で seal し、データをディスクに永続化します。すべてのデータが collection に挿入された後にこの操作を呼び出すことを推奨します。これは、関数が戻る前に flush 操作が完了していることを保証する同期関数です。

```javascript
await milvusClient.flushSync(data)
```

<Admonition type="info" icon="📘" title="注意">

Milvus は一定間隔でデータを永続ストレージに自動的に flush します。この自動データ永続化メカニズムに依存することを推奨します。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.flushSync({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection が属する対象データベースの名前。

- **collection_names** (*string[]*) -

    **[REQUIRED]**

    対象 collection 名のリスト。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;GetFlushStateResponse&gt;*

このメソッドは、**GetFlushStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **flushed** (*boolean*) -<br/>
  対象のすべての segment が永続ストレージに flush されているかどうか。`flushSync()` は flush の完了までブロックするため、成功時にはこの値は **true** です。

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
const flushSyncStatus = await milvusClient.flushSync({
    collection_names: ['my_collection'],
});
```

