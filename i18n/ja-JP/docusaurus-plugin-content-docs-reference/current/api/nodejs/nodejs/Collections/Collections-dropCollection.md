---
title: "dropCollection() | Node.js"
slug: /node/node/Collections-dropCollection
sidebar_label: "dropCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection を削除します。 | Node.js"
type: docx
token: KLknda2VtocQSBx7PKVc6F9Nnug
sidebar_position: 10
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollection()

この操作は collection を削除します。

```javascript
await milvusClient.dropCollection(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropCollection({ 
    db_name: string,
    collection_name: string,
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持しているデータベースの名前です。

- **collection_name** (*string*) -

    **[必須]**

    既存の collection の名前です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

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
 const resStatus = await milvusClient.dropCollection({ collection_name: 'my_collection' });
```

