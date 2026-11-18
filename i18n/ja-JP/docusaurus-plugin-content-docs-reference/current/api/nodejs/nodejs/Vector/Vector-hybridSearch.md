---
title: "hybridSearch() | Node.js"
slug: /node/node/Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、複数のベクトルフィールドを対象に、任意のスカラーフィルタリング式を指定してハイブリッド検索を実行し、マージおよび再ランキングされた結果を返します。 | Node.js"
type: docx
token: Ph9ldBswooKwebxKI9EcqSu4nlc
sidebar_position: 4
keywords: 
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone 対 Milvus
  - Chroma 対 Milvus
  - zilliz
  - zilliz cloud
  - クラウド
  - hybridSearch()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# hybridSearch()

この操作では、複数のベクトルフィールドを対象に、任意のスカラーフィルタリング式を指定してハイブリッド検索を実行し、マージおよび再ランキングされた結果を返します。

```javascript
await milvusClient.hybridSearch(data: HybridSearchReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.hybridSearch({
    collection_name: string,
    data: HybridSearchSingleReq[],
    limit?: number,
    topk?: number,
    offset?: number,
    output_fields?: string[],
    filter?: string,
    params?: keyValueObj,
    metric_type?: string,
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
    nq?: number,
    ids?: number[] | string[],
    highlighter?: Highlighter,
    db_name?: string,
    timeout?: number,
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    検索対象のコレクション名です。

- **data** (*HybridSearchSingleReq[]*) -

    **[必須]**

    ベクトルフィールドごとに1つずつ指定するサブ検索リクエストのリストです。各要素は、単一ベクトルのサブ検索のクエリベクトルと対象フィールドを定義します。フィールドの完全なリファレンスについては、後述の HybridSearchSingleReq セクションを参照してください。

- **limit** (*number*) -

    返すエンティティの総数です。この値と `offset` の合計は 16,384 以下である必要があります。

- **topk** (*number*) -

    **limit** のエイリアスです。

- **offset** (*number*) -

    検索結果でスキップするレコード数です。この値と `limit` の合計は 16,384 以下である必要があります。

- **output_fields** (*string[]*) -

    返される各エンティティに含めるフィールド名のリストです。デフォルトではプライマリフィールドのみが含まれます。

- **filter** (*string*) -

    ハイブリッド検索結果のマージ後に適用されるトップレベルのスカラーフィルタリング条件です。デフォルトは空文字列です。

- **params** (*keyValueObj*) -

    キーと値のペアとして指定する追加の検索パラメーターです。

- **metric_type** (*string*) -

    ベクトル間の類似度を測定するために使用するメトリックタイプです。

- **rerank** (*RerankerObj* | *FunctionObject* | *FunctionScore*) -

    複数のサブ検索の結果を統合するための再ランキング戦略です。再ランキングパラメーターの完全なスキーマについては、`search()` を参照してください。

- **partition_names** (*string[]*) -

    検索対象のパーティション名です。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象コレクションの整合性レベルです。オプションは `Strong`（0）、`Session`（1）、`Bounded`（2）、`Eventually`（3）です。デフォルトは `Bounded` です。ConsistencyLevelEnum を参照してください。

- **ignore_growing** (*boolean*) -

    検索中に growing セグメントをスキップするかどうかです。

- **group_by_field** (*string*) -

    指定したフィールドで検索結果をグループ化して多様性を確保し、同じグループから複数の結果が返されないようにします。

- **group_size** (*number*) -

    グループ化検索で各グループ内に返すエンティティの目標数です。

- **strict_group_size** (*boolean*) -

    `group_size` を厳密に適用するかどうかです。`true` の場合、システムは各グループを正確に `group_size` 件の結果で埋めようとします。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒント文字列です。

- **round_decimal** (*number*) -

    最終スコアで保持する小数点以下の桁数です。

- **transformers** (*OutputTransformers*) -

    BFloat16Vector や Float16Vector などの特殊なベクトルデータ型用のカスタムトランスフォーマーです。

- **nq** (*number*) -

    クエリベクトルの数です。

- **ids** (*number[]* | *string[]*) -

    PK による検索クエリのプライマリキーです。

- **highlighter** (*Highlighter*) -

    検索結果用のハイライターです。

- **db_name** (*string*) -

    コレクションを含むデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値:**

*Promise&lt;SearchResults&gt;*

このメソッドは、`SearchResults` オブジェクトに解決される promise を返します。

**例外:**

- **エラー**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## HybridSearchSingleReq\{#hybridsearchsinglereq}

`data` 配列の各要素は、単一ベクトルのサブ検索リクエストを定義する **HybridSearchSingleReq** オブジェクトです。

**パラメーター:**

- **data** (*SearchData*) -

    **[必須]**

    このサブ検索のクエリベクトルです。密ベクトル（`number[]`）、疎ベクトル（`SparseVectorDic`）、またはテキストベース検索用のテキスト文字列を指定できます。

- **anns_field** (*string*) -

    **[必須]**

    このサブリクエスト内で検索するベクトルフィールドの名前です。

- **expr** (*string*) -

    このサブ検索にのみ適用されるスカラーフィルタリング条件です。

- **exprValues** (*keyValueObj*) -

    フィルター式のテンプレート値をキーと値のペアで指定します。

- **params** (*keyValueObj*) -

    インデックス固有の検索パラメーターをキーと値のペアで指定します。

- **ignore_growing** (*boolean*) -

    このサブ検索中に growing セグメントをスキップするかどうかです。

- **group_by_field** (*string*) -

    このサブ検索内の多様性を確保するために、指定したフィールドで結果をグループ化します。

- **transformers** (*OutputTransformers*) -

    BFloat16Vector や Float16Vector などの特殊なベクトル型用のカスタムトランスフォーマーです。

## 例\{#example}

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
