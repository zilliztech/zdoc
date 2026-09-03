---
title: "search() | Python | MilvusClient"
slug: /python/python/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation conducts a vector similarity search with an optional scalar filtering expression. | Python | MilvusClient"
type: docx
token: DvaZdhYnyoo7lOxNIBwc5eKEn7d
sidebar_position: 6
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションのスカラーフィルタリング式を使用してベクトル類似性検索を実行します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、専用サービングクラスタとオンデマンドコンピュートにのみ適用されます。

- サービングクラスタのコレクションでこの操作を実行する場合は、クラスタエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュートのコレクションでこの操作を実行する場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成し、検索用のオンデマンドクラスタにアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
search(
    self,
    collection_name: str,
    data: Union[List[list], list],
    ids: Union[List[str], List[int]],
    filter: str = "",
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    search_params: Optional[dict] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    anns_field: Optional[str] = None,
    ranker: Optional[Union[Function, FunctionScore]] = None,
    highlighter: Optional[Highlighter] = None,
    order_by_fields: Optional[List[dict]] = None,
    search_aggregation: Optional[SearchAggregation] = None,
    **kwargs,
) -> List[List[dict]]
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    既存のコレクションの名前。

- **data** (*List[list], list]*) -

    **[必須]**

    ベクトル埋め込みのリスト。

    Zilliz Cloud は、指定されたものに最も類似したベクトル埋め込みを検索します。

    このパラメータは **ids** と相互排他的です。

- **ids** (*Union[List[str], List[int]]*) -

    プライマリキーのリスト。

    Zilliz Cloud は、指定されたエンティティ内のベクトル埋め込みに最も類似したものを検索します。

    このパラメータは **data** と相互排他的です。

- **anns_field** (*str*) -

    現在の検索のターゲットベクトルフィールドの名前。

- **filter** (*str*) -

    一致するエンティティをフィルタリングするスカラーフィルタリング条件。

    デフォルト値は空の文字列で、条件が適用されないことを示します。

    スカラーフィルタリングをスキップするには、このパラメータを空の文字列に設定できます。スカラーフィルタリング条件を構築するには、[Filtering Overview](/docs/filtering-overview) を参照してください。

- **filter_params** (*dict*) -

    [Filtering Templating](/docs/filtering-templating) に記載されているように `filter` でプレースホルダーを使用する場合は、これらのプレースホルダーの実際の値をこのパラメータの値としてキーと値のペアとして指定できます。

- **limit** (*int*) -

    返すエンティティの総数。

    このパラメータを **param** の **offset** と組み合わせて、ページネーションを有効にできます。

    この値と **param** の **offset** の合計は 16,384 未満である必要があります。

    ただし、グループ化検索では、`limit` は個々のエンティティではなく、返すグループの最大数を指定します。各グループは、指定された `group_by_field` に基づいて形成されます。

    <Admonition type="info" icon="📘" title="注意">

    `search_aggregation` が指定されている場合は、明示的に `limit` を設定しないでください。ルート `SearchAggregation.size` 値を使用して、返すトップレベルバケットの数を制御してください。

    </Admonition>

- **output_fields** (l*ist[str]*) -

    返される各エンティティに含めるフィールド名のリスト。

    デフォルト値は **None** です。指定されていない場合、プライマリフィールドのみが含まれます。

- **search_params** (*dict*) -

    この操作に固有のパラメータ設定。

    - **radius** (float) -

        最小類似度のしきい値を決定します。コレクションのメトリックタイプが L2 に設定されている場合、この値が **range_filter** より大きいことを確認してください。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。

    - **range_filter**  (float) -  

        特定の類似度範囲内のベクトルに検索を絞り込みます。コレクションのメトリックタイプが `IP` または `COSINE` に設定されている場合、この値が **radius** の値より大きいことを確認してください。それ以外の場合、この値は **radius** の値より小さくする必要があります。

    - **level** (*int*)

        Zilliz Cloud は、さまざまなインデックスアルゴリズムに固有の多数の検索パラメータを処理する代わりに、統一されたパラメータを使用して検索パラメータの調整を簡素化します。

        デフォルト値は **1** で、**1** から **5** の範囲です。値を増やすと、検索パフォーマンスが低下しますが、再現率が向上します。

    - **page_retain_order** (*bool*) -

        `offset` が指定されている場合に、検索結果の順序を保持するかどうか。

        このパラメータは、`radius` も設定した場合にのみ適用されます。

    - **params** (dict) -

        追加のパラメータ。

        <Admonition type="info" icon="📘" title="注意">

        すべての追加パラメータは上位の `search_params` に移動され、`params` 引数は間もなく廃止されます。

        </Admonition>

        - **radius** (float) -

            最小類似度のしきい値を決定します。コレクションのメトリックタイプが `L2` に設定されている場合、この値が **range_filter** の値より大きいことを確認してください。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。

        - **range_filter**  (float) -  

            特定の類似度範囲内のベクトルに検索を絞り込みます。コレクションのメトリックタイプが `IP` または `COSINE` に設定されている場合、この値が **radius** の値より大きいことを確認してください。それ以外の場合、この値は **radius** の値より小さくする必要があります。

        - **level** (*int*)

            Zilliz Cloud は、さまざまなインデックスアルゴリズムに固有の多数の検索パラメータを処理する代わりに、統一されたパラメータを使用して検索パラメータの調整を簡素化します。

            デフォルト値は **1** で、**1** から **5** の範囲です。値を増やすと、検索パフォーマンスが低下しますが、再現率が向上します。

        - **page_retain_order** (*bool*) -

            `offset` が指定されている場合に、検索結果の順序を保持するかどうか。

            このパラメータは、`radius` も設定した場合にのみ適用されます。

    - **ignore_growing** (*str*) -

        このオプションを設定すると、検索は成長中のセグメントからのデータを除外するように指示されます。この設定を使用すると、インデックス化され完全に処理されたデータのみに焦点を当てることで、検索パフォーマンスが向上する可能性があります。

    その他の適用可能な検索パラメータの詳細については、[In-memory Index](https://milvus.io/docs/index.md) および [On-disk Index](https://milvus.io/docs/disk_index.md) を参照してください。

    その他の適用可能な検索パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **group_by_field** (*str*)

    指定されたフィールドで検索結果をグループ化して、多様性を確保し、同じグループから複数の結果を返すことを避けます。

    このパラメータは、グループ化検索で使用されます。PyMilvus 3.0.1 以降では、このパラメータを `search_aggregation` と一緒に使用しないでください。

- **group_size** (*int*)

    グループ化検索で各グループ内に返すターゲットエンティティ数。例えば、`group_size=2` と設定すると、システムは各グループ内で最も類似した最大 2 つのエンティティ (例: ドキュメントの段落またはベクトル表現) を返すように指示されます。`group_size` を設定しない場合、システムはデフォルトでグループごとに 1 つのエンティティのみを返します。

- **strict_group_size** (*bool*)

    このブール値パラメータは、`group_size` を厳密に適用するかどうかを指定します。`strict_group_size=True` の場合、システムは各グループに十分なデータが存在する限り、各グループを正確に `group_size` の結果で埋めようとします。グループ内のエンティティ数が不十分な場合は、利用可能なエンティティのみを返し、十分なデータを持つグループが指定された `group_size` を満たすようにします。

- **order_by_fields** (*list[dict] | None*) -

    サポートされているスカラーフィールドで検索結果をソートするための order-by 仕様のリスト。

    リスト内の各辞書には、次のキーがあります:

    - **field** (*str*) -

        ソートするスカラーフィールドの名前。

    - **order** (*str*) -

        ソート方向。可能な値は `"asc"` および `"desc"` です。このキーを省略すると、Milvus はフィールドを昇順でソートします。

    Zilliz Cloud は、指定した順序で複数の order-by フィールドを適用します。指定されたすべての order-by フィールドで同じ値を持つエンティティについては、Zilliz Cloud は元の類似性スコアの順序を保持します。

    グループ化検索では、Zilliz Cloud は各グループのトップエンティティの指定されたスカラーフィールド値でグループを順序付けます。`limit` パラメータは引き続きグループ数を制御し、`group_size` はグループごとのエンティティ数を制御します。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、応答が到着するかエラーが発生するまで、この操作はタイムアウトしません。

- **partition_names** (*list*) -

    パーティション名のリスト。

    デフォルト値は **None** です。指定された場合、指定されたパーティションのみがクエリに関与します。

- **ranker** (*[Function](./MilvusClient-Function)* | *[FunctionScore](./MilvusClient-FunctionScore)*) -

    検索に使用するランカー。

    詳細については、[Decay Ranker Overview](/docs/decay-ranker-oveview) を参照してください。

- **highlighter** (*Highlighter*) -

    検索操作で一致した用語を強調表示するためのハイライター。詳細については、[Lexical Highlighter](/docs/text-highlighter) および [Semantic Highlighter](/docs/semantic-highlighter) を参照してください。

- **search_aggregation** (*Optional[SearchAggregation]*) - PyMilvus 3.0.1 以降で使用可能。階層的バケット集計を定義します。このパラメータを `group_by_field` と一緒に使用しないでください。設定すると、`limit` は無視され、ルート `SearchAggregation.size` がトップレベルバケットの数を制御します。

- **kwargs** -

    - **offset** (int) -

        検索結果でスキップするレコードの数。

        このパラメータを `limit` と組み合わせて、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満である必要があります。

    - **round_decimal** (int) -

        Zilliz Cloud が計算された距離を丸める小数点以下の桁数。

        デフォルト値は **-1** で、Zilliz Cloud が計算された距離の丸めをスキップし、生の値を返すことを示します。

    - **timezone** (*str*)

        [IANA 識別子](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) (例: **Asia/Shanghai**、**America/Chicago**、または **UTC**) を設定することで、単一のクエリに対してコレクションまたはデータベースのデフォルトタイムゾーンを一時的にオーバーライドします。これは、`TIMESTAMPTZ` 値がその操作中にのみどのように解釈、表示、比較されるかを制御します。保存されたデータやコレクション設定は変更されません。

        詳細については、[TIMESTAMPZ Field](/docs/use-timestamptz-field) を参照してください。

    - **time_fields** (*str*)

        クエリまたは検索操作中に `TIMESTAMPTZ` フィールドから特定の時間コンポーネントを抽出します。抽出する要素を指定するには、カンマ区切りのリストを使用します。サポートされる要素: `year`、`month`、`day`、`hour`、`minute`、`second`、`microsecond`。

        詳細については、TIMESTAMPZ Field を参照してください。

**戻り値の型:**

*list[dict]*

**戻り値:**
指定された出力フィールドを持つ検索されたエンティティを含む辞書のリスト。

**例外:**

- **MilvusException**

    この操作中にエラーが発生すると、この例外が発生します。

## 例\{#examples}

**グループ化検索**

次の焦点を絞った例では、クライアントのセットアップ、コレクションの作成、データの挿入を省略しています。`product_catalog` に 5 次元のベクトルフィールドと `brand` という名前のスカラーフィールドがあることを前提としています。

```python
res = client.search(
    collection_name="product_catalog",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=10,
    group_by_field="brand",
    group_size=2,
    strict_group_size=True,
    output_fields=["brand"],
)
```

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Insert data
client.insert(
    collection_name="test_collection",
    data=[
         {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
         {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
         {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
         {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
         {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
         {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
         {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
         {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
         {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
         {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}
     ],
)

# {'insert_count': 10}

# 4. Conduct a search
search_params = {
    "params": {}
}

# Search with limit
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    search_params=search_params
)

# [[{'id': 7, 'distance': 0.4801957309246063, 'entity': {}},
#   {'id': 2, 'distance': 0.3205878734588623, 'entity': {}},
#   {'id': 1, 'distance': 0.2993225157260895, 'entity': {}}]]

# Search with filter
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    filter='color like "red%"',
    search_params=search_params
)

# [[{'id': 1, 'distance': 0.2993225157260895, 'entity': {}},
#   {'id': 4, 'distance': 0.12666261196136475, 'entity': {}},
#   {'id': 6, 'distance': -0.3535143733024597, 'entity': {}}]]

# Search with an offset
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    offset=3,
    search_params=search_params
)

# [[{'id': 4, 'distance': 0.12666261196136475, 'entity': {}},
#   {'id': 3, 'distance': 0.11930042505264282, 'entity': {}},
#   {'id': 5, 'distance': -0.05843167006969452, 'entity': {}}]]

# Search with output fields
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    output_fields=["vector", "color"],
    search_params=search_params
)

# [[{'id': 7,
#    'distance': 0.4801957309246063,
#    'entity': {'color': 'grey_8510',
#     'vector': [-0.33445146679878235,
#      -0.25671350955963135,
#      0.8987540006637573,
#      0.9402995705604553,
#      0.537806510925293]}},
#   {'id': 2,
#    'distance': 0.3205878734588623,
#    'entity': {'color': 'orange_6781',
#     'vector': [0.4374213218688965,
#      -0.5597502589225769,
#      0.6457887887954712,
#      0.789405882358551,
#      0.20785793662071228]}},
#   {'id': 1,
#    'distance': 0.2993225157260895,
#    'entity': {'color': 'red_7025',
#     'vector': [0.19886812567710876,
#      0.060235604643821716,
#      0.697696328163147,
#      0.2614474594593048,
#      0.8387295007705688]}}]]

# Conduct a range search
search_params = {
    "metric_type": "IP",
    "params": {
        "radius": 0.1,
        "range_filter": 0.8
    }
}

res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    search_params=search_params
)

# [[{'id': 7, 'distance': 0.4801957309246063, 'entity': {}},
#   {'id': 2, 'distance': 0.3205878734588623, 'entity': {}},
#   {'id': 1, 'distance': 0.2993225157260895, 'entity': {}}]]
```

