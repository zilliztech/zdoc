---
title: "query_iterator() | Python | MilvusClient"
slug: /python/python/Vector-query_iterator
sidebar_label: "query_iterator()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたブール式を使用してスカラーフィルタリングを反復的に実行します。 | Python | MilvusClient"
type: docx
token: L6i8dmvsBogcmIxtORsc1Mu0nhg
sidebar_position: 5
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - query_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query_iterator()

この操作は、指定されたブール式を使用してスカラーフィルタリングを反復的に実行します。

<Admonition type="info" icon="📘" title="Notes">

外部コレクションではこの操作はサポートされていません。

</Admonition>

## Request syntax\{#request-syntax}

```python
query_iterator(
    collection_name: str,
    batch_size: Optional[int] = 1000,
    limit: Optional[int] = UNLIMITED,
    filter: str,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> List[dict]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存のコレクションの名前。

- **batch_size** (*int*) -

    各反復で返されるエンティティ数。デフォルト値は 1000 です。

- **limit** (*int*) -

    返されるエンティティの総数。パラメータ値は 16,384 未満である必要があります。 

- **filter** (*str*) -

    **[REQUIRED]**

    一致するエンティティを絞り込むためのスカラーフィルタリング条件。 

    スカラーフィルタリングをスキップするには、このパラメータを空文字列に設定できます。スカラーフィルタリング条件の構築については、[Filtering Overview](/docs/filtering-overview) を参照してください。 

- **output_fields** (*list[str]* | *None*) -

    返される各エンティティに含めるフィールド名のリスト。

    値のデフォルトは **None** です。

    <Admonition type="info" icon="📘" title="Notes">

    - これを `output_fields=["\*"]` に設定すると、すべてのフィールドが出力されます。
    
    - これを `output_fields=["count(\*)"]` に設定すると、**filter** 引数で指定された条件に一致する、ロード済みのエンティティが出力されます。 

    </Admonition>

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、いずれかの応答が到着するかエラーが発生した時点でこの操作はタイムアウトします。

- **partition_names** (*list[str]* | *None*) -

    パーティション名のリスト。

    値のデフォルトは **None** です。指定した場合、指定されたパーティションのみがクエリに含まれます。

- **kwargs** -

    - **consistency_level** (*str* | *int*) -

        対象コレクションの整合性レベル。

        値のデフォルトは現在のコレクション作成時に指定したもので、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) から選択できます。

        <Admonition type="info" icon="📘" title="Note">

        整合性レベルとは何ですか？
        
                分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
        
                Zilliz Cloud は 3 つの整合性レベル、**Strong**、**Bounded Staleness**、**Eventually** を提供しており、デフォルトは **Bounded Staleness** です。
        
                ベクトル類似検索またはクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        有効なタイムスタンプ。 

        このパラメータが設定されている場合、この操作は、このタイムスタンプより前に挿入されたすべてのエンティティがクエリノードから可視である場合にのみクエリを実行します。 

        <Admonition type="info" icon="📘" title="Notes">

        このパラメータは、デフォルトの整合性レベルが適用される場合に有効です。

        </Admonition>

    - **graceful_time** (*int*) -

        秒単位の期間。

        値のデフォルトは **5** です。このパラメータが設定されている場合、この操作は現在のタイムスタンプからこの値を差し引いて保証タイムスタンプを計算します。

        <Admonition type="info" icon="📘" title="Notes">

        このパラメータは、デフォルト以外の整合性レベルが適用される場合に有効です。

        </Admonition>

    - **offset** (*int*) -

        クエリ結果でスキップするレコード数。 

        このパラメータを `limit` と組み合わせて使用することで、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満である必要があります。 

    - **limit** (*int*) -

        クエリ結果で返されるレコード数。

        このパラメータを `offset` と組み合わせて使用することで、ページネーションを有効にできます。

        この値と `offset` の合計は 16,384 未満である必要があります。 

**RETURN TYPE:**

*QueryIterator*

**RETURNS:**

以下のメソッドを提供する **QueryIterator** インスタンス:

- `next()`

    このメソッドは、エンティティのバッチを反復的に返します。呼び出すたびに、最後のエンティティが取得されるまで新しいエンティティセットが返されます。

- `close()`

    このメソッドは、現在の **QueryIterator** インスタンスを閉じます。

<Admonition type="info" icon="📘" title="Notes">

返されたエンティティ数が期待より少ない場合、コレクション内に重複エンティティが存在する可能性があります。

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

- **DataTypeNotMatchException**

    この例外は、パラメータ値が必要なデータ型と一致しない場合に発生します。

## Examples\{#examples}

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

# Query with query iterator
iterator = client.query_iterator(
    collection_name="test_collection",
    batch_size=1000,
    filter="id in [6,7,8]",
)

results = []

while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break
        
    for hit in result:
        results.append(hit.to_dict())
```

