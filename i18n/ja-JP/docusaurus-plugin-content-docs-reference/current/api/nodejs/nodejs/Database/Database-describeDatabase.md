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
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


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

**戻り値** *Promise&lt;DescribeDatabaseResponse&gt;*

このメソッドは、**DescribeDatabaseResponse** オブジェクトに解決される promise を返します。

```typescript
{
    db_name: string,
    dbID: number,
    created_timestamp: number,
    properties: KeyValuePair[],
    status:  ResStatus
}
```

**パラメータ:**

- **db_name** (*string*) -<br/>
  データベース名。

- **dbID** (*number*) -<br/>
  内部データベース識別子。

- **created_timestamp** (*number*) -<br/>
  データベースの作成タイムスタンプ（ミリ秒単位）。

- **properties** (*KeyValuePair[]*) -<br/>
  作成時に宣言された、または `alterDatabaseProperties()` によって設定されたデータベースレベルのプロパティ（例: **database.replica.number**、**database.resource_groups**）。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

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
