---
title: "Hugging Face Ranker | Cloud"
slug: /hugging-face-ranker
sidebar_label: "Hugging Face Ranker"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル検索はベクトル距離で結果を並べますが、初期の順序は各候補のテキストがクエリにどれだけ適切に答えているかを反映しない場合があります。Hugging Face model provider integration を使用すると、Hugging Face Ranker は Hugging Face の sentence-similarity タスクのスコアを使用して、ベクトル検索で返された候補を再順位付けします。 | Cloud"
type: origin
token: P4UywHFH2iDFJWk2kwwcs22SnRc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Hugging Face Ranker

ベクトル検索はベクトル距離で結果を並べますが、初期の順序は各候補のテキストがクエリにどれだけ適切に答えているかを反映しない場合があります。[Hugging Face model provider integration](./integrate-with-model-providers) を使用すると、Hugging Face Ranker は Hugging Face の sentence-similarity タスクのスコアを使用して、ベクトル検索で返された候補を再順位付けします。

## 仕組み\{#how-it-works}

Hugging Face Ranker は、ベクトル検索後に候補エンティティを再順位付けします。次の図は、アプリケーション、Zilliz Cloud、Hugging Face 間の一般的なワークフローを示しています。

![KDOBw9YpBhRHkJbwjL3cmZfWnvf](https://zdoc-images.s3.us-west-2.amazonaws.com/KDOBw9YpBhRHkJbwjL3cmZfWnvf.png)

一般的なワークフローは 4 つのステップで構成されます。

1. **候補エンティティを取得します。** Zilliz Cloud は設定されたベクトルフィールドに対してベクトル検索を実行し、候補エンティティを返します。

1. **再順位付け用のテキストを準備します。** Ranker は、`params.queries` からクエリテキストを読み取り、`input_field_names` で指定された null 不可の `VARCHAR` フィールドから候補テキストを読み取ります。

1. **再順位付けスコアをリクエストします。** Zilliz Cloud はクエリと候補テキストを Hugging Face に送信し、各候補に対して新たに計算された類似度スコアを受け取ります。

1. **再順位付けして結果を返します。** Zilliz Cloud はスコアを候補エンティティにマッピングし、スコアの高い順に並べて、再順位付けされた結果を返します。

**再順位付けスコアの計算方法**

上記の一般的なワークフローは、再順位付けがどこで行われるかを示しています。次のプロセスでは、Hugging Face が各候補に対して新しい類似度スコアをどのように計算するかを説明します。

![L1jQwyef6hP51bb9EYjc6pV6nTd](https://zdoc-images.s3.us-west-2.amazonaws.com/L1jQwyef6hP51bb9EYjc6pV6nTd.png)

1. **テキスト入力を準備します。** Ranker は、`params.queries` からクエリテキストを読み取り、`input_field_names` で指定された `VARCHAR` フィールドから空でない候補テキストを読み取ります。

1. **embedding を作成します。** Zilliz Cloud は、クエリテキストを `source_sentence` として、候補テキストを `sentences` として、[Sentence Similarity](https://huggingface.co/docs/huggingface_hub/package_reference/inference_client#huggingface_hub.InferenceClient.sentence_similarity) タスク向けに `hf-inference` を通じて Hugging Face に送信します。モデルは概念的に、クエリ embedding と候補テキストごとの個別の embedding を作成します。

1. **スコアを計算して返します。** モデルはクエリ embedding を各候補 embedding と比較し、候補ごとに 1 つの類似度スコアを返します。

図に示されている embedding はモデル内部の中間処理であり、Hugging Face API が返すのは類似度スコアのみです。ベクトル検索と再順位付けでは、別々の表現とスコアが使用されます。Hugging Face Ranker は候補ベクトルや検索スコアを再利用しません。検索ベクトルの作成に使用する embedding モデルと、再順位付けに使用する Hugging Face モデルは独立しており、異なっていても構いません。

事前計算済みベクトルを挿入する場合は、Hugging Face Ranker が再順位付け時に読み取れるよう、元の候補テキストも `VARCHAR` フィールドに保存してください。

## 始める前に\{#before-you-start}

Hugging Face Ranker を使用する前に、以下を確認してください。

<Admonition type="info" icon="📘" title="注記">

Zilliz Cloud は [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) を通じて Hugging Face に接続し、Hugging Face Ranker には [`sentence-similarity`](https://huggingface.co/tasks/sentence-similarity) タスクを使用します。特定のモデルが現在 `hf-inference` で提供されているかどうか、引き続き利用可能かどうか、あるいは安定性、レイテンシ、出力品質に関する要件を満たすかどうかは、Zilliz Cloud では制御できません。本番環境で使用する前に、選択したモデルを Hugging Face 上で確認し、ワークロードに対して評価してください。

</Admonition>

- Hugging Face model provider integration を作成し、その integration ID をコピーします。手順については、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

- モデルの Hugging Face ページを開き、**Inference Providers** セクションを確認します。`hf-inference` が現在そのモデルを `sentence-similarity` タスク用に提供していることを確認してください。

- collection に候補テキストが null 不可の `VARCHAR` フィールドとして保存されていることを確認します。rerank function は `input_field_names` でそのようなフィールドをちょうど 1 つ参照する必要があります。collection には他のテキストフィールドを含めることもできます。

## Hugging Face Ranker を使用する\{#use-hugging-face-ranker}

Hugging Face Ranker は検索時に定義して適用します。collection schema を変更せずに、検索リクエストごとに ranker を有効化、無効化、または変更できます。

### 準備\{#preparations}

次のセットアップでは、3 つのフィールドを持つ collection を作成します。`id` は主キー、`document` は再順位付けに使用する候補テキストを保存する `VARCHAR` フィールド、`dense` は初期検索に使用するベクトルフィールドです。また、検索および再順位付けの例のためのサンプルデータも挿入します。

<details>

<summary>**サンプルデータを含む collection を準備する**</summary>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "hugging_face_rerank_demo"

schema = client.create_schema()

schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=1000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=4)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params,
)

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

client.insert(collection_name=collection_name, data=data)
```

</details>

### rerank function を定義する\{#define-the-rerank-function}

ベクトル検索で返された候補を、`document` に保存されたテキストを使って再順位付けする `RERANK` function を定義します。この function では、クエリテキスト、Hugging Face モデル、および model provider integration も指定します。

```python
from pymilvus import Function, FunctionType

hugging_face_ranker = Function(
    name="hugging_face_semantic_ranker",
    # Use the text stored in the "document" VARCHAR field for reranking.
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    # highlight-start
    params={
        "reranker": "model",
        "provider": "huggingface",
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "queries": ["renewable energy developments"],
        "integration_id": "YOUR_INTEGRATION_ID",
        "max_client_batch_size": 32,
    },
    # highlight-end
)
```

この例では、設定方法を示すためだけに `sentence-transformers/all-MiniLM-L6-v2` を使用しています。このモデルは Zilliz Cloud による推奨や認定を意味するものではありません。

次の表は、Hugging Face Ranker の `params` にある、ユーザーが設定可能なすべての項目を説明しています。

| Parameter | Required | Description |
| --- | --- | --- |
| `reranker` | Yes | 再順位付けの実装です。この値は `model` に設定します。 |
| `provider` | Yes | Zilliz Cloud model provider です。この値は `huggingface` に設定します。 |
| `model_name` | Yes | `sentence-similarity` タスク用に `hf-inference` を通じて現在提供されているモデルの Hugging Face Model ID です。 |
| `queries` | Yes | 再順位付けに使用するクエリテキストのリストです。初期検索でクエリベクトルを使用する場合でも、各検索クエリ (`nq`) に対して 1 つの文字列を指定してください。 |
| `integration_id` | Yes | Hugging Face model provider integration の ID です。手順については、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。 |
| `max_client_batch_size` | No | 1 回のリクエストで Hugging Face に送信する候補テキストの最大数です。デフォルト値は `32` です。値は `0` より大きい必要があります。 |

function 定義に Hugging Face の認証情報を含めないでください。

### rerank function で検索する\{#search-with-the-rerank-function}

`ranker` パラメータを通じて function を `search()` に渡します。

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    # highlight-next-line
    ranker=hugging_face_ranker,
)

print(results)
```

検索では、まず `dense` ベクトルフィールドから候補エンティティを取得します。次に Hugging Face Ranker は、`queries` 内のクエリテキストと各候補の `document` テキストを使用して、sentence-similarity タスクを通じて類似度スコアを計算します。Zilliz Cloud は、スコアの高い順に候補を返します。

## トラブルシューティング\{#troubleshooting}

### モデルが sentence-similarity タスクで利用できません\{#the-model-is-unavailable-for-the-sentence-similarity-task}

Hugging Face のモデルページを開き、**Inference Providers** セクションを確認してください。`hf-inference` が現在そのモデルを提供しており、そのモデルが `sentence-similarity` をサポートしていることを確認します。いずれかの要件を満たしていない場合は、別のモデルを選択し、そのモデルページで確認してください。Zilliz Cloud は Hugging Face モデル向けのサポート対象モデルカタログを管理していません。

### クエリテキストの数が検索リクエストと一致しません\{#the-number-of-query-texts-does-not-match-the-search-request}

`queries` 内の文字列数は、検索クエリ数 (`nq`) と等しくなければなりません。1 つのクエリベクトルで検索する場合は、クエリ文字列をちょうど 1 つ指定してください。

## 次のステップ\{#next-steps}

Hugging Face Ranker はハイブリッド検索でも使用できます。検索とハイブリッド検索では、同じ方法で ranker を適用します。つまり、検索時に `ranker` パラメータを通じて rerank function を渡します。

詳細については、[Multi-Vector Hybrid Search](./hybrid-search) を参照してください。
