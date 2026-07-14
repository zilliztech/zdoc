---
title: "truncateCollection() | Node.js"
slug: /node/node/Collections-truncateCollection
sidebar_label: "truncateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection からすべてのデータを削除しますが、collection の schema と構造は保持します。 | Node.js"
type: docx
token: J0IBdbw3Voyqw9xnInUcn9EonTe
sidebar_position: 28
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - zilliz cloud
  - cloud
  - truncateCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# truncateCollection()

この操作は、collection からすべてのデータを削除しますが、collection の schema と構造は保持します。

```javascript
await milvusClient.truncateCollection(data: TruncateCollectionRequest)
```

<Admonition type="info" icon="📘" title="注意">

- **元に戻せない操作**

    collection を truncate すると、すべてのデータが完全に削除されます。

- **Schema は保持されます**

    collection の構造、fields、indexes、および properties はそのまま保持されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
truncateCollection({
    db_name?: string,
    collection_name: string,
    timeout?: number
})
```

**パラメーター:**

- **db_name** (*string*) -

    collection を含む database の名前。

- **collection_name** (*string*) -

    **[必須]**

    対象 collection の名前。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。

**戻り値:**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

### 基本的な使用方法\{#basic-usage}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

// Truncate collection
const res = await milvusClient.truncateCollection({
  collection_name: 'my_collection',
});

console.log(res);
// Output: { error_code: 'Success', reason: '' }
```

### database を指定する場合\{#with-database-specified}

```javascript
const res = await milvusClient.truncateCollection({
  db_name: 'my_database',
  collection_name: 'my_collection',
});
```
