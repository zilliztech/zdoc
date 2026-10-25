---
title: "dropIndex() | Node.js"
slug: /node/node/Management-dropIndex
sidebar_label: "dropIndex()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops an インデックス from a specific コレクション. | Node.js"
type: docx
token: UBbndftiQo2HdOxUNtocIISnnVh
sidebar_position: 5
keywords: 
  - how do ベクトル データベース work
  - ベクトル db comparison
  - openai ベクトル db
  - natural language processing データベース
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndex()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropIndex()

This operation drops an インデックス from a specific コレクション.

```javascript
await milvusClient.dropIndex(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropPartition({
    db_name: string,
    collection_name: string,
    field_name?: string,
    index_name?: string,
    timeout?: number
 });
```

**パラメータ:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **field_name** (*string*) -

    The name of an existing field in the コレクション.

- **index_name** (string) -

    The name of the インデックス to drop.

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

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

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const dropIndexReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.dropIndex(dropIndexReq);
console.log(res);
```

