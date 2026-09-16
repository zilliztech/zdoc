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

```python
class pymilvus.Function
```

## コンストラクター\{#constructor}

このコンストラクターは、ユーザーの生データをベクトル埋め込みに変換したり、検索結果に再ランキング戦略を適用したりするために設計された新しい `Function` インスタンスを初期化します。これは、類似検索操作を簡素化する自動化されたプロセスによって実現されます。

```python
Function(
    name: str,
    function_type: FunctionType,
    input_field_names: Union[str, List[str]],
    output_field_names: Union[str, List[str]],
    description: str = "",
)
```

**パラメーター:**

- `name` (*str*) -

    **[必須]**

    関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用します。

- `function_type` (*[FunctionType](./Collections-FunctionType)*) -

    **[必須]**

    使用する埋め込み関数のタイプです。指定可能な値は次のとおりです。

    - FunctionType.BM25: VARCHAR または TEXT フィールドから、BM25 ランキングアルゴリズムに基づいてスパースベクトルを生成します。

    - FunctionType.TEXTEMBEDDING: VARCHAR または TEXT フィールドから、意味的な内容を捉える高密度ベクトルを生成します。

    - `FunctionType.MINHASH`: ドキュメント間の [Jaccard similarity](https://en.wikipedia.org/wiki/Jaccard_index) を近似するバイナリベクトルを生成します。

- `FunctionType.RERANK`: 検索結果に再ランキング戦略を適用します。

- `input_field_names` (*Union[str, List[str]]*) -

    **[必須]**

    ベクトル表現への変換が必要な生データを含む VARCHAR または TEXT フィールドの名前です。FunctionType.BM25 および FunctionType.TEXTEMBEDDING では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- `output_field_names` (*Union[str, List[str]]*) -

    生成された埋め込みを格納するフィールドの名前です。これは、コレクションスキーマで定義されたベクトルフィールドに対応している必要があります。このパラメーターは 1 つのフィールド名のみを受け付けます。

    <Admonition type="info" title="Notes">

    これは、`function_type` を `FunctionType.BM25` および `FunctionType.TEXTEMBEDDING` に設定した場合にのみ適用されます。

    </Admonition>

- `params` (*dict*) -

    embedding/ranking 関数の設定用ディクショナリです。サポートされるキーは `function_type` によって異なります。

    - `FunctionType.BM25`: パラメーターは不要です。空のディクショナリを渡すか、完全に省略してください。

    - `FunctionType.TEXTEMBEDDING`:

        - `provider` (*str*) -

            埋め込みモデルのプロバイダーです。指定可能な値は次のとおりです。

            - `openai` ([OpenAI](https://milvus.io/docs/openai.md))

            - `azure_openai` ([Microsoft Azure OpenAI](https://milvus.io/docs/azure-openai.md))

            - `dashscope` ([DashScope](https://milvus.io/docs/dashscope.md))

            - `bedrock` ([Amazon Bedrock](https://milvus.io/docs/bedrock.md))

            - `vertexai` ([Google Cloud Vertext AI](https://milvus.io/docs/vertex-ai.md))

            - `voyageai` ([Voyage AI](https://milvus.io/docs/voyage-ai.md))

            - `cohere` ([Cohere](https://milvus.io/docs/cohere.md))

            - `siliconflow` ([SiliconFlow](https://milvus.io/docs/siliconflow.md))

            - `TEI` ([Hugging Face Text Embedding Inference](https://milvus.io/docs/hugging-face-tei.md))

        - `model_name` (*str*) -

            使用する埋め込みモデルの名前です。値はプロバイダーによって異なります。詳細については、それぞれ該当するドキュメントページを参照してください。

        - `credential` (*str*) -

            `milvus.yaml` のトップレベルにある `credential:` セクションで定義された認証情報のラベルです。

            - 指定した場合、Milvus は一致するキーペアまたは API トークンを取得し、サーバー側でリクエストに署名します。

            - 省略した場合（`None`）、Milvus は `milvus.yaml` で対象のモデルプロバイダーに対して明示的に設定された認証情報にフォールバックします。

            - ラベルが不明である場合、または参照先のキーが存在しない場合、呼び出しは失敗します。

        - `dim` (*str*) -

            出力埋め込みの次元数です。OpenAI の第 3 世代モデルでは、完全なベクトルを短縮して、意味情報を大きく損なうことなくコストとレイテンシーを削減できます。詳細については、[OpenAI announcement blog post](https://openai.com/blog/new-embedding-models-and-api-updates) を参照してください。

            <Admonition type="info" title="Notes">

            ベクトルの次元を短縮する場合は、ベクトルフィールドに対してスキーマの `add_field` メソッドで指定した `dim` の値が、埋め込み関数の最終出力次元と一致していることを確認してください。

            </Admonition>

    - `FunctionType.RERANK`: reranker タイプに応じて `params` を設定します。

        - **Weighted Ranker**

            ```python
            params = {
                "reranker": "weighted", # Required
                "weights": [0.1, 0.9], # List[float], weights per search path ∈ [0,1]
                "norm_score": True  # Optional
            }
            ```

            - `reranker` (*str*): 使用する再ランキング方式を指定します。Weighted Ranker を使用するには `weighted` に設定する必要があります。

            - `weights` (*List[float]*): 各検索パスに対応する重みの配列です。値 ∈ [0,1]。詳細については、[Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker) を参照してください。

            - `norm_score` (*boolean*): 重み付けの前に生のスコアを正規化するかどうか（arctan を使用）。詳細については、[Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker) を参照してください。

        - **RRF Ranker**

            ```python
            params = {
                "reranker": "rrf", # Required
                "k": 100  # Optional (default: 60)
            }
            ```

            - `reranker` (*str*): 使用する再ランキング方式を指定します。RRF Ranker を使用するには `"rrf"` に設定する必要があります。

            - `k` (*int*): ドキュメントの順位が与える影響を制御する平滑化パラメーターです。`k` が大きいほど上位の順位への感度が低くなります。値の範囲: (0, 16384)、デフォルト: `60`。詳細については、[Mechanism of RRF Ranker](https://milvus.io/docs/rrf-ranker.md#Mechanism-of-RRF-Ranker) を参照してください。

        - **Decay Ranker**

            ```python
            params={
                "reranker": "decay",            # Specify decay reranker. Must be "decay"
                "function": "gauss",            # Choose decay function type: "gauss", "exp", or "linear"
                "origin": 1720000000,           # Reference point (e.g., Unix timestamp)
                "scale": 7 * 24 * 60 * 60,      # 7 days in seconds
                "offset": 24 * 60 * 60,         # 1 day no-decay zone
                "decay": 0.5                    # Half score at scale distance
            }
            ```

            - `reranker` (*str*): 使用する再ランキング方式を指定します。decay ランキング機能を有効にするには `"decay"` に設定する必要があります。

            - `function` (*str*): 適用する数学的な decay ranker を指定します。指定可能な値: `"gauss"`、`"expr"`、`"linear"`。詳細については、[Choose the right decay ranker](https://milvus.io/docs/decay-ranker-overview.md#Choose-the-right-decay-ranker) を参照してください。

            - `origin` (*int*): decay スコアを計算する基準点です。

            - `scale`  (*int*): 関連性が `decay` の値まで低下する距離または時間です。

            - `offset` (*int*): `origin` の周囲に、アイテムが完全なスコア（decay score = 1.0）を維持する「減衰なしゾーン」を作成します。

            - `decay` (*float*): `scale` の距離におけるスコア値で、曲線の急峻さを制御します。

            decay ランキングの詳細については、[Decay Ranker Overview](https://milvus.io/docs/decay-ranker-overview.md) を参照してください。

        - **Model Ranker**

            **TEI Provider**:

            ```python
            params={
                "reranker": "model",  # Specify model reranker. Must be "model"
                "provider": "tei",  # Choose provider: "tei" or "vllm"
                "queries": ["machine learning for time series"],  # Query text
                "endpoint": "http://model-service:8080",  # Model service endpoint
                "max_client_batch_size": 32,  # Optional (default: 32)
                "truncate": True,                # Optional: Truncate the inputs that are longer than the maximum supported size
                "truncation_direction": "Right",    # Optional: Direction to truncate the inputs
            }
            ```

            **vLLM Provider**:

            ```python
            params={
                "reranker": "model",        # Specifies model-based reranking
                "provider": "vllm",         # Specifies vLLM service
                "queries": ["renewable energy developments"],  # Query text
                "endpoint": "http://localhost:8080",  # vLLM service address
                "max_client_batch_size": 64,              # Optional: batch size
                "truncate_prompt_tokens": 256,  # Optional: Use last 256 tokens
            }
            ```

            **Cohere Provider**:

            ```python
            params = {
                "reranker": "model",                  # Enables model-based reranking
                "provider": "cohere",                 # Specifies Cohere as the service provider
                "model_name": "rerank-english-v3.0",  # Cohere rerank model to use
                "queries": ["renewable energy developments"],  # Query text for relevance evaluation
                "max_client_batch_size": 128,         # Optional: batch size for model service requests (default: 128)
                "max_tokens_per_doc": 4096,           # Optional: max tokens per document (default: 4096)
                "credential": "your-cohere-api-key" # Optional: authentication credential for Cohere API
            }
            ```

            **Voyage AI Provider**:

            ```python
            params = {
                "reranker": "model",                    # Enables model-based reranking
                "provider": "voyageai",                 # Specifies Voyage AI as the service provider
                "model_name": "rerank-2.5",             # Voyage AI reranker to use
                "queries": ["renewable energy developments"],  # Query text for relevance evaluation
                "max_client_batch_size": 128,           # Optional: batch size for model service requests (default: 128)
                "truncation": True,                     # Optional: enable input truncation (default: True)
                "credential": "your-voyage-api-key"   # Optional: if not set, uses VOYAGE_API_KEY env var
            }
            ```

            **SiliconFlow Provider**:

            ```python
            params = {
                "reranker": "model",                        # Enables model-based reranking
                "provider": "siliconflow",                  # Specifies SiliconFlow as the service provider
                "model_name": "BAAI/bge-reranker-v2-m3",    # SiliconFlow reranking model to use
                "queries": ["renewable energy developments"],  # Query text for relevance evaluation
                "max_client_batch_size": 128,               # Optional: batch size for model service requests (default: 128)
                "max_chunks_per_doc": 5,                    # Optional: max chunks per document for supported models
                "overlap_tokens": 50,                       # Optional: token overlap between chunks for supported models
                "credential": "your-siliconflow-api-key"  # Optional: if not set, uses SILICONFLOW_API_KEY env var
            }
            ```

            - `reranker` (*str*): モデルベースの再ランキングを有効にするには `"model"` に設定する必要があります。

            - `provider` (*str*): 再ランキングに使用するモデルサービスのプロバイダーです。指定可能な値: `"tei"` または `"vllm"`。詳細については、[Choose a model provider for your needs](https://milvus.io/docs/model-ranker-overview.md#Choose-a-model-provider-for-your-needs) を参照してください。

            - `queries` (*List[str]*): 関連性スコアを計算するために再ランキングモデルが使用するクエリ文字列のリストです。

            - `endpoint` (*str*): モデルサービスの URL です。

            - `max_client_batch_size` *(int)*: 1 つのバッチで処理するドキュメントの最大数です。デフォルト: 32。

            - `truncate` *(bool)*: **[TEI only]** サポートされる最大サイズを超える入力を切り詰めるかどうか。詳細については、[TEI Ranker](https://milvus.io/docs/tei-ranker.md) を参照してください。

            - `truncation_direction` (*str*): **[TEI only]** 切り詰めの方向（`"Left"` または `"Right"`）。詳細については、[TEI Ranker](https://milvus.io/docs/tei-ranker.md) を参照してください。

            - `truncate_prompt_tokens` *(int)*: **[vLLM only]** 切り詰める際にプロンプトの末尾から保持するトークン数です。詳細については、[vLLM Ranker](https://milvus.io/docs/vllm-ranker.md) を参照してください。

            - `max_tokens_per_doc` *(int)*: **[Cohere only]** ドキュメントごとの最大トークン数です。長いドキュメントは、指定されたトークン数に自動的に切り詰められます。詳細については、[Cohere Ranker](https://milvus.io/docs/cohere-ranker.md) を参照してください。

            - `truncation` *(bool)*: **[Voyage AI only]** クエリとドキュメントの「コンテキスト長の制限」を満たすために入力を切り詰めるかどうか。詳細については、[Voyage AI Ranker](https://milvus.io/docs/voyage-ai-ranker.md) を参照してください。

            - `max_chunks_per_doc` *(int)*: <strong>[SiliconFlow only]</strong> 1 つのドキュメント内から生成されるチャンクの最大数です。詳細については、[SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md) を参照してください。

            - `overlap_tokens`  *(int)*: **[SiliconFlow only]** ドキュメントをチャンクに分割する際の、隣接するチャンク間で重複するトークン数です。詳細については、[SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md) を参照してください。

- `description` (*str*) -

    **[オプション]**

    関数の目的に関する簡単な説明です。これは、ドキュメント化や大規模なプロジェクトでの明確化に役立ち、デフォルトは空の文字列です。

**戻り値の型:**

生データをベクトル埋め込みに変換するための特定の処理動作をカプセル化した `Function` のインスタンスです。

**戻り値:**

Milvus のコレクションに登録できる `Function` オブジェクトです。データ挿入時の埋め込みの自動生成を容易にします。

**例外:**

- `UnknownFunctionType`

    サポートされていない、または認識されない関数タイプが指定された場合に、この例外が発生します。

- `FunctionIncorrectInputOutputType`

    `input_field_names` または `output_field_names` 内の 1 つ以上のフィールド名が文字列でない場合に、この例外が発生します。

- `FunctionDuplicateInputs`

    `input_field_names` に重複するフィールド名が存在する場合に、この例外が発生します。

- `FunctionDuplicateOutputs`

    `output_field_names` に重複するフィールド名が存在する場合に、この例外が発生します。

- `FunctionCommonInputOutput`

    `input_field_names` と `output_field_names` が重複している場合、つまり同じフィールド名が両方に存在する場合に、この例外が発生します。

## 例\{#examples}

- `BM25` を使用する

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

- `TEXTEMBEDDING` を使用する

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

- `RERANK` を使用する

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
