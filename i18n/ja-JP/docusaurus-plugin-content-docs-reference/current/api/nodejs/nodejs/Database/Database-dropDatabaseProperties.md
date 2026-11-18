---
title: "dropDatabaseProperties() | Node.js"
slug: /node/node/Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたプロパティの設定を削除します。 | Node.js"
type: docx
token: GulFdOWMboEK9bxnzMSc8Uf8n8b
sidebar_position: 4
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabaseProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropDatabaseProperties()

この操作は、指定されたプロパティの設定を削除します。

```javascript
await milvusClient.dropDatabaseProperties(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropDatabaseProperties({
    db_name: string,
    properties: string[],
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    プロパティを削除する対象のデータベースの名前です。

    指定された名前のデータベースが存在している必要があります。存在しない場合、例外が発生します。

- **properties** (*string[]*) -

    削除するプロパティの名前を配列で指定します。使用可能なデータベースプロパティは次のとおりです。

    - **データベース.replica.number** (*number*) -

        データベースのレプリカ数です。

    - **データベース.resource_groups** (*string[]*) -

        データベース専用のリソースグループです。

    - **データベース.diskQuota.mb** (*number*) -

        データベースに割り当てられたディスククォータです（単位はメガバイト（**MB**））。

    - **データベース.max.コレクション** (*number*) -

        データベースで許可されるコレクションの最大数です。

    - **データベース.force.deny.writing** (*boolean*) -

        データベース内のすべての書き込み操作を拒否するかどうかです。

    - **データベース.force.deny.reading** (*boolean*) -

        データベース内のすべての読み取り操作を拒否するかどうかです。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作の結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空の文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropDatabaseProperties({ 
    db_name: 'new_db',
    properties: ["database.replica.number"] 
});
```
