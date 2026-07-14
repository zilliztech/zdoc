---
title: "flush() | Node.js"
slug: /node/node/Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、segment を手動で seal し、データをディスクに永続化します。すべてのデータが collection に挿入された後でこの操作を呼び出すことを推奨します。 | Node.js"
type: docx
token: E2XJd4ZHvoc7QlxyrEJcrOJOn9f
sidebar_position: 7
keywords: 
  - HNSW
  - 非構造化データとは
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# flush()

この操作は、segment を手動で seal し、データをディスクに永続化します。すべてのデータが collection に挿入された後でこの操作を呼び出すことを推奨します。

```javascript
await milvusClient.flush(data)
```

<Admonition type="info" icon="📘" title="注意">

Milvus は一定間隔でデータを自動的に永続ストレージへ flush します。 この自動データ永続化メカニズムに依存することを推奨します。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.flush({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象 collection が属する対象データベースの名前。

- **collection_names** (*string[]*) -

    **[REQUIRED]**

    対象 collection 名のリスト。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が返るか何らかのエラーが発生した時点で、この操作はタイムアウトします。

**RETURNS** *Promise&lt;FlushResult&gt;*

このメソッドは、**FlushResult** オブジェクトに解決される promise を返します。

```typescript
{
    coll_segIDs: Record<string, { data: number[] }>,
    status:  ResStatus
}
```

**PARAMETERS:**

- **coll_segIDs** (*Record&lt;string, \{ data: number[] }&gt;*) -
collection 名から、この flush によって seal された segment ID へのマッピングです。永続化を確認するには、返された ID を `getFlushState()` とともに使用してください。

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
const flushStatus = await milvusClient.flush({
    collection_names: ['my_collection'],
});
```

