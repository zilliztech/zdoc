---
title: "alterDatabase() | Node.js"
slug: /node/node/Database-alterDatabase
sidebar_label: "alterDatabase()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、設定のキーと値のペアの設定や削除など、データベースのプロパティを変更します。 | Node.js"
type: docx
token: HTGgd3icQo2ssuxywUocz02Enhe
sidebar_position: 1
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabase()

この操作は、設定のキーと値のペアの設定や削除など、データベースのプロパティを変更します。

```javascript
await milvusClient.alterDatabase(data: AlterDatabaseRequest)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.alterDatabase({
    db_name: string,
    db_id?: string,
    properties: object,
    delete_keys?: string[],
    timeout?: number,
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    データベースの名前。

- **db_id** (*string*) -

    変更するデータベースの ID。任意です。

- **properties** (*object*) -

    **[REQUIRED]**

    設定するプロパティのオブジェクト（例: データベースの resource group を設定するには `{ "database.resource_groups": "rg1" }`）。

- **delete_keys** (*string[]*) -

    削除するプロパティキー。任意です。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。任意です。

**RETURNS:**

*Promise\<ResStatus\>*

**EXCEPTIONS:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.alterDatabase({
    db_name: 'my_database',
    properties: { 'database.resource_groups': 'rg1' },
});
```
