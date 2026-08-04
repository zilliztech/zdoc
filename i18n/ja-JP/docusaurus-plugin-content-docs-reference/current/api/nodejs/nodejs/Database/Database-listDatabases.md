---
title: "listDatabases() | Node.js"
slug: /node/node/Database-listDatabases
sidebar_label: "listDatabases()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのデータベースを一覧表示します。 | Node.js"
type: docx
token: DZMUdKbtfoT1HbxaXEDcgFkJnsh
sidebar_position: 5
keywords: 
  - 音声類似性検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listDatabases()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listDatabases()

この操作は、既存のすべてのデータベースを一覧表示します。

```javascript
await milvusClient.listDatabases(data?)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listDatabases({
    timeout?: number
})
```

**PARAMETERS:**

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;ListDatabasesResponse&gt;*

このメソッドは、**ListDatabasesResponse** オブジェクトに解決される promise を返します。

```typescript
{
    db_names: string[],
    db_ids: string[],
    created_timestamp: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **db_names** (*string[]*) -<br/>
  現在の Milvus インスタンスで定義されているデータベース名のリスト。

- **db_ids** (*string[]*) -<br/>
  **db_names** と同じ順序の、内部データベース識別子。

- **created_timestamp** (*string[]*) -<br/>
  **db_names** と同じ順序の、データベースの作成タイムスタンプ。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

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
const res = await milvusClient.listDatabases();
```
