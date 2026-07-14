---
title: "createDatabase() | Node.js"
slug: /node/node/Database-createDatabase
sidebar_label: "createDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作はデータベースを作成します。 | Node.js"
type: docx
token: UouKd4h01oL9Rqx73jjcHM3enSh
sidebar_position: 2
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - createDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createDatabase()

この操作はデータベースを作成します。

```javascript
await milvusClient.createDatabase(data)
```

<Admonition type="info" icon="📘" title="注意">

このメソッドは Dedicated Cluster にのみ適用されます。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.createDatabase({
    db_name: string,
    properties?: Object
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    作成するデータベースの名前です。

    指定した名前のデータベースが存在してはいけません。存在する場合は、例外が発生します。

- **properties** (*Object*) -

    データベースの作成とともに設定するプロパティです。使用可能なデータベースプロパティは次のとおりです。

    - **database.replica.number** (*int*) -

        データベースのレプリカ数。

    - **database.resource_groups** (*[]str*) -

        データベース専用のリソースグループ。

    - **database.diskQuota.mb** (*int*) -

        データベースに割り当てられるディスククォータ（メガバイト（**MB**）単位）。

    - **database.max.collections** (*int*) -

        データベースで許可される collection の最大数。

    - **database.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **database.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうか。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise |&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.createDatabase({
    db_name: 'new_db',
    properties: { 'database.resource_groups': 'rg1' },
});
```
