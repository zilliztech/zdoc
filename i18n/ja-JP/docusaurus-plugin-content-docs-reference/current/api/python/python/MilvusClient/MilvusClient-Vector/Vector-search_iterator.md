---
title: "search_iterator() | Python | MilvusClient"
slug: /python/python/Vector-search_iterator
sidebar_label: "search_iterator()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションのスカラーフィルタリング式を使用して、反復的にベクトル類似検索を実行します。 | Python | MilvusClient"
type: docx
token: Z8WId53zDonHYuxckCDccOEcnjb
sidebar_position: 7
keywords: 
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - search_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search_iterator()

この操作は、オプションのスカラーフィルタリング式を使用して、反復的にベクトル類似検索を実行します。

## リクエスト構文\{#request-syntax}

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
    round_decimal: int = -1,
    *,
    external_filter_func: Optional[Callable[[Hits], Union[Hits, List[Hit]]]] = None,
    **kwargs,
) -> List[List[dict]]
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    既存のコレクションの名前です。

- **data** (*List[list], list]*) -

    **[必須]**

    ベクトル埋め込みのリストです。Milvus は、指定されたものに最も類似するベクトル埋め込みを検索します。

- **batch_size** (*int*) -

    各反復で返すエンティティの数です。既定値は 1000 です。

- **filter** (*str*) -

    一致するエンティティをフィルター処理するためのスカラーフィルタリング条件です。値の既定値は空の文字列で、条件が適用されないことを示します。スカラーフィルタリングをスキップするには、このパラメーターを空の文字列に設定できます。スカラーフィルタリング条件を作成するには、Boolean Expression Rules を参照してください。

- **limit** (*int*) -

    返すエンティティの総数です。この操作では offset パラメーターはサポートされていません。

- **output_fields** (*list[str]*) -

    返される各エンティティに含めるフィールド名のリストです。値の既定値は None です。指定しない場合、プライマリフィールドのみが含まれます。

- **search_params** (*dict*) -

    この操作に固有のパラメーター設定です。params（dict）: 追加のパラメーター。radius（float）: 類似度が最も低い閾値を決定します。コレクションのメトリクスタイプが L2 に設定されている場合は、この値が range_filter の値より大きくなるようにしてください。それ以外の場合は、この値が range_filter の値より小さくなるようにしてください。range_filter（float）: 検索を特定の類似度範囲内のベクトルに絞り込みます。コレクションのメトリクスタイプが IP または COSINE の場合は、この値が radius の値より大きくなるようにしてください。それ以外の場合は、この値が radius の値より小さくなるようにしてください。max_empty_result_buckets（int）: このパラメーターは、BIN_IVF_FLAT、IVF_FLAT、IVF_SQ8、IVF_PQ、SCANN を含む IVF シリーズのインデックスの範囲検索にのみ使用されます。値の既定値は 1 で、範囲は 1 から 65536 です。範囲検索中、有効な範囲検索結果がないバケットの数が指定値に達すると、検索プロセスは早期に終了します。このパラメーターを増やすと、範囲検索の再現率が向上します。ignore_growing（str）: このオプションを設定すると、検索から growing セグメントのデータを除外するように指示されます。この設定を利用すると、インデックス化され完全に処理されたデータのみに焦点を当てることで、検索パフォーマンスを向上できる可能性があります。その他の適用可能な検索パラメーターの詳細については、In-memory インデックス および On-disk Index を参照してください。

- **group_by_field** (*str*) -

    r o というオプションです。

- **timeout** (*float | None*) -

    この操作のタイムアウト期間です。None に設定すると、応答が到着するかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **partition_names** (*list*) -

    パーティション名のリストです。値の既定値は None です。指定した場合、指定したパーティションのみがクエリの対象になります。このパラメーターは Milvus Lite には適用されません。Milvus Lite の制限の詳細については、Run Milvus Lite を参照してください。

- **anns_field** (*string*) -

    対象のベクトルフィールドの名前です。対象のコレクションにベクトルフィールドが 1 つしかない場合、このパラメーターはオプションです。

- **round_decimal** (*int*) -

    距離値の小数点以下の桁数です。既定値は -1 で、丸めが適用されないことを示します。

- **external_filter_func** (*Callable*) -

    検索ヒットの各ページをフィルター処理するクライアント側のコールバックです。コールバックは、ページの Hits オブジェクトを受け取り、フィルター処理された Hits オブジェクトまたは Hit オブジェクトのリストを返します。この引数はキーワード専用であり、Search Iterator V2 でサポートされています。

- **kwargs** (*Any*) -

    検索操作に渡す追加のパラメーターです。

**戻り値の型:**

*SearchIterator*

**戻り値:**

次のメソッドを提供する SearchIterator インスタンスです。 - next() このメソッドは、エンティティのバッチを反復的に返します。呼び出すたびに、最後のエンティティが取得されるまで新しいエンティティのセットが返されます。 - close() このメソッドは、現在の SearchIterator インスタンスを閉じます。

**例外:**

- **MilvusException**

    この操作中にエラーが発生すると、この例外がスローされます。この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#examples}

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

# Search with output fields
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

<Admonition type="info" title="Notes">

外部コレクションはこの操作をサポートしていません。

</Admonition>

