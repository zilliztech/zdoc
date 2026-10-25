---
title: "flush() | Node.js"
slug: /node/node/Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、セグメントを手動でシールし、データをディスクに永続化します。すべてのデータがコレクションに挿入された後にこの操作を呼び出すことを推奨します。 | Node.js"
type: docx
token: E2XJd4ZHvoc7QlxyrEJcrOJOn9f
sidebar_position: 7
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# flush()

この操作は、セグメントを手動でシールし、データをディスクに永続化します。すべてのデータがコレクションに挿入された後にこの操作を呼び出すことを推奨します。

```javascript
await milvusClient.flush(data)
```

<Admonition type="info" title="Notes">

Milvus は一定間隔でデータを永続ストレージに自動的に flush します。この自動データ永続化メカニズムに依存することを推奨します。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.flush({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    対象のコレクションが属する対象データベースの名前。

- **collection_names** (*string[]*) -

    **[必須]**

    対象のコレクション名のリスト。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が到着するかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値** *Promise&lt;FlushResult&gt;*

このメソッドは、**FlushResult** オブジェクトに解決される promise を返します。

```typescript
{
    coll_segIDs: Record<string, { data: number[] }>,
    status:  ResStatus
}
```

**パラメータ:**

- **coll_segIDs** (*Record&lt;string, \{ data: number[] }&gt;*) -<br/>
  コレクション名から、この flush によってシールされたセグメント ID へのマッピングです。永続化を確認するには、返された ID を `getFlushState()` とともに使用します。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

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
const flushStatus = await milvusClient.flush({
    collection_names: ['my_collection'],
});
```

