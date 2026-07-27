---
title: "search() | Python | MilvusClient"
slug: /python/python/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラー絞り込み式を使用して vector 類似度検索を実行します。 | Python | MilvusClient"
type: docx
token: DvaZdhYnyoo7lOxNIBwc5eKEn7d
sidebar_position: 6
keywords: 
  - マルチモーダル RAG
  - llm ハルシネーション
  - ハイブリッド検索
  - レキシカル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションのスカラー絞り込み式を使用して vector 類似度検索を実行します。

<Admonition type="info" icon="📘" title="Notes">

このメソッドは dedicated serving cluster と on-demand compute にのみ適用されます。 

- serving cluster の collection でこの操作を行うには、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用の collection でこの操作を行うには、project endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索用の on-demand cluster にアタッチする session を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request syntax\{#request-syntax}

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
    group_by: Optional[GroupBy] = None,
    order_by_fields: Optional[List[dict]] = None,
    search_aggregation: Optional[SearchAggregation] = None,
    **kwargs,
) -> List[List[dict]]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **data** (*List[list], list]*) -

    **[REQUIRED]**

    vector 埋め込みのリストです。

    Zilliz Cloud は、指定されたものに最も類似する vector 埋め込みを検索します。

    このパラメータは **ids** と同時に使用できません。

- **ids** (*Union[List[str], List[int]]*) -

    主キーのリストです。

    Zilliz Cloud は、指定された entity 内のものに最も類似する vector 埋め込みを検索します。

    このパラメータは **data** と同時に使用できません。

- **anns_field** (*str*) -

    現在の検索の対象 vector field の名前です。

- **filter** (*str*) -

    一致する entity を絞り込むためのスカラー絞り込み条件です。 

    デフォルト値は空文字列で、条件が適用されないことを示します。 

    スカラー絞り込みをスキップするには、このパラメータを空文字列に設定できます。スカラー絞り込み条件を作成するには、[Filtering Overview](/docs/filtering-overview) を参照してください。 

- **filter_params** (*dict*) -

    [Filtering Templating](/docs/filtering-templating) で説明されているように `filter` 内でプレースホルダーを使用する場合、このパラメータの値として、それらのプレースホルダーの実際の値をキーと値のペアで指定できます。

- **limit** (*int*) -

    返される entity の総数です。

    このパラメータを **param** 内の **offset** と組み合わせて使用することで、ページネーションを有効にできます。

    この値と **param** 内の **offset** の合計は 16,384 未満である必要があります。 

    ただし、グループ化検索では、`limit` は個々の entity ではなく、返される group の最大数を指定します。各 group は、指定された `group_by_field` に基づいて形成されます。

    <Admonition type="info" icon="📘" title="Notes">

    検索集約で `group_by` が指定されている場合は、`limit` を明示的に設定しないでください。返す最上位 bucket の数は、ルートの `GroupBy.size` 値を使用して制御します。

    </Admonition>

- **output_fields** (l*ist[str]*) -

    戻り値の各 entity に含める field 名のリストです。

    デフォルト値は **None** です。指定しない場合は、主 field のみが含まれます。

- **search_params** (*dict*) -

    この操作に固有のパラメータ設定です。

    - **radius** (float) -

        類似度の最小しきい値を決定します。collection の metric type が L2 に設定されている場合、この値は **range_filter** より大きくする必要があります。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。 

    - **range_filter**  (float) -  

        特定の類似度範囲内の vector に検索を絞り込みます。collection の metric type が `IP` または `COSINE` に設定されている場合、この値は **radius** より大きくする必要があります。それ以外の場合、この値は **radius** より小さくする必要があります。

    - **level** (*int*)

        Zilliz Cloud は、さまざまな index アルゴリズム固有の多数の検索パラメータを扱う代わりに、検索パラメータ調整を簡素化するための統一パラメータを使用します。

        デフォルト値は **1** で、範囲は **1** から **5** です。値を大きくすると再現率は高くなりますが、検索パフォーマンスは低下します。

    - **page_retain_order** (*bool*) -

        `offset` が指定されたときに検索結果の順序を保持するかどうかを指定します。 

        このパラメータは、`radius` も設定した場合にのみ適用されます。

    - **params** (dict) -

        追加パラメータです。

        <Admonition type="info" icon="📘" title="Notes">

        すべての追加パラメータは上位の `search_params` に移動されており、`params` 引数はまもなく非推奨になります。

        </Admonition>

        - **radius** (float) -

            類似度の最小しきい値を決定します。collection の metric type が `L2` に設定されている場合、この値は **range_filter** より大きくする必要があります。それ以外の場合、この値は **range_filter** より小さくする必要があります。 

        - **range_filter**  (float) -  

            特定の類似度範囲内の vector に検索を絞り込みます。collection の metric type が `IP` または `COSINE` に設定されている場合、この値は **radius** より大きくする必要があります。それ以外の場合、この値は **radius** より小さくする必要があります。

        - **level** (*int*)

            Zilliz Cloud は、さまざまな index アルゴリズム固有の多数の検索パラメータを扱う代わりに、検索パラメータ調整を簡素化するための統一パラメータを使用します。

            デフォルト値は **1** で、範囲は **1** から **5** です。値を大きくすると再現率は高くなりますが、検索パフォーマンスは低下します。

        - **page_retain_order** (*bool*) -

            `offset` が指定されたときに検索結果の順序を保持するかどうかを指定します。 

            このパラメータは、`radius` も設定した場合にのみ適用されます。

    - **ignore_growing** (*str*) -

        このオプションを設定すると、検索時に growing segment のデータを除外するよう指示します。この設定を使用すると、index 済みで完全に処理されたデータのみに絞ることで、検索パフォーマンスが向上する可能性があります。

    その他の適用可能な検索パラメータの詳細については、[In-memory Index](https://milvus.io/docs/index.md) および [On-disk Index](https://milvus.io/docs/disk_index.md) を参照してください。

    その他の適用可能な検索パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **group_by_field** (*str*)

    検索結果を指定した field でグループ化し、同じ group から複数の結果が返されるのを防いで多様性を確保します。

    このパラメータは Grouping Search で使用されます。`group_by` と同時に使用することはできません。

- **group_size** (*int*)

    グループ化検索において、各 group 内で返す entity の目標数です。たとえば、`group_size=2` を設定すると、各 group 内で最も類似した entity（例: ドキュメントの passage や vector 表現）を最大 2 件返すようシステムに指示します。`group_size` を設定しない場合、システムはデフォルトで各 group あたり 1 entity のみを返します。

- **strict_group_size** (*bool*)

    このブール値パラメータは、`group_size` を厳密に適用するかどうかを指定します。`strict_group_size=True` の場合、各 group 内に十分なデータが存在する限り、各 group をちょうど `group_size` 件の結果で埋めようとします。group 内の entity 数が不足している場合は、利用可能な entity のみを返し、十分なデータがある group では指定された `group_size` を満たすようにします。

- **group_by** (*GroupBy | None*) -

    検索集約を定義する `GroupBy` オブジェクトです。このパラメータが指定されると、Zilliz Cloud はルート `GroupBy` オブジェクト内の field に基づいて ANN 検索結果を bucket にグループ化します。各 bucket には、bucket ごとのメトリクス、代表ヒット、ネストされたサブグループを含めることができます。`group_by` は `group_by_field` と同時に使用できません。既存の単一 field の Grouping Search ワークフローには `group_by_field` を使用してください。bucket ごとのメトリクス、複数 field でのグループ化、bucket の順序付け、hit のソート、またはネストしたグループ化が必要な場合は `group_by` を使用してください。

    <Admonition type="info" icon="📘" title="Notes">

    検索集約メトリクスは、collection 全体ではなく、ANN によって取得された entity に対して計算されます。bucket 数、メトリクス、およびメトリクスに基づく順序付けは近似値です。

    </Admonition>

- **order_by_fields** (*list[dict] | None*) -

    サポートされているスカラー field で検索結果をソートするための order-by 指定のリストです。

    リスト内の各辞書には、次のキーがあります。

    - **field** (*str*) -

        ソート対象のスカラー field の名前です。

    - **order** (*str*) -

        ソート方向です。指定可能な値は `"asc"` と `"desc"` です。このキーを省略した場合、Milvus は field を昇順でソートします。

    Zilliz Cloud は、指定した順序で複数の order-by field を適用します。指定されたすべての order-by field で値が同じ entity については、Zilliz Cloud は元の類似度スコア順を保持します。

    グループ化検索では、Zilliz Cloud は各 group の最上位 entity の指定されたスカラー field 値で group を並べ替えます。`limit` パラメータは引き続き group の数を制御し、`group_size` は各 group あたりの entity 数を制御します。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、応答が到着するかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **partition_names** (*list*) -

    partition 名のリストです。

    デフォルト値は **None** です。指定した場合、指定された partition のみがクエリに含まれます。

- **ranker** (*[Function](./MilvusClient-Function)* | *[FunctionScore](./MilvusClient-FunctionScore)*) -

    検索に使用する ranker です。

    詳細については、[Decay Ranker Overview](/docs/decay-ranker-oveview) および を参照してください。

- **highlighter** (*Highlighter*) -

    検索操作で一致した用語をハイライトするための highlighter です。詳細については、[Lexical Highlighter](/docs/text-highlighter) および [Semantic Highlighter](/docs/semantic-highlighter) を参照してください。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    階層 bucket 集約仕様です。**group_by_field** と同時に使用できません。設定すると、**limit** は無視され、ルートの `SearchAggregation.size` が最上位 bucket 数を制御します。

- **kwargs** -

    - **offset** (int) -

        検索結果でスキップするレコード数です。 

        このパラメータを `limit` と組み合わせて使用することで、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満である必要があります。 

    - **round_decimal** (int) -

        Zilliz Cloud が計算された distance を丸める小数点以下の桁数です。

        デフォルト値は **-1** で、Zilliz Cloud が計算された distance の丸めを行わず、生の値を返すことを示します。

    - **timezone** (*str*)

        [IANA identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)（たとえば **Asia/Shanghai**、**America/Chicago**、**UTC**）を設定することで、単一のクエリに対して collection または database のデフォルト time zone を一時的に上書きします。これにより、その操作中のみ `TIMESTAMPTZ` 値の解釈、表示、比較方法が制御されます。保存済みデータや collection 設定は変更されません。

        詳細については、[TIMESTAMPZ Field](/docs/use-timestamptz-field) を参照してください。

    - **time_fields** (*str*)

        クエリまたは検索操作中に `TIMESTAMPTZ` field から特定の時刻要素を抽出します。抽出する要素はカンマ区切りのリストで指定します。サポートされる要素には、`year`、`month`、`day`、`hour`、`minute`、`second`、`microsecond` が含まれます。

        詳細については、TIMESTAMPZ Field を参照してください。

**RETURN TYPE:**

*list[dict]*

**RETURNS:**
指定された output field を含む、検索された entity の辞書のリストです。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

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

