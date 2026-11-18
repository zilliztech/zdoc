---
title: "useDatabase() | Node.js"
slug: /node/node/Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "この操作は、gRPC クライアントのアクティブなデータベースを設定します。 | Node.js"
type: docx
token: NDcldy9OLo62DLxw1a9cFSLsnYb
sidebar_position: 6
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - クラウド
  - useDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# useDatabase()

この操作は、gRPC クライアントのアクティブなデータベースを設定します。

```javascript
await milvusClient.useDatabase(data?)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.useDatabase({
    db_name: string
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    使用するデータベースの名前。

    指定した名前のデータベースが存在している必要があります。存在しない場合は、例外が発生します。

**戻り値:**

*Promise&lt;\{ error_code: string, reason: string }&gt;*

このメソッドは、結果ステータスを格納したオブジェクトに解決される promise を返します。

```javascript
{
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままになります。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合、空文字列のままになります。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.useDatabase({ db_name: 'new_db' });
```
