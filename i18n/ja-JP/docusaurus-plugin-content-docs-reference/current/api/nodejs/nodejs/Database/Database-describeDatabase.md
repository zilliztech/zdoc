---
title: "describeDatabase() | Node.js"
slug: /node/node/Database-describeDatabase
sidebar_label: "describeDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はデータベースの詳細情報を取得し、データベース名、ID、作成タイムスタンプ、プロパティなどを返します。 | Node.js"
type: docx
token: PzXldcfljoU9rOx9TFUcIoNknt6
sidebar_position: 8
keywords: 
  - Zilliz
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# describeDatabase()

この操作はデータベースの詳細情報を取得し、データベース名、ID、作成タイムスタンプ、プロパティなどを返します。

```javascript
await milvusClient.describeDatabase(data: DescribeDatabaseRequest)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.describeDatabase({
    db_name: string,
    timeout?: number,
})
```

**パラメータ:**

- **db_name** (*string*) -

    **[必須]**

    詳細を取得するデータベースの名前。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。任意。

**戻り値:**

*Promise&lt;DescribeDatabaseResponse&gt;*

このメソッドは、**DescribeDatabaseResponse** オブジェクトに解決される promise を返します。

```javascript
{
    db_name: string,
    dbID: number,
    created_timestamp: number,
    properties: KeyValuePair[],
    status:  ResStatus
}
```

**パラメータ:**

- **db_name** (*string*) -
データベース名です。

- **dbID** (*number*) -
データベースの内部識別子です。

- **created_timestamp** (*number*) -
データベースの作成タイムスタンプ（ミリ秒単位）です。

- **properties** (*KeyValuePair[]*) -
作成時に宣言された、または `alterDatabaseProperties()` で設定されたデータベースレベルのプロパティです（例: **データベース.replica.number**、**データベース.resource_groups**）。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.describeDatabase({ db_name: 'default' });
console.log(res.db_name, res.dbID, res.properties);
```
