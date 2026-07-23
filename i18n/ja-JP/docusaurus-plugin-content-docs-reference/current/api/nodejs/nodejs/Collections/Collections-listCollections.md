---
title: "listCollections() | Node.js"
slug: /node/node/Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのコレクションを一覧表示します。 | Node.js"
type: docx
token: Djg7dlb5NoINz9xOAs1cyY67nsh
sidebar_position: 15
keywords: 
  - milvus はどのように動作するか
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - クラウド
  - listCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

この操作は、既存のすべてのコレクションを一覧表示します。

```javascript
milvusClient.listCollections();
```

## リクエスト構文\{#request-syntax}

```javascript
listCollections({
    collection_name: string
    type: ShowCollectionsType,
    timeout?: number
})
```

**パラメータ:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前です。

- **type** (*ShowCollectionsType*) 

    この操作のスコープです。指定可能な値は **All** または **Loaded** です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値** *Promise&lt;ShowCollectionsResponse&gt;*

このメソッドは、**ShowCollectionsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    data: CollectionData[],
    created_timestamps: string[],
    created_utc_timestamps: string[],
    status:  ResStatus
}
```

**パラメータ:**

- **data** (*CollectionData[]*) -<br/>
  コレクションデータオブジェクトのリストです。各エントリには、コレクション名、ID、タイムスタンプ、およびロード率が含まれます。

- **created_timestamps** (*string[]*) -<br/>
  各コレクションが作成された時刻を示すハイブリッドタイムスタンプのリストです。

- **created_utc_timestamps** (*string[]*) -<br/>
  各コレクションが作成された時刻を示す UTC タイムスタンプのリストです。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す内容です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listCollections({ collection_name: 'my_collection' });
```

