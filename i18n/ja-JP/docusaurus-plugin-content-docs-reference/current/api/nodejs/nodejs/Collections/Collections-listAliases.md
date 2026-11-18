---
title: "listAliases() | Node.js"
slug: /node/node/Collections-listAliases
sidebar_label: "listAliases()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "これはメソッドテンプレートです。 | Node.js"
type: docx
token: KeoKdlitaog6n1xpX8McIIIrnWb
sidebar_position: 14
keywords: 
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - listAliases()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listAliases()

これはメソッドテンプレートです。

```javascript
await milvusClient.listAliases(data)
```

## Request Syntax\{#request-syntax}

このメソッドには以下の代替構文があります。

```javascript
listAliases({
    db_name: string
    collection_name: string
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise&lt;ListAliasesResponse&gt;*

このメソッドは、**ListAliasesResponse** オブジェクトに解決される promise を返します。

```javascript
{
    db_name: string,
    aliases: string[],
    collection_name: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **db_name** (*string*) -
一覧表示されたエイリアスを所有するデータベースです。

- **aliases** (*string[]*) -
リクエストされたコレクションを指すすべてのエイリアスの一覧です。

- **collection_name** (*string*) -
一覧表示されたエイリアスが指すコレクション名です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listAliases({ collection_name: 'my_collection' });
```
