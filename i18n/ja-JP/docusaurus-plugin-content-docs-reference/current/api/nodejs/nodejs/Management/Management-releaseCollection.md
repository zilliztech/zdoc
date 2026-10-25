---
title: "releaseCollection() | Node.js"
slug: /node/node/Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases the data of a specific コレクション from memory. | Node.js"
type: docx
token: UxOXdeKF1oOIBuxTjPhcKBtPnRb
sidebar_position: 20
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - releaseCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# releaseCollection()

This operation releases the data of a specific コレクション from memory.

```javascript
await milvusClient.releaseCollection(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.releaseCollection({ 
    db_name: string,
    collection_name: 'my_collection',
    timeout?: number 
})
```

**パラメータ:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*str*) -

    **[必須]**

    The name of a コレクション.

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

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

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.releaseCollection({ collection_name: 'my_collection' });
```

