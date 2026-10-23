---
title: "search() | Python | MilvusClient"
slug: /python/python/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、オプションのスカラーフィルタリング式を使用してベクトル類似性検索を実行します。 | Python | MilvusClient"
type: docx
token: DvaZdhYnyoo7lOxNIBwc5eKEn7d
sidebar_position: 6
keywords: 
  - マルチモーダル RAG
  - LLM のハルシネーション
  - ハイブリッド検索
  - レキシカル検索
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# search()

この操作では、オプションのスカラーフィルタリング式を使用してベクトル類似性検索を実行します。

## リクエスト構文\{#request-syntax}

```python
search(
    self,
    collection_name: str,
    data: Optional[Union[List[list], list]] = None,
    filter: str = "",
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    search_params: Optional[dict] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    anns_field: Optional[str] = None,
    ranker: Optional[Union[Function, FunctionScore]] = None,
    function_chains: Optional[Union[FunctionChain, List[FunctionChain]]] = None,
    highlighter: Optional[Highlighter] = None,
    ids: Optional[Union[List[int], List[str], str, int]] = None,
    search_aggregation: Optional[SearchAggregation] = None,
    **kwargs,
) -> List[List[dict]]
```

**パラメーター：**

- **collection_name** (*str*) -

    **[必須]**

    既存のコレクションの名前です。

- **data** (*List[list], list]*) -

    **[必須]**

    ベクトル埋め込みのリストです。Milvus は、指定されたベクトル埋め込みに最も類似するベクトル埋め込みを検索します。このパラメーターは ids と同時に使用できません。

- **ids** (*Union[List[str], List[int]]*) -

    主キーのリストです。Milvus は、指定されたエンティティ内のベクトル埋め込みに最も類似するベクトル埋め込みを検索します。このパラメーターは data と同時に使用できません。

- **anns_field** (*str*) -

    現在の検索における対象ベクトルフィールドの名前です。

- **filter** (*str*) -

    一致するエンティティを絞り込むためのスカラーフィルタリング条件です。値のデフォルトは空文字列で、条件が適用されないことを示します。スカラーフィルタリングをスキップするには、このパラメーターを空文字列に設定できます。スカラーフィルタリング条件を作成するには、Boolean Expression Rules を参照してください。

- **filter_params** (*dict*) -

    Filtering Templating に記載されているとおり、filter でプレースホルダーを使用する場合、このパラメーターの値として、これらのプレースホルダーの実際の値をキーと値のペアで指定できるオプションです。

- **limit** (*int*) -

    返すエンティティの総数です。このパラメーターは、param の offset と組み合わせて使用すると、ページネーションを有効にできます。この値と param の offset の合計は 16,384 未満にする必要があります。ただし、グループ化検索では、limit は個々のエンティティではなく、返すグループの最大数を指定します。各グループは、指定された group_by_field に基づいて形成されます。search_aggregation を指定する場合は、limit を明示的に設定しないでください。返すトップレベルのバケット数を制御するには、ルートの SearchAggregation.size 値を使用します。

- **output_fields** (*list[str]*) -

    返される各エンティティに含めるフィールド名のリストです。値のデフォルトは None です。指定しない場合、プライマリフィールドのみが含まれます。

- **search_params** (*dict*) -

    この操作に固有のパラメーター設定です。radius（float）：最小類似度のしきい値を決定します。コレクションのメトリックタイプが L2 に設定されている場合は、この値が range_filter より大きくなるようにしてください。それ以外の場合は、この値は range_filter より小さくする必要があります。range_filter（float）：特定の類似度範囲内のベクトルに検索を絞り込みます。コレクションのメトリックタイプが IP または COSINE に設定されている場合は、この値が radius より大きくなるようにしてください。それ以外の場合は、この値は radius より小さくする必要があります。max_empty_result_buckets（int）：このパラメーターは、BIN_IVF_FLAT、IVF_FLAT、IVF_SQ8、IVF_PQ、SCANN などの IVF 系インデックスの範囲検索にのみ使用されます。値のデフォルトは 1 で、範囲は 1～65536 です。範囲検索中、有効な範囲検索結果のないバケットの数が指定された値に達すると、検索プロセスは早期に終了します。このパラメーターを増やすと、範囲検索の再現率が向上します。params（dict）：追加のパラメーターです。すべての追加パラメーターは上位の search_params に移動され、params 引数はまもなく非推奨になります。radius（float）：最小類似度のしきい値を決定します。コレクションのメトリックタイプが L2 に設定されている場合は、この値が range_filter より大きくなるようにしてください。それ以外の場合は、この値は range_filter より小さくする必要があります。range_filter（float）：特定の類似度範囲内のベクトルに検索を絞り込みます。コレクションのメトリックタイプが IP または COSINE に設定されている場合は、この値が radius より大きくなるようにしてください。それ以外の場合は、この値は radius より小さくする必要があります。max_empty_result_buckets（int）：このパラメーターは、BIN_IVF_FLAT、IVF_FLAT、IVF_SQ8、IVF_PQ、SCANN などの IVF 系インデックスの範囲検索にのみ使用されます。値のデフォルトは 1 で、範囲は 1～65536 です。範囲検索中、有効な範囲検索結果のないバケットの数が指定された値に達すると、検索プロセスは早期に終了します。このパラメーターを増やすと、範囲検索の再現率が向上します。ignore_growing（str）：このオプションを設定すると、検索で増加中のセグメントのデータを除外するよう指示されます。この設定を使用すると、インデックス済みで完全に処理されたデータのみに焦点を当てることで、検索パフォーマンスを向上できる可能性があります。その他の適用可能な検索パラメーターの詳細については、インメモリインデックスとオンディスクインデックスを参照してください。

- **group_by_field** (*str*) -

    オプションです。r o.

- **group_size** (*int*) -

    グループ化検索で各グループ内に返すエンティティの目標数です。たとえば、group_size=2 を設定すると、システムは各グループ内で最大 2 つの最も類似するエンティティ（ドキュメントのパッセージやベクトル表現など）を返すよう指示されます。group_size を設定しない場合、システムはデフォルトで各グループにつき 1 つのエンティティのみを返します。

- **strict_group_size** (*bool*) -

    このブール値パラメーターは、group_size を厳密に適用するかどうかを決定するオプションです。strict_group_size=True の場合、システムは各グループ内に十分なデータがある限り、各グループを正確に group_size 件の結果で埋めようとします。グループ内のエンティティ数が不足している場合は、使用可能なエンティティのみが返され、十分なデータがあるグループが指定された group_size を満たすことが保証されます。

- **order_by_fields** (*list[dict] | None*) -

    サポートされているスカラーフィールドで検索結果を並べ替えるための order-by 仕様のリストです。リスト内の各ディクショナリには、次のキーがあります。field（str）：並べ替えるスカラーフィールドの名前です。order（str）：並べ替えの方向です。指定できる値は "asc" と "desc" です。このキーを省略すると、Milvus はフィールドを昇順に並べ替えます。Milvus は、指定した順序で複数の order-by フィールドを適用します。指定されたすべての order-by フィールドで同じ値を持つエンティティについては、Milvus は元の類似度スコアの順序を保持します。グループ化検索では、Milvus は各グループの先頭エンティティの指定されたスカラーフィールド値でグループを並べ替えます。limit パラメーターは引き続きグループ数を制御し、group_size はグループあたりのエンティティ数を制御します。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、応答が到着したとき、またはエラーが発生したときに、この操作がタイムアウトすることを示します。

- **partition_names** (*list*) -

    パーティション名のリストです。値のデフォルトは None です。指定した場合、指定されたパーティションのみがクエリの対象になります。このパラメーターは Milvus Lite には適用されません。Milvus Lite の制限の詳細については、Run Milvus Lite を参照してください。

- **ranker** (*[Function](../Collections/Function/Function.md*) -

    検索に使用するランカーを指定するオプションです（*|* FunctionScore&ast;）。詳細については、Decay Ranker Overview および Model Ranker Overview を参照してください。

- **function_chains** (*FunctionChain | list[FunctionChain]*) -

    検索に適用するファンクションチェーンです。このパラメーターは ranker と同時に使用できません。

- **highlighter** (*Highlighter*) -

    検索操作で一致した用語をハイライト表示するハイライターです。詳細については、Lexical Highlighter を参照してください。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    PyMilvus 3.0.1 以降で使用できるオプションです。階層的なバケット集約を定義します。このパラメーターは group_by_field と一緒に使用しないでください。設定すると、limit は無視され、ルートの SearchAggregation.size がトップレベルのバケット数を制御します。

- **kwargs** (*Any*) -

    オプションです。offset（int）：検索結果でスキップするレコード数です。このパラメーターは limit と組み合わせて使用すると、ページネーションを有効にできます。この値と limit の合計は 16,384 未満にする必要があります。round_decimal（int）：Milvus が計算された距離を丸める小数点以下の桁数です。値のデフォルトは -1 で、Milvus が計算された距離の丸めをスキップし、生の値を返すことを示します。timezone（str）：IANA 識別子（Asia/Shanghai, America/Chicago, UTC など）を設定することで、単一のクエリに対してコレクションまたはデータベースのデフォルトタイムゾーンを一時的に上書きします。これは、その操作中のみ TIMESTAMPTZ 値の解釈、表示、比較の方法を制御します。保存されたデータやコレクション設定は変更しません。詳細については、TIMESTAMPZ Field を参照してください。time_fields（str）：クエリ操作または検索操作中に TIMESTAMPTZ フィールドから特定の時間コンポーネントを抽出します。抽出する要素を指定するには、カンマ区切りのリストを使用します。サポートされている要素には、year、month、day、hour、minute、second、microsecond があります。詳細については、TIMESTAMPZ Field を参照してください。

**戻り値の型：**

*list[dict]*

**戻り値：**

指定された出力フィールドを含む、検索されたエンティティを格納したディクショナリのリストです。

**例外：**

- **MilvusException**

    この操作中にエラーが発生すると、この例外が発生します。この操作中にエラーが発生すると、この例外が発生します。

## 例\{#examples}

グループ化検索：次の焦点を絞った例では、クライアントの設定、コレクションの作成、データの挿入を省略しています。product_catalog には 5 次元のベクトルフィールドと brand という名前のスカラーフィールドがあることを前提としています。

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
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
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

<Admonition type="info" title="Notes">

このメソッドは、Dedicated 配信クラスターとオンデマンドコンピューティングにのみ適用されます。

- 配信クラスターのコレクションでこの操作を行うには、クラスターエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピューティングのコレクションでこの操作を行うには、プロジェクトエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成し、次にオンデマンドクラスターにアタッチするセッションを作成して検索します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

