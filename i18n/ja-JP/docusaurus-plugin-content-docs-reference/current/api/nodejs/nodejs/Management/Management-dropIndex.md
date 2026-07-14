---
title: "dropIndex() | Node.js"
slug: /node/node/Management-dropIndex
sidebar_label: "dropIndex()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection から index を削除します。 | Node.js"
type: docx
token: UBbndftiQo2HdOxUNtocIISnnVh
sidebar_position: 5
keywords: 
  - vector database はどのように動作するか
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndex()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropIndex()

この操作は、特定の collection から index を削除します。

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

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **field_name** (*string*) -

    collection 内の既存フィールドの名前。

- **index_name** (string) -

    削除する index の名前。

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

