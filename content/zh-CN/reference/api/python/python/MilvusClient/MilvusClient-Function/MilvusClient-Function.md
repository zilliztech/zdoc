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

    用于对搜索结果应用重排序策略的选项。

- **input_field_names** (*Union[str, List[str]]*) -

    **[必需]**

    包含需要转换为向量表示的原始数据的 VARCHAR 或 TEXT 字段名称。对于 FunctionType.BM25 和 FunctionType.TEXTEMBEDDING，此参数仅接受一个字段名。

- **output_field_names** (*Union[str, List[str]]*) -

    用于存储所生成嵌入的字段名称。此字段应对应 Collection Schema 中定义的向量字段。此参数仅接受一个字段名。此参数仅适用于将 function_type 设置为 FunctionType.BM25 和 FunctionType.TEXTEMBEDDING 的情况。

- **params** (*dict*) -

    用于嵌入/ranking 函数的配置字典。支持的键因 function_type 而异：FunctionType.BM25：无需参数。传递空字典或完全省略。FunctionType.TEXTEMBEDDING：provider (str)：嵌入模型提供方。可选值如下：openai ([OpenAI](https://milvus.io/docs/openai.md)):. azure_openai ([Microsoft Azure OpenAI](https://milvus.io/docs/azure-openai.md)):. dashscope ([DashScope](https://milvus.io/docs/dashscope.md)):. bedrock ([Amazon Bedrock](https://milvus.io/docs/bedrock.md)):. vertexai ([Google Cloud Vertext AI](https://milvus.io/docs/vertex-ai.md)):. voyageai ([Voyage AI](https://milvus.io/docs/voyage-ai.md)):. cohere ([Cohere](https://milvus.io/docs/cohere.md)):. siliconflow ([SiliconFlow](https://milvus.io/docs/siliconflow.md)):. TEI ([Hugging Face Text Embedding Inference](https://milvus.io/docs/hugging-face-tei.md)):. model_name (str)：要使用的嵌入模型名称。该值因提供方而异。有关详细信息，请参阅各自的文档页面。credential (str)：在 milvus.yaml 的顶层 credential: 部分定义的凭据标签。提供后，Milvus 会检索匹配的密钥对或 API token，并在服务器端对请求进行签名。:. 省略时（`None`），Milvus 会回退到在 `milvus.yaml` 中为目标模型提供方显式配置的凭据。:. 如果标签未知或引用的键缺失，则调用失败。:. dim (str)：输出嵌入的维度数。对于 OpenAI 的第三代模型，您可以缩短完整向量，以降低成本和延迟，同时不会显著损失语义信息。有关详细信息，请参阅 OpenAI 公告博客文章。如果缩短向量维度，请确保 Schema 的 add_field 方法中为向量字段指定的 dim 值与嵌入函数的最终输出维度一致。FunctionType.RERANK：根据重排序器类型配置 params：Weighted Ranker：reranker (str)：: 指定要使用的重排序方法。必须设置为 weighted 才能使用 Weighted Ranker。weights (List[float])：与每个搜索路径对应的权重数组；值 ∈ [0,1]。有关详细信息，请参阅 [Weighted Ranker 工作机制](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . norm_score (boolean)：是否在加权前对原始分数进行归一化（使用反正切函数）。有关详细信息，请参阅 [Weighted Ranker 工作机制](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . RRF Ranker：reranker (str)：: 指定要使用的重排序方法。必须设置为 "rrf" 才能使用 RRF Ranker。k (int)：平滑参数，用于控制文档排名的影响；`k` 越高，对靠前排名的敏感度越低。取值范围：(0, 16384)；默认值：`60`。有关详细信息，请参阅 [RRF Ranker 工作机制](https://milvus.io/docs/rrf-ranker.md#Mechanism-of-RRF-Ranker): . Decay Ranker：reranker (str)：: 指定要使用的重排序方法。必须设置为 "decay" 才能启用衰减排名功能。function (str)：指定要应用的数学衰减排序器类型。可选值：`"gauss"`、`"expr"` 和 `"linear"`。有关详细信息，请参阅 [选择合适的 Decay Ranker](https://milvus.io/docs/decay-ranker-overview.md#Choose-the-right-decay-ranker): . origin (int)：: 计算衰减分数时所用的参考点。scale (int)：: 相关性降至衰减值时所对应的距离或时间。offset (int)：在 `origin` 周围创建一个“无衰减区域”，其中的条目保持满分（衰减分数 = 1.0）： . decay (float)：: 位于 scale 距离处的分数值，用于控制曲线陡峭程度。有关衰减排名的详细信息，请参阅 Decay Ranker 概述。Model Ranker：TEI 提供方：vLLM 提供方：Cohere 提供方：Voyage AI 提供方：SiliconFlow 提供方：reranker (str)：: 必须设置为 "model" 才能启用模型重排序。provider (str)：用于重排序的模型服务提供方。可选值：`"tei"` 或 `"vllm"`。有关详细信息，请参阅 [选择适合您需求的模型提供方](https://milvus.io/docs/model-ranker-overview.md#Choose-a-model-provider-for-your-needs): . queries (List[str])：: 重排序模型用于计算相关性分数的查询字符串列表。Endpoint (str)：: 模型服务 URL。`max_client_batch_size` &ast;(int)&ast;：单批处理的最大文档数量。默认值：32.:.`truncate` &ast;(bool)&ast;：&ast;&ast;[仅 TEI]&ast;&ast; 是否截断超过最大支持大小的输入。有关详细信息，请参阅 [TEI Ranker](https://milvus.io/docs/tei-ranker.md).:. truncation_direction (str)：*[仅 TEI]* 截断方向（`"Left"` 或 `"Right"`）。有关详细信息，请参阅 [TEI Ranker](https://milvus.io/docs/tei-ranker.md):.`truncate_prompt_tokens` *(int)*：**[仅 vLLM]** 截断时从提示词末尾保留的 token 数量。有关详细信息，请参阅 [vLLM Ranker](https://milvus.io/docs/vllm-ranker.md).:.`max_tokens_per_doc` *(int)*：**[仅 Cohere]** 每个文档的最大 token 数量。长文档将自动截断为指定的 token 数量。有关详细信息，请参阅 [Cohere Ranker](https://milvus.io/docs/cohere-ranker.md).:.`truncation` *(bool)*：**[仅 Voyage AI]** 是否截断输入，以满足查询和文档的“上下文长度限制”。有关详细信息，请参阅 [Voyage AI Ranker](https://milvus.io/docs/voyage-ai-ranker.md).:.`max_chunks_per_doc` *(int)*：**[仅 SiliconFlow]** 单个文档内生成的最大分块数量。有关详细信息，请参阅 [SiliconFlow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:.`overlap_tokens` *(int)*：**[仅 SiliconFlow]** 对文档分块时相邻分块之间的 token 重叠数量。有关详细信息，请参阅 [SiliconFlow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:.

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
