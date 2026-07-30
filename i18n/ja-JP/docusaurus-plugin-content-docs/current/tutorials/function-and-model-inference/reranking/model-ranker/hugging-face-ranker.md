---
title: "Hugging Face Ranker | Cloud"
slug: /hugging-face-ranker
sidebar_key: hugging-face-ranker
sidebar_label: "Hugging Face Ranker"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "ベクトル検索ではベクトル距離に基づいて結果が並べられますが、その初期順序が、各候補のテキストがクエリにどの程度適切に回答しているかを反映しない場合があります。Hugging Face モデルプロバイダー連携を使用すると、Hugging Face Ranker は Hugging Face の sentence-similarity タスクから得られたスコアを使用して、ベクトル検索で返された候補を並べ替えます。 | Cloud"
type: origin
token: P4UywHFH2iDFJWk2kwwcs22SnRc
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コレクション
  - データ
  - 検索結果のリランキング
  - 結果のリランキング
  - リランキングモデル
  - モデルランカー
  - hugging face

---

import Admonition from '@theme/Admonition';


# Hugging Face Ranker

ベクトル検索ではベクトル距離に基づいて結果が並べられますが、その初期順序が、各候補のテキストがクエリにどの程度適切に回答しているかを反映しない場合があります。[Hugging Face モデルプロバイダー連携](./hugging-face)を使用すると、Hugging Face Ranker は Hugging Face の sentence-similarity タスクから得られたスコアを使用して、ベクトル検索で返された候補を並べ替えます。

## 仕組み\{#how-it-works}

Hugging Face Ranker は、ベクトル検索後に候補エンティティをリランキングします。次の図は、アプリケーション、Zilliz Cloud、Hugging Face 間の一般的なワークフローを示しています。

![KDOBw9YpBhRHkJbwjL3cmZfWnvf](https://zdoc-images.s3.us-west-2.amazonaws.com/KDOBw9YpBhRHkJbwjL3cmZfWnvf.png)

一般的なワークフローは次の 4 つのステップで構成されます。

1. **候補エンティティを取得する。** Zilliz Cloud は、設定されたベクトルフィールドに対してベクトル検索を実行し、候補エンティティを返します。

1. **リランキング用のテキストを準備する。** Ranker は `params.queries` からクエリテキストを読み取り、`input_field_names` で指定された null 非許容の `VARCHAR` フィールドから候補テキストを読み取ります。

1. **リランキングスコアをリクエストする。** Zilliz Cloud はクエリと候補テキストを Hugging Face に送信し、候補ごとに新しく計算された類似度スコアを受け取ります。

1. **リランキングして結果を返す。** Zilliz Cloud はスコアを候補エンティティに対応付け、スコアの高い順に並べて、リランキングされた結果を返します。

**リランキングスコアの計算方法**

上記の一般的なワークフローは、リランキングが行われる位置を示しています。次のプロセスでは、Hugging Face が候補ごとに新しい類似度スコアを計算する方法を説明します。

![L1jQwyef6hP51bb9EYjc6pV6nTd](https://zdoc-images.s3.us-west-2.amazonaws.com/L1jQwyef6hP51bb9EYjc6pV6nTd.png)

1. **テキスト入力を準備する。** Ranker は `params.queries` からクエリテキストを読み取り、`input_field_names` で指定された `VARCHAR` フィールドから空でない候補テキストを読み取ります。

1. **埋め込みを作成する。** Zilliz Cloud は、[Sentence Similarity](https://huggingface.co/docs/huggingface_hub/package_reference/inference_client#huggingface_hub.InferenceClient.sentence_similarity) タスク用の `hf-inference` を通じて、クエリテキストを `source_sentence`、候補テキストを `sentences` として Hugging Face に送信します。概念的には、モデルがクエリ埋め込みと各候補テキストの個別の埋め込みを作成します。

1. **スコアを計算して返す。** モデルはクエリ埋め込みと各候補埋め込みを比較し、候補ごとに 1 つの類似度スコアを返します。

図に示されている埋め込みはモデル内部の中間処理であり、Hugging Face API が返すのは類似度スコアのみです。ベクトル取得とリランキングでは、それぞれ別の表現とスコアが使用されます。Hugging Face Ranker は候補ベクトルや取得スコアを再利用しません。検索ベクトルの作成に使用した埋め込みモデルと、リランキングに使用する Hugging Face モデルは独立しており、異なるモデルを使用できます。

事前計算済みのベクトルを挿入する場合は、Hugging Face Ranker がリランキング時に読み取れるように、元の候補テキストも `VARCHAR` フィールドに保存してください。

## 開始前の準備\{#before-you-start}

Hugging Face Ranker を使用する前に、以下を行ってください。

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud は [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) を通じて Hugging Face に接続し、Hugging Face Ranker では [`sentence-similarity`](https://huggingface.co/tasks/sentence-similarity) タスクを使用します。Zilliz Cloud は、特定のモデルが現在 `hf-inference` で提供されているか、引き続き利用できるか、または安定性、レイテンシー、出力品質に関する要件を満たすかどうかを管理していません。本番環境で使用する前に、Hugging Face で選択したモデルを確認し、ワークロードに対して評価してください。

</Admonition>

- Hugging Face モデルプロバイダー連携を作成し、その統合 ID をコピーします。手順については、[モデルプロバイダーとの連携](./integrate-with-model-providers)を参照してください。

- モデルの Hugging Face ページを開き、**Inference Providers** セクションを確認します。`hf-inference` が現在 `sentence-similarity` タスク用にモデルを提供していることを確認してください。

- コレクションが候補テキストを null 非許容の `VARCHAR` フィールドに保存していることを確認します。リランキング Function は、`input_field_names` でこのようなフィールドを 1 つだけ参照する必要があります。コレクションには他のテキストフィールドを含めることもできます。

## Hugging Face Ranker を使用する\{#use-hugging-face-ranker}

Hugging Face Ranker は検索時に定義および適用されます。コレクションスキーマを変更せずに、検索リクエストごとに Ranker を有効化、無効化、または変更できます。

### 準備\{#preparations}

以下のセットアップでは 3 つのフィールドを持つコレクションを作成します。`id` はプライマリキー、`document` はリランキングに使用する候補テキストを保存する `VARCHAR` フィールド、`dense` は初期検索に使用するベクトルフィールドです。また、検索とリランキングの例で使用するサンプルデータを挿入します。

<details>

<summary>**サンプルデータを含むコレクションを準備する**</summary>

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

### リランキング Function を定義する\{#define-the-rerank-function}

`document` に保存されたテキストを使用して、ベクトル検索で返された候補をリランキングする `RERANK` Function を定義します。この Function では、クエリテキスト、Hugging Face モデル、モデルプロバイダー連携も指定します。

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

この例では、設定方法を示す目的でのみ `sentence-transformers/all-MiniLM-L6-v2` を使用しています。このモデルは Zilliz Cloud が推奨または認定するものではありません。

以下の表は、Hugging Face Ranker の `params` でユーザーが設定できるすべてのエントリを示します。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>リランキングの実装。この値を <code>model</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>provider</code></p></td>
     <td><p>はい</p></td>
     <td><p>Zilliz Cloud のモデルプロバイダー。この値を <code>huggingface</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>model_name</code></p></td>
     <td><p>はい</p></td>
     <td><p><code>sentence-similarity</code> タスク用の <code>hf-inference</code> を通じて現在提供されているモデルの Hugging Face Model ID。</p></td>
   </tr>
   <tr>
     <td><p><code>queries</code></p></td>
     <td><p>はい</p></td>
     <td><p>リランキングに使用するクエリテキストのリスト。初期検索でクエリベクトルを使用する場合でも、検索クエリ（<code>nq</code>）ごとに 1 つの文字列を指定します。</p></td>
   </tr>
   <tr>
     <td><p><code>integration_id</code></p></td>
     <td><p>はい</p></td>
     <td><p>Hugging Face モデルプロバイダー連携の ID。手順については、<a href="./integrate-with-model-providers">モデルプロバイダーとの連携</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>max_client_batch_size</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>1 回のリクエストで Hugging Face に送信する候補テキストの最大数。デフォルト値は <code>32</code> です。値は <code>0</code> より大きい必要があります。</p></td>
   </tr>
</table>

Function の定義には Hugging Face の認証情報を含めないでください。

### リランキング Function を使用して検索する\{#search-with-the-rerank-function}

`ranker` パラメーターを使用して Function を `search()` に渡します。

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

検索では、まず `dense` ベクトルフィールドから候補エンティティを取得します。次に Hugging Face Ranker が `queries` のクエリテキストと各候補の `document` テキストを使用し、sentence-similarity タスクを通じて類似度スコアを計算します。Zilliz Cloud は、スコアの降順で候補を返します。

## トラブルシューティング\{#troubleshooting}

### sentence-similarity タスク用のモデルを利用できない\{#the-model-is-unavailable-for-the-sentence-similarity-task}

Hugging Face でモデルページを開き、**Inference Providers** セクションを確認します。`hf-inference` が現在モデルを提供しており、モデルが `sentence-similarity` をサポートしていることを確認してください。どちらかの要件を満たさない場合は、別のモデルを選択し、そのモデルページで確認してください。Zilliz Cloud は Hugging Face モデルのサポート対象カタログを管理していません。

### クエリテキストの数が検索リクエストと一致しない\{#the-number-of-query-texts-does-not-match-the-search-request}

`queries` 内の文字列数は、検索クエリ数（`nq`）と等しくなければなりません。1 つのクエリベクトルで検索する場合は、クエリ文字列を 1 つだけ指定します。

## 次のステップ\{#next-steps}

Hugging Face Ranker はハイブリッド検索でも使用できます。検索とハイブリッド検索では Ranker を同じ方法で適用します。つまり、検索時に `ranker` パラメーターを通じてリランキング Function を渡します。

詳細については、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。
