---
title: "queryIterator() | Node.js"
slug: /node/node/Vector-queryIterator
sidebar_label: "queryIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation conducts a ベクトル similarity search iteratively and returns results in batches. Use this instead of a single search() call when you need to process large result sets incrementally or when the total result count exceeds what a single query can return. | Node.js"
type: docx
token: YZ3GdmklAolLnux8LRhcw7hxnvd
sidebar_position: 11
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - queryIterator()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# queryIterator()

This operation conducts a ベクトル similarity search iteratively and returns results in batches. Use this instead of a single search() call when you need to process large result sets incrementally or when the total result count exceeds what a single query can return.

```javascript
await milvusClient.searchIterator(data: SearchIteratorReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.searchIterator({
    collection_name: string,
    data: SearchData | SearchData[],
    batchSize: number,
    limit?: number,
    filter?: string,
    anns_field?: string,
    output_fields?: string[],
    partition_names?: string[],
    params?: keyValueObj,
    metric_type?: string,
    consistency_level?: ConsistencyLevelEnum,
    ignore_growing?: boolean,
    group_by_field?: string,
    exprValues?: keyValueObj,
    rerank?: RerankerObj | FunctionObject | FunctionScore,
    transformers?: OutputTransformers,
    external_filter_fn?: (row: SearchResultData) => boolean,
    db_name?: string,
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    The name of the コレクション to search.

- **data** (*SearchData | SearchData[]*) -

    **[必須]**

    The query ベクトル(s). Supported types include FloatVector (number[]), BFloat16Vector (Uint8Array), Float16Vector (Uint8Array), BinaryVector (number[]), and SparseFloatVector.

- **batchSize** (*number*) -

    **[必須]**

    反復ごとに返される結果数。16,384 を超えることはできません。

- **limit** (*number*) -

    すべての反復にわたる結果の総最大数。デフォルトは一致する entity の総数です（制限なし）。

- **filter** (*string*) -

    A スカラー filtering condition to filter matching entities before the search. Defaults to an empty string (no filter).

- **anns_field** (*string*) -

    The name of the target ベクトル field. Required when the コレクション has multiple ベクトル fields.

- **output_fields** (*string[]*) -

    返される各 entity に含めるフィールド名のリスト。デフォルトでは primary フィールドのみが含まれます。

- **partition_names** (*string[]*) -

    検索対象の partition の名前。

- **params** (*keyValueObj*) -

    `radius` や範囲検索用の `range_filter` など、キーと値のペアで指定する追加の検索パラメーター。

- **metric_type** (*string*) -

    The metric type used to measure similarity between ベクトル. Defaults to the metric type of the indexed field.

- **consistency_level** (*ConsistencyLevelEnum*) -

    この操作の整合性レベル。オプション: Strong (0)、Bounded (1)、Session (2)、Eventually (3)。デフォルトは Bounded です。

- **ignore_growing** (*boolean*) -

    検索中に growing segment をスキップするかどうか。

- **group_by_field** (*string*) -

    指定したフィールドで検索結果をグループ化し、多様性を確保します。

- **exprValues** (*keyValueObj*) -

    テンプレート化されたフィルタ式のプレースホルダー値。

- **rerank** (*RerankerObj | FunctionObject | FunctionScore*) -

    再ランキング戦略とそのパラメーター。サポートされる reranker タイプの詳細については `search()` を参照してください。

- **transformers** (*OutputTransformers*) -

    Custom transformers for special ベクトル data types such as BFloat16Vector and Float16Vector.

- **external_filter_fn** (*(row: SearchResultData) => boolean*) -

    各結果バッチに適用される任意のクライアント側フィルター関数。この関数が `false` を返した entity は、yield されるバッチから除外されます。

- **db_name** (*string*) -

    The name of the データベース containing the コレクション.

- **element_indices** (*ElementIndices[]*) -

    クエリ iterator の element index。任意です。

**戻り値:**

*Promise\<AsyncIterable\<SearchResultData[]\>\>*

非同期 iterable を返します。各反復では、そのバッチに対応する一致 entity の配列が yield されます。総結果数が `limit` に達した時点、または一致するすべての entity を使い切った時点で反復は終了します。

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const iterator = await milvusClient.searchIterator({
    collection_name: 'my_collection',
    data: [0.1, 0.2, 0.3, 0.4, 0.5],
    batchSize: 100,
    limit: 500,
    output_fields: ['id', 'text'],
    filter: 'age > 18',
});

for await (const batch of iterator) {
    console.log(`Batch of ${batch.length} results:`, batch);
}
```
