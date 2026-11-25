---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、任意のスカラーフィルタリング式を使用してベクトル類似検索を実行します。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - 字句検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# search()

この操作では、任意のスカラーフィルタリング式を使用してベクトル類似検索を実行します。

```javascript
await milvusClient.search(data)
```

## リクエスト構文\{#request-syntax}

<NextChannel action="exclude">

```javascript
await milvusClient.search({
  db_name?: string,
  collection_name: string,
  partition_names?: string[];
  anns_field?: string; 
  data?: SearchData | SearchData[];
  vector?: SearchData | SearchData[];
  output_fields?: string[];
  limit?: number;
  topk?: number;
  offset?: number;
  filter?: string;
  expr?: string;
  exprValues?: keyValueObj;
  params?: keyValueObj;
  metric_type?: string;
  consistency_level?: ConsistencyLevelEnum;
  ignore_growing?: boolean;
  group_by_field?: string;
  group_size?: number;
  strict_group_size?: boolean;
  hints?: string;
  round_decimal?: number;
  transformers?: OutputTransformers;
  rerank?: RerankerObj | FunctionObject | FunctionScore;
  search_aggregation?: SearchAggregation;
  nq?: number;
  ids?: number[] | string[];
  highlighter?: Highlighter;
  timeout?: number;
})
```

</NextChannel>

<NextChannel action="include">

```javascript
await milvusClient.search({
  db_name?: string,
  collection_name: string,
  partition_names?: string[];
  anns_field?: string; 
  data?: SearchData | SearchData[];
  vector?: SearchData | SearchData[];
  output_fields?: string[];
  limit?: number;
  topk?: number;
  offset?: number;
  filter?: string;
  expr?: string;
  exprValues?: keyValueObj;
  params?: keyValueObj;
  metric_type?: string;
  consistency_level?: ConsistencyLevelEnum;
  ignore_growing?: boolean;
  group_by_field?: string;
  group_size?: number;
  strict_group_size?: boolean;
  hints?: string;
  round_decimal?: number;
  transformers?: OutputTransformers;
  rerank?: RerankerObj | FunctionObject | FunctionScore;
  function_score?: FunctionScore;
  function_chains?: FunctionChains;
  search_aggregation?: SearchAggregation;
  nq?: number;
  ids?: number[] | string[];
  highlighter?: Highlighter;
  timeout?: number;
})
```

</NextChannel>

**パラメーター:**

<NextChannel action="exclude">

- **db_name** (*string*) -

    対象のコレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[必須]**

    検索対象のコレクションの名前です。

- **partition_names** (*string[]*) -

    検索対象のパーティション名のリストです。

- **anns_field** (*string*) -

    この操作の対象となるベクトルフィールドの名前です。複数のベクトルフィールドを持つコレクションを検索する場合は必須です。

- **data** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    ベクトル埋め込みのリストです。

    Milvus は、指定されたベクトル埋め込みに最も類似するベクトル埋め込みを検索します。

- **vector** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    クエリベクトルに対する **data** のエイリアスです。

- **output_fields** (*string[]*) -

    返される各エンティティに含めるフィールド名のリストです。

    値のデフォルトは **None** です。指定しない場合は、プライマリフィールドのみが含まれます。

- **limit** (*number*) - 

    返すエンティティの総数です。

    **param** 内の **offset** と組み合わせて、ページネーションを有効にできます。

    この値と **param** 内の **offset** の合計は、16,384 以下である必要があります。

    ただし、グループ検索では、`limit` は個々のエンティティではなく、返すグループの最大数を指定します。各グループは、指定された `group_by_field` に基づいて形成されます。

- **topk** (*number*) -

    返すエンティティの総数に対する **limit** のエイリアスです。

- **offset** (*number*) - 

    検索結果でスキップするレコード数です。

    このパラメーターは `limit` と組み合わせて、ページネーションを有効にできます。

    この値と `limit` の合計は、16,384 以下である必要があります。

- **filter** (*string*) -

    一致するエンティティを絞り込むスカラーフィルタリング条件です。

    値のデフォルトは空の文字列で、条件が適用されないことを示します。

    このパラメーターを空の文字列に設定すると、スカラーフィルタリングをスキップできます。スカラーフィルタリング条件を構築する場合は、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **expr** (*string*) -

    **filter** のエイリアスです。**filter** または **expr** のいずれかを指定し、両方は指定しないでください。

- **exprValues** (*keyValueObj*) -

    `filter` で [Filtering Templating](https://milvus.io/docs/filtering-templating.md) に示すようにプレースホルダーを使用する場合は、このパラメーターの値として、これらのプレースホルダーの実際の値をキーと値のペアで指定できます。

- **params** (*KeyValueObj*) -

    キーと値のペアで指定する追加の検索パラメーターです。以下のキーは検索の `params` で使用できますが、`KeyValueObj` のメンバーではありません。

    - **radius** (*number*) -

        類似度の下限のしきい値を決定します。`metric_type` を `L2` に設定する場合は、この値が **range_filter** の値より大きくなるようにしてください。それ以外の場合は、この値が **range_filter** の値より小さくなるようにしてください。

    - **range_filter**  (*number*) -  

        検索を、特定の類似度範囲内のベクトルに絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合は、この値が **radius** の値より大きくなるようにしてください。それ以外の場合は、この値が **radius** の値より小さくなるようにしてください。

    - **max_empty_result_buckets** (*number*)

        このパラメーターは、**BIN_IVF_FLAT**、**IVF_FLAT**、**IVF_SQ8**、**IVF_PQ**、**SCANN** などの IVF シリーズのインデックスに対する範囲検索でのみ使用されます。値のデフォルトは 1 で、範囲は 1〜65536 です。

        範囲検索中、有効な範囲検索結果がないバケットの数が指定値に達すると、検索プロセスは早期に終了します。このパラメーターを大きくすると、範囲検索の再現率が向上します。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象コレクションの整合性レベルです。値のデフォルトは **Bounded**（**2**）で、**Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）、**Eventually**（**3**）を選択できます。詳しくは、[ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum) を参照してください。

- **metric_type** (*string*) -

    ベクトル間の類似度を測定するために使用するメトリックタイプです。デフォルトは、インデックスが作成されたフィールドのメトリックタイプです。

- **ignore_growing** (*boolean*) -

    成長中のセグメントでの検索をスキップするかどうかを示すブール値です。

- **group_by_field** (*string*) -

    検索結果を指定したフィールドでグループ化し、多様性を確保して、同じグループから複数の結果が返されるのを防ぎます。

- **group_size** (*number*) -

    グループ検索で各グループ内から返すエンティティの目標数です。たとえば、`group_size=2` を設定すると、各グループ内で最も類似するエンティティ（ドキュメントのパッセージやベクトル表現など）を最大 2 個返すようにシステムに指示します。`group_size` を設定しない場合、システムはデフォルトでグループごとに 1 個のエンティティのみを返します。

- **strict_group_size** (*boolean*) -

    この Boolean パラメーターは、`group_size` を厳密に適用するかどうかを指定します。`group_size=true` の場合、各グループ内に十分なデータがある限り、システムは各グループを正確に `group_size` 個の結果で埋めようとします。グループ内のエンティティ数が不足している場合は、利用可能なエンティティのみを返し、十分なデータがあるグループが指定された `group_size` を満たすようにします。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒント文字列です。

- **round_decimal** (*number*) -

    最終結果で保持する小数点以下の桁数です。

- **transformers** (*[OutputTransformers](./Vector-OutputTransformers)*) -

    次のデータ型のデータを変換するためのカスタム関数です。

- **rerank** (*[RerankerObj](./Vector-RerankerObj)* | *[FunctionObject](./Collections-FunctionObject)* | *[FunctionScore](./Vector-FunctionScore)*) -

    カスタムパラメーターを備えた再ランキング戦略です。**RerankerObj**、**FunctionObject**、または **FunctionScore** のいずれかを使用できます。詳しくは、[RerankerObj](./Vector-RerankerObj) および [FunctionObject](./Collections-FunctionObject) を参照してください。

- **order_by_fields** (*OrderByFields*) -

    検索結果を並べ替える対象のフィールドです。任意です。

- **search_aggregation** (*SearchAggregation*) -

    任意のバケット集計構成です。一致するエンティティを 1 つ以上のフィールドでグループ化し、必要に応じてメトリクスを計算し、バケットを並べ替え、トップヒットを返します。また、ネストされたサブ集計を含めることもできます。以下のメンバーは `SearchAggregation` に属します。

    - **fields** (*string[]*) -

        **[必須]**

        グループ化するフィールド名です。少なくとも 1 つのフィールドが必要です。

    - **size** (*number*) -

        **[必須]**

        返すバケット数です。正の整数である必要があります。

    - **metrics** (*Record&lt;string, SearchAggregationMetric&gt;*) -

        エイリアスをキーとする任意のメトリック集計です。各値は、以下のメンバーを持つ `SearchAggregationMetric` です。

        - **op** (*AggregationMetricOp*) -

            メトリック演算です。**avg**、**sum**、**count**、**min**、または **max** を指定できます。

        - **field_name** (*string*) -

            集計するフィールドです。

    - **order** (*SearchAggregationOrder[]*) -

        返されるバケットの任意の並べ替えルールです。各エントリは、以下のメンバーを持つ `SearchAggregationOrder` です。

        - **key** (*string*) -

            メトリックのエイリアス、`_count`、または `_key` を指定できるキーです。

        - **direction** (*AggregationDirection*) -

            並べ替え方向です。**asc** または **desc** を指定できます。

    - **top_hits** (*SearchAggregationTopHits*) -

        各バケットに対して返される任意のトップヒットドキュメントです。`SearchAggregationTopHits` オブジェクトには、以下のメンバーがあります。

        - **size** (*number*) -

            **[必須]**

            バケットごとに返すヒット数です。正の整数である必要があります。

        - **sort** (*SearchAggregationSort[]*) -

            各バケット内のヒットに適用される任意の並べ替えルールです。各エントリは、**field_name** と **direction** のメンバーを持つ `SearchAggregationSort` です。

    - **sub_aggregation** (*SearchAggregation*) -

        任意のネストされたサブ集計です。最大 4 レベルの集計がサポートされます。

    > **注意:**
    >
    > - 最大 4 レベルの集計をサポートします。
    > - 合計で最大 10 個のグループ化フィールドをサポートします。
    > - ゼロ以外の `offset`、ハイブリッド検索、検索またはクエリのイテレーター、ハイライター、または `group_by_field` と組み合わせることはできません。

- **nq** (*number*) -

    クエリベクトルの数です。

- **ids** (*number[]* | *string[]*) -

    PK による検索クエリのプライマリキーです。

- **highlighter** (*Highlighter*) -

    検索結果用のハイライターです。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。**None** に設定すると、何らかの応答が到着した場合またはエラーが発生した場合に、この操作がタイムアウトすることを示します。

</NextChannel>

<NextChannel action="include">

- **db_name** (*string*) -

    対象のコレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[必須]**

    検索対象のコレクションの名前です。

- **partition_names** (*string[]*) -

    検索対象のパーティション名のリストです。

- **anns_field** (*string*) -

    この操作の対象となるベクトルフィールドの名前です。複数のベクトルフィールドを持つコレクションを検索する場合は必須です。

- **data** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    ベクトル埋め込みのリストです。

    Milvus は、指定されたベクトル埋め込みに最も類似するベクトル埋め込みを検索します。

- **vector** (*[SearchData](./Vector-SearchData)* | *SearchData[]*) -

    クエリベクトルに対する **data** のエイリアスです。

- **output_fields** (*string[]*) -

    返される各エンティティに含めるフィールド名のリストです。

    値のデフォルトは **None** です。指定しない場合は、プライマリフィールドのみが含まれます。

- **limit** (*number*) - 

    返すエンティティの総数です。

    **param** 内の **offset** と組み合わせて、ページネーションを有効にできます。

    この値と **param** 内の **offset** の合計は、16,384 以下である必要があります。

    ただし、グループ検索では、`limit` は個々のエンティティではなく、返すグループの最大数を指定します。各グループは、指定された `group_by_field` に基づいて形成されます。

- **topk** (*number*) -

    返すエンティティの総数に対する **limit** のエイリアスです。

- **offset** (*number*) - 

    検索結果でスキップするレコード数です。

    このパラメーターは `limit` と組み合わせて、ページネーションを有効にできます。

    この値と `limit` の合計は、16,384 以下である必要があります。

- **filter** (*string*) -

    一致するエンティティを絞り込むスカラーフィルタリング条件です。

    値のデフォルトは空の文字列で、条件が適用されないことを示します。

    このパラメーターを空の文字列に設定すると、スカラーフィルタリングをスキップできます。スカラーフィルタリング条件を構築する場合は、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。

- **expr** (*string*) -

    **filter** のエイリアスです。**filter** または **expr** のいずれかを指定し、両方は指定しないでください。

- **exprValues** (*keyValueObj*) -

    `filter` で [Filtering Templating](https://milvus.io/docs/filtering-templating.md) に示すようにプレースホルダーを使用する場合は、このパラメーターの値として、これらのプレースホルダーの実際の値をキーと値のペアで指定できます。

- **params** (*KeyValueObj*) -

    キーと値のペアで指定する追加の検索パラメーターです。以下のキーは検索の `params` で使用できますが、`KeyValueObj` のメンバーではありません。

    - **radius** (*number*) -

        類似度の下限のしきい値を決定します。`metric_type` を `L2` に設定する場合は、この値が **range_filter** の値より大きくなるようにしてください。それ以外の場合は、この値が **range_filter** の値より小さくなるようにしてください。

    - **range_filter**  (*number*) -  

        検索を、特定の類似度範囲内のベクトルに絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合は、この値が **radius** の値より大きくなるようにしてください。それ以外の場合は、この値が **radius** の値より小さくなるようにしてください。

    - **max_empty_result_buckets** (*number*)

        このパラメーターは、**BIN_IVF_FLAT**、**IVF_FLAT**、**IVF_SQ8**、**IVF_PQ**、**SCANN** などの IVF シリーズのインデックスに対する範囲検索でのみ使用されます。値のデフォルトは 1 で、範囲は 1〜65536 です。

        範囲検索中、有効な範囲検索結果がないバケットの数が指定値に達すると、検索プロセスは早期に終了します。このパラメーターを大きくすると、範囲検索の再現率が向上します。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象コレクションの整合性レベルです。値のデフォルトは **Bounded**（**2**）で、**Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）、**Eventually**（**3**）を選択できます。詳しくは、[ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum) を参照してください。

- **metric_type** (*string*) -

    ベクトル間の類似度を測定するために使用するメトリックタイプです。デフォルトは、インデックスが作成されたフィールドのメトリックタイプです。

- **ignore_growing** (*boolean*) -

    成長中のセグメントでの検索をスキップするかどうかを示すブール値です。

- **group_by_field** (*string*) -

    検索結果を指定したフィールドでグループ化し、多様性を確保して、同じグループから複数の結果が返されるのを防ぎます。

- **group_size** (*number*) -

    グループ検索で各グループ内から返すエンティティの目標数です。たとえば、`group_size=2` を設定すると、各グループ内で最も類似するエンティティ（ドキュメントのパッセージやベクトル表現など）を最大 2 個返すようにシステムに指示します。`group_size` を設定しない場合、システムはデフォルトでグループごとに 1 個のエンティティのみを返します。

- **strict_group_size** (*boolean*) -

    この Boolean パラメーターは、`group_size` を厳密に適用するかどうかを指定します。`group_size=true` の場合、各グループ内に十分なデータがある限り、システムは各グループを正確に `group_size` 個の結果で埋めようとします。グループ内のエンティティ数が不足している場合は、利用可能なエンティティのみを返し、十分なデータがあるグループが指定された `group_size` を満たすようにします。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒント文字列です。

- **round_decimal** (*number*) -

    最終結果で保持する小数点以下の桁数です。

- **transformers** (*[OutputTransformers](./Vector-OutputTransformers)*) -

    次のデータ型のデータを変換するためのカスタム関数です。

- **rerank** (*[RerankerObj](./Vector-RerankerObj)* | *[FunctionObject](./Collections-FunctionObject)* | *[FunctionScore](./Vector-FunctionScore)*) -

    カスタムパラメーターを備えた再ランキング戦略です。**RerankerObj**、**FunctionObject**、または **FunctionScore** のいずれかを使用できます。詳しくは、[RerankerObj](./Vector-RerankerObj) および [FunctionObject](./Collections-FunctionObject) を参照してください。

- **function_score** (*[FunctionScore](./Vector-FunctionScore)*) -

    関数ベースの再ランカーです。**rerank** 経由でも受け付けられます。詳細は、[FunctionScore](./Vector-FunctionScore) を参照してください。

- **function_chains** (*FunctionChain* | *FunctionChainSpec* | *readonly (FunctionChain | FunctionChainSpec)[]*) -

    検索候補に適用されるサーバー側の処理チェーンです。任意です。

- **order_by_fields** (*OrderByFields*) -

    検索結果を並べ替える対象のフィールドです。任意です。

- **search_aggregation** (*SearchAggregation*) -

    任意のバケット集計構成です。一致するエンティティを 1 つ以上のフィールドでグループ化し、必要に応じてメトリクスを計算し、バケットを並べ替え、トップヒットを返します。また、ネストされたサブ集計を含めることもできます。以下のメンバーは `SearchAggregation` に属します。

    - **fields** (*string[]*) -

        **[必須]**

        グループ化するフィールド名です。少なくとも 1 つのフィールドが必要です。

    - **size** (*number*) -

        **[必須]**

        返すバケット数です。正の整数である必要があります。

    - **metrics** (*Record&lt;string, SearchAggregationMetric&gt;*) -

        エイリアスをキーとする任意のメトリック集計です。各値は、以下のメンバーを持つ `SearchAggregationMetric` です。

        - **op** (*AggregationMetricOp*) -

            メトリック演算です。**avg**、**sum**、**count**、**min**、または **max** を指定できます。

        - **field_name** (*string*) -

            集計するフィールドです。

    - **order** (*SearchAggregationOrder[]*) -

        返されるバケットの任意の並べ替えルールです。各エントリは、以下のメンバーを持つ `SearchAggregationOrder` です。

        - **key** (*string*) -

            メトリックのエイリアス、`_count`、または `_key` を指定できるキーです。

        - **direction** (*AggregationDirection*) -

            並べ替え方向です。**asc** または **desc** を指定できます。

    - **top_hits** (*SearchAggregationTopHits*) -

        各バケットに対して返される任意のトップヒットドキュメントです。`SearchAggregationTopHits` オブジェクトには、以下のメンバーがあります。

        - **size** (*number*) -

            **[必須]**

            バケットごとに返すヒット数です。正の整数である必要があります。

        - **sort** (*SearchAggregationSort[]*) -

            各バケット内のヒットに適用される任意の並べ替えルールです。各エントリは、**field_name** と **direction** のメンバーを持つ `SearchAggregationSort` です。

    - **sub_aggregation** (*SearchAggregation*) -

        任意のネストされたサブ集計です。最大 4 レベルの集計がサポートされます。

    > **注意:**
    >
    > - 最大 4 レベルの集計をサポートします。
    > - 合計で最大 10 個のグループ化フィールドをサポートします。
    > - ゼロ以外の `offset`、ハイブリッド検索、検索またはクエリのイテレーター、ハイライター、または `group_by_field` と組み合わせることはできません。

- **nq** (*number*) -

    クエリベクトルの数です。

- **ids** (*number[]* | *string[]*) -

    PK による検索クエリのプライマリキーです。

- **highlighter** (*Highlighter*) -

    検索結果用のハイライターです。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。**None** に設定すると、何らかの応答が到着した場合またはエラーが発生した場合に、この操作がタイムアウトすることを示します。

</NextChannel>

**戻り値:**

*Promise&lt;SearchResults&lt;T&gt;&gt;*

このメソッドは、**SearchResults&lt;T&gt;** オブジェクトに解決される Promise を返します。

```javascript
{
    results: SearchResultData[] | SearchResultData[][],
    recalls: number[],
    session_ts: number,
    collection_name: string,
    all_search_count?: number,
    search_iterator_v2_results?: Record<string, any>,
    _search_iterator_v2_results?: string,
    status:  ResStatus
}
```

**パラメーター:**

- **results** (*SearchResultData[]* | *SearchResultData[][]*) -
各クエリベクトルに対して返されるヒットです。単一のクエリベクトルが指定された場合、これはフラットな **SearchResultData[]** です。一連のクエリベクトルが指定された場合、これはネストされた **SearchResultData[][]** で、クエリごとに 1 つの内部リストが含まれます。

    - **id** (*string*) -

        一致した行のプライマリキーです。

    - **score** (*number*) -

        設定されたメトリックタイプでスケーリングされた類似度スコアです。

    - **offset** (*number* | *string*) -

        クエリグループ内でのこのヒットの 0 から始まるオフセットです。

    - **group_by_field_values** (*Record&lt;string, FieldData&gt;*) -

        **group_by_field** が指定された場合に設定され、ヒットのグループ化フィールドの値を保持します。

    - **highlight** (*HighlightResult*) -

        リクエストで **highlighter** が指定された場合に設定され、一致するフィールドのハイライトされたフラグメントを保持します。

    - **&lt;output_field&gt;** (*FieldData*) -

        要求された **output_fields** の各エントリは、一致した行の値を保持するキーとしてヒットに追加されます。

- **recalls** (*number[]*) -
検索エンジンが生成した場合の、各クエリの推定再現率スコアです。

- **session_ts** (*number*) -
Milvus が検索の評価に使用したセッションタイムスタンプです。

- **collection_name** (*string*) -
検索されたコレクションです。

- **all_search_count** (*number*) -
任意です。検索が調査した候補の総数を報告する場合に設定されます。

- **agg_buckets** (*AggregationBucket[]* | *undefined*) -
任意です。**search_aggregation** が指定された場合に設定され、集計バケット、ネストされたメトリック、トップヒット、サブグループが含まれます。

- **search_iterator_v2_results** (*Record&lt;string, any&gt;*) -
任意です。V2 検索イテレーターによって生成される内部結果です。

- **_search_iterator_v2_results** (*string*) -
任意です。V2 検索イテレーターによって生成される内部のシリアル化された結果です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由です。この操作が成功した場合は空の文字列のままです。

**例外:**

- **Error**

    この例外は、この操作中にエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const searchResults = await milvusClient.search({
   collection_name: 'my_collection',
   vector: [1, 2, 3, 4],
});
```
