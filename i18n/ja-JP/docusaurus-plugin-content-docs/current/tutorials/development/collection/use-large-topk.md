---
title: "Large TopK を使用する | Cloud"
slug: /use-large-topk
sidebar_label: "Large TopK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の collection では、検索またはクエリ結果で最大 16,384 件の entity を取得できます。topK の上限を超えてさらに多くの entity を取得するには、複雑で時間のかかる iterator を使用する代わりに、1 回の検索またはクエリ結果に数百万件の entity を含められるように query mode を設定できます。 | Cloud"
type: origin
token: RH6MwFlaCig6LRkR6Qec206OnUc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Large TopK を使用する

Zilliz Cloud の collection では、検索またはクエリ結果で最大 16,384 件の entity を取得できます。topK の上限を超えてさらに多くの entity を取得するには、複雑で時間のかかる iterator を使用する代わりに、1 回の検索またはクエリ結果に数百万件の entity を含められるように query mode を設定できます。

<Admonition type="info" icon="📘" title="注意">

この機能は、Milvus v2.6.x と互換性のある Zilliz Cloud cluster で利用できます。この機能を試してみたい場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</Admonition>

## 概要\{#overview}

デフォルトでは、Zilliz Cloud の collection は検索またはクエリ操作において最大 **16,384** の topK をサポートします。バッチ類似検索やデータマイニングのように、1 回のリクエストでより多くの entity を取得する必要がある場合は、collection の `query_mode` プロパティを `large_topk` に設定することで、**Large TopK** モードを有効にできます。これにより、topK の上限が **1,000,000**（100 万）entity に引き上げられます。

Large TopK を有効にすると、基盤となる index 戦略はデフォルトの Auto Index から、**IVF (Inverted File Index)** と **RaBitQ** の深い圧縮を組み合わせたものに変更されます。これは、高い再現率で広範囲の取得を最適化する一方で、小さな K のクエリ性能を犠牲にします。

## Large TopK を使用すべき場合\{#when-to-use-large-topk}

Large TopK は、1 回の検索で非常に多くの類似 entity を取得する必要があるシナリオ向けに設計されています。たとえば次のような場合です。

- **バッチ類似検索**: 指定した query vector に対して、最も類似する上位 100,000 件または 1,000,000 件のアイテムを見つける。

- **データマイニングと分析**: 後続の処理、フィルタリング、またはモデル学習のために、大きな候補集合を抽出する。

- **回帰テスト準備**: シミュレーションチーム向けのテストコーパスを構築するために、大規模な結果セットを取得する。

小さな topK（例: top 10 または top 100）で対話的かつレイテンシに敏感なオンラインクエリには、デフォルトの query mode を推奨します。

## 前提条件とトレードオフ\{#prerequisites-and-trade-offs}

Large TopK を有効にする前に、次のトレードオフを理解しておいてください。

- **小さな K の性能低下**: `large_topk` に切り替えた後は、小さな K のクエリ（K < 16,384）で、デフォルトモードと比べてレイテンシが増加し、再現率が低下します。

- **クエリレイテンシ**: Large TopK クエリは標準クエリよりも大幅に高いレイテンシになります。topK が 100,000 の場合は数秒、topK が 1,000,000 の場合は数分かかることがあります。

- **リソース使用量**: 単一の大規模 TopK クエリでも、結果のソートのために数 GB のメモリを消費することがあります。Perf cluster では、同じ cluster 上で実行中の他のクエリに影響する可能性があります。

- **オフライン用途の推奨**: バッチワークロードでは、On-demand Compute database の利用を検討してください。database はオンデマンド CUs を使用するため、オンラインサービスに影響しません。

- **index の再構築が必要**: collection にすでに vector index がある場合、Large TopK を有効にする前に既存の index を release および drop する必要があります。再構築中は検索を利用できません。

## Large TopK を有効にする\{#enable-large-topk}

### collection 作成時（推奨）\{#during-collection-creation-recommended}

collection で Large TopK が必要になることがわかっている場合は、後から切り替えるコストを避けるため、作成時に指定してください。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")

client.create_collection(
    collection_name="scenarios_corpus",
    schema=schema,
    index_params=index_params,
    properties={"query_mode": "large_topk"}
)
```

### 既存の collection で有効化する\{#on-an-existing-collection}

vector index のない既存の collection では、直接 Large TopK を有効にできます。

```python
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)
```

vector index が**ある**既存の collection では、まず index を drop し、その後モードを有効にして、最後に index を再作成する必要があります。

```python
# 1. Release and drop the existing index
client.release_collection(collection_name="scenarios_corpus")
client.drop_index(collection_name="scenarios_corpus", index_name="vector_idx")

# 2. Enable Large TopK
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)

# 3. Recreate the index (will use IVF + RaBitQ automatically)
client.create_index(
    collection_name="scenarios_corpus",
    index_params=index_params
)
client.load_collection(collection_name="scenarios_corpus")
```

### 現在の query mode を確認する\{#check-current-query-mode}

```python
info = client.describe_collection(collection_name="scenarios_corpus")
query_mode = info["properties"].get("query_mode")  # None means default mode
```

### Large TopK を無効にする\{#disable-large-topk}

デフォルトの query mode に戻すには、`query_mode` プロパティを削除します。なお、この場合も最初に既存の index を release および drop する必要があります。

```python
client.drop_collection_properties(
    collection_name="scenarios_corpus",
    property_keys=["query_mode"]
)
```

## Large TopK 検索を実行する\{#perform-a-large-topk-search}

Large TopK を有効にしたら、標準の `search` メソッドを大きな `limit` 値とともに使用します。

### オンライン検索（Serving Cluster）\{#online-search-serving-cluster}

```python
results = client.search(
    collection_name="scenarios_serving",
    data=[query_vector],
    limit=500000
)
```

### オフライン検索（On-demand Compute）\{#offline-search-on-demand-compute}

```python
results = client.search(
    collection_name="scenarios_corpus",
    data=[query_vector],
    limit=500000
)
```

## 検索結果をエクスポートする\{#export-search-results}

Large TopK の結果専用の export API はありません。既存の機能を組み合わせて、結果を Managed Volume に書き込むことができます。

```python
import pyarrow as pa
import pyarrow.parquet as pq

writer = None
try:
    for i, qvec in enumerate(query_vectors):
        results = client.search(
            collection_name="corpus",
            data=[qvec],
            limit=100000,
            output_fields=["scenario_id", "title"]
        )

        table = pa.Table.from_pylist([
            {"query_id": i, "rank": j, **r}
            for j, r in enumerate(results)
        ])

        if writer is None:
            writer = pq.ParquetWriter("/tmp/results.parquet", table.schema)
        writer.write_table(table)
finally:
    if writer is not None:
        writer.close()

volume_file_manager.upload_file_to_volume(
    source_file_path="/tmp/results.parquet",
    target_volume_path="results/batch.parquet"
)
```

## 想定されるパフォーマンス\{#performance-expectations}

次の表は、Large TopK クエリのパフォーマンス特性をまとめたものです。

| Metric | デフォルトモード | Large TopK モード |
| --- | --- | --- |
| TopK 上限 | 16,384 | 1,000,000 |
| 小さな K のレイテンシ | ミリ秒 | 高い（低下） |
| 大きな K のレイテンシ | サポートされない | 数秒～数分 |
| クエリごとのメモリ | 低い | 最大数 GB |
| 同時実行性 | 高い | 制限あり（キューイング） |
| 最適な用途 | オンライン対話 | バッチ、データマイニング |

Zilliz Cloud は、リソース枯渇を防ぐために Large TopK クエリに同時実行制御を適用します。同時実行上限を超えたリクエストはキューに入れられ、リソースが利用可能になると処理されます。

## 制限事項\{#limitations}

- query mode の切り替えには vector index の再構築が必要です。再構築中、その collection では検索を利用できません。

- Large TopK は collection レベルの設定です。collection 上のすべての index が影響を受けます。

- 3 種類の cluster タイプ（Performance-optimized、Capacity-optimized、Tiered Storage）はいずれも Large TopK をサポートします。

## FAQ\{#faq}

**Q: 頻繁に切り替えることはできますか？**

技術的には可能ですが、推奨されません。切り替えのたびに index の release、drop、再作成が必要であり、その間は検索を利用できません。オンデマンド cluster では、再構築のたびに Index Build CU の料金も発生します。
