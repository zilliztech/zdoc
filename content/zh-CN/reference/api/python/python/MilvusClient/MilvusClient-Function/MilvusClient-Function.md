---
title: "Function | Python | MilvusClient"
slug: /python/python/MilvusClient-Function
sidebar_label: "Function"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "用于根据用户提供的原始数据生成向量嵌入，或对 Milvus 中的搜索结果应用重排序策略的 `Function` 实例。 | Python | MilvusClient"
type: docx
token: GaCYdVohYoHFhrx897zcmcNfn6e
sidebar_position: 3
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - cloud
  - Function
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Function

用于根据用户提供的原始数据生成向量嵌入，或对 Milvus 中的搜索结果应用重排序策略的 `Function` 实例。

## 请求语法\{#request-syntax}

```python
class pymilvus.Function
```

**参数：**

- **name** (*str*) -

    **[必需]**

    函数名称。此标识符用于在查询和 Collection 中引用该函数。

- **function_type** (*[FunctionType](./Collections-FunctionType)*) -

    **[必需]**

    要使用的嵌入函数类型。可能的值：FunctionType.BM25：根据 VARCHAR 或 TEXT 字段，基于 BM25 排序算法生成稀疏向量。:. FunctionType.TEXTEMBEDDING：从 VARCHAR 或 TEXT 字段生成可捕获语义含义的稠密向量。:. FunctionType.MINHASH：生成可近似表示文档之间 Jaccard 相似度的二进制向量。

- **FunctionType.RERANK** (*[FunctionType](./Collections-FunctionType)*) -

    一个 p p 的选项。

- **input_field_names** (*Union[str, List[str]]*) -

    **[必需]**

    包含需要转换为向量表示的原始数据的 VARCHAR 或 TEXT 字段名称。对于 FunctionType.BM25 和 FunctionType.TEXTEMBEDDING，此参数仅接受一个字段名。

- **output_field_names** (*Union[str, List[str]]*) -

    用于存储所生成嵌入的字段名称。此字段应对应 Collection Schema 中定义的向量字段。此参数仅接受一个字段名。此参数仅适用于将 function_type 设置为 FunctionType.BM25 和 FunctionType.TEXTEMBEDDING 的情况。

- **params** (*dict*) -

    embedding/ranking 函数的配置字典。支持的键因 function_type 而异：FunctionType.BM25：无需任何参数。请传入空字典或完全省略。FunctionType.TEXTEMBEDDING：provider (str)：嵌入模型提供商。可能的值如下：openai ([OpenAI](https://milvus.io/docs/openai.md)):. azure_openai ([Microsoft Azure OpenAI](https://milvus.io/docs/azure-openai.md)):. dashscope ([DashScope](https://milvus.io/docs/dashscope.md)):. bedrock ([Amazon Bedrock](https://milvus.io/docs/bedrock.md)):. vertexai ([Google Cloud Vertext AI](https://milvus.io/docs/vertex-ai.md)):. voyageai ([Voyage AI](https://milvus.io/docs/voyage-ai.md)):. cohere ([Cohere](https://milvus.io/docs/cohere.md)):. siliconflow ([SiliconFlow](https://milvus.io/docs/siliconflow.md)):. TEI ([Hugging Face Text Embedding Inference](https://milvus.io/docs/hugging-face-tei.md)):. model_name (str)：要使用的嵌入模型名称。该值因提供商而异。有关详细信息，请参见各自的文档页面。credential (str)：milvus.yaml 顶层 credential: 部分中定义的凭据标签。提供后，Milvus 会检索匹配的密钥对或 API token，并在服务器端对请求进行签名。:. 省略时（`None`），Milvus 会回退到 `milvus.yaml` 中为目标模型提供商显式配置的凭据。:. 如果标签未知或引用的密钥缺失，调用将失败。:. dim (str)：输出嵌入的维度数。对于 OpenAI 的第三代模型，您可以缩短完整向量，以降低成本并减少延迟，同时不会显著丢失语义信息。有关更多信息，请参见 OpenAI 公告博客文章。如果缩短向量维度，请确保 Schema 的 add_field 方法为向量字段指定的 dim 值与嵌入函数的最终输出维度相匹配。FunctionType.RERANK：根据 reranker 类型配置 params：Weighted Ranker: python params = \{ "reranker": "weighted", # Required "weights": [0.1, 0.9], # List[float], weights per search path ∈ [0,1] "norm_score": True # Optional } `` reranker (str): : Specifies the reranking method to use. Must be set to weighted to use Weighted Ranker. weights (List[float]): Array of weights corresponding to each search path; values ∈ [0,1]. For details, refer to [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . norm_score (boolean): Whether to normalize raw scores (using arctan) before weighting. For details, refer to [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . RRF Ranker: python params = { "reranker": "rrf", # Required "k": 100 # Optional (default: 60) }  reranker (str): : Specifies the reranking method to use. Must be set to "rrf" to use RRF Ranker. k (int): Smoothing parameter that controls the impact of document ranks; higher `k` reduces sensitivity to top ranks. Value range: (0, 16384); default: `60`. For details, refer to [Mechanism of RRF Ranker](https://milvus.io/docs/rrf-ranker.md#Mechanism-of-RRF-Ranker): . Decay Ranker: python params={ "reranker": "decay", # Specify decay reranker. Must be "decay" "function": "gauss", # Choose decay function type: "gauss", "exp", or "linear" "origin": 1720000000, # Reference point (e.g., Unix timestamp) "scale": 7  *24*  60  *60, # 7 days in seconds "offset": 24*  60  *60, # 1 day no-decay zone "decay": 0.5 # Half score at scale distance }  reranker (str): : Specifies the reranking method to use. Must be set to "decay" to enable decay ranking functionality. function (str): Specifies which mathematical decay ranker to apply. Possible values: `"gauss"`, `"expr"`, `"linear"`. For details, refer to [Choose the right decay ranker](https://milvus.io/docs/decay-ranker-overview.md#Choose-the-right-decay-ranker): . origin (int): : Reference point from which decay score is calculated. scale (int): : Distance or time at which relevance drops to the decay value. offset (int): Creates a "no-decay zone" around the `origin` where items maintain full scores (decay score = 1.0): . decay (float): : Score value at the scale distance, controls curve steepness. For details on decay ranking, refer to Decay Ranker Overview. Model Ranker: TEI Provider: python params={ "reranker": "model", # Specify model reranker. Must be "model" "provider": "tei", # Choose provider: "tei" or "vllm" "queries": ["machine learning for time series"], # Query text "endpoint": "http://model-service:8080", # Model service endpoint "max_client_batch_size": 32, # Optional (default: 32) "truncate": True, # Optional: Truncate the inputs that are longer than the maximum supported size "truncation_direction": "Right", # Optional: Direction to truncate the inputs } ` vLLM Provider: `python params={ "reranker": "model", # Specifies model-based reranking "provider": "vllm", # Specifies vLLM service "queries": ["renewable energy developments"], # Query text "endpoint": "http://localhost:8080", # vLLM service address "max_client_batch_size": 64, # Optional: batch size "truncate_prompt_tokens": 256, # Optional: Use last 256 tokens } ` Cohere Provider: `python params = { "reranker": "model", # Enables model-based reranking "provider": "cohere", # Specifies Cohere as the service provider "model_name": "rerank-english-v3.0", # Cohere rerank model to use "queries": ["renewable energy developments"], # Query text for relevance evaluation "max_client_batch_size": 128, # Optional: batch size for model service requests (default: 128) "max_tokens_per_doc": 4096, # Optional: max tokens per document (default: 4096) "credential": "your-cohere-api-key" # Optional: authentication credential for Cohere API } ` Voyage AI Provider: `python params = { "reranker": "model", # Enables model-based reranking "provider": "voyageai", # Specifies Voyage AI as the service provider "model_name": "rerank-2.5", # Voyage AI reranker to use "queries": ["renewable energy developments"], # Query text for relevance evaluation "max_client_batch_size": 128, # Optional: batch size for model service requests (default: 128) "truncation": True, # Optional: enable input truncation (default: True) "credential": "your-voyage-api-key" # Optional: if not set, uses VOYAGE_API_KEY env var } ` SiliconFlow Provider: `python params = { "reranker": "model", # Enables model-based reranking "provider": "siliconflow", # Specifies SiliconFlow as the service provider "model_name": "BAAI/bge-reranker-v2-m3", # SiliconFlow reranking model to use "queries": ["renewable energy developments"], # Query text for relevance evaluation "max_client_batch_size": 128, # Optional: batch size for model service requests (default: 128) "max_chunks_per_doc": 5, # Optional: max chunks per document for supported models "overlap_tokens": 50, # Optional: token overlap between chunks for supported models "credential": "your-siliconflow-api-key" # Optional: if not set, uses SILICONFLOW_API_KEY env var } `` reranker (str): : 必须设置为 "model" 才能启用模型重排序。provider (str)：用于重排序的模型服务提供商。可能的值：`"tei"` 或 `"vllm"`。有关详细信息，请参见 [选择适合您需求的模型提供商](https://milvus.io/docs/model-ranker-overview.md#Choose-a-model-provider-for-your-needs): . queries (List[str]): : 重排序模型用于计算相关性分数的查询字符串列表。Endpoint (str): : 模型服务的 URL。`max_client_batch_size`* (int)*：单个批次中可处理的最大文档数。默认值：32。:. `truncate`* (bool)*：[仅 TEI] 是否截断超过最大支持大小的输入。有关详细信息，请参见 [TEI Ranker](https://milvus.io/docs/tei-ranker.md).:. truncation_direction (str):* [仅 TEI]&ast; 截断方向（`"Left"` 或 `"Right"`）。有关详细信息，请参见 [TEI Ranker](https://milvus.io/docs/tei-ranker.md): . `truncate_prompt_tokens` *(int)*：**[仅 vLLM]** 截断时从提示末尾保留的 token 数。有关详细信息，请参见 [vLLM Ranker](https://milvus.io/docs/vllm-ranker.md).:. `max_tokens_per_doc` *(int)*：**[仅 Cohere]** 每个文档的最大 token 数。长文档会自动截断为指定的 token 数。有关详细信息，请参见 [Cohere Ranker](https://milvus.io/docs/cohere-ranker.md).:. `truncation` *(bool)*：**[仅 Voyage AI]** 是否截断输入，以满足查询和文档的“上下文长度限制”。有关详细信息，请参见 [Voyage AI Ranker](https://milvus.io/docs/voyage-ai-ranker.md).:. `max_chunks_per_doc` *(int)*：**[仅 SiliconFlow]** 从单个文档内部生成的最大分块数。有关详细信息，请参见 [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:. `overlap_tokens` *(int)*：**[仅 SiliconFlow]** 对文档进行分块时，相邻分块之间的 token 重叠数。有关详细信息，请参见 [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:.

- **description** (*str*) -

    一个选项，[OPTIONAL] 函数用途的简短描述。这在较大项目中可用于文档说明或提高清晰度，默认值为空字符串。

**返回类型：**

*Function*

**返回值：**

封装将原始数据转换为向量嵌入这一特定处理行为的 Function 实例。一个可注册到 Milvus Collection 的 Function 对象，便于在插入数据期间自动生成嵌入。

**异常：**

- **UnknownFunctionType**

    当指定了不受支持或无法识别的函数类型时，将引发此异常。当指定了不受支持或无法识别的函数类型时，将引发此异常。

- **FunctionIncorrectInputOutputType**

    当 `input_field_names` 或 `output_field_names` 中的一个或多个字段名不是字符串时，将引发此异常。当 `input_field_names` 或 `output_field_names` 中的一个或多个字段名不是字符串时，将引发此异常。

- **FunctionDuplicateInputs**

    当 `input_field_names` 中存在重复的字段名时，将引发此异常。当 `input_field_names` 中存在重复的字段名时，将引发此异常。

- **FunctionDuplicateOutputs**

    当 `output_field_names` 中存在重复的字段名时，将引发此异常。当 `output_field_names` 中存在重复的字段名时，将引发此异常。

- **FunctionCommonInputOutput**

    当 `input_field_names` 和 `output_field_names` 之间存在重叠，即同一个字段名同时出现在两者中时，将引发此异常。当 `input_field_names` 和 `output_field_names` 之间存在重叠，即同一个字段名同时出现在两者中时，将引发此异常。

## 示例\{#examples}

- 使用 BM25

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

- 使用 TEXTEMBEDDING

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

- 使用 RERANK

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
