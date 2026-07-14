---
title: "loadCollectionAsync() | Node.js"
slug: /node/node/Management-loadCollectionAsync
sidebar_label: "loadCollectionAsync()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection データを query node にロードし、その後この collection に対して vector search を実行できるようにします。これは非同期関数です — ロード状態の確認には `getLoadState()` または `getLoadingProgress()` を使用してください。 | Node.js"
type: docx
token: SqSZdmSoVoBuiSxe1a1cdOuZnDd
sidebar_position: 30
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollectionAsync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadCollectionAsync()

この操作は collection データを query node にロードし、その後この collection に対して vector search を実行できるようにします。これは非同期関数です — ロード状態の確認には `getLoadState()` または `getLoadingProgress()` を使用してください。

```javascript
await milvusClient.loadCollectionAsync(data: LoadCollectionReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.loadCollectionAsync({
    collection_name: string,
    db_name?: string,
    replica_number?: number,
    resource_groups?: string[],
    refresh?: boolean,
    load_fields?: string[],
    skip_load_dynamic_field?: boolean,
    timeout?: number,
})
```

**パラメータ:**

- **collection_name** (*string*) -

    **[必須]**

    ロードする collection の名前。

- **db_name** (*string*) -

    データベースの名前。オプションです。

- **replica_number** (*number*) -

    ロードするレプリカ数。オプションです。

- **resource_groups** (*string[]*) -

    負荷分散のための resource group 名。オプションです。

- **refresh** (*boolean*) -

    新しい field を含めるためにロードを更新するかどうか。オプションです。

- **load_fields** (*string[]*) -

    ロードする特定の field 名。オプションです。

- **skip_load_dynamic_field** (*boolean*) -

    dynamic field のロードをスキップするかどうか。オプションです。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。オプションです。

**戻り値:**

*Promise\<ResStatus\>*

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.loadCollectionAsync({
    collection_name: 'my_collection',
});

// Check loading progress
const state = await client.getLoadState({
    collection_name: 'my_collection',
});
```
