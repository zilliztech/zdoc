---
title: "query() | Python | MilvusClient"
slug: /python/python/Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation conducts a scalar filtering with a specified boolean expression. | Python | MilvusClient"
type: docx
token: ShzCdNgEGozKi3xa3lUcHpxQnaf
sidebar_position: 4
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query()

この操作は、指定されたブール式を使用してスカラーフィルタリングを実行します。

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
query(
    collection_name: str,
    filter: str,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> List[dict]
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    既存のコレクションの名前。

- **filter** (*str*) -

    **[必須]**

    一致するエンティティをフィルタリングするスカラーフィルタリング条件。

    スカラーフィルタリングをスキップするには、このパラメータを空の文字列に設定できます。スカラーフィルタリング条件を構築するには、[Filtering Overview](/docs/filtering-overview) を参照してください。

- **output_fields** (*list[str]* | *None*) -

    返される各エンティティに含めるフィールド名のリスト。

    デフォルト値は **None** です。

    <Admonition type="info" icon="📘" title="注意">

    - `output_fields=["\*"]` と設定すると、すべてのフィールドが出力されます。
    
    - `output_fields=["count(\*)"]` と設定すると、**filter** 引数で指定された条件に一致する読み込まれたエンティティが出力されます。
    
    - `group_by_fields` と併用する場合、このリストは集計式も受け入れます: `count(*)`、`count(<field>)`、`min(<field>)`、`max(<field>)`、`sum(<field>)`、`avg(<field>)`。集計値はグループごとに計算され、グループキーと共に返されます。

    </Admonition>

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、応答が到着するかエラーが発生するまで、この操作はタイムアウトしません。

- **partition_names** (*list[str]* | *None*) -

    パーティション名のリスト。

    デフォルト値は **None** です。指定された場合、指定されたパーティションのみがクエリに関与します。

- **kwargs** -

    - **consistency_level** (*str* | *int*) -

        ターゲットコレクションの一貫性レベル。

        デフォルト値は、現在のコレクションを作成したときに指定した値で、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) のオプションがあります。

        <Admonition type="info" icon="📘" title="注意">

        一貫性レベルとは?
        
                分散データベースにおける一貫性とは、特定の時点でデータの書き込みまたは読み取り時に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
        
                Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の3つの一貫性レベルを提供し、**Bounded Staleness** がデフォルトとして設定されています。
        
                ベクトル類似性検索またはクエリを実行する際に、一貫性レベルを簡単に調整して、アプリケーションに最適なものにすることができます。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        有効なタイムスタンプ。

        このパラメータを設定すると、このタイムスタンプより前に挿入されたすべてのエンティティがクエリノードに可視である場合にのみ、クエリを実行します。

        <Admonition type="info" icon="📘" title="注意">

        このパラメータは、デフォルトの一貫性レベルが適用される場合に有効です。

        </Admonition>

    - **graceful_time** (*int*) -

        秒単位の期間。

        デフォルト値は **5** です。このパラメータを設定すると、現在のタイムスタンプからこの値を引いた値を保証タイムスタンプとして計算します。

        <Admonition type="info" icon="📘" title="注意">

        このパラメータは、デフォルト以外の一貫性レベルが適用される場合に有効です。

        </Admonition>

    - **offset** (*int*) -

        クエリ結果でスキップするレコードの数。

        このパラメータを `limit` と組み合わせて、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満である必要があります。

    - **limit** (*int*) -

        クエリ結果で返すレコードの数。

        このパラメータを `offset` と組み合わせて、ページネーションを有効にできます。

        この値と `offset` の合計は 16,384 未満である必要があります。

    - **timezone** (*str*)

        [IANA 識別子](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) (例: **Asia/Shanghai**、**America/Chicago**、または **UTC**) を設定することで、単一のクエリに対してコレクションまたはデータベースのデフォルトタイムゾーンを一時的にオーバーライドします。これは、`TIMESTAMPTZ` 値がその操作中にのみどのように解釈、表示、比較されるかを制御します。保存されたデータやコレクション設定は変更されません。

        詳細については、[TIMESTAMPZ Field](/docs/use-timestamptz-field) を参照してください。

    - **time_fields** (*str*)

        クエリまたは検索操作中に `TIMESTAMPTZ` フィールドから特定の時間コンポーネントを抽出します。抽出する要素を指定するには、カンマ区切りのリストを使用します。サポートされる要素: `year`、`month`、`day`、`hour`、`minute`、`second`、`microsecond`。

        詳細については、TIMESTAMPZ Field を参照してください。

    - **order_by** (*list[str]*)

        クエリ結果をソートするフィールドのリスト。各要素は `"field_name:direction"` の形式に従います。ここで、direction は `asc` (昇順) または `desc` (降順) のいずれかです。`asc` と `desc` は大文字と小文字が区別されることに注意してください。

        サポートされるフィールドタイプ: INT8、INT16、INT32、INT64、FLOAT、DOUBLE、VARCHAR。ベクトル、JSON、ARRAY フィールドによるソートはサポートされていません。

        このパラメータは `limit` と一緒に使用する必要があります。NULL 許容フィールドをソートする場合、NULL 値は昇順ソートでは最後に配置され (NULLS LAST)、降順ソートでは最初に配置されます (NULLS FIRST)。

    - **group_by_fields** (*list[str]*) -

        クエリ結果をグループ化するスカラーフィールドのリスト。設定すると、`query()` は指定されたフィールド値の一意な組み合わせごとに1行を返し、`output_fields` 内の集計式 (`count(*)`、`count(<f>)`、`min(<f>)`、`max(<f>)`、`sum(<f>)`、`avg(<f>)`) はグループごとに計算されます。

        サポートされるグループ化キーフィールドタイプ: `INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR`、`TIMESTAMPTZ`。`FLOAT`、`DOUBLE`、ベクトル、`JSON`、`ARRAY` フィールドによるグループ化はエラーを返します。

        `group_by_fields` を `limit` と組み合わせて、返されるグループ数を制限できます。

        集計入力タイプのルール:

        - `sum` と `avg` は、`FLOAT` と `DOUBLE` を含む数値フィールドのみを受け入れます。いずれかの関数を `VARCHAR` フィールドに適用するとエラーが返されます。

        - `sum` は整数入力に対して `INT64` を返し、`FLOAT` または `DOUBLE` 入力に対して `DOUBLE` を返します。`avg` は常に `DOUBLE` を返します。`count` は `INT64` を返します。`min` と `max` はフィールドタイプを保持します。

**戻り値の型:**

*list[dict]*

**戻り値:**

各辞書がクエリされたエンティティを表す辞書のリスト。

<Admonition type="info" icon="📘" title="注意">

返されたエンティティの数が予想より少ない場合、コレクションに重複エンティティが存在する可能性があります。

</Admonition>

**例外:**

- **MilvusException**

    この操作中にエラーが発生すると、この例外が発生します。

- **DataTypeNotMatchException**

    パラメータ値が必要なデータ型と一致しない場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection and a partition
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

client.create_partition(
    collection_name="test_collection",
    partition_name="partitionA"
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

# 4. Conduct queries

# Query without any scalar filtering condition
# This query returns entities with their ids from 0 to 4.
res = client.query(
    collection_name="test_collection",
    filter="",
    limit=5,
) 

print(res)

# [{'id': 0,
#   'vector': [0.35803765, -0.6023496, 0.18414013, -0.26286206, 0.90294385],
#   'color': 'pink_8682'},
#  {'id': 1,
#   'vector': [0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295],
#   'color': 'red_7025'},
#  {'id': 2,
#   'vector': [0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794],
#   'color': 'orange_6781'},
#  {'id': 3,
#   'vector': [0.3172005, 0.97190446, -0.36981148, -0.48608947, 0.9579189],
#   'color': 'pink_9298'},
#  {'id': 4,
#   'vector': [0.44523495, -0.8757027, 0.82207793, 0.4640629, 0.3033748],
#   'color': 'red_4794'}]

# Query with pagination
# This query returns entities with their ids from 5 to 9.
res = client.query(
    collection_name="test_collection",
    filter="",
    offset=5,
    limit=5
)

print(res)

# [{'vector': [0.9858251, -0.81446517, 0.6299267, 0.12069069, -0.14462778],
#   'color': 'yellow_4222',
#   'id': 5},
#  {'vector': [0.8371978, -0.015764369, -0.31062937, -0.56266695, -0.8984948],
#   'color': 'red_9392',
#   'id': 6},
#  {'vector': [-0.33445147, -0.2567135, 0.898754, 0.9402996, 0.5378065],
#   'color': 'grey_8510',
#   'id': 7},
#  {'vector': [0.3952472, 0.40002573, -0.5890507, -0.86505026, -0.6140361],
#   'color': 'white_9381',
#   'id': 8},
#  {'vector': [0.57182807, 0.24070318, -0.37379134, -0.067269325, -0.6980532],
#   'color': 'purple_4976',
#   'id': 9}]

# Query with a scalar filtering condition
res = client.query(
    collection_name="test_collection",
    filter="id in [6,7,8]",
)

print(res)

# [{'vector': [0.8371978, -0.015764369, -0.31062937, -0.56266695, -0.8984948],
#   'color': 'red_9392',
#   'id': 6},
#  {'vector': [-0.33445147, -0.2567135, 0.898754, 0.9402996, 0.5378065],
#   'color': 'grey_8510',
#   'id': 7},
#  {'vector': [0.3952472, 0.40002573, -0.5890507, -0.86505026, -0.6140361],
#   'color': 'white_9381',
#   'id': 8}]

# Query within a partition
res = client.query(
    collection_name="test_collection",
    filter="id in [6,7,8]",
    partition_names=["partitionA"],
)

# []

# Query with specified output fields
res = client.query(
    collection_name="test_collection",
    filter="id in [6,7,8]",
    output_fields=["id", "vector"],
)

print(res)

# [{'id': 6,
#   'vector': [0.8371978, -0.015764369, -0.31062937, -0.56266695, -0.8984948]},
#  {'id': 7,
#   'vector': [-0.33445147, -0.2567135, 0.898754, 0.9402996, 0.5378065]},
#  {'id': 8,
#   'vector': [0.3952472, 0.40002573, -0.5890507, -0.86505026, -0.6140361]}]

# Query with a customized consistency level
res = client.query(
    collection_name="test_collection",
    filter="",
    limit=5,
    consistency_level=3,
    graceful_time=6
)

print(res)

# [{'color': 'pink_8682',
#   'id': 0,
#   'vector': [0.35803765, -0.6023496, 0.18414013, -0.26286206, 0.90294385]},
#  {'color': 'red_7025',
#   'id': 1,
#   'vector': [0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295]},
#  {'color': 'orange_6781',
#   'id': 2,
#   'vector': [0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794]},
#  {'color': 'pink_9298',
#   'id': 3,
#   'vector': [0.3172005, 0.97190446, -0.36981148, -0.48608947, 0.9579189]},
#  {'color': 'red_4794',
#   'id': 4,
#   'vector': [0.44523495, -0.8757027, 0.82207793, 0.4640629, 0.3033748]}]

# Query with outputting all fields
res = client.query(
    collection_name="test_collection",
    filter="id < 5",
    output_fields=["*"]
)

# [{'vector': [0.35803765, -0.6023496, 0.18414013, -0.26286206, 0.90294385],
#   'color': 'pink_8682',
#   'id': 0},
#  {'vector': [0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295],
#   'color': 'red_7025',
#   'id': 1},
#  {'vector': [0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794],
#   'color': 'orange_6781',
#   'id': 2},
#  {'vector': [0.3172005, 0.97190446, -0.36981148, -0.48608947, 0.9579189],
#   'color': 'pink_9298',
#   'id': 3},
#  {'vector': [0.44523495, -0.8757027, 0.82207793, 0.4640629, 0.3033748],
#   'color': 'red_4794',
#   'id': 4}]

# Count the loaded entities that match specific conditions
res = client.query(
    collection_name="test_collection",
    filter="color like \"red_%\"",
    output_fields=["count(*)"]
)

# [{'count(*)': 3}]
```

