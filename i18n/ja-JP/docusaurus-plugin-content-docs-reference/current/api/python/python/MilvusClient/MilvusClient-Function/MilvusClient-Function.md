---
title: "Function | Python | MilvusClient"
slug: /python/python/MilvusClient-Function
sidebar_label: "Function"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ユーザーが提供する生データからベクトル埋め込みを生成したり、Milvus の検索結果に再ランキング戦略を適用したりするための `Function` インスタンス。 | Python | MilvusClient"
type: docx
token: GaCYdVohYoHFhrx897zcmcNfn6e
sidebar_position: 3
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - クラウド
  - Function
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Function

`Function` インスタンスは、ユーザーが提供する生データからベクトル埋め込みを生成したり、Milvus の検索結果に再ランキング戦略を適用したりするためのものです。

## リクエスト構文\{#request-syntax}

```python
class pymilvus.Function
```

**パラメーター:**

- **name** (*str*) -

    **[必須]**

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用します。

- **function_type** (*[FunctionType](./Collections-FunctionType)*) -

    **[必須]**

    使用する埋め込み関数の種類を指定します。指定可能な値は次のとおりです。FunctionType.BM25: VARCHAR または TEXT フィールドから、BM25 ランキングアルゴリズムに基づいてスパースベクトルを生成します。:. FunctionType.TEXTEMBEDDING: VARCHAR または TEXT フィールドから、セマンティックな意味を捉える密ベクトルを生成します。:. FunctionType.MINHASH: ドキュメント間の Jaccard 類似度を近似するバイナリベクトルを生成します。

- **FunctionType.RERANK** (*[FunctionType](./Collections-FunctionType)*) -

    検索結果に再ランキング戦略を適用するためのオプションです。

- **input_field_names** (*Union[str, List[str]]*) -

    **[必須]**

    ベクトル表現への変換が必要な生データを含む VARCHAR または TEXT フィールドの名前です。FunctionType.BM25 および FunctionType.TEXTEMBEDDING では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- **output_field_names** (*Union[str, List[str]]*) -

    生成された埋め込みの格納先となるフィールドの名前です。これは、コレクションスキーマで定義されているベクトルフィールドに対応している必要があります。このパラメーターは 1 つのフィールド名のみを受け付けます。これは、function_type を FunctionType.BM25 および FunctionType.TEXTEMBEDDING に設定した場合にのみ適用されます。

- **params** (*dict*) -

    埋め込み/ranking 関数の設定用の辞書です。サポートされるキーは function_type によって異なります。FunctionType.BM25: パラメーターは不要です。空の辞書を渡すか、完全に省略します。FunctionType.TEXTEMBEDDING: provider (str): 埋め込みモデルのプロバイダーです。指定可能な値は次のとおりです。openai ([OpenAI](https://milvus.io/docs/openai.md)):. azure_openai ([Microsoft Azure OpenAI](https://milvus.io/docs/azure-openai.md)):. dashscope ([DashScope](https://milvus.io/docs/dashscope.md)):. bedrock ([Amazon Bedrock](https://milvus.io/docs/bedrock.md)):. vertexai ([Google Cloud Vertext AI](https://milvus.io/docs/vertex-ai.md)):. voyageai ([Voyage AI](https://milvus.io/docs/voyage-ai.md)):. cohere ([Cohere](https://milvus.io/docs/cohere.md)):. siliconflow ([SiliconFlow](https://milvus.io/docs/siliconflow.md)):. TEI ([Hugging Face Text Embedding Inference](https://milvus.io/docs/hugging-face-tei.md)):. model_name (str): 使用する埋め込みモデルの名前です。値はプロバイダーによって異なります。詳細については、各プロバイダーのドキュメントページを参照してください。credential (str): milvus.yaml のトップレベル credential: セクションで定義された認証情報のラベルです。指定すると、Milvus は一致するキーペアまたは API トークンを取得し、サーバー側でリクエストに署名します。:. 省略した場合（`None`）、Milvus は、対象のモデルプロバイダーに対して `milvus.yaml` で明示的に設定された認証情報にフォールバックします。:. ラベルが不明であるか、参照されたキーが存在しない場合、呼び出しは失敗します。:. dim (str): 出力埋め込みの次元数です。OpenAI の第 3 世代モデルでは、セマンティック情報を大幅に失うことなく、完全なベクトルを短縮してコストとレイテンシーを削減できます。詳細については、OpenAI の発表ブログ記事を参照してください。ベクトルの次元を短縮する場合は、スキーマの add_field メソッドでベクトルフィールドに指定した dim の値が、埋め込み関数の最終的な出力次元と一致することを確認してください。FunctionType.RERANK: reranker のタイプに基づいて params を設定します。Weighted Ranker: reranker (str): : 使用する再ランキング方式を指定します。Weighted Ranker を使用するには、weighted に設定する必要があります。weights (List[float]): 各検索パスに対応する重みの配列です。値の範囲は ∈ [0,1] です。詳細については、[Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . norm_score (boolean): 重み付けの前に生のスコアを正規化するかどうか（arctan を使用）です。詳細については、[Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . RRF Ranker: reranker (str): : 使用する再ランキング方式を指定します。RRF Ranker を使用するには、"rrf" に設定する必要があります。k (int): ドキュメントの順位が与える影響を制御する平滑化パラメーターです。`k` を大きくすると、上位の順位に対する感度が低下します。値の範囲は (0, 16384) で、デフォルトは `60` です。詳細については、[Mechanism of RRF Ranker](https://milvus.io/docs/rrf-ranker.md#Mechanism-of-RRF-Ranker): . Decay Ranker: reranker (str): : 使用する再ランキング方式を指定します。減衰ランキング機能を有効にするには、"decay" に設定する必要があります。function (str): 適用する数学的減衰ランカーを指定します。指定可能な値は `"gauss"`、`"expr"`、`"linear"` です。詳細については、[Choose the right decay ranker](https://milvus.io/docs/decay-ranker-overview.md#Choose-the-right-decay-ranker): . origin (int): : 減衰スコアを計算する基準点です。scale (int): : 関連性が減衰値まで低下する距離または時間です。offset (int): `origin` の周囲に、アイテムが完全なスコア（減衰スコア = 1.0）を維持する「減衰なしゾーン」を作成します: . decay (float): : scale の距離におけるスコア値で、曲線の急峻さを制御します。減衰ランキングの詳細については、Decay Ranker Overview を参照してください。Model Ranker: TEI プロバイダー: vLLM プロバイダー: Cohere プロバイダー: Voyage AI プロバイダー: SiliconFlow プロバイダー: reranker (str): : モデル再ランキングを有効にするには、"model" に設定する必要があります。provider (str): 再ランキングに使用するモデルサービスプロバイダーです。指定可能な値は `"tei"` または `"vllm"` です。詳細については、[Choose a model provider for your needs](https://milvus.io/docs/model-ranker-overview.md#Choose-a-model-provider-for-your-needs): . queries (List[str]): : 再ランキングモデルが関連性スコアを計算するために使用するクエリ文字列のリストです。endpoint (str): : モデルサービスの URL です。`max_client_batch_size` &ast;(int)&ast;: 1 バッチで処理するドキュメントの最大数です。デフォルト: 32.:. `truncate` &ast;(bool)&ast;: &ast;&ast;[TEI only]&ast;&ast; サポートされる最大サイズを超える入力を切り捨てるかどうかです。詳細については、[TEI Ranker](https://milvus.io/docs/tei-ranker.md).:. truncation_direction (str): *[TEI only]* 切り捨ての方向（`"Left"` または `"Right"`）です。詳細については、[TEI Ranker](https://milvus.io/docs/tei-ranker.md): . `truncate_prompt_tokens` *(int)*: **[vLLM only]** 切り捨て時にプロンプトの末尾から保持するトークン数です。詳細については、[vLLM Ranker](https://milvus.io/docs/vllm-ranker.md).:. `max_tokens_per_doc` *(int)*: **[Cohere only]** ドキュメントあたりの最大トークン数です。長いドキュメントは、指定したトークン数に自動的に切り捨てられます。詳細については、[Cohere Ranker](https://milvus.io/docs/cohere-ranker.md).:. `truncation` *(bool)*: **[Voyage AI only]** クエリとドキュメントの「コンテキスト長の上限」を満たすために、入力を切り捨てるかどうかです。詳細については、[Voyage AI Ranker](https://milvus.io/docs/voyage-ai-ranker.md).:. `max_chunks_per_doc` *(int)*: **[SiliconFlow only]** 1 つのドキュメント内から生成されるチャンクの最大数です。詳細については、[SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:. `overlap_tokens` *(int)*: **[SiliconFlow only]** ドキュメントをチャンク化する際の、隣接するチャンク間のトークン重複数です。詳細については、[SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:.

- **description** (*str*) -

    **[任意]** 関数の目的についての簡単な説明です。ドキュメント化や、大規模なプロジェクトでの明確化に役立ちます。デフォルトは空の文字列です。

**戻り値の型:**

*Function*

**戻り値:**

生データをベクトル埋め込みに変換するための具体的な処理動作をカプセル化した Function のインスタンスです。Milvus コレクションに登録できる Function オブジェクトであり、データ挿入時の埋め込みの自動生成を容易にします。

**例外:**

- **UnknownFunctionType**

    サポートされていない、または認識されない関数タイプを指定した場合、この例外がスローされます。サポートされていない、または認識されない関数タイプを指定した場合、この例外がスローされます。

- **FunctionIncorrectInputOutputType**

    `input_field_names` または `output_field_names` の 1 つ以上のフィールド名が文字列でない場合、この例外がスローされます。`input_field_names` または `output_field_names` の 1 つ以上のフィールド名が文字列でない場合、この例外がスローされます。

- **FunctionDuplicateInputs**

    `input_field_names` に重複したフィールド名がある場合、この例外がスローされます。`input_field_names` に重複したフィールド名がある場合、この例外がスローされます。

- **FunctionDuplicateOutputs**

    `output_field_names` に重複したフィールド名がある場合、この例外がスローされます。`output_field_names` に重複したフィールド名がある場合、この例外がスローされます。

- **FunctionCommonInputOutput**

    `input_field_names` と `output_field_names` が重複しており、同じフィールド名が両方に存在する場合、この例外がスローされます。`input_field_names` と `output_field_names` が重複しており、同じフィールド名が両方に存在する場合、この例外がスローされます。

## 例\{#examples}

- BM25 を使用する

```python
from pymilvus import Function, FunctionType
    
    # use BM25
    bm25_function = Function(
        name="bm25_fn",
        input_field_names=["document_content"],
        output_field_names=["sparse_vector"],
        function_type=FunctionType.BM25,
    )
```

- TEXTEMBEDDING を使用する

```python
from pymilvus import Function, FunctionType
    
    # use TEXTEMBEDDING
    text_embedding_function = Function(
        name="openai_embedding",                        # Unique identifier for this embedding function
        function_type=FunctionType.TEXTEMBEDDING,       # Type of embedding function
        input_field_names=["document"],                 # Scalar field to embed
        output_field_names=["dense"],                   # Vector field to store embeddings
        params={                                        # Provider-specific configuration (highest priority)
            "provider": "openai",                       # Embedding model provider
            "model_name": "text-embedding-3-small",     # Embedding model
            # "credential": "apikey1",                    # Optional: Credential label specified in milvus.yaml
            # Optional parameters:
            # "dim": "1536",                            # Optionally shorten the output vector dimension
            # "user": "user123"                         # Optional: identifier for API tracking
        }
    )
```

- RERANK を使用する

```python
from pymilvus import Function, FunctionType
    
    # use RERANK
    model_ranker = Function(
        name="semantic_ranker",  # Function identifier
        input_field_names=["document"],  # VARCHAR field to use for reranking
        function_type=FunctionType.RERANK,  # Must be set to RERANK
        params={
            "reranker": "model",  # Specify model reranker. Must be "model"
            "provider": "tei",  # Choose provider: "tei" or "vllm"
            "queries": ["machine learning for time series"],  # Query text
            "endpoint": "http://model-service:8080",  # Model service endpoint
            # "max_client_batch_size": 32  # Optional: batch size for processing
        }
    )
```
