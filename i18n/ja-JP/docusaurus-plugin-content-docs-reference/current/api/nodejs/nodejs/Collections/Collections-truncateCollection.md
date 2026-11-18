---
title: "truncateCollection() | Node.js"
slug: /node/node/Collections-truncateCollection
sidebar_label: "truncateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションからすべてのデータを削除しますが、コレクションのスキーマと構造は保持します。 | Node.js"
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

---

import Admonition from '@theme/Admonition';

# truncateCollection()

この操作はコレクションからすべてのデータを削除しますが、コレクションのスキーマと構造は保持します。

```javascript
await milvusClient.truncateCollection(data: DropCollectionReq)
```

<Admonition type="info" icon="📘" title="Notes">

- **元に戻せない操作**

コレクションを truncate すると、すべてのデータが完全に削除されます。

- **スキーマは保持されます**

コレクションの構造、フィールド、インデックス、およびプロパティはそのまま保持されます。

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

    コレクションを含むデータベースの名前。

- **collection_name** (*string*) -

    **[必須]**

    対象コレクションの名前。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。

**戻り値:**

*Promise&lt;\{ status: ResStatus }&gt;*

このメソッドは、**ResStatus** を含むオブジェクトに解決される Promise を返します。

```javascript
{
    status: ResStatus
}
```

**パラメーター:**

- **status** (*ResStatus*) -

    **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作の結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

    - **reason** (*string*) - 

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空の文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#examples}

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
// Output: { status: { error_code: 'Success', reason: '' } }
```

### データベースを指定する場合\{#with-database-specified}

```javascript
const res = await milvusClient.truncateCollection({
  db_name: 'my_database',
  collection_name: 'my_collection',
});
```
