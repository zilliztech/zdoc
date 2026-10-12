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

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

この操作は、指定されたプロパティの設定を削除します。

```javascript
await milvusClient.dropDatabaseProperties(data)
```

<Admonition type="info" title="Notes">

このメソッドは Dedicated クラスターにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropDatabaseProperties({
    db_name: string,
    delete_properties: string[],
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    プロパティを削除する対象のデータベースの名前です。

    指定された名前のデータベースが存在している必要があります。存在しない場合、例外が発生します。

- **delete_properties** (*string[]*) -

    削除するプロパティの名前を配列で指定します。使用可能なデータベースプロパティは次のとおりです。

    - **データベース.replica.number** (*int*) -

        データベースのレプリカ数です。

    - **データベース.resource_groups** (*[]str*) -

        データベース専用のリソースグループです。

    - **データベース.diskQuota.mb** (*int*) -

        データベースに割り当てられたディスククォータです（単位はメガバイト（**MB**））。

    - **データベース.max.コレクション** (*int*) -

        データベースで許可されるコレクションの最大数です。

    - **データベース.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうかです。

    - **データベース.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうかです。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise |&lt;ResStatus&gt;*

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

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropDatabaseProperties({ 
    db_name: 'new_db',
    delete_properties: ["database.replica.number"] 
});
```
