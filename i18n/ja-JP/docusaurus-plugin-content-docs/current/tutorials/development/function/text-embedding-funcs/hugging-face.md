---
title: "Hugging Face | Cloud"
slug: /hugging-face
sidebar_label: "Hugging Face"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "通常、Hugging Face 埋め込みモデルを使用するには、アプリケーション側で認証情報を管理し、モデルを個別に呼び出し、挿入データと検索クエリの両方に対して一貫して埋め込みを生成する必要があります。Hugging Face モデルプロバイダー統合と Text Embedding Function を使用すると、Zilliz Cloud は挿入時および検索時に生テキストをベクトルに変換します。 | Cloud"
type: origin
token: ETsNwO7T0iR5GDkvuMxcJG7JnIb
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Hugging Face

通常、Hugging Face 埋め込みモデルを使用するには、アプリケーション側で認証情報を管理し、モデルを個別に呼び出し、挿入データと検索クエリの両方に対して一貫して埋め込みを生成する必要があります。[Hugging Face モデルプロバイダー統合](./integrate-with-model-providers) と Text Embedding Function を使用すると、Zilliz Cloud は挿入時および検索時に生テキストをベクトルに変換します。

## 仕組み\{#how-it-works}

![XCxpwN8JvhevN8bAvbzcI72Fngg](https://zdoc-images.s3.us-west-2.amazonaws.com/XCxpwN8JvhevN8bAvbzcI72Fngg.png)

ワークフローは 3 つのステップで構成されます。

1. **生テキストを送信します。** アプリケーションは、挿入または検索リクエストで生テキストを提供します。

1. **埋め込みを生成します。** Text Embedding Function は `integration_id` を使用して Hugging Face モデルプロバイダー統合を参照し、`model_name` でモデルを選択します。Zilliz Cloud は [Feature Extraction](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction) タスクのために `hf-inference` を通じてテキストを Hugging Face に送信します。

1. **埋め込みを使用します。** Hugging Face は浮動小数点の埋め込みベクトルを返します。挿入時には、Zilliz Cloud はそのベクトルを Function の出力フィールドに保存します。検索時には、Zilliz Cloud はそのベクトルをクエリベクトルとして使用します。

同じ Function 設定が挿入と検索の両方に使用されるため、両方の操作でモデルと推論パラメータの一貫性が保たれます。

## モデル互換性\{#model-compatibility}

Text Embedding Function で Hugging Face モデルを使用するには、そのモデルが [Feature Extraction](https://huggingface.co/docs/inference-providers/tasks/feature-extraction#api-specification) 機能を持ち、設定された [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) 統合を通じて正常に埋め込みを返せる必要があります。Function の出力フィールドは、`dim` がモデルの埋め込み次元と一致する `FLOAT_VECTOR` フィールドである必要があります。

以下のモデルは、記載の日付時点で Zilliz Cloud との互換性テストに合格しています。

| Model | Capability | Dimension | Last tested |
| --- | --- | --- | --- |
| [`BAAI/bge-m3`](https://huggingface.co/BAAI/bge-m3) | Feature Extraction | 1024 | 2026-07-27 |
| [`BAAI/bge-large-zh-v1.5`](https://huggingface.co/BAAI/bge-large-zh-v1.5) | Feature Extraction | 1024 | 2026-07-27 |
| [`BAAI/bge-large-en-v1.5`](https://huggingface.co/BAAI/bge-large-en-v1.5) | Feature Extraction | 1024 | 2026-07-27 |
| [`BAAI/bge-small-en-v1.5`](https://huggingface.co/BAAI/bge-small-en-v1.5) | Feature Extraction | 384 | 2026-07-27 |
| [`dragonkue/snowflake-arctic-embed-l-v2.0-ko`](https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko) | Feature Extraction | 1024 | 2026-07-27 |
| [`upskyy/bge-m3-korean`](https://huggingface.co/upskyy/bge-m3-korean) | Feature Extraction | 1024 | 2026-07-27 |

<Admonition type="info" icon="📘" title="注意">

この表は互換性のあるモデルの完全な一覧ではありません。ここに記載されていないモデルでも、統合と互換性がある可能性があります。

互換性の結果は、記載日時点でのテスト結果を反映しています。Zilliz Cloud は、あるモデルが [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) を通じて引き続き利用可能であること、または安定性、レイテンシ、出力品質に関する要件を満たすことを管理していません。Zilliz Cloud は、過去の結果を定期的に再テストすることを約束するものではありません。本番環境で使用する前に、選択したモデルを Hugging Face 上で確認し、ワークロードに対して評価してください。

</Admonition>

## 始める前に\{#before-you-start}

Hugging Face テキスト埋め込みを使用する前に、以下を行ってください。

- Hugging Face モデルプロバイダー統合を作成し、その統合 ID をコピーします。**Provider** を `hf-inference` に設定します。手順については、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

- モデルの Hugging Face ページを開き、**Inference Providers** セクションを確認します。`hf-inference` が現在そのモデルを `feature-extraction` タスク向けに提供していることを確認してください。

- モデルの出力次元を確認します。Function の出力フィールドは、`dim` がモデルの出力と一致する `FLOAT_VECTOR` フィールドである必要があります。カスタム出力次元はサポートされていません。

以下の例では `BAAI/bge-small-en-v1.5` を使用します。これは執筆時点で `hf-inference` を通じて 384 次元の埋め込みを生成します。このモデルは設定方法を示すためにのみ使用しており、Zilliz Cloud による推奨や認定を意味するものではありません。

## Hugging Face テキスト埋め込みを使用する\{#use-hugging-face-text-embedding}

### ステップ 1: テキスト埋め込み関数を含むコレクションを作成する\{#step-1-create-a-collection-with-a-text-embedding-function}

#### スキーマフィールドを定義する\{#define-schema-fields}

以下を含むコレクションスキーマを作成します。

- 各エンティティを一意に識別するプライマリフィールド。

- 生テキストを格納する `VARCHAR` フィールド。

- 選択したモデルの出力次元に一致する次元を持つ `FLOAT_VECTOR` フィールド。

以下の例では `BAAI/bge-small-en-v1.5` を使用します。これは 384 次元ベクトルを生成します。

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

schema = client.create_schema()

schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=False,
)

schema.add_field(
    field_name="document",
    datatype=DataType.VARCHAR,
    max_length=9000
,
)

# The vector dimension must match the model's output dimension.
schema.add_field(
    field_name="dense",
    datatype=DataType.FLOAT_VECTOR,
    # highlight-next-line
    dim=384,
)
```

#### テキスト埋め込み関数を定義する\{#define-the-text-embedding-function}

`document` フィールドの値を埋め込みに変換し、それを `dense` フィールドに書き込む `TEXTEMBEDDING` Function を定義します。

```python
text_embedding_function = Function(
    name="hugging_face_embedding",
    input_field_names=["document"],
    output_field_names=["dense"],
    function_type=FunctionType.TEXTEMBEDDING,
    # highlight-start
    params={
        "provider": "huggingface",
        "model_name": "BAAI/bge-small-en-v1.5",
        "integration_id": "YOUR_INTEGRATION_ID",
        "normalize": "true",
        "truncate": "true",
    },
    # highlight-end
)

schema.add_function(text_embedding_function)
```

次の表は、`params` でサポートされているすべての項目を説明しています。Hugging Face のリクエストオプションは [Feature Extraction API specification](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction#api-specification) に従います。`provider`、`model_name`、`integration_id`、`max_client_batch_size` は Zilliz Cloud 統合を構成します。

| Parameter | Required | Description |
| --- | --- | --- |
| `provider` | Yes | Zilliz Cloud モデルプロバイダーです。この値は `huggingface` に設定します。 |
| `model_name` | Yes | 現在 `feature-extraction` タスク用に `hf-inference` を通じて提供されているモデルの Hugging Face モデル ID。 |
| `integration_id` | Yes | Hugging Face モデルプロバイダー統合の ID。手順については、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。 |
| `normalize` | No | 正規化された埋め込みをリクエストするかどうか。省略した場合、Zilliz Cloud は Hugging Face リクエストにこのオプションを設定せず、動作は選択したモデルに従います。 |
| `prompt_name` | No | 選択したモデルの Sentence Transformers 設定で定義されたプロンプトの名前。Hugging Face はエンコード前に対応するプロンプトテキストを先頭に追加します。省略した場合、プロンプトはリクエストされません。 |
| `truncate` | No | 入力がモデルのサポートする長さを超えた場合に切り詰めをリクエストするかどうか。省略した場合、Zilliz Cloud は Hugging Face リクエストにこのオプションを設定せず、動作は選択したモデルに従います。 |
| `truncation_direction` | No | Hugging Face が入力を切り詰める方向。サポートされる値は `left` と `right` です。 |
| `max_client_batch_size` | No | 1 回のリクエストで Hugging Face に送信する入力テキストの最大数。デフォルト値は `128` です。値は `0` より大きい必要があります。 |

#### インデックスを設定する\{#configure-the-index}

出力ベクトルフィールド用のインデックスを設定します。以下の例では `AUTOINDEX` とコサイン類似度を使用します。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)
```

#### コレクションを作成する\{#create-the-collection}

スキーマとインデックスパラメータを使用してコレクションを作成します。

```python
client.create_collection(
    collection_name="hugging_face_demo",
    schema=schema,
    index_params=index_params,
)
```

このコレクションは、384 次元ベクトルを `dense` フィールドに書き込むテキスト埋め込み関数を備えた状態で作成されます。

### ステップ 2: データを挿入する\{#step-2-insert-data}

ベクトルを指定せずに生テキストを挿入します。Zilliz Cloud が Hugging Face モデルを呼び出し、生成された埋め込みを `dense` フィールドに書き込みます。

```python
client.insert(
    collection_name="hugging_face_demo",
    data=[
        {
            "id": 1,
            "document": "Milvus simplifies semantic search through embeddings.",
        },
        {
            "id": 2,
            "document": "Vector embeddings convert text into searchable numeric data.",
        },
        {
            "id": 3,
            "document": "Semantic search helps users find relevant information quickly.",
        },
    ],
)
```

この挿入操作では、生テキストが保存され、各エンティティに対して 1 つの埋め込みが生成されます。

### ステップ 3: テキストで検索する\{#step-3-search-with-text}

生のクエリテキストを使用して検索します。Zilliz Cloud は、ベクトル検索を実行する前に、同じ Function、モデル、および任意の推論パラメータを使用してクエリテキストを埋め込みに変換します。

```python
results = client.search(
    collection_name="hugging_face_demo",
    data=["How does Milvus handle semantic search?"],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
)

print(results)
```

検索結果には、クエリテキストに最も関連するドキュメントがコサイン類似度の順で含まれます。

## トラブルシューティング\{#troubleshooting}

### モデルが feature-extraction タスクで利用できない\{#the-model-is-unavailable-for-the-feature-extraction-task}

Hugging Face 上でモデルページを開き、**Inference Providers** セクションを確認してください。`hf-inference` が現在そのモデルを提供していること、およびそのモデルが `feature-extraction` をサポートしていることを確認してください。どちらかの要件を満たしていない場合は、別のモデルを選択し、そのモデルページで確認してください。Model compatibility 表は完全な一覧ではなく、記載されていないモデルでも互換性がある可能性があります。モデルを変更する場合は、Function の出力フィールドの次元が置き換え先のモデルと一致していることを確認してください。

### 返されたベクトル次元がスキーマと一致しない\{#the-returned-vector-dimension-does-not-match-the-schema}

モデルの出力次元を確認し、Function の `FLOAT_VECTOR` 出力フィールドに設定された `dim` と比較してください。異なる次元のモデルを使用するには、互換性のあるベクトルフィールドまたはコレクションを作成してください。カスタム出力次元はサポートされていません。

## 次のステップ\{#next-steps}

Functions に関する一般的な情報については、[Function Overview](./function-and-model-inference-overview) を参照してください。

Hugging Face Sentence Similarity スコアを使用してベクトル検索の候補を再ランク付けするには、[Hugging Face Ranker](./hugging-face-ranker) を参照してください。
