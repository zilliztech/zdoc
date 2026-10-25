---
title: "searchIterator() | Node.js"
slug: /node/node/Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation conducts a スカラー filtering query iteratively and returns results in batches. Use this instead of a single query() call when you need to process large result sets incrementally or when the total result count exceeds what a single query can return. | Node.js"
type: docx
token: K5APdBqphoQG7vxU4P2ccr5Wnig
sidebar_position: 9
keywords: 
  - 音声類似検索
  - Elastic ベクトル データベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - searchIterator()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# searchIterator()

This operation conducts a スカラー filtering query iteratively and returns results in batches. Use this instead of a single query() call when you need to process large result sets incrementally or when the total result count exceeds what a single query can return.

```javascript
await milvusClient.queryIterator(data: QueryIteratorReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.queryIterator({
    collection_name: string,
    batchSize: number,
    filter?: string,
    limit?: number,
    output_fields?: string[],
    partition_names?: string[],
    consistency_level?: ConsistencyLevelEnum,
    db_name?: string,
    timeout?: number,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **batchSize** (*number*) -

    **[REQUIRED]**

    1 回の反復ごとに返される entity の数です。16,384 を超えることはできません。

- **filter** (*string*) -

    A スカラー filtering condition to filter matching entities. Set to an empty string to return all entities. To build a スカラー filtering condition, refer to Boolean Expression Rules.

- **limit** (*number*) -

    すべての反復を通じて返される entity の合計最大数です。デフォルトは一致する entity の総数です（制限なし）。

- **output_fields** (*string[]*) -

    各返却 entity に含めるフィールド名のリストです。デフォルトではすべてのフィールドが返されます。

- **partition_names** (*string[]*) -

    クエリ対象の partition の名前です。

- **consistency_level** (*ConsistencyLevelEnum*) -

    The consistency level for this operation. Options: Strong (0), Bounded (1), Session (2), Eventually (3). Defaults to the consistency level set when the コレクション was created.

- **db_name** (*string*) -

    The name of the データベース containing the コレクション.

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

- **order_by_fields** (*OrderByFields*) -

    検索結果を並べ替えるフィールドです。任意です。

**RETURNS:**

*Promise\<AsyncIterable\<object[]\>\>*

非同期 iterable を返します。各反復では、そのバッチに対応する entity の配列が返されます。総結果数が `limit` に達するか、一致するすべての entity を使い切ると反復は終了します。

**EXCEPTIONS:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const iterator = await milvusClient.queryIterator({
    collection_name: 'my_collection',
    filter: 'age > 30',
    batchSize: 100,
    limit: 500,
    output_fields: ['id', 'age', 'text'],
});

for await (const batch of iterator) {
    console.log(`Batch of ${batch.length} entities:`, batch);
}
```
