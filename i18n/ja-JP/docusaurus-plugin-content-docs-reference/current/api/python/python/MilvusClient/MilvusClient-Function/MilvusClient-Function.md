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

    オプションです。p p。

- **input_field_names** (*Union[str, List[str]]*) -

    **[必須]**

    ベクトル表現への変換が必要な生データを含む VARCHAR または TEXT フィールドの名前です。FunctionType.BM25 および FunctionType.TEXTEMBEDDING では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- **output_field_names** (*Union[str, List[str]]*) -

    生成された埋め込みの格納先となるフィールドの名前です。これは、コレクションスキーマで定義されているベクトルフィールドに対応している必要があります。このパラメーターは 1 つのフィールド名のみを受け付けます。これは、function_type を FunctionType.BM25 および FunctionType.TEXTEMBEDDING に設定した場合にのみ適用されます。

- **params** (*dict*) -

    埋め込み/ranking 関数の設定辞書です。サポートされているキーは function_type によって異なります。FunctionType.BM25: パラメーターは不要です。空の辞書を渡すか、完全に省略します。FunctionType.TEXTEMBEDDING: provider (str): 埋め込みモデルのプロバイダーです。指定可能な値は次のとおりです。openai ([OpenAI](https://milvus.io/docs/openai.md)):. azure_openai ([Microsoft Azure OpenAI](https://milvus.io/docs/azure-openai.md)):. dashscope ([DashScope](https://milvus.io/docs/dashscope.md)):. bedrock ([Amazon Bedrock](https://milvus.io/docs/bedrock.md)):. vertexai ([Google Cloud Vertext AI](https://milvus.io/docs/vertex-ai.md)):. voyageai ([Voyage AI](https://milvus.io/docs/voyage-ai.md)):. cohere ([Cohere](https://milvus.io/docs/cohere.md)):. siliconflow ([SiliconFlow](https://milvus.io/docs/siliconflow.md)):. TEI ([Hugging Face Text Embedding Inference](https://milvus.io/docs/hugging-face-tei.md)):. model_name (str): 使用する埋め込みモデルの名前です。値はプロバイダーによって異なります。詳細については、各プロバイダーのドキュメントページを参照してください。credential (str): milvus.yaml の最上位の credential: セクションで定義された認証情報のラベルです。指定すると、Milvus は一致するキーペアまたは API トークンを取得し、サーバー側でリクエストに署名します。:. 省略した場合 (`None`)、Milvus は、`milvus.yaml` で対象のモデルプロバイダーに明示的に設定された認証情報にフォールバックします。:. ラベルが不明な場合、または参照されたキーが存在しない場合、呼び出しは失敗します。:. dim (str): 出力埋め込みの次元数です。OpenAI の第 3 世代モデルでは、完全なベクトルを短縮して、意味情報を大きく損なうことなくコストとレイテンシーを削減できます。詳細については、OpenAI の発表ブログ記事を参照してください。ベクトルの次元を短縮する場合、スキーマの add_field メソッドでベクトルフィールドに指定する dim 値が、埋め込み関数の最終的な出力次元と一致するようにしてください。FunctionType.RERANK: ランカーのタイプに応じて params を設定します。Weighted Ranker: python params = \{ "reranker": "weighted", # Required "weights": [0.1, 0.9], # List[float], weights per search path ∈ [0,1] "norm_score": True # Optional } `` reranker (str): : Specifies the reranking method to use. Must be set to weighted to use Weighted Ranker. weights (List[float]): Array of weights corresponding to each search path; values ∈ [0,1]. For details, refer to [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . norm_score (boolean): Whether to normalize raw scores (using arctan) before weighting. For details, refer to [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . RRF Ranker: python params = { "reranker": "rrf", # Required "k": 100 # Optional (default: 60) }  reranker (str): : Specifies the reranking method to use. Must be set to "rrf" to use RRF Ranker. k (int): Smoothing parameter that controls the impact of document ranks; higher `k` reduces sensitivity to top ranks. Value range: (0, 16384); default: `60`. For details, refer to [Mechanism of RRF Ranker](https://milvus.io/docs/rrf-ranker.md#Mechanism-of-RRF-Ranker): . Decay Ranker: python params={ "reranker": "decay", # Specify decay reranker. Must be "decay" "function": "gauss", # Choose decay function type: "gauss", "exp", or "linear" "origin": 1720000000, # Reference point (e.g., Unix timestamp) "scale": 7  *24*  60  *60, # 7 days in seconds "offset": 24*  60  *60, # 1 day no-decay zone "decay": 0.5 # Half score at scale distance }  reranker (str): : Specifies the reranking method to use. Must be set to "decay" to enable decay ranking functionality. function (str): Specifies which mathematical decay ranker to apply. Possible values: `"gauss"`, `"expr"`, `"linear"`. For details, refer to [Choose the right decay ranker](https://milvus.io/docs/decay-ranker-overview.md#Choose-the-right-decay-ranker): . origin (int): : Reference point from which decay score is calculated. scale (int): : Distance or time at which relevance drops to the decay value. offset (int): Creates a "no-decay zone" around the `origin` where items maintain full scores (decay score = 1.0): . decay (float): : Score value at the scale distance, controls curve steepness. For details on decay ranking, refer to Decay Ranker Overview. Model Ranker: TEI Provider: python params={ "reranker": "model", # Specify model reranker. Must be "model" "provider": "tei", # Choose provider: "tei" or "vllm" "queries": ["machine learning for time series"], # Query text "endpoint": "http://model-service:8080", # Model service endpoint "max_client_batch_size": 32, # Optional (default: 32) "truncate": True, # Optional: Truncate the inputs that are longer than the maximum supported size "truncation_direction": "Right", # Optional: Direction to truncate the inputs } ` vLLM Provider: `python params={ "reranker": "model", # Specifies model-based reranking "provider": "vllm", # Specifies vLLM service "queries": ["renewable energy developments"], # Query text "endpoint": "http://localhost:8080", # vLLM service address "max_client_batch_size": 64, # Optional: batch size "truncate_prompt_tokens": 256, # Optional: Use last 256 tokens } ` Cohere Provider: `python params = { "reranker": "model", # Enables model-based reranking "provider": "cohere", # Specifies Cohere as the service provider "model_name": "rerank-english-v3.0", # Cohere rerank model to use "queries": ["renewable energy developments"], # Query text for relevance evaluation "max_client_batch_size": 128, # Optional: batch size for model service requests (default: 128) "max_tokens_per_doc": 4096, # Optional: max tokens per document (default: 4096) "credential": "your-cohere-api-key" # Optional: authentication credential for Cohere API } ` Voyage AI Provider: `python params = { "reranker": "model", # Enables model-based reranking "provider": "voyageai", # Specifies Voyage AI as the service provider "model_name": "rerank-2.5", # Voyage AI reranker to use "queries": ["renewable energy developments"], # Query text for relevance evaluation "max_client_batch_size": 128, # Optional: batch size for model service requests (default: 128) "truncation": True, # Optional: enable input truncation (default: True) "credential": "your-voyage-api-key" # Optional: if not set, uses VOYAGE_API_KEY env var } ` SiliconFlow Provider: `python params = { "reranker": "model", # Enables model-based reranking "provider": "siliconflow", # Specifies SiliconFlow as the service provider "model_name": "BAAI/bge-reranker-v2-m3", # SiliconFlow reranking model to use "queries": ["renewable energy developments"], # Query text for relevance evaluation "max_client_batch_size": 128, # Optional: batch size for model service requests (default: 128) "max_chunks_per_doc": 5, # Optional: max chunks per document for supported models "overlap_tokens": 50, # Optional: token overlap between chunks for supported models "credential": "your-siliconflow-api-key" # Optional: if not set, uses SILICONFLOW_API_KEY env var } `` reranker (str): : Must be set to "model" to enable model reranking. provider (str): The model service provider to use for reranking. Possible values: `"tei"` or `"vllm"`. For details, refer to [Choose a model provider for your needs](https://milvus.io/docs/model-ranker-overview.md#Choose-a-model-provider-for-your-needs): . queries (List[str]): : List of query strings used by the reranking model to calculate relevance scores. endpoint (str): : URL of the model service. `max_client_batch_size`* (int)*: Maximum number of documents to process in a single batch. Default: 32.:. `truncate`* (bool)*: [TEI only] Whether to truncate inputs that exceed the maximum supported size. For details, refer to [TEI Ranker](https://milvus.io/docs/tei-ranker.md).:. truncation_direction (str):* [TEI only]&ast; Direction for truncation (`"Left"` or `"Right"`). For details, refer to [TEI Ranker](https://milvus.io/docs/tei-ranker.md): . `truncate_prompt_tokens` *(int)*: **[vLLM only]** Number of tokens to keep from the end of the prompt when truncating. For details, refer to [vLLM Ranker](https://milvus.io/docs/vllm-ranker.md).:. `max_tokens_per_doc` *(int)*: **[Cohere only]** Maximum number of tokens per document. Long documents will be automatically truncated to the specified number of tokens. For details, refer to [Cohere Ranker](https://milvus.io/docs/cohere-ranker.md).:. `truncation` *(bool)*: **[Voyage AI only]** Whether to truncate the input to satisfy the "context length limit" on the query and the documents. For details, refer to [Voyage AI Ranker](https://milvus.io/docs/voyage-ai-ranker.md).:. `max_chunks_per_doc` *(int)*: **[SiliconFlow only]** Maximum number of chunks generated from within a document. For details, refer to [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:. `overlap_tokens` *(int)*: **[SiliconFlow only]** Number of token overlaps between adjacent chunks when documents are chunked. For details, refer to [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:.

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
