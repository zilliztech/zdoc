---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラー フィルタリング式を使用して vector 類似検索を実行します。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - マルチモーダルRAG
  - llm hallucinations
  - ハイブリッド検索
  - レキシカル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションのスカラー フィルタリング式を使用して vector 類似検索を実行します。

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

    対象 collection が属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    検索する collection の名前です

- **partition_names** (*string[]*) -

    検索する partition の名前のリストです。

- **anns_field** (*string*) -

    この操作の対象 vector field の名前です。複数の vector field を持つ collection で検索する場合は必須です。

- **data** (*number[]* | *number[][]*) -

    vector 埋め込みのリストです。

    Zilliz Cloud は、指定されたものに最も類似する vector 埋め込みを検索します。

- **output_fields** (*string[]*) -

    返却される各 entity に含める field 名のリストです。

    値のデフォルトは **None** です。指定しない場合は、primary field のみが含まれます。

- **limit** (*number*) - 

    返却する entity の総数です。

    ページネーションを有効にするには、このパラメータを **param** 内の **offset** と組み合わせて使用できます。

    この値と **param** 内の **offset** の合計は 16,384 未満である必要があります。 

    ただし、グループ化検索では、`limit` は個々の entity ではなく返却するグループの最大数を指定します。各グループは、指定した `group_by_field` に基づいて形成されます。

- **offset** (*number*) - 

    検索結果でスキップするレコード数です。 

    ページネーションを有効にするには、このパラメータを `limit` と組み合わせて使用できます。

    この値と `limit` の合計は 16,384 未満である必要があります。 

- **filter** (*string*) -

    一致した entity を絞り込むためのスカラー フィルタリング条件です。 

    値のデフォルトは空文字列で、条件が適用されないことを示します。

    スカラー フィルタリングをスキップするには、このパラメータに空文字列を設定できます。スカラー フィルタリング条件を構築するには、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。 

- **exprValues** (*keyValueObj*) -

    [Filtering Templating](/docs/filtering-templating) に記載されているように `filter` でプレースホルダーを使用する場合、このパラメータの値として、それらのプレースホルダーに対応する実際の値をキーと値のペアで指定できます。

- **params** (*KeyValueObj*) -

    追加の検索パラメータをキーと値のペアで指定します。

    - **radius** (*number*) -

        類似度の下限しきい値を決定します。`metric_type` を `L2` に設定する場合、この値は **range_filter** の値より大きくしてください。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。 

    - **range_filter**  (*number*) -  

        特定の類似度範囲内の vector に検索を絞り込みます。`metric_type` を `IP` または `COSINE` に設定する場合、この値は **radius** の値より大きくしてください。それ以外の場合、この値は **radius** の値より小さくする必要があります。

    - **level** (*number*)

        Zilliz Cloud は、さまざまな index アルゴリズム固有の多数の検索パラメータを扱う代わりに、検索パラメータ調整を簡素化するための統一パラメータを使用します。

        値のデフォルトは **1** で、範囲は **1** から **5** です。値を大きくすると、検索パフォーマンスは低下しますが再現率は高くなります。

    - **page_retain_order** (*bool*) -

        `offset` が指定されている場合に、検索結果の順序を保持するかどうかです。 

        このパラメータは、`radius` も設定した場合にのみ適用されます。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象 collection の整合性レベルです。値のデフォルトは **Bounded** (**1**) で、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) を指定できます。

- **ignore_growing** (*boolean*) -

    growing segment での検索をスキップするかどうかを示すブール値です。

- **group_by_field** (*string*) -

    指定した field で検索結果をグループ化し、多様性を確保して同じグループから複数の結果が返るのを防ぎます。

- **group_size** (*number*) -

    グループ化検索で各グループ内に返す entity の目標数です。たとえば、`group_size=2` を設定すると、各グループ内で最も類似した entity（例: ドキュメントのパッセージや vector 表現）を最大 2 件返すようシステムに指示します。`group_size` を設定しない場合、システムはデフォルトで各グループにつき 1 entity のみを返します。

- **strict_group_size** (*boolean*) -

    このブール パラメータは、`group_size` を厳密に適用するかどうかを指定します。`group_size=true` の場合、各グループ内に十分なデータが存在する限り、システムは各グループをちょうど `group_size` 件の結果で埋めようとします。グループ内の entity 数が不足している場合は、利用可能な entity のみを返し、十分なデータがあるグループでは指定された `group_size` を満たすようにします。

- **hints** (*string*) -

    検索パフォーマンスを向上させるための hints 文字列です。

- **round_decimal** (*number*) -

    最終結果で保持する小数点以下の桁数です。

- **transformers** (*OutputTransformers*) -

    次のデータ型のデータを変換するカスタム関数です。

    - BFloat16Vector (`(bf16bytes: Uint8Array) => BFloat16Vector;`)

    - Float16Vector (`(f16: Uint8Array) => Float16Vector;`)

    - SparseFloatVector (`(sparse: SparseVectorDic) => SparseFloatVector;`)

- **rerank** (*RerankerObj* | *FunctionObject \ FunctionScore*) -

    カスタム パラメータを持つ再ランキング戦略です。**RerankerObj**、**FunctionObject**、または **FunctionScore** を使用できます。

    **RerankerObj** には次のパラメータがあります。

    - **strategy** (*string*) -

        再ランキング戦略です。指定可能な値は次のとおりです。

        - **RRF** ("rrf")

            この戦略は、特定の強調がない場合に推奨されます。RRF は各 vector field の重要性を効果的にバランスできます。

        - **WEIGHTED** ("weighted")

            この戦略は、結果で特定の vector field を強調したい場合に推奨されます。WeightedRanker を使用すると、特定の vector field により高い重みを割り当てて、それらをより強調できます。たとえばマルチモーダル検索では、画像内の色よりも画像のテキスト記述の方が重要と見なされる場合があります。

    - **params** (*keyValueObj*) -

        パラメータは再ランキング戦略ごとに異なります。

        - RRFRanker 戦略を使用する場合、RRFRanker にパラメータ値 `k` を入力する必要があります。`k` のデフォルト値は 60 です。このパラメータは、異なる ANN 検索からのランキングをどのように結合するかを決定し、すべての検索間で重要性をバランスよくブレンドするのに役立ちます。

        - WeightedRanker 戦略を使用する場合、`WeightedRanker` 関数に重み値を入力する必要があります。Hybrid Search における基本 ANN 検索の数は、入力すべき値の数に対応します。入力値は [0,1] の範囲である必要があり、1 に近い値ほど重要度が高いことを示します。

    **FunctionObject** には次の構造があります。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよび collection 内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的の簡単な説明です。大規模なプロジェクトではドキュメント化や明確化に役立ち、デフォルトは空文字列です。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理するための関数タイプです。このパラメータで指定できる値は `FunctionType.RERANK` です。

    - **input_field_names** (*string[]*)

        このパラメータの値は空配列のままにしてください。

    **FunctionScore** には次の構造があります。

    - **functions** (*FunctionObject[]*) -

        **FunctionObject** オブジェクトのリストです。

    - **params** (*keyValueObj*) -  

        指定した関数がどのように連携するかを指定します。構造は次のとおりです。

        - **boost_mode** (*string*) -

            指定した重みが一致した entity のスコアにどのように影響するかを指定します。指定可能な値は次のとおりです。

            - `Multiply`

                重み付け後の値が、一致した entity の元のスコアに指定した重みを掛けた値に等しいことを示します。

                これはデフォルト値です。

            - `Sum`

                重み付け後の値が、一致した entity の元のスコアと指定した重みの合計に等しいことを示します

        - **function_mode** (*string*) -

            さまざまな Boost Ranker からの重み付け値をどのように処理するかを指定します。指定可能な値は次のとおりです。

            - `Multiply`

                一致した entity の最終スコアが、すべての Boost Ranker からの重み付け値の積に等しいことを示します。

                これはデフォルト値です。

            - `Sum`

                一致した entity の最終スコアが、すべての Boost Ranker からの重み付け値の合計に等しいことを示します。

- **order_by_fields** (*OrderByFields*) -

    検索結果を並べ替える field です。オプションです。

**RETURNS** *Promise&lt;SearchResults&lt;T&gt;&gt;*

このメソッドは **SearchResults&lt;T&gt;** オブジェクトに解決される promise を返します。

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

- **results** (*SearchResultData[]* | *SearchResultData[][]*) -<br/>
  各クエリ vector に対して返されたヒットです。単一のクエリ vector が指定された場合、これはフラットな **SearchResultData[]** です。複数のクエリ vector をまとめて指定した場合、これはクエリごとに 1 つの内部リストを持つネストされた **SearchResultData[][]** です。

    - **id** (*string*) -

        一致した行の primary key です。

    - **score** (*number*) -

        設定された metric type によってスケーリングされた類似度スコアです。

    - **offset** (*number* | *string*) -

        クエリ グループ内におけるこのヒットの 0 ベースのオフセットです。

    - **group_by_field_values** (*Record&lt;string, FieldData&gt;*) -

        **group_by_field** が指定された場合に設定されます。ヒットに対するグループ化 field の値を保持します。

    - **highlight** (*HighlightResult*) -

        リクエストで **highlighter** が指定された場合に設定されます。一致した field のハイライト断片を保持します。

    - **&lt;output_field&gt;** (*FieldData*) -

        要求された各 **output_fields** エントリはヒット上のキーとして追加され、一致した行の値を保持します。

- **recalls** (*number[]*) -<br/>
  検索エンジンが生成した場合の、各クエリの推定再現率スコアです。

- **session_ts** (*number*) -<br/>
  検索の評価に Milvus が使用したセッション タイムスタンプです。

- **collection_name** (*string*) -<br/>
  検索対象となった collection です。

- **all_search_count** (*number*) -<br/>
  オプションです。検索が調査した候補の総数を報告する場合に設定されます。

- **ResStatus**<br/>
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

