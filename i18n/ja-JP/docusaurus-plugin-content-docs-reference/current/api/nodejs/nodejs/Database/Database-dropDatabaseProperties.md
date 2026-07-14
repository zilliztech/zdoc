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

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated cluster にのみ適用されます。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropDatabaseProperties({
    db_name: string,
    delete_properties: string[],
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    プロパティを削除する対象のデータベース名。

    指定された名前のデータベースが存在している必要があります。そうでない場合、例外が発生します。

- **delete_properties** (*string[]*) -

    削除するプロパティ名の配列。使用可能なデータベースプロパティは次のとおりです。

    - **database.replica.number** (*int*) -

        データベースのレプリカ数。

    - **database.resource_groups** (*[]str*) -

        データベース専用の resource group。

    - **database.diskQuota.mb** (*int*) -

        データベースに割り当てられたディスククォータ（メガバイト（**MB**）単位）。

    - **database.max.collections** (*int*) -

        データベースで許可される collection の最大数。

    - **database.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **database.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうか。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise |&lt;ResStatus&gt;*

このメソッドは **ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。

## Example\{#example}

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
