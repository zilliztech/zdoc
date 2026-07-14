---
title: "hybridSearch() | Node.js"
slug: /node/node/Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションの scalar フィルタリング式を使用して複数の vector フィールドに対してハイブリッド検索を実行し、マージおよび再ランキングされた結果を返します。 | Node.js"
type: docx
token: Ph9ldBswooKwebxKI9EcqSu4nlc
sidebar_position: 4
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - hybridSearch()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

この操作は、オプションの scalar フィルタリング式を使用して複数の vector フィールドに対してハイブリッド検索を実行し、マージおよび再ランキングされた結果を返します。

```typescript
await milvusClient.hybridSearch(data: HybridSearchReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.hybridSearch({
    collection_name: string,
    data: HybridSearchSingleReq[],
    limit?: number,
    offset?: number,
    output_fields?: string[],
    filter?: string,
    rerank?: RerankerObj | FunctionObject | FunctionScore,
    partition_names?: string[],
    consistency_level?: ConsistencyLevelEnum,
    ignore_growing?: boolean,
    group_by_field?: string,
    group_size?: number,
    strict_group_size?: boolean,
    hints?: string,
    round_decimal?: number,
    transformers?: OutputTransformers,
    db_name?: string,
    timeout?: number,
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    検索対象の collection の名前です。

- **data** (*HybridSearchSingleReq[]*) -

    **[REQUIRED]**

    vector フィールドごとのサブ検索リクエストのリストです。各要素は、単一 vector サブ検索用のクエリ vector と対象フィールドを定義します。完全なフィールドリファレンスについては、以下の HybridSearchSingleReq セクションを参照してください。

- **limit** (*number*) -

    返される entity の総数です。この値と `offset` の合計は 16,384 未満でなければなりません。

- **offset** (*number*) -

    検索結果でスキップするレコード数です。この値と `limit` の合計は 16,384 未満でなければなりません。

- **output_fields** (*string[]*) -

    返される各 entity に含めるフィールド名のリストです。デフォルトでは primary field のみが含まれます。

- **filter** (*string*) -

    ハイブリッド検索結果がマージされた後に適用されるトップレベルの scalar フィルタリング条件です。デフォルトは空文字列です。

- **rerank** (*RerankerObj \| FunctionObject \| FunctionScore*) -

    複数のサブ検索からの結果を結合するための再ランキング戦略です。`rerank` パラメーターの完全なスキーマについては `search()` を参照してください。

- **partition_names** (*string[]*) -

    検索対象の partition の名前です。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象 collection の整合性レベルです。オプション: `Strong` (0)、`Bounded` (1)、`Session` (2)、`Eventually` (3)。デフォルトは `Bounded` です。

- **ignore_growing** (*boolean*) -

    検索中に growing segment をスキップするかどうかを指定します。

- **group_by_field** (*string*) -

    指定したフィールドで検索結果をグループ化し、多様性を確保して同じグループから複数の結果が返されるのを防ぎます。

- **group_size** (*number*) -

    grouping search において、各グループ内で返す entity 数の目標値です。

- **strict_group_size** (*boolean*) -

    `group_size` を厳密に適用するかどうかを指定します。`true` の場合、システムは各グループを正確に `group_size` 件の結果で埋めるよう試みます。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒント文字列です。

- **round_decimal** (*number*) -

    最終スコアで保持する小数点以下の桁数です。

- **transformers** (*OutputTransformers*) -

    BFloat16Vector や Float16Vector などの特殊な vector データ型向けのカスタム transformer です。

- **db_name** (*string*) -

    collection を含むデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

- **order_by_fields** (*OrderByFields*) -

    検索結果の並び順に使用するフィールドです。オプションです。

**戻り値:**

*Promise\<SearchResults\>*

このメソッドは、`SearchResults` オブジェクトに解決される Promise を返します。

**例外:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## HybridSearchSingleReq\{#hybridsearchsinglereq}

`data` 配列内の各要素は、単一 vector サブ検索リクエストを定義する **HybridSearchSingleReq** オブジェクトです。

**パラメーター:**

- **data** (*SearchData*) -

    **[REQUIRED]**

    このサブ検索用のクエリ vector です。dense vector（`number[]`）、sparse vector（`SparseVectorDic`）、またはテキストベース検索用のテキスト文字列を指定できます。

- **anns_field** (*string*) -

    **[REQUIRED]**

    このサブリクエスト内で検索する vector フィールドの名前です。

- **filter** (*string*) -

    このサブ検索にのみ適用される scalar フィルタリング条件です。

- **exprValues** (*keyValueObj*) -

    フィルタ式用のテンプレート値をキーと値のペアで指定します。

- **params** (*keyValueObj*) -

    インデックス固有の検索パラメーターをキーと値のペアで指定します。

- **ignore_growing** (*boolean*) -

    このサブ検索中に growing segment をスキップするかどうかを指定します。

- **group_by_field** (*string*) -

    指定したフィールドで結果をグループ化し、このサブ検索内での多様性を確保します。

- **transformers** (*OutputTransformers*) -

    BFloat16Vector や Float16Vector などの特殊な vector 型向けのカスタム transformer です。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const results = await milvusClient.hybridSearch({
    collection_name: 'my_collection',
    data: [
        {
            anns_field: 'dense_vector',
            data: [0.1, 0.2, 0.3, 0.4, 0.5],
        },
        {
            anns_field: 'sparse_vector',
            data: { 1: 0.5, 42: 0.8, 100: 0.3 },
        },
    ],
    limit: 10,
    rerank: { strategy: 'rrf', params: { k: 60 } },
    output_fields: ['id', 'text'],
});

console.log(results.results);
```

