---
title: "Voyage AI Ranker | Cloud"
slug: /voyage-ai-model-ranker
sidebar_label: "Voyage AI Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Voyage AI Ranker leverages Voyage AI's and search applications. | Cloud"
type: origin
token: PpGlwYU6PiSsfVkZ7doco50vnKg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Voyage AI Ranker

Voyage AI Ranker は、[Voyage AI](https://www.voyageai.com/) の特化型 reranker を活用して、セマンティック reranking により検索関連性を向上させます。RAG（retrieval-augmented generation）および検索アプリケーション向けに最適化された高性能な reranking 機能を提供します。

Voyage AI Ranker は、特に次のような要件があるアプリケーションで有用です。

- reranking タスク向けに特別にトレーニングされたモデルによる高度なセマンティック理解

- 本番ワークロード向けに最適化された推論による高性能処理

- さまざまなドキュメント長に対応する柔軟な truncation 制御

- 異なるモデルバリアント（rerank-2、rerank-lite など）にわたるチューニング済みのパフォーマンス

## Before you start\{#before-you-start}

Voyage AI Ranker を使用する前に、次の前提条件を満たしていることを確認してください。

- **rerank モデルを選択する**

    `rerank-2.5` など、使用する Cohere rerank モデルを決定します。選択したモデルにより、reranking 中にセマンティック関連性がどのように評価されるかが決まります。詳細については、[Voyage AI 公式ドキュメント](https://docs.voyageai.com/docs/reranker) を参照してください。

- **Voyage AI と統合し、integration ID を取得する**

    Voyage AI Ranker を使用するには、まず [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でモデルプロバイダーとして Voyage AI を統合する必要があります。

    統合後、Zilliz Cloud により **integration ID** が生成されます。この ID は rerank function を定義する際に参照します。詳細な手順については、[モデルプロバイダーとの統合](./integrate-with-model-providers) を参照してください。

- **rerank 可能なテキスト field を含む collection スキーマを計画する**

    collection に、rerank 対象のテキストを含む `VARCHAR` field が 1 つ含まれていることを確認してください。

## Use Voyage AI Ranker\{#use-voyage-ai-ranker}

このセクションでは、検索時に Voyage AI Ranker を適用して取得結果を rerank する方法を示します。

rerank function は検索時に定義および適用されるため、クエリごとに reranking の動作を有効化、無効化、または変更できます。

### Preparations\{#preparations}

以下のセットアップでは、検索と reranking のための collection とサンプルデータを準備します。

<details>

<summary><strong>サンプルデータを含む collection を準備する</strong></summary>

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

### Define the rerank function\{#define-the-rerank-function}

Voyage AI Ranker は、collection スキーマの一部としてではなく、**検索時に**定義されます。

rerank function では、次の内容を指定します。

- rerank するテキスト field（`VARCHAR`）

- 使用する Voyage AI モデル

- クエリとドキュメントをどのように truncation または検証するか

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

<Admonition type="info" icon="📘" title="注意">

`queries` 内の文字列数は、検索リクエストで発行されるクエリ数と一致している必要があります。

</Admonition>

### Search with the rerank function\{#search-with-the-rerank-function}

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

この検索では、次の処理が行われます。

1. vector search を使用して候補が取得されます。

1. Voyage AI Ranker が各候補のセマンティック関連性を評価します。

1. 結果セットは返される前に並べ替えられます。

## Next steps\{#next-steps}

Voyage AI Ranker は hybrid search でも使用できます。

検索と hybrid search では、同じ方法で ranker を適用します。

どちらの場合も、検索時に `ranker` パラメータを介して rerank function を渡します。

詳細については、[マルチベクトル hybrid search](./hybrid-search) を参照してください。
