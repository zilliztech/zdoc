---
title: "search() | Python | MilvusClient"
slug: /python/python/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラーフィルタリング式を使用してベクトル類似度検索を実行します。 | Python | MilvusClient"
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

この操作は、オプションのスカラーフィルタリング式を使用してベクトル類似度検索を実行します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated サービングクラスターおよびオンデマンドコンピュートにのみ適用されます。

- サービングクラスターのコレクションでこの操作を実行するには、クラスターエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュートのコレクションでこの操作を実行するには、プロジェクトエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索を行うためにオンデマンドクラスターにアタッチするセッションを作成してください。

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

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存のコレクションの名前です。

- **data** (*List[list], list]*) -

    **[REQUIRED]**

    ベクトル埋め込みのリストです。

    Zilliz Cloud は、指定されたベクトル埋め込みに最も類似するベクトル埋め込みを検索します。

    このパラメータは **ids** と相互に排他的です。

- **ids** (*Union[List[str], List[int]]*) -

    主キーのリストです。

    Zilliz Cloud は、指定されたエンティティ内のベクトル埋め込みに最も類似するベクトル埋め込みを検索します。

    このパラメータは **data** と相互に排他的です。

- **anns_field** (*str*) -

    現在の検索における対象のベクトルフィールドの名前です。

- **filter** (*str*) -

    一致するエンティティをフィルタリングするためのスカラーフィルタリング条件です。

    値のデフォルトは空の文字列で、条件が適用されないことを示します。

    スカラーフィルタリングをスキップするには、このパラメータを空の文字列に設定します。スカラーフィルタリング条件を作成する方法については、[フィルタリングの概要](/docs/filtering-overview) を参照してください。

- **filter_params** (*dict*) -

    [フィルタリングテンプレート](/docs/filtering-templating) で説明されているように `filter` でプレースホルダーを使用する場合は、これらのプレースホルダーの実際の値をキーと値のペアとしてこのパラメータの値に指定できます。

- **limit** (*int*) -

    返されるエンティティの総数です。

    このパラメータを **param** の **offset** と組み合わせて使用すると、ページネーションを有効にできます。

    この値と **param** の **offset** の合計は 16,384 未満にする必要があります。

    ただし、グループ化検索では、`limit` は個々のエンティティではなく、返されるグループの最大数を指定します。各グループは、指定された `group_by_field` に基づいて形成されます。

    <Admonition type="info" title="Notes">

    `search_aggregation` を指定する場合は、`limit` を明示的に設定しないでください。返される最上位バケットの数を制御するには、ルートの `SearchAggregation.size` の値を使用します。

    </Admonition>

- **output_fields** (l*ist[str]*) -

    返される各エンティティに含めるフィールド名のリストです。

    値のデフォルトは **None** です。指定しない場合は、主フィールドのみが含まれます。

- **search_params** (*dict*) -

    この操作に固有のパラメータ設定です。

    - **radius** (float) -

        最小類似度のしきい値を決定します。コレクションのメトリックタイプが L2 に設定されている場合は、この値が **range_filter** の値より大きくなるようにしてください。それ以外の場合は、この値は **range_filter** の値より小さくする必要があります。

    - **range_filter**  (float) -

        特定の類似度範囲内のベクトルに検索を絞り込みます。コレクションのメトリックタイプが `IP` または `COSINE` に設定されている場合は、この値が **radius** の値より大きくなるようにしてください。それ以外の場合は、この値は **radius** の値より小さくする必要があります。

    - **level** (*int*)

        Zilliz Cloud は、さまざまなインデックスアルゴリズムに固有の多数の検索パラメータを個別に扱う代わりに、統一されたパラメータを使用して検索パラメータのチューニングを簡素化します。

        値のデフォルトは **1** で、**1** から **5** の範囲です。値を大きくすると、検索パフォーマンスは低下しますが、再現率は高くなります。

    - **page_retain_order** (*bool*) -

        `offset` を指定したときに検索結果の順序を保持するかどうかです。

        このパラメータは、`radius` も設定した場合にのみ適用されます。

    - **params** (dict) -

        追加のパラメータです。

        <Admonition type="info" title="Notes">

        すべての追加パラメータは上位の `search_params` に移動されました。`params` 引数はまもなく非推奨になります。

        </Admonition>

        - **radius** (float) -

            最小類似度のしきい値を決定します。コレクションのメトリックタイプが `L2` に設定されている場合は、この値が **range_filter** の値より大きくなるようにしてください。それ以外の場合は、この値は **range_filter** の値より小さくする必要があります。

        - **range_filter**  (float) -

            特定の類似度範囲内のベクトルに検索を絞り込みます。コレクションのメトリックタイプが `IP` または `COSINE` に設定されている場合は、この値が **radius** の値より大きくなるようにしてください。それ以外の場合は、この値は **radius** の値より小さくする必要があります。

        - **level** (*int*)

            Zilliz Cloud は、さまざまなインデックスアルゴリズムに固有の多数の検索パラメータを個別に扱う代わりに、統一されたパラメータを使用して検索パラメータのチューニングを簡素化します。

            値のデフォルトは **1** で、**1** から **5** の範囲です。値を大きくすると、検索パフォーマンスは低下しますが、再現率は高くなります。

        - **page_retain_order** (*bool*) -

            `offset` を指定したときに検索結果の順序を保持するかどうかです。

            このパラメータは、`radius` も設定した場合にのみ適用されます。

    - **ignore_growing** (*str*) -

        このオプションを設定すると、検索から成長中のセグメントのデータを除外するように指示されます。この設定を利用すると、インデックス済みで完全に処理されたデータのみに焦点を当てることで、検索パフォーマンスを向上できる可能性があります。

    その他の適用可能な検索パラメータの詳細については、[インメモリインデックス](https://milvus.io/docs/index.md) および [オンディスクインデックス](https://milvus.io/docs/disk_index.md) を参照してください。

    その他の適用可能な検索パラメータの詳細については、[AUTOINDEX の説明](/docs/autoindex-explained) を参照してください。

- **group_by_field** (*str*)

    検索結果を指定したフィールドでグループ化し、多様性を確保するとともに、同じグループから複数の結果が返されることを防ぎます。

    このパラメータはグループ化検索で使用されます。PyMilvus 3.0.1 以降では、このパラメータを `search_aggregation` と併用しないでください。

- **group_size** (*int*)

    グループ化検索において、各グループ内で返すエンティティの目標数です。たとえば、`group_size=2` を設定すると、システムは各グループ内で最も類似するエンティティ（例: ドキュメントのパッセージやベクトル表現）を最大 2 件返すようになります。`group_size` を設定しない場合、システムはデフォルトで各グループにつき 1 件のエンティティのみを返します。

- **strict_group_size** (*bool*)

    この Boolean パラメータは、`group_size` を厳密に適用するかどうかを指定します。`strict_group_size=True` の場合、各グループ内に十分なデータが存在する限り、システムは各グループを正確に `group_size` 件の結果で埋めようとします。グループ内のエンティティ数が不足している場合は、利用可能なエンティティのみが返されるため、十分なデータがあるグループは指定された `group_size` を満たします。

- **order_by_fields** (*list[dict] | None*) -

    サポートされているスカラーフィールドで検索結果を並べ替えるための order-by 指定のリストです。

    リスト内の各辞書は、次のキーを持ちます。

    - **field** (*str*) -

        並べ替えの対象となるスカラーフィールドの名前です。

    - **order** (*str*) -

        並べ替えの方向です。指定できる値は `"asc"` および `"desc"` です。このキーを省略した場合、Milvus はそのフィールドを昇順で並べ替えます。

    Zilliz Cloud は、指定した順序で複数の order-by フィールドを適用します。指定したすべての order-by フィールドで同じ値を持つエンティティについては、Zilliz Cloud は元の類似度スコアの順序を維持します。

    グループ化検索では、Zilliz Cloud は各グループの先頭エンティティの指定されたスカラーフィールドの値によってグループを並べ替えます。`limit` パラメータは引き続きグループ数を制御し、`group_size` はグループあたりのエンティティ数を制御します。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **partition_names** (*list*) -

    パーティション名のリストです。

    値のデフォルトは **None** です。指定した場合、指定したパーティションのみがクエリの対象になります。

- **ranker** (*[Function](./MilvusClient-Function)* | *[FunctionScore](./MilvusClient-FunctionScore)*) -

    検索に使用するランカーです。

    詳細については、[Decay Ranker Overview](/docs/decay-ranker-oveview) を参照してください。

- **highlighter** (*Highlighter*) -

    検索操作で一致した用語をハイライトするためのハイライターです。詳細については、[Lexical Highlighter](/docs/text-highlighter) を参照してください。

- **search_aggregation** (*Optional[SearchAggregation]*) - PyMilvus 3.0.1 以降で使用できます。階層的なバケット集約を定義します。このパラメータを `group_by_field` と併用しないでください。設定した場合、`limit` は無視され、最上位バケットの数はルートの `SearchAggregation.size` によって制御されます。

- **kwargs** -

    - **offset** (int) -

        検索結果でスキップするレコード数です。

        このパラメータを `limit` と組み合わせて使用すると、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満にする必要があります。

    - **round_decimal** (int) -

        Zilliz Cloud が計算された距離を丸める際の小数点以下の桁数です。

        値のデフォルトは **-1** で、Zilliz Cloud が計算された距離の丸めをスキップし、生の値を返すことを示します。

    - **timezone** (*str*)

        [IANA identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)（例: **Asia/Shanghai**, **America/Chicago**, または **UTC**）を設定することで、単一のクエリに対してコレクションまたはデータベースのデフォルトのタイムゾーンを一時的に上書きします。これは、その操作の実行中に限り、`TIMESTAMPTZ` 値がどのように解釈、表示、比較されるかを制御します。保存されているデータやコレクションの設定は変更されません。

        詳細については、[TIMESTAMPZ Field](/docs/use-timestamptz-field) を参照してください。

    - **time_fields** (*str*)

        クエリまたは検索操作中に `TIMESTAMPTZ` フィールドから特定の時間コンポーネントを抽出します。抽出する要素はカンマ区切りのリストで指定します。サポートされている要素は `year`、`month`、`day`、`hour`、`minute`、`second`、`microsecond` です。

        詳細については、TIMESTAMPZ Field を参照してください。

**RETURN TYPE:**

*list[dict]*

**RETURNS:**
指定された出力フィールドを持つ、検索されたエンティティを含む辞書のリストです。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#examples}

**グループ化検索**

次の例は焦点を絞ったもので、クライアントのセットアップ、コレクションの作成、およびデータの挿入を省略しています。`product_catalog` に 5 次元のベクトルフィールドと `brand` という名前のスカラーフィールドがあることを前提としています。

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
