---
title: "Function | Python | MilvusClient"
slug: /python/python/MilvusClient-Function
sidebar_label: "Function"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A `Function` instance for generating vector embeddings from user-provided raw data or applying a reranking strategy to the search results in Milvus. | Python | MilvusClient"
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

A `Function` instance for generating vector embeddings from user-provided raw data or applying a reranking strategy to the search results in Milvus.

## Request Syntax\{#request-syntax}

```python
class pymilvus.Function
```

**PARAMETERS:**

- **name** (*str*) -

    **[REQUIRED]**

    The name of the function. This identifier is used to reference the function within queries and collections.

- **function_type** (*[FunctionType](./Collections-FunctionType)*) -

    **[REQUIRED]**

    The type of embedding function to use. Possible values: FunctionType.BM25: Generates sparse vectors based on the BM25 ranking algorithm from a VARCHAR or TEXT field.:. FunctionType.TEXTEMBEDDING: Generates dense vectors that capture semantic meaning from a VARCHAR or TEXT field.:. FunctionType.MINHASH: Generates binary vectors that approximate Jaccard similarity between documents.

- **FunctionType.RERANK** (*[FunctionType](./Collections-FunctionType)*) -

    An option that applies reranking strategies to the search results.

- **input_field_names** (*Union[str, List[str]]*) -

    **[REQUIRED]**

    The name of the VARCHAR or TEXT field containing the raw data that requires conversion to a vector representation. For FunctionType.BM25 and FunctionType.TEXTEMBEDDING, this parameter accepts only one field name.

- **output_field_names** (*Union[str, List[str]]*) -

    The name of the field where the generated embeddings will be stored. This should correspond to a vector field defined in the collection schema. This parameter accepts only one field name. This applies only when you set function_type to FunctionType.BM25 and FunctionType.TEXTEMBEDDING.

- **params** (*dict*) -

    A configuration dictionary for the embedding/ranking function. Supported keys vary by function_type: FunctionType.BM25: No parameters required. Pass an empty dictionary or omit entirely. FunctionType.TEXTEMBEDDING: provider (str): The embedding model provider. Possible values are as follows: openai ([OpenAI](https://milvus.io/docs/openai.md)):. azure_openai ([Microsoft Azure OpenAI](https://milvus.io/docs/azure-openai.md)):. dashscope ([DashScope](https://milvus.io/docs/dashscope.md)):. bedrock ([Amazon Bedrock](https://milvus.io/docs/bedrock.md)):. vertexai ([Google Cloud Vertext AI](https://milvus.io/docs/vertex-ai.md)):. voyageai ([Voyage AI](https://milvus.io/docs/voyage-ai.md)):. cohere ([Cohere](https://milvus.io/docs/cohere.md)):. siliconflow ([SiliconFlow](https://milvus.io/docs/siliconflow.md)):. TEI ([Hugging Face Text Embedding Inference](https://milvus.io/docs/hugging-face-tei.md)):. model_name (str): The name of the embedding model to use. The value varies with the provider. For details, refer to their respective document page. credential (str): The label of a credential defined in the top-level credential: section of milvus.yaml. When provided, Milvus retrieves the matching key pair or API token and signs the request on the server side.:. When omitted (`None`), Milvus falls back to the credential explicitly configured for the target model provider in `milvus.yaml`.:. If the label is unknown or the referenced key is missing, the call fails.:. dim (str): The number of dimensions for the output embeddings. For OpenAI's third-generation models, you can shorten the full vector to reduce cost and latency without a significant loss of semantic information. For more information, refer to OpenAI announcement blog post. If you shorten the vector dimension, ensure the dim value specified in the schema's add_field method for the vector field matches the final output dimension of your embedding function. FunctionType.RERANK: Configure params based on reranker type: Weighted Ranker: reranker (str): : Specifies the reranking method to use. Must be set to weighted to use Weighted Ranker. weights (List[float]): Array of weights corresponding to each search path; values ∈ [0,1]. For details, refer to [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . norm_score (boolean): Whether to normalize raw scores (using arctan) before weighting. For details, refer to [Mechanism of Weighted Ranker](https://milvus.io/docs/weighted-ranker.md#Mechanism-of-Weighted-Ranker): . RRF Ranker: reranker (str): : Specifies the reranking method to use. Must be set to "rrf" to use RRF Ranker. k (int): Smoothing parameter that controls the impact of document ranks; higher `k` reduces sensitivity to top ranks. Value range: (0, 16384); default: `60`. For details, refer to [Mechanism of RRF Ranker](https://milvus.io/docs/rrf-ranker.md#Mechanism-of-RRF-Ranker): . Decay Ranker: reranker (str): : Specifies the reranking method to use. Must be set to "decay" to enable decay ranking functionality. function (str): Specifies which mathematical decay ranker to apply. Possible values: `"gauss"`, `"expr"`, `"linear"`. For details, refer to [Choose the right decay ranker](https://milvus.io/docs/decay-ranker-overview.md#Choose-the-right-decay-ranker): . origin (int): : Reference point from which decay score is calculated. scale (int): : Distance or time at which relevance drops to the decay value. offset (int): Creates a "no-decay zone" around the `origin` where items maintain full scores (decay score = 1.0): . decay (float): : Score value at the scale distance, controls curve steepness. For details on decay ranking, refer to Decay Ranker Overview. Model Ranker: TEI Provider: vLLM Provider: Cohere Provider: Voyage AI Provider: SiliconFlow Provider: reranker (str): : Must be set to "model" to enable model reranking. provider (str): The model service provider to use for reranking. Possible values: `"tei"` or `"vllm"`. For details, refer to [Choose a model provider for your needs](https://milvus.io/docs/model-ranker-overview.md#Choose-a-model-provider-for-your-needs): . queries (List[str]): : List of query strings used by the reranking model to calculate relevance scores. endpoint (str): : URL of the model service. `max_client_batch_size` &ast;(int)&ast;: Maximum number of documents to process in a single batch. Default: 32.:. `truncate` &ast;(bool)&ast;: &ast;&ast;[TEI only]&ast;&ast; Whether to truncate inputs that exceed the maximum supported size. For details, refer to [TEI Ranker](https://milvus.io/docs/tei-ranker.md).:. truncation_direction (str): *[TEI only]* Direction for truncation (`"Left"` or `"Right"`). For details, refer to [TEI Ranker](https://milvus.io/docs/tei-ranker.md): . `truncate_prompt_tokens` *(int)*: **[vLLM only]** Number of tokens to keep from the end of the prompt when truncating. For details, refer to [vLLM Ranker](https://milvus.io/docs/vllm-ranker.md).:. `max_tokens_per_doc` *(int)*: **[Cohere only]** Maximum number of tokens per document. Long documents will be automatically truncated to the specified number of tokens. For details, refer to [Cohere Ranker](https://milvus.io/docs/cohere-ranker.md).:. `truncation` *(bool)*: **[Voyage AI only]** Whether to truncate the input to satisfy the "context length limit" on the query and the documents. For details, refer to [Voyage AI Ranker](https://milvus.io/docs/voyage-ai-ranker.md).:. `max_chunks_per_doc` *(int)*: **[SiliconFlow only]** Maximum number of chunks generated from within a document. For details, refer to [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:. `overlap_tokens` *(int)*: **[SiliconFlow only]** Number of token overlaps between adjacent chunks when documents are chunked. For details, refer to [SiliconFLow Ranker](https://milvus.io/docs/siliconflow-ranker.md).:.

- **description** (*str*) -

    An option that [OPTIONAL] A short description of the function's purpose. This can be useful for documentation or clarity in larger projects and defaults to an empty string.

**RETURN TYPE:**

*Function*

**RETURNS:**

Instance of Function that encapsulates the specific processing behavior for converting raw data to vector embeddings. A Function object that can be registered with a Milvus collection, facilitating automatic embedding generation during data insertion.

**EXCEPTIONS:**

- **UnknownFunctionType**

    This exception will be raised when an unsupported or unrecognized function type is specified. This exception will be raised when an unsupported or unrecognized function type is specified.

- **FunctionIncorrectInputOutputType**

    This exception will be raised when one or more field names in `input_field_names` or `output_field_names` are not strings. This exception will be raised when one or more field names in `input_field_names` or `output_field_names` are not strings.

- **FunctionDuplicateInputs**

    This exception will be raised when there are duplicate field names in `input_field_names`. This exception will be raised when there are duplicate field names in `input_field_names`.

- **FunctionDuplicateOutputs**

    This exception will be raised when there are duplicate field names in `output_field_names`. This exception will be raised when there are duplicate field names in `output_field_names`.

- **FunctionCommonInputOutput**

    This exception will be raised when there is an overlap between `input_field_names` and `output_field_names`, meaning that the same field name is present in both. This exception will be raised when there is an overlap between `input_field_names` and `output_field_names`, meaning that the same field name is present in both.

## Examples\{#examples}

- Use BM25

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

- Use TEXTEMBEDDING

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

- Use RERANK

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
