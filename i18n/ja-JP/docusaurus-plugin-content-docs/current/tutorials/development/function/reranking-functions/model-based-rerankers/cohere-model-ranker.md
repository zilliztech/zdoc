---
title: "Cohere Ranker | Cloud"
slug: /cohere-model-ranker
sidebar_label: "Cohere Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Cohere Ranker は、Cohere の rerank モデルを活用して、取得された候補にセマンティック reranking を適用し、結果の並び順を改善します。 | Cloud"
type: origin
token: Mtxfwvu2fiOLwXkcURCcJxDPnLd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Cohere Ranker

Cohere Ranker は、取得された候補にセマンティック reranking を適用することで、結果の並び順を改善するために [Cohere の](https://cohere.com/) rerank モデルを活用します。

retrieval 関数や embedding 関数とは異なり、Cohere Ranker は **取得後のステップ** として実行されます。クエリとドキュメントテキストの間のセマンティックな関連性を評価し、それに応じて候補結果を並べ替えます。

Cohere Ranker は、特に次のような場合に役立ちます。

- 取得結果自体には関連性があるものの、並び順が最適ではない場合

- vector distance だけでなく、セマンティックな関連性がより重要な場合

- 多言語または長文テキストの reranking が必要な場合

## 始める前に\{#before-you-start}

Cohere Ranker を使用する前に、次の前提条件を満たしていることを確認してください。

- **rerank モデルを選択する**

    `rerank-english-v3.0` など、使用する Cohere rerank モデルを決定します。選択したモデルによって、reranking 中にどのようにセマンティックな関連性が評価されるかが決まります。詳細については、[Cohere 公式ドキュメント](https://docs.cohere.com/docs/models#rerank) を参照してください。

- **Cohere と統合し、integration ID を取得する**

    Cohere Ranker を使用するには、まず [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で Cohere を model provider として統合する必要があります。詳細な手順については、[Model Providers との統合](./integrate-with-model-providers) を参照してください。

- **rerank 可能なテキストフィールドを含む collection schema を計画する**

    rerank 対象のテキストを含む `VARCHAR` フィールドが collection に 1 つ含まれていることを確認してください。

## Cohere Ranker を使用する\{#use-cohere-ranker}

このセクションでは、取得された結果を rerank するために、検索時に Cohere Ranker を適用する方法を示します。

Cohere Ranker は検索時に定義して適用されるため、クエリごとに reranking を有効または無効にできます。

### 準備\{#preparations}

以下のセットアップでは、検索と reranking のための collection とサンプルデータを準備します。

<details>

<summary><strong>サンプルデータを含む collection を準備する</strong></summary>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "cohere_rerank_demo"

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

### rerank 関数を定義する\{#define-the-rerank-function}

Cohere Ranker は collection schema の一部としてではなく、**検索時に** 定義されます。

rerank 関数では、次の項目を指定します。

- どのテキストフィールド（`VARCHAR`）を rerank するか

- どの Cohere rerank モデルを使用するか

- 関連性評価の対象となるクエリテキストは何か

```python
from pymilvus import Function, FunctionType

cohere_ranker = Function(
    name="cohere_semantic_ranker",
    input_field_names=["document"],
    # highlight-next-line
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model",
        "provider": "cohere",
        "model_name": "rerank-english-v3.0",
        "queries": ["renewable energy developments"],

        "integration_id": "YOUR_INTEGRATION_ID",

    }
)
```

<Admonition type="info" icon="📘" title="注意">

`queries` 内の文字列数は、検索リクエストで発行されるクエリ数と一致している必要があります。

</Admonition>

### rerank 関数を使って検索する\{#search-with-the-rerank-function}

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    # highlight-next-line
    ranker=cohere_ranker,
)

print(results)
```

この検索では、次の処理が行われます。

1. Zilliz Cloud が vector search を使用して候補を取得します。

1. Cohere Ranker が各候補のセマンティックな関連性を評価します。

1. 結果セットは返される前に並べ替えられます。

## 次のステップ\{#next-steps}

Cohere Ranker は hybrid search と組み合わせて使用することもできます。

search と hybrid search は、同じ方法で ranker を適用します。

どちらの場合も、検索時に `ranker` パラメータを介して rerank 関数を渡します。

詳細については、[Multi-Vector Hybrid Search](./hybrid-search) を参照してください。

