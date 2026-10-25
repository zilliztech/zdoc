---
title: "query() | Python | MilvusClient"
slug: /python/python/Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたブール式によるスカラーフィルタリングを実行します。 | Python | MilvusClient"
type: docx
token: ShzCdNgEGozKi3xa3lUcHpxQnaf
sidebar_position: 4
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - クラウド
  - query()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# query()

この操作は、指定されたブール式によるスカラーフィルタリングを実行します。

<Admonition type="info" title="Notes">

このメソッドは、dedicated serving クラスターおよび on-demand compute にのみ適用されます。

- serving クラスターのコレクションでこの操作を実行するには、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用のコレクションでこの操作を実行するには、project エンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索用に on-demand クラスターへアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
query(
    collection_name: str,
    filter: str,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    ids: Optional[Union[List, str, int]] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> List[dict]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存のコレクションの名前。

- **filter** (*str*) -

    **[REQUIRED]**

    一致するエンティティをフィルター処理するスカラーフィルタリング条件です。スカラーフィルタリングをスキップするには、このパラメーターを空文字列に設定できます。スカラーフィルタリング条件を構築するには、Boolean Expression Rules を参照してください。

- **output_fields** (*list[str] | None*) -

    返される各エンティティに含めるフィールド名のリストです。値のデフォルトは None です。- これを output_fields=["*"] に設定すると、すべてのフィールドが出力されます。- これを output_fields=["count(*)"] に設定すると、filter 引数で指定した条件に一致する、ロード済みのエンティティが出力されます。- group_by_fields と併用する場合、このリストは集計式 count(&ast;)、count(&lt;field&gt;)、min(&lt;field&gt;)、max(&lt;field&gt;)、sum(&lt;field&gt;)、avg(&lt;field&gt;) も受け付けます。集計値はグループごとに計算され、グループキーとともに返されます。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、応答が到着したとき、またはエラーが発生したときに、この操作がタイムアウトすることを示します。

- **ids** (*list | str | int | None*) -

    直接クエリするエンティティの主キー値のリストです。このパラメーターは filter とは相互に排他的です。設定すると、エンティティはブール式ではなく主キー値によって特定されます。

- **partition_names** (*list[str] | None*) -

    パーティション名のリストです。値のデフォルトは None です。指定した場合、クエリには指定したパーティションのみが含まれます。このパラメーターは Milvus Lite には適用されません。Milvus Lite の制限の詳細については、Run Milvus Lite を参照してください。

- **kwargs** (*Any*) -

    consistency_level（str | int）などのオプションです。consistency_level は、対象コレクションの整合性レベルです。値のデフォルトは、現在のコレクションを作成したときに指定した値で、Strong（0）、Bounded（1）、Session（2）、Eventually（3）のいずれかを選択できます。分散データベースにおける整合性とは、特定の時点でデータを書き込みまたは読み取りする際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。Milvus は、Strong、Bounded Staleness、Session、Eventually の 4 つの整合性レベルをサポートしています。Milvus のデフォルトの整合性レベルは Bounded Staleness です。ベクトル類似検索またはクエリを実行するときに整合性レベルを簡単に調整して、アプリケーションに最適な設定にできます。guarantee_timestamp（int）は有効なタイムスタンプです。このパラメーターを設定すると、MilvusZilliz Cloud は、このタイムスタンプより前に挿入されたすべてのエンティティがクエリノードから参照可能な場合にのみ、クエリを実行します。このパラメーターは、デフォルトの整合性レベルが適用される場合に有効です。graceful_time（int）は秒単位の期間です。値のデフォルトは 5 です。このパラメーターを設定すると、MilvusZilliz Cloud は現在のタイムスタンプからこの値を差し引いて guarantee timestamp を計算します。このパラメーターは、デフォルト以外の整合性レベルが適用される場合に有効です。offset（int）は、クエリ結果でスキップするレコード数です。このパラメーターを limit と組み合わせて使用すると、ページネーションを有効にできます。この値と limit の合計は 16,384 未満にする必要があります。limit（int）は、クエリ結果で返すレコード数です。このパラメーターを offset と組み合わせて使用すると、ページネーションを有効にできます。この値と offset の合計は 16,384 未満にする必要があります。timezone（str）は、IANA 識別子（たとえば Asia/Shanghai, America/Chicago, UTC）を設定することで、単一のクエリに対してコレクションまたはデータベースのデフォルトタイムゾーンを一時的に上書きします。これは、その操作中に限り TIMESTAMPTZ 値の解釈、表示、比較の方法を制御します。保存済みデータやコレクション設定は変更しません。詳細については、TIMESTAMPZ Field を参照してください。time_fields（str）は、クエリまたは検索の操作中に TIMESTAMPTZ フィールドから特定の時間コンポーネントを抽出します。抽出する要素はカンマ区切りのリストで指定します。サポートされる要素には、year、month、day、hour、minute、second、microsecond が含まれます。詳細については、TIMESTAMPZ Field を参照してください。order_by（list[str]）は、クエリ結果を並べ替えるフィールドのリストです。各要素は "field_name:direction" の形式に従い、direction は asc（昇順）または desc（降順）のいずれかです。asc と desc は大文字と小文字を区別することに注意してください。サポートされるフィールド型は、INT8、INT16、INT32、INT64、FLOAT、DOUBLE、VARCHAR です。ベクトル、JSON、ARRAY フィールドによる並べ替えはサポートされていません。このパラメーターは limit と併用する必要があります。NULL 値を許容するフィールドを並べ替える場合、昇順では NULL 値が末尾に配置され（NULLS LAST）、降順では先頭に配置されます（NULLS FIRST）。group_by_fields（list[str]）は、クエリ結果をグループ化するスカラーフィールドのリストです。設定すると、query() は指定したフィールド値の一意な組み合わせごとに 1 行を返し、output_fields 内の集計式（count(&ast;)、count(&lt;f&gt;)、min(&lt;f&gt;)、max(&lt;f&gt;)、sum(&lt;f&gt;)、avg(&lt;f&gt;)）はグループごとに計算されます。サポートされるグループ化キーのフィールド型は、INT8、INT16、INT32、INT64、VARCHAR、TIMESTAMPTZ です。FLOAT、DOUBLE、ベクトル、JSON、ARRAY フィールドでグループ化すると、エラーが返されます。group_by_fields を limit と組み合わせて、返されるグループ数を制限できます。集計の入力型ルール: `sum` と `avg` は、`FLOAT` と `DOUBLE` を含む数値フィールドのみを受け付けます。いずれかの関数を `VARCHAR` フィールドに適用すると、エラーが返されます。:. `sum` は整数入力に対して `INT64`、`FLOAT` または `DOUBLE` 入力に対して `DOUBLE` を返します。`avg` は常に `DOUBLE` を返し、`count` は `INT64` を返し、`min` と `max` はフィールド型を保持します。:.

**RETURN TYPE:**

*list[dict]*

**RETURNS:**

クエリされたエンティティを表す辞書のリストです。返されるエンティティの数が想定より少ない場合、コレクション内に重複したエンティティが存在する可能性があります。

<Admonition type="info" title="Notes">

返されるエンティティの数が想定より少ない場合、コレクション内に重複したエンティティが存在する可能性があります。

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    この操作中にエラーが発生すると、この例外が発生します。この操作中にエラーが発生すると、この例外が発生します。

- **DataTypeNotMatchException**

    パラメーターの値が必要なデータ型と一致しない場合、この例外が発生します。パラメーターの値が必要なデータ型と一致しない場合、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
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

print(res)

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
