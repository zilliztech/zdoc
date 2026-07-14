---
title: "alterDatabaseProperties() | Node.js"
slug: /node/node/Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータベースのプロパティを変更します。 | Node.js"
type: docx
token: NNWed9Vd1o7vDkxY4pncM4wYnaf
sidebar_position: 7
keywords: 
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabaseProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

この操作は、指定されたデータベースのプロパティを変更します。

```javascript
await milvusClient.alterDatabaseProperties(data)
```

<Admonition type="info" icon="📘" title="注意">

このメソッドは Dedicated Cluster にのみ適用されます。

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.alterDatabaseProperties({
    db_name: string,
    delete_keys: Object,
    properties: Record<string, string | number | boolean>
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    プロパティを変更するデータベースの名前。

    指定された名前のデータベースが存在している必要があります。そうでない場合、例外が発生します。

- **delete_properties** (*string[]*) -

    削除するプロパティ名を配列で指定します。使用可能なデータベースプロパティは次のとおりです。

    - **database.replica.number** (*int*) -

        データベースのレプリカ数。

    - **database.resource_groups** (*[]str*) -

        データベース専用のリソースグループ。

    - **database.diskQuota.mb** (*int*) -

        データベースに割り当てられるディスククォータ（メガバイト（**MB**）単位）。

    - **database.max.collections** (*int*) -

        データベースで許可されるコレクションの最大数。

    - **database.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **database.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうか。

- **properties** (*Record&lt;string, string | number | boolean&gt;*) -

    キーと値のペアで指定するプロパティとその値。

    - **database.replica.number** (*int*) -

        データベースのレプリカ数。

    - **database.resource_groups** (*[]str*) -

        データベース専用のリソースグループ。

    - **database.diskQuota.mb** (*int*) -

        データベースに割り当てられるディスククォータ（メガバイト（**MB**）単位）。

    - **database.max.collections** (*int*) -

        データベースで許可されるコレクションの最大数。

    - **database.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **database.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうか。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterDatabaseProperties({ 
    db_name: 'new_db',
    delete_properties: {'database.replica.number': 3} 
});
```

