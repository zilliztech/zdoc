---
title: "search_iterator() | Python | MilvusClient"
slug: /python/python/Vector-search_iterator
sidebar_label: "search_iterator()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラー・フィルタリング式を使用して、反復的に vector 類似度検索を実行します。 | Python | MilvusClient"
type: docx
token: T9KhdDJQColJEuxZ7YOcV2zdnlb
sidebar_position: 7
keywords: 
  - vector データベースはどのように動作するか
  - vector db 比較
  - openai vector db
  - 自然言語処理データベース
  - zilliz
  - zilliz cloud
  - cloud
  - search_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search_iterator()

この操作は、オプションのスカラー・フィルタリング式を使用して、反復的に vector 類似度検索を実行します。

<Admonition type="info" icon="📘" title="注意">

External collection ではこの操作はサポートされていません。

</Admonition>

## Request syntax\{#request-syntax}

```python
search_iterator(
    self,
    collection_name: str,
    data: Union[List[list], list],
    batch_size: Optional[int] = 1000,
    filter: str = "",
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    search_params: Optional[dict] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    anns_field: Optional[str] = None,
    round_decimal: int = -1
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

    Zilliz Cloud は、指定されたものに最も類似した vector 埋め込みを検索します。

- **batch_size** (*int*) -

    各反復で返される entity の数です。デフォルト値は 1000 です。

- **anns_field** (*str*) -

    現在の検索の対象 vector field の名前です。

- **filter** (*str*) -

    一致する entity を絞り込むためのスカラー・フィルタリング条件です。 

    デフォルト値は空文字列で、条件が適用されないことを示します。

    スカラー・フィルタリングをスキップするには、このパラメータを空文字列に設定できます。スカラー・フィルタリング条件の構築については、[Filtering Overview](/docs/filtering-overview) を参照してください。 

- **limit** (*int*) -

    返される entity の総数です。

    このパラメータを **param** 内の **offset** と組み合わせて使用すると、ページネーションを有効にできます。

    この値と **param** 内の **offset** の合計は 16,384 未満である必要があります。 

- **output_fields** (l*ist[str]*) -

    返される各 entity に含める field 名のリストです。

    デフォルト値は **None** です。指定しない場合は、primary field のみが含まれます。

- **search_params** (*dict*) -

    この操作固有のパラメータ設定です。

    - **params** (dict) -

        追加パラメータ

        - **radius** (float) -

            最小類似度のしきい値を決定します。collection の metric type が `L2` に設定されている場合、この値は **range_filter** の値より大きくする必要があります。それ以外の場合、この値は **range_filter** の値より小さくする必要があります。 

        - **range_filter**  (float) -  

            特定の類似度範囲内の vector に検索を絞り込みます。collection の metric type が `IP` または `COSINE` の場合、この値は **radius** の値より大きくする必要があります。それ以外の場合、この値は **radius** の値より小さくする必要があります。

        - **level** (*int*)

            Zilliz Cloud は、さまざまな index アルゴリズム固有の多数の検索パラメータを扱う代わりに、検索パラメータ調整を簡素化するために統一パラメータを使用します。

            デフォルト値は **1** で、**1** から **10** の範囲です。値を大きくすると再現率は高くなりますが、検索パフォーマンスは低下します。詳細については、[Tune Recall Rate](/docs/tune-recall-rate) を参照してください。

        - **page_retain_order** (*bool*) -

            `offset` が指定されている場合に、検索結果の順序を保持するかどうかです。 

            このパラメータは、`radius` も設定した場合にのみ適用されます。

    その他の適用可能な検索パラメータの詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **group_by_field** (*str*)

    指定された field で検索結果をグループ化し、多様性を確保して同じグループから複数の結果が返されるのを防ぎます。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトすることを示します。

- **partition_names** (*list*) -

    partition 名のリストです。

    デフォルト値は **None** です。指定した場合、指定された partition のみがクエリに使用されます。

- **anns_field** (*string*) -

    対象 vector field の名前です。対象 collection に vector field が 1 つしかない場合、このパラメータは省略可能です。

- **round_decimal** (*int*) -

    distance 値の小数点以下の桁数です。デフォルト値は -1 で、丸めを適用しないことを示します。

- **kwargs** -

    - **offset** (int) -

        検索結果でスキップするレコード数です。 

        このパラメータを `limit` と組み合わせて使用すると、ページネーションを有効にできます。

        この値と `limit` の合計は 16,384 未満である必要があります。 

    - **round_decimal** (int) -

        Zilliz Cloud が計算された distance を丸める小数点以下の桁数です。

        デフォルト値は **-1** で、Zilliz Cloud が計算された distance の丸めをスキップし、生の値を返すことを示します。

**RETURN TYPE:**

*SearchIterator*

**RETURNS:**
以下のメソッドを提供する **SearchIterator** インスタンスです。

- `next()`

    このメソッドは、entity のバッチを反復的に返します。呼び出すたびに、最後の entity が取得されるまで新しい entity のセットが返されます。

- `close()`

    このメソッドは、現在の **SearchIterator** インスタンスを閉じます。

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
    "metric_type": "IP",
    "params": {}
}

# Search with search iterator
iterator = client.search_iterator(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    batch_size=1000,
    output_fields=["vector", "color"],
    search_params=search_params
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

