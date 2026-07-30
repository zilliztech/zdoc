---
title: "Hugging Face | Cloud"
slug: /hugging-face
sidebar_key: hugging-face
sidebar_label: "Hugging Face"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "通常、Hugging Face 埋め込みモデルを使用するには、アプリケーションで認証情報を管理し、モデルを個別に呼び出し、挿入データと検索クエリに対して一貫した方法で埋め込みを生成する必要があります。Hugging Face モデルプロバイダー連携とテキスト埋め込み Function を使用すると、Zilliz Cloud は挿入時と検索時に生テキストをベクトルへ変換します。 | Cloud"
type: origin
token: ETsNwO7T0iR5GDkvuMxcJG7JnIb
sidebar_position: 9
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - function
  - model
  - inference
  - text
  - embedding
  - hugging face

---

import Admonition from '@theme/Admonition';


# Hugging Face

通常、Hugging Face 埋め込みモデルを使用するには、アプリケーションで認証情報を管理し、モデルを個別に呼び出し、挿入データと検索クエリに対して一貫した方法で埋め込みを生成する必要があります。[Hugging Face モデルプロバイダー連携](./integrate-with-model-providers)とテキスト埋め込み Function を使用すると、Zilliz Cloud は挿入時と検索時に生テキストをベクトルへ変換します。

## 仕組み\{#how-it-works}

![XCxpwN8JvhevN8bAvbzcI72Fngg](https://zdoc-images.s3.us-west-2.amazonaws.com/XCxpwN8JvhevN8bAvbzcI72Fngg.png)

ワークフローは次の 3 つのステップで構成されます。

1. **生テキストを送信する。** アプリケーションが挿入リクエストまたは検索リクエストで生テキストを指定します。

1. **埋め込みを生成する。** テキスト埋め込み Function は、`integration_id` で Hugging Face モデルプロバイダー連携を参照し、`model_name` でモデルを選択します。Zilliz Cloud は、[Feature Extraction](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction) タスク用の [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) を通じてテキストを Hugging Face に送信します。

1. **埋め込みを使用する。** Hugging Face は浮動小数点の埋め込みベクトルを返します。挿入時には、Zilliz Cloud がそのベクトルを Function の出力フィールドに保存します。検索時には、そのベクトルをクエリベクトルとして使用します。

挿入と検索では同じ Function 設定が使用されるため、両方の操作でモデルと推論パラメーターの一貫性が保たれます。

## モデルの互換性\{#model-compatibility}

Hugging Face モデルをテキスト埋め込み Function で使用するには、モデルが [Feature Extraction](https://huggingface.co/docs/inference-providers/tasks/feature-extraction#api-specification) 機能を備え、設定した [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) 連携を通じて埋め込みを正常に返す必要があります。Function の出力フィールドは、`dim` がモデルの埋め込み次元と一致する `FLOAT_VECTOR` フィールドである必要があります。

以下のモデルは、記載された日付に Zilliz Cloud との互換性テストに合格しています。

<table>
   <tr>
     <th><p>モデル</p></th>
     <th><p>機能</p></th>
     <th><p>次元</p></th>
     <th><p>最終テスト日</p></th>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-m3"><code>BAAI/bge-m3</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-large-zh-v1.5"><code>BAAI/bge-large-zh-v1.5</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-large-en-v1.5"><code>BAAI/bge-large-en-v1.5</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-small-en-v1.5"><code>BAAI/bge-small-en-v1.5</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>384</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko"><code>dragonkue/snowflake-arctic-embed-l-v2.0-ko</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/upskyy/bge-m3-korean"><code>upskyy/bge-m3-korean</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

この表は、互換性のあるモデルを網羅した一覧ではありません。記載されていないモデルにも互換性がある場合があります。

互換性の結果は、記載された日付時点のテストを反映しています。Zilliz Cloud は、モデルが [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) を通じて引き続き利用できるかどうか、または安定性、レイテンシー、出力品質に関する要件を満たすかどうかを管理していません。また、過去の結果を定期的に再テストすることを保証しません。本番環境で使用する前に、Hugging Face で選択したモデルを確認し、ワークロードに対して評価してください。

</Admonition>

## 開始前の準備\{#before-you-start}

Hugging Face テキスト埋め込みを使用する前に、以下を行ってください。

- Hugging Face モデルプロバイダー連携を作成し、その統合 ID をコピーします。**Provider** を `hf-inference` に設定します。手順については、[モデルプロバイダーとの連携](./integrate-with-model-providers)を参照してください。

- モデルの Hugging Face ページを開き、**Inference Providers** セクションを確認します。`hf-inference` が現在 `feature-extraction` タスク用にモデルを提供していることを確認してください。

- モデルの出力次元を確認します。Function の出力フィールドは、`dim` がモデルの出力と一致する `FLOAT_VECTOR` フィールドである必要があります。カスタム出力次元はサポートされていません。

例では `BAAI/bge-small-en-v1.5` を使用します。このモデルは、本書執筆時点で `hf-inference` を通じて 384 次元の埋め込みを生成します。このモデルは設定方法を示す目的でのみ使用しており、Zilliz Cloud が推奨または認定するものではありません。

## Hugging Face テキスト埋め込みを使用する\{#use-hugging-face-text-embedding}

### ステップ 1：テキスト埋め込み Function を持つコレクションを作成する\{#step-1-create-a-collection-with-a-text-embedding-function}

#### スキーマフィールドを定義する\{#define-schema-fields}

以下を含むコレクションスキーマを作成します。

- 各エンティティを一意に識別するプライマリフィールド。

- 生テキストを保存する `VARCHAR` フィールド。

- 次元が選択したモデルの出力次元と一致する `FLOAT_VECTOR` フィールド。

以下の例では、384 次元のベクトルを生成する `BAAI/bge-small-en-v1.5` を使用します。

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

#### テキスト埋め込み Function を定義する\{#define-the-text-embedding-function}

`document` フィールドの値を埋め込みに変換し、`dense` フィールドへ書き込む `TEXTEMBEDDING` Function を定義します。

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

以下の表は、`params` でサポートされているすべてのエントリを示します。Hugging Face のリクエストオプションは [Feature Extraction API specification](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction#api-specification) に従い、`provider`、`model_name`、`integration_id`、`max_client_batch_size` は Zilliz Cloud 連携を設定します。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>provider</code></p></td>
     <td><p>はい</p></td>
     <td><p>Zilliz Cloud のモデルプロバイダー。この値を <code>huggingface</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>model_name</code></p></td>
     <td><p>はい</p></td>
     <td><p><code>feature-extraction</code> タスク用の <code>hf-inference</code> を通じて現在提供されているモデルの Hugging Face Model ID。</p></td>
   </tr>
   <tr>
     <td><p><code>integration_id</code></p></td>
     <td><p>はい</p></td>
     <td><p>Hugging Face モデルプロバイダー連携の ID。手順については、<a href="./integrate-with-model-providers">モデルプロバイダーとの連携</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>normalize</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>正規化された埋め込みをリクエストするかどうか。省略した場合、Zilliz Cloud は Hugging Face リクエストにこのオプションを設定せず、動作は選択したモデルに従います。</p></td>
   </tr>
   <tr>
     <td><p><code>prompt_name</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>選択したモデルの Sentence Transformers 設定で定義されているプロンプトの名前。Hugging Face は、エンコード前に対応するプロンプトテキストを付加します。省略した場合、プロンプトはリクエストされません。</p></td>
   </tr>
   <tr>
     <td><p><code>truncate</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>入力がモデルのサポートする長さを超えた場合に切り詰めをリクエストするかどうか。省略した場合、Zilliz Cloud は Hugging Face リクエストにこのオプションを設定せず、動作は選択したモデルに従います。</p></td>
   </tr>
   <tr>
     <td><p><code>truncation_direction</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>Hugging Face が入力を切り詰める方向。サポートされる値は <code>left</code> と <code>right</code> です。</p></td>
   </tr>
   <tr>
     <td><p><code>max_client_batch_size</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>1 回のリクエストで Hugging Face に送信する入力テキストの最大数。デフォルト値は <code>128</code> です。値は <code>0</code> より大きい必要があります。</p></td>
   </tr>
</table>

#### インデックスを設定する\{#configure-the-index}

出力ベクトルフィールドのインデックスを設定します。以下の例では、`AUTOINDEX` とコサイン類似度を使用します。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)
```

#### コレクションを作成する\{#create-the-collection}

スキーマとインデックスパラメーターを指定してコレクションを作成します。

```python
client.create_collection(
    collection_name="hugging_face_demo",
    schema=schema,
    index_params=index_params,
)
```

これにより、384 次元のベクトルを `dense` フィールドへ書き込むテキスト埋め込み Function を持つコレクションが作成されます。

### ステップ 2：データを挿入する\{#step-2-insert-data}

ベクトルを指定せずに生テキストを挿入します。Zilliz Cloud は Hugging Face モデルを呼び出し、生成された埋め込みを `dense` フィールドへ書き込みます。

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

挿入操作では、生テキストを保存し、エンティティごとに 1 つの埋め込みを生成します。

### ステップ 3：テキストで検索する\{#step-3-search-with-text}

生のクエリテキストを使用して検索します。Zilliz Cloud は、ベクトル検索を実行する前に、同じ Function、モデル、オプションの推論パラメーターを使用してクエリテキストを埋め込みへ変換します。

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

検索結果には、クエリテキストとの関連性が最も高いドキュメントがコサイン類似度順に含まれます。

## トラブルシューティング\{#troubleshooting}

### feature-extraction タスク用のモデルを利用できない\{#the-model-is-unavailable-for-the-feature-extraction-task}

Hugging Face でモデルページを開き、**Inference Providers** セクションを確認します。`hf-inference` が現在モデルを提供しており、モデルが `feature-extraction` をサポートしていることを確認してください。どちらかの要件を満たさない場合は、別のモデルを選択し、そのモデルページで確認してください。モデルの互換性表は網羅的な一覧ではなく、記載されていないモデルにも互換性がある場合があります。モデルを変更する場合は、Function の出力フィールドの次元が代替モデルと一致していることを確認してください。

### 返されたベクトルの次元がスキーマと一致しない\{#the-returned-vector-dimension-does-not-match-the-schema}

モデルの出力次元を確認し、Function の `FLOAT_VECTOR` 出力フィールドに設定された `dim` と比較してください。次元が異なるモデルを使用するには、互換性のあるベクトルフィールドまたはコレクションを作成します。カスタム出力次元はサポートされていません。

## 次のステップ\{#next-steps}

Function の一般的な情報については、[Function の概要](./function-and-model-inference-overview)を参照してください。

Hugging Face の Sentence Similarity スコアを使用してベクトル検索の候補をリランキングする方法については、[Hugging Face Ranker](./hugging-face-ranker)を参照してください。
