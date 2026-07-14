---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラー フィルタリング式を使用してベクトル類似度検索を実行します。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションのスカラー フィルタリング式を使用してベクトル類似度検索を実行します。

```javascript
await milvusClient.search(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.search({
  db_name?: string,
  collection_name: string,
  partition_names?: string[];
  anns_field?: string; 
  data?: SearchDataType;
  output_fields?: string[];
  limit?: number;
  offset?: number;
  filter?: string;
  exprValues?: keyValueObj;
  params?: keyValueObj;
  consistency_level?: ConsistencyLevelEnum;
  ignore_growing?: boolean;
  group_by_field?: string;
  group_size?: number;
  strict_group_size?: boolean;
  hints?: string;
  round_decimal?: number;
  transformers?: OutputTransformers;
  rerank?: RankerObj | FunctionObject | FunctionScore;
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection が属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    検索対象の collection の名前です

- **partition_names** (*string[]*) -

    検索対象の partition 名のリストです。

- **anns_field** (*string*) -

    この操作の対象ベクトル フィールド名です。複数のベクトル フィールドを持つ collection で検索する場合は必須です。

- **data** (*number[]* | *number[][]*) -

    ベクトル埋め込みのリストです。

    Zilliz Cloud は、指定されたものに最も類似したベクトル埋め込みを検索します。

- **output_fields** (*string[]*) -

    返却される各 entity に含めるフィールド名のリストです。

    デフォルト値は **None** です。未指定の場合、プライマリ フィールドのみが含まれます。

- **limit** (*number*) - 

    返却する entity の総数です。

    このパラメータは **param** 内の **offset** と組み合わせて使用することで、ページネーションを有効にできます。

    この値と **param** 内の **offset** の合計は 16,384 未満である必要があります。 

    ただし、グループ化検索では、`limit` は個々の entity ではなく、返却するグループの最大数を指定します。各グループは、指定された `group_by_field` に基づいて形成されます。

- **offset** (*number*) - 

    検索結果でスキップするレコード数です。 

    このパラメータは `limit` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と `limit` の合計は 16,384 未満である必要があります。 

- **filter** (*string*) -

    一致する entity を絞り込むためのスカラー フィルタリング条件です。 

    デフォルト値は空文字列で、条件が適用されないことを示します。

    スカラー フィルタリングをスキップするには、このパラメータを空文字列に設定できます。スカラー フィルタリング条件の作成については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。 

- **exprValues** (*keyValueObj*) -

    [Filtering Templating](/docs/filtering-templating) に記載されているように `filter` でプレースホルダーを使用する場合、このパラメータの値として、これらのプレースホルダーに対応する実際の値をキーと値のペアで指定できます。

- **params** (*KeyValueObj*) -

    追加の検索パラメータをキーと値のペアで指定します。

    - **radius** (*number*) -

        最低類似度のしきい値を決定します。`metric_type` を `L2` に設定する場合、この値が **range_filter** より大きいことを確認してください。それ以外の場合、この値は **range_filter** より小さくする必要があります。 

    - **range_filter**  (*number*) -  

        特定の類似度範囲内のベクトルに検索を絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合、この値が **radius** より大きいことを確認してください。それ以外の場合、この値は **radius** より小さくする必要があります。

    - **level** (*number*)

        Zilliz Cloud は、さまざまな index アルゴリズム固有の多数の検索パラメータを扱う代わりに、検索パラメータの調整を簡素化するための統一パラメータを使用します。

        デフォルト値は **1** で、範囲は **1** から **5** です。値を大きくすると、検索パフォーマンスが低下する代わりに再現率が高くなります。

    - **page_retain_order** (*bool*) -

        `offset` が指定されたときに検索結果の順序を保持するかどうか。 

        このパラメータは、`radius` も設定した場合にのみ適用されます。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象 collection の整合性レベルです。デフォルト値は **Bounded** (**1**) で、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) を選択できます。

- **ignore_growing** (*boolean*) -

    growing segment での検索をスキップするかどうかを示すブール値です。

- **group_by_field** (*string*) -

    検索結果を指定されたフィールドでグループ化し、多様性を確保して同じグループから複数の結果が返されるのを防ぎます。

- **group_size** (*number*) -

    グループ化検索で各グループ内に返す entity の目標数です。たとえば、`group_size=2` に設定すると、各グループ内で最も類似した entity（例: ドキュメントのパッセージやベクトル表現）を最大 2 件返すようシステムに指示します。`group_size` を設定しない場合、システムはデフォルトで各グループにつき 1 entity のみを返します。

- **strict_group_size** (*boolean*) -

    このブール パラメータは、`group_size` を厳密に適用するかどうかを指定します。`group_size=true` の場合、各グループ内に十分なデータが存在する限り、システムは各グループをちょうど `group_size` 件の結果で埋めようとします。グループ内の entity 数が不足している場合は、利用可能な entity のみを返し、十分なデータがあるグループでは指定された `group_size` を満たすようにします。

- **hints** (*string*) -

    検索パフォーマンスを向上させるためのヒント文字列です。

- **round_decimal** (*number*) -

    最終結果で保持する小数点以下の桁数です。

- **transformers** (*OutputTransformers*) -

    以下のデータ型のデータを変換するためのカスタム関数です。

    - BFloat16Vector (`(bf16bytes: Uint8Array) => BFloat16Vector;`)

    - Float16Vector (`(f16: Uint8Array) => Float16Vector;`)

    - SparseFloatVector (`(sparse: SparseVectorDic) => SparseFloatVector;`)

- **rerank** (*RerankerObj* | *FunctionObject \ FunctionScore*) -

    カスタム パラメータを伴うリランキング戦略です。**RerankerObj**、**FunctionObject**、または **FunctionScore** のいずれかを使用できます。

    **RerankerObj** には以下のパラメータがあります。

    - **strategy** (*string*) -

        リランキング戦略です。指定可能な値は次のとおりです。

        - **RRF** ("rrf")

            この戦略は、特定の重視点がない場合に推奨されます。RRF は各ベクトル フィールドの重要度を効果的にバランスできます。

        - **WEIGHTED** ("weighted")

            この戦略は、結果で特定のベクトル フィールドを重視したい場合に推奨されます。WeightedRanker を使用すると、特定のベクトル フィールドにより高い重みを割り当てて、より強調できます。たとえば、マルチモーダル検索では、画像の色よりもその画像のテキスト説明の方が重要と見なされる場合があります。

    - **params** (*keyValueObj*) -

        これらのパラメータはリランキング戦略ごとに異なります。

        - RRFRanker 戦略を使用する場合、RRFRanker にパラメータ値 `k` を入力する必要があります。`k` のデフォルト値は 60 です。このパラメータは、異なる ANN 検索からのランクをどのように組み合わせるかを決定し、すべての検索にわたって重要度をバランスよく統合するのに役立ちます。

        - WeightedRanker 戦略を使用する場合、`WeightedRanker` 関数に重み値を入力する必要があります。Hybrid Search における基本 ANN 検索の数は、入力が必要な値の数に対応します。入力値は [0,1] の範囲である必要があり、1 に近い値ほど重要度が高いことを示します。

    **FunctionObject** は以下の構造を持ちます。

    - **name** (*string*)

        関数名です。この識別子は、クエリや collection 内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的に関する簡単な説明です。大規模なプロジェクトではドキュメント化や明確化に役立ち、デフォルトでは空文字列です。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数の型です。このパラメータに指定できる値は `FunctionType.RERANK` です。

    - **input_field_names** (*string[]*)

        このパラメータの値は空の配列のままにしてください。

    **FunctionScore** は以下の構造を持ちます。

    - **functions** (*FunctionObject[]*) -

        **FunctionObject** オブジェクトのリストです。

    - **params** (*keyValueObj*) -  

        指定された関数がどのように連携して動作するかを指定します。構造は次のとおりです。

        - **boost_mode** (*string*) -

            指定された重みが一致する entity のスコアにどのように影響するかを指定します。指定可能な値は次のとおりです。

            - `Multiply`

                重み付けされた値が、一致する entity の元のスコアに指定した重みを掛けた値であることを示します。

                これはデフォルト値です。

            - `Sum`

                重み付けされた値が、一致する entity の元のスコアと指定した重みの合計に等しいことを示します

        - **function_mode** (*string*) -

            さまざまな Boost Ranker からの重み付け値をどのように処理するかを指定します。指定可能な値は次のとおりです。

            - `Multiply`

                一致する entity の最終スコアが、すべての Boost Ranker からの重み付け値の積に等しいことを示します。

                これはデフォルト値です。

            - `Sum`

                一致する entity の最終スコアが、すべての Boost Ranker からの重み付け値の合計に等しいことを示します。

- **order_by_fields** (*OrderByFields*) -

    検索結果の並び順に使用するフィールドです。オプションです。

**RETURNS** *Promise&lt;SearchResults&lt;T&gt;&gt;*

このメソッドは、**SearchResults&lt;T&gt;** オブジェクトに解決される promise を返します。

```typescript
{
    results: SearchResultData[] | SearchResultData[][],
    recalls: number[],
    session_ts: number,
    collection_name: string,
    all_search_count?: number,
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*SearchResultData[]* | *SearchResultData[][]*) -
各クエリ ベクトルに対して返されるヒットです。単一のクエリ ベクトルが指定された場合、これはフラットな **SearchResultData[]** になります。クエリ ベクトルのバッチが指定された場合、これはクエリごとに 1 つの内部リストを持つネストされた **SearchResultData[][]** になります。

    - **id** (*string*) -

        一致した行のプライマリ キーです。

    - **score** (*number*) -

        構成された metric type によってスケーリングされた類似度スコアです。

    - **offset** (*number* | *string*) -

        クエリ グループ内におけるこのヒットの 0 ベースのオフセットです。

    - **group_by_field_values** (*Record&lt;string, FieldData&gt;*) -

        **group_by_field** が指定された場合に設定されます。このヒットのグループ化フィールドの値を保持します。

    - **highlight** (*HighlightResult*) -

        リクエストで **highlighter** が指定された場合に設定されます。一致したフィールドのハイライト断片を保持します。

    - **&lt;output_field&gt;** (*FieldData*) -

        要求された各 **output_fields** エントリはヒット上のキーとして追加され、一致した行の値を保持します。

- **recalls** (*number[]*) -
検索エンジンが生成した場合の、各クエリに対する推定再現率スコアです。

- **session_ts** (*number*) -
検索評価に Milvus が使用したセッション タイムスタンプです。

- **collection_name** (*string*) -
検索された collection です。

- **all_search_count** (*number*) -
オプションです。検索が調査した候補の総数を報告する場合に設定されます。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラー コードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

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

