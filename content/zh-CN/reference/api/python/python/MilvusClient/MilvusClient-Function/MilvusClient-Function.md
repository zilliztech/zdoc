---
title: "Function | Python | MilvusClient"
slug: /python/python/MilvusClient-Function
sidebar_label: "Function"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "一个 `Function` 实例，用于从用户提供的原始数据生成向量嵌入，或对 Milvus 中的搜索结果应用重排序策略。 | Python | MilvusClient"
type: docx
token: GaCYdVohYoHFhrx897zcmcNfn6e
sidebar_position: 3
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
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

`Function` 实例用于从用户提供的原始数据生成向量嵌入，或对 Milvus 中的搜索结果应用重排序策略。

```python
class pymilvus.Function
```

## Constructor\{#constructor}

此构造函数初始化一个新的 `Function` 实例，用于将用户的原始数据转换为向量嵌入，或对搜索结果应用重排序策略。这通过自动化流程实现，从而简化相似性搜索操作。

```python
Function(
    name: str,
    function_type: FunctionType,
    input_field_names: Union[str, List[str]],
    output_field_names: Union[str, List[str]],
    description: str = "",
)
```

**PARAMETERS:**

- `name` (*str*) -

    **[REQUIRED]**

    函数名称。该标识符用于在查询和集合中引用该函数。

- `function_type` (*[FunctionType](./Collections-FunctionType)*) -

    **[REQUIRED]**

    要使用的嵌入函数类型。可选值如下：

    - FunctionType.BM25：基于 BM25 排序算法，从 VARCHAR 或 TEXT 字段生成稀疏向量。

    - FunctionType.TEXTEMBEDDING：从 VARCHAR 或 TEXT 字段生成能够表达语义含义的稠密向量。

    - `FunctionType.MINHASH`：生成可近似文档间 [Jaccard similarity](https://en.wikipedia.org/wiki/Jaccard_index) 的二进制向量。

- `FunctionType.RERANK`：对搜索结果应用重排序策略。

- `input_field_names` (*Union[str, List[str]]*) -

    **[REQUIRED]**

    包含原始数据的 VARCHAR 或 TEXT 字段名称，这些原始数据需要被转换为向量表示。对于 FunctionType.BM25 和 FunctionType.TEXTEMBEDDING，此参数仅接受一个字段名。

- `output_field_names` (*Union[str, List[str]]*) -

    用于存储生成嵌入的字段名称。该字段应对应于集合 schema 中定义的向量字段。此参数仅接受一个字段名。

    <Admonition type="info" icon="📘" title="Notes">

    仅当你将 `function_type` 设置为 `FunctionType.BM25` 和 `FunctionType.TEXTEMBEDDING` 时适用。

    </Admonition>

- `params` (*dict*) -

    嵌入/排序函数的配置字典。支持的键因 `function_type` 而异：

    - `FunctionType.BM25`：不需要参数。传入空字典或完全省略即可。

    - `FunctionType.TEXTEMBEDDING`：

        - `provider` (*str*) -

            嵌入模型提供方。可选值如下：

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

            要使用的嵌入模型名称。其取值取决于 provider。详情请参阅对应文档页面。

        - `credential` (*str*) -

            在 `milvus.yaml` 顶层 `credential:` 部分中定义的凭证标签。

            - 提供该参数时，Milvus 会检索匹配的密钥对或 API token，并在服务端对请求进行签名。

            - 省略时（`None`），Milvus 会回退到 `milvus.yaml` 中为目标模型提供方显式配置的凭证。

            - 如果标签未知或引用的密钥缺失，则调用失败。

        - `dim` (*str*) -

            输出嵌入的维度数。对于 OpenAI 第三代模型，你可以缩短完整向量以降低成本和延迟，同时不会显著损失语义信息。更多信息请参阅 [OpenAI announcement blog post](https://openai.com/blog/new-embedding-models-and-api-updates)。

            <Admonition type="info" icon="📘" title="Notes">

            如果你缩短了向量维度，请确保 schema 的 `add_field` 方法中为向量字段指定的 `dim` 值，与嵌入函数最终输出的维度一致。

            </Admonition>

    - `FunctionType.RERANK`：根据 reranker 类型配置 `params`：

        - **Weighted Ranker**

            ```python
            params = {
                "reranker": "weighted", # Required
                "weights": [0.1, 0.9], # List[float], weights per search path ∈ [0,1]
                "norm_score": True  # Optional
            }
            ```

            - `reranker` (*str*)：指定要使用的重排序方法。必须设置为 `weighted` 才能使用 Weighted Ranker。

            - `weights` (*List[float]*)：与每条搜索路径对应的权重数组；取值范围 ∈ [0,1]。详情请参阅 [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker)。

            - `norm_score` (*boolean*)：是否在加权前对原始分数进行归一化（使用 arctan）。详情请参阅 [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker)。

        - **RRF Ranker**

            ```python
            params = {
                "reranker": "rrf", # Required
                "k": 100  # Optional (default: 60)
            }
            ```

            - `reranker` (*str*)：指定要使用的重排序方法。必须设置为 `"rrf"` 才能使用 RRF Ranker。

            - `k` (*int*)：平滑参数，用于控制文档排名的影响；`k` 越高，对靠前排名的敏感度越低。取值范围：(0, 16384)；默认值：`60`。详情请参阅 [Mechanism of RRF Ranker](https://milvus.io/docs/rrf-ranker.md#Mechanism-of-RRF-Ranker)。

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

            - `reranker` (*str*)：指定要使用的重排序方法。必须设置为 `"decay"` 才能启用衰减排序功能。

            - `function` (*str*)：指定要应用的数学衰减排序器。可选值：`"gauss"`、`"expr"`、`"linear"`。详情请参阅 [Choose the right decay ranker](https://milvus.io/docs/decay-ranker-overview.md#Choose-the-right-decay-ranker)。

            - `origin` (*int*)：计算衰减分数的参考点。

            - `scale`  (*int*)：相关性下降到 `decay` 值时对应的距离或时间。

            - `offset` (*int*)：在 `origin` 周围创建一个“无衰减区”，其中条目保持满分（衰减分数 = 1.0）。

            - `decay` (*float*)：在 `scale` 距离处的分数值，用于控制曲线陡峭程度。

            衰减排序的详情请参阅 [Decay Ranker Overview](https://milvus.io/docs/decay-ranker-overview.md)。

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

            - `reranker` (*str*)：必须设置为 `"model"` 才能启用模型重排序。

            - `provider` (*str*)：用于重排序的模型服务提供方。可选值：`"tei"` 或 `"vllm"`。详情请参阅 [Choose a model provider for your needs](https://milvus.io/docs/model-ranker-overview.md#Choose-a-model-provider-for-your-needs)。

            - `queries` (*List[str]*)：查询字符串列表，重排序模型使用它来计算相关性分数。

            - `endpoint` (*str*)：模型服务的 URL。

            - `max_client_batch_size` *(int)*：单批次处理的最大文档数。默认值：32。

            - `truncate` *(bool)*：**[仅限 TEI]** 是否截断超出最大支持大小的输入。详情请参阅 [TEI Ranker](https://milvus.io/docs/tei-ranker.md)。

            - `truncation_direction` (*str*)：**[仅限 TEI]** 截断方向（`"Left"` 或 `"Right"`）。详情请参阅 [TEI Ranker](https://milvus.io/docs/tei-ranker.md)。

            - `truncate_prompt_tokens` *(int)*：**[仅限 vLLM]** 截断时从提示词末尾保留的 token 数量。详情请参阅 [vLLM Ranker](https://milvus.io/docs/vllm-ranker.md)。

            - `max_tokens_per_doc` *(int)*：**[仅限 Cohere]** 每个文档的最大 token 数。较长文档会自动截断到指定 token 数。详情请参阅 [Cohere Ranker](https://milvus.io/docs/cohere-ranker.md)。

            - `truncation` *(bool)*：**[仅限 Voyage AI]** 是否截断输入，以满足查询和文档的“上下文长度限制”。详情请参阅 [Voyage AI Ranker](https://milvus.io/docs/voyage-ai-ranker.md)。

            - `max_chunks_per_doc` *(int)*：**[仅限 SiliconFlow]** 单个文档内部生成的最大 chunk 数。详情请参阅 [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md)。

            - `overlap_tokens`  *(int)*：**[仅限 SiliconFlow]** 当文档被切分为 chunk 时，相邻 chunk 之间重叠的 token 数。详情请参阅 [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md)。

- `description` (*str*) -

    **[OPTIONAL]**

    对函数用途的简要说明。在较大的项目中，这对于文档说明或提升可读性会很有帮助，默认值为空字符串。

**RETURN TYPE:**

`Function` 的实例，封装了将原始数据转换为向量嵌入的特定处理行为。

**RETURNS:**

一个可注册到 Milvus 集合中的 `Function` 对象，用于在数据插入期间自动生成嵌入。

**EXCEPTIONS:**

- `UnknownFunctionType`

    当指定了不受支持或无法识别的函数类型时，将引发此异常。

- `FunctionIncorrectInputOutputType`

    当 `input_field_names` 或 `output_field_names` 中的一个或多个字段名不是字符串时，将引发此异常。

- `FunctionDuplicateInputs`

    当 `input_field_names` 中存在重复字段名时，将引发此异常。

- `FunctionDuplicateOutputs`

    当 `output_field_names` 中存在重复字段名时，将引发此异常。

- `FunctionCommonInputOutput`

    当 `input_field_names` 与 `output_field_names` 之间存在重叠时，将引发此异常，也就是同一个字段名同时出现在两者中。

## Examples\{#examples}

- 使用 `BM25`

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

- 使用 `TEXTEMBEDDING`

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

- 使用 `RERANK`

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
