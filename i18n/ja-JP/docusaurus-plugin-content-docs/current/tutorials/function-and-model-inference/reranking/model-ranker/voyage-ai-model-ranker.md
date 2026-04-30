---
title: "Voyage AI Ranker | Cloud"
slug: /voyage-ai-model-ranker
sidebar_key: voyage-ai-model-ranker
sidebar_label: "Voyage AI Ranker"
beta: FALSE
notebook: FALSE
description: "Voyage AI Ranker は、Voyage AI の機能を活用して検索アプリケーションの精度を向上させます。| Cloud"
type: origin
token: PpGlwYU6PiSsfVkZ7doco50vnKg
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - 検索結果の再ランキング
  - 結果の再ランキング
  - 再ランキングモデル
  - モデルランカー
  - voyage ai

---

import Admonition from '@theme/Admonition';


# Voyage AI Ranker

Voyage AI Ranker は、[Voyage AI](https://www.voyageai.com/) の専用リランカーを活用し、セマンティックリランキングを通じて検索関連性を向上させます。これは、検索拡張生成（RAG）および検索アプリケーション向けに最適化された高性能なリランキング機能を提供します。

Voyage AI Ranker は、以下の要件を持つアプリケーションにとって特に有用です。

- リランキングタスクに特化してトレーニングされたモデルによる高度なセマンティック理解

- 本番ワークロード向けに最適化された推論による高性能処理

- 多様な文書長に対応する柔軟な切り捨て制御

- 複数のモデルバリアント（rerank-2、rerank-lite など）にわたる微調整されたパフォーマンス

## Before you start\{#before-you-start}

Voyage AI Ranker を使用する前に、以下の前提条件を満たしていることを確認してください。

- **リランクモデルを選択**

    使用する Cohere リランクモデル（例: `rerank-2.5`）を決定します。この選択により、リランキング時のセマンティック関連性の評価方法が決まります。詳細については、[Voyage AI 公式ドキュメント](https://docs.voyageai.com/docs/reranker) を参照してください。

- **Voyage AI と統合し、統合IDを取得**

    Voyage AI Ranker を使用するには、まず [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で Voyage AI をモデルプロバイダーとして統合する必要があります。

    統合後、Zilliz Cloud は**統合ID**を生成します。この ID は、リランキング関数を定義する際に参照します。手順の詳細については、[モデルプロバイダーとの統合](./integrate-with-model-providers) を参照してください。

- **リランキング可能なテキストフィールドを含むコレクションスキーマを計画**

    コレクションに、リランキング対象のテキストを含む `VARCHAR` フィールドが1つ含まれていることを確認してください。

## Use Voyage AI Ranker\{#use-voyage-ai-ranker}

このセクションでは、検索時に Voyage AI Ranker を適用して取得結果をリランキングする方法を示します。

リランキング関数は検索時に定義・適用されるため、クエリごとにリランキング機能を有効化、無効化、または変更できます。

### Preparations\{#preparations}

以下の準備手順により、検索およびリランキング用のコレクションとサンプルデータをセットアップします。

<details>

<summary><strong>サンプルデータ付きコレクションを準備</strong></summary>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "voyage_rerank_demo"

# Define collection schema
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=1000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=4)

# Configure index
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

# Create collection
client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params
)

# Insert sample data
data = [
    {
        "id": 1,
        "document": "Recent renewable energy developments include improved solar efficiency.",
        "dense": [0.10, 0.20, 0.30, 0.40],
    },
    {
        "id": 2,
        "document": "Climate policy and carbon markets have evolved rapidly in recent years.",
        "dense": [0.11, 0.19, 0.28, 0.39],
    },
    {
        "id": 3,
        "document": "New battery technology helps stabilize wind and solar power generation.",
        "dense": [0.90, 0.10, 0.05, 0.02],
    },
    {
        "id": 4,
        "document": "Vector databases support similarity search for machine learning applications.",
        "dense": [0.01, 0.02, 0.03, 0.04],
    },
]

client.insert(collection_name, data)
```

</details>

### リランク関数の定義\{#define-the-rerank-function}

Voyage AI Ranker は、コレクションスキーマの一部としてではなく、**検索時**に定義されます。

リランク関数では、以下の内容を指定します：

- リランク対象のテキストフィールド（`VARCHAR`）

- 使用する Voyage AI モデル

- クエリおよびドキュメントの切り捨て方法または検証方法

```python
from pymilvus import Function, FunctionType

voyage_ranker = Function(
    name="voyage_semantic_ranker",
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model",
        "provider": "voyageai",
        "model_name": "rerank-2.5",
        "queries": ["renewable energy developments"],
        "truncation": True,

        "integration_id": "YOUR_INTEGRATION_ID",

    }
)
```

<Admonition type="info" icon="📘" title="Notes">

<p><code>queries</code> 内の文字列の数は、検索リクエストで発行されたクエリの数と一致している必要があります。</p>

</Admonition>

### rerank 機能を使用した検索\{#search-with-the-rerank-function}

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    # highlight-next-line
    ranker=voyage_ranker,
)

print(results)
```

この検索では、以下の手順が実行されます。

1. ベクトル検索を用いて候補が取得されます。

1. Voyage AI Ranker が各候補のセマンティックな関連性を評価します。

1. 結果セットは返される前に並べ替えられます。

## 次のステップ\{#next-steps}

Voyage AI Ranker はハイブリッド検索でも使用できます。

通常の検索とハイブリッド検索の両方で、ランカーの適用方法は同じです。

どちらの場合も、検索時に `ranker` パラメータ経由で rerank 関数を渡します。

詳細については、[マルチベクターハイブリッド検索](./hybrid-search) を参照してください。