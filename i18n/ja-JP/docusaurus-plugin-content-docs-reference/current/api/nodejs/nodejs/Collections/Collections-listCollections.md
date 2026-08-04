---
title: "listCollections() | Node.js"
slug: /node/node/Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のすべての collection を一覧表示します。 | Node.js"
type: docx
token: Djg7dlb5NoINz9xOAs1cyY67nsh
sidebar_position: 15
keywords: 
  - Milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
  - 非構造化データ
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

この操作は、既存のすべての collection を一覧表示します。

```javascript
milvusClient.listCollections();
```

## Request Syntax\{#request-syntax}

```javascript
listCollections({
    collection_name: string
    type: ShowCollectionsType,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **type** (*ShowCollectionsType*) 

    この操作のスコープです。指定可能な値は **All** または **Loaded** です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;ShowCollectionsResponse&gt;*

このメソッドは、**ShowCollectionsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    data: CollectionData[],
    created_timestamps: string[],
    created_utc_timestamps: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*CollectionData[]*) -<br/>
  collection データオブジェクトの一覧です。各エントリには、collection 名、ID、タイムスタンプ、およびロード率が含まれます。

- **created_timestamps** (*string[]*) -<br/>
  各 collection が作成された時刻を示すハイブリッドタイムスタンプの一覧です。

- **created_utc_timestamps** (*string[]*) -<br/>
  各 collection が作成された時刻を示す UTC タイムスタンプの一覧です。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listCollections({ collection_name: 'my_collection' });
```

