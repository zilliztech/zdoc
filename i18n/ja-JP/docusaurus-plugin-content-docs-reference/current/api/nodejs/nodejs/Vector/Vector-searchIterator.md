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

# searchIterator()

この操作は、ベクトル類似検索を反復的に実行し、結果をバッチで返します。大規模な結果セットを段階的に処理する場合や、結果の合計件数が 1 回の search() 呼び出しで返せる件数を超える場合は、単一の search() 呼び出しではなくこちらを使用してください。

```javascript
await milvusClient.searchIterator(data: SearchIteratorReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.searchIterator({
    collection_name: string,
    data: SearchData | SearchData[],
    vector?: SearchData | SearchData[],
    batchSize: number,
    limit?: number,
    filter?: string,
    expr?: string,
    anns_field?: string,
    output_fields?: string[],
    partition_names?: string[],
    params?: keyValueObj,
    metric_type?: string,
    consistency_level?: ConsistencyLevelEnum,
    ignore_growing?: boolean,
    group_by_field?: string,
    group_size?: number,
    strict_group_size?: boolean,
    order_by_fields?: OrderByFields,
    hints?: string,
    round_decimal?: number,
    exprValues?: keyValueObj,
    rerank?: RerankerObj | FunctionObject | FunctionScore,
    transformers?: OutputTransformers,
    nq?: number,
    ids?: number[] | string[],
    highlighter?: Highlighter,
    external_filter_fn?: (row: SearchResultData) => boolean,
    db_name?: string,
    timeout?: number,
})
```

**PARAMETERS:**

<NextChannel action="exclude">

- **collection_name** (*string*) -

    **[REQUIRED]**

    検索対象のコレクションの名前です。

- **data** (*[SearchData](./Vector-SearchData) | SearchData[]*) -

    クエリベクトルです。サポートされる型には、FloatVector（number[]）、BFloat16Vector（Uint8Array）、Float16Vector（Uint8Array）、BinaryVector（number[]）、SparseFloatVector があります。**data** または **ベクトル** のいずれかを指定してください。

- **ベクトル** (*[SearchData](./Vector-SearchData) | SearchData[]*) -

    クエリベクトルに対する **data** のエイリアスです。

- **batchSize** (*number*) -

    **[REQUIRED]**

    反復ごとに返す結果数です。16,384 を超えることはできません。

- **limit** (*number*) -

    すべての反復を通じた結果の最大合計数です。デフォルトは、一致するエンティティの合計数です（制限なし）。

- **filter** (*string*) -

    検索前に一致するエンティティを絞り込むためのスカラー条件です。デフォルトは空の文字列です（フィルターなし）。

- **expr** (*string*) -

    **filter** のエイリアスです。**filter** または **expr** のいずれかを指定し、両方は指定しないでください。

- **anns_field** (*string*) -

    対象のベクトルフィールドの名前です。コレクションに複数のベクトルフィールドがある場合に必須です。

- **output_fields** (*string[]*) -

    返される各エンティティに含めるフィールド名のリストです。デフォルトではプライマリフィールドのみが含まれます。

- **partition_names** (*string[]*) -

    検索対象のパーティション名のリストです。

- **params** (*keyValueObj*) -

    キーと値のペアで指定する追加の検索パラメーターです。たとえば、範囲検索では `radius` と `range_filter` を指定します。

- **metric_type** (*string*) -

    ベクトル間の類似度を測定するために使用するメトリクスタイプです。デフォルトは、インデックス付きフィールドのメトリクスタイプです。

- **consistency_level** (*ConsistencyLevelEnum*) -

    この操作の一貫性レベルです。オプションは Strong（0）、Session（1）、Bounded（2）、Eventually（3）です。デフォルトは Bounded です。詳細は [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum) を参照してください。

- **ignore_growing** (*boolean*) -

    検索中に増加中のセグメントをスキップするかどうかを指定します。

- **group_by_field** (*string*) -

    検索結果を指定したフィールドでグループ化し、多様性を確保します。

- **group_size** (*number*) -

    グループ化検索で各グループ内に返すエンティティの目標数です。

- **strict_group_size** (*boolean*) -

    グループ化検索で **group_size** を厳密に適用するかどうかを指定します。

- **order_by_fields** (*OrderByFields*) -

    検索結果を並べ替える基準となるフィールドです。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒント文字列です。

- **round_decimal** (*number*) -

    最終結果に保持する小数点以下の桁数です。

- **exprValues** (*keyValueObj*) -

    テンプレート化されたフィルター式のプレースホルダー値です。

- **nq** (*number*) -

    クエリベクトルの数です。

- **ids** (*number[]* | *string[]*) -

    PK による検索クエリで使用するプライマリキーです。

- **highlighter** (*Highlighter*) -

    検索結果のハイライターです。

- **rerank** (*[RerankerObj](./Vector-RerankerObj)* | *[FunctionObject](./Collections-FunctionObject)* | *[FunctionScore](./Vector-FunctionScore)*) -

    再ランキング戦略とそのパラメーターです。サポートされている再ランカー種別の詳細は、`search()` を参照してください。

- **transformers** (*[OutputTransformers](./Vector-OutputTransformers)*) -

    BFloat16Vector や Float16Vector などの特殊なベクトルデータ型用のカスタムトランスフォーマーです。

- **external_filter_fn** (*(row: SearchResultData) => boolean*) -

    各結果バッチに適用されるオプションのクライアント側フィルター関数です。この関数が `false` を返すエンティティは、生成されるバッチから除外されます。

- **db_name** (*string*) -

    The name of the データベース containing the コレクション.

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトすることを示します。

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -

    **[REQUIRED]**

    検索対象のコレクションの名前です。

- **data** (*[SearchData](./Vector-SearchData) | SearchData[]*) -

    クエリベクトルです。サポートされる型には、FloatVector（number[]）、BFloat16Vector（Uint8Array）、Float16Vector（Uint8Array）、BinaryVector（number[]）、SparseFloatVector があります。**data** または **ベクトル** のいずれかを指定してください。

- **ベクトル** (*[SearchData](./Vector-SearchData) | SearchData[]*) -

    クエリベクトルに対する **data** のエイリアスです。

- **batchSize** (*number*) -

    **[REQUIRED]**

    反復ごとに返す結果数です。16,384 を超えることはできません。

- **limit** (*number*) -

    すべての反復を通じた結果の最大合計数です。デフォルトは、一致するエンティティの合計数です（制限なし）。

- **filter** (*string*) -

    検索前に一致するエンティティを絞り込むためのスカラー条件です。デフォルトは空の文字列です（フィルターなし）。

- **expr** (*string*) -

    **filter** のエイリアスです。**filter** または **expr** のいずれかを指定し、両方は指定しないでください。

- **anns_field** (*string*) -

    対象のベクトルフィールドの名前です。コレクションに複数のベクトルフィールドがある場合に必須です。

- **output_fields** (*string[]*) -

    返される各エンティティに含めるフィールド名のリストです。デフォルトではプライマリフィールドのみが含まれます。

- **partition_names** (*string[]*) -

    検索対象のパーティション名のリストです。

- **params** (*keyValueObj*) -

    キーと値のペアで指定する追加の検索パラメーターです。たとえば、範囲検索では `radius` と `range_filter` を指定します。

- **metric_type** (*string*) -

    ベクトル間の類似度を測定するために使用するメトリクスタイプです。デフォルトは、インデックス付きフィールドのメトリクスタイプです。

- **consistency_level** (*ConsistencyLevelEnum*) -

    この操作の一貫性レベルです。オプションは Strong（0）、Session（1）、Bounded（2）、Eventually（3）です。デフォルトは Bounded です。詳細は [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum) を参照してください。

- **ignore_growing** (*boolean*) -

    検索中に増加中のセグメントをスキップするかどうかを指定します。

- **group_by_field** (*string*) -

    検索結果を指定したフィールドでグループ化し、多様性を確保します。

- **group_size** (*number*) -

    グループ化検索で各グループ内に返すエンティティの目標数です。

- **strict_group_size** (*boolean*) -

    グループ化検索で **group_size** を厳密に適用するかどうかを指定します。

- **order_by_fields** (*OrderByFields*) -

    検索結果を並べ替える基準となるフィールドです。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒント文字列です。

- **round_decimal** (*number*) -

    最終結果に保持する小数点以下の桁数です。

- **exprValues** (*keyValueObj*) -

    テンプレート化されたフィルター式のプレースホルダー値です。

- **nq** (*number*) -

    クエリベクトルの数です。

- **ids** (*number[]* | *string[]*) -

    PK による検索クエリで使用するプライマリキーです。

- **highlighter** (*Highlighter*) -

    検索結果のハイライターです。詳細は Highlighter を参照してください。

- **rerank** (*[RerankerObj](./Vector-RerankerObj)* | *[FunctionObject](./Collections-FunctionObject)* | *[FunctionScore](./Vector-FunctionScore)*) -

    再ランキング戦略とそのパラメーターです。サポートされている再ランカー種別の詳細は、`search()` を参照してください。

- **transformers** (*[OutputTransformers](./Vector-OutputTransformers)*) -

    BFloat16Vector や Float16Vector などの特殊なベクトルデータ型用のカスタムトランスフォーマーです。

- **external_filter_fn** (*(row: SearchResultData) => boolean*) -

    各結果バッチに適用されるオプションのクライアント側フィルター関数です。この関数が `false` を返すエンティティは、生成されるバッチから除外されます。

- **db_name** (*string*) -

    The name of the データベース containing the コレクション.

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトすることを示します。

</NextChannel>

**RETURNS:**

*Promise&lt;AsyncIterable&lt;SearchResultData[]&gt;&gt;*

非同期イテラブルを返します。各反復では、そのバッチの一致するエンティティの配列が生成されます。合計結果件数が `limit` に達するか、一致するすべてのエンティティを使い切ると、反復が終了します。

**EXCEPTIONS:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## Example\{#example}

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
