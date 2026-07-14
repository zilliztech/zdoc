---
title: "renameCollection() | Node.js"
slug: /node/node/Collections-renameCollection
sidebar_label: "renameCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存のコレクションの名前を変更します。 | Node.js"
type: docx
token: LSwVdMg4SorzZ5xSHHVcQeVDnfh
sidebar_position: 16
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - renameCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# renameCollection()

この操作は既存のコレクションの名前を変更します。

```javascript
await milvusClient.renameCollection(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.renameCollection({
   db_name: string,
   collection_name: string,
   new_collection_name: string,
   timeout?: number
 })
```

**パラメーター:**

- **db_name** (*string*) -

    対象のコレクションを保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前です。

- **new_collection_name** (*string*) -

    **[REQUIRED]**

    この操作後の対象コレクションの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着した場合、または何らかのエラーが発生した場合にこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは **ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター:**

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
 const resStatus = await milvusClient.renameCollection({
   collection_name: 'my_collection',
   new_collection_name: 'my_new_collection'
 });
```

