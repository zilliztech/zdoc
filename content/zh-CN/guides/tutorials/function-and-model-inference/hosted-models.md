---
title: "托管模型 | Cloud"
slug: /hosted-models
sidebar_key: hosted-models
sidebar_label: "托管模型"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PRIVATE
notebook: FALSE
description: "Zilliz Cloud 支持在 Zilliz 的基础设施上托管 Embedding 与 Reranking 模型。您可以部署全托管的模型，并直接在 Zilliz Cloud 中调用，从而获得稳定、高性能的推理能力。 | Cloud"
type: origin
token: LIH4wAtfCi0kxvko5X9c8SvFnkZ
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - function
  - 模型
  - 推理
  - embedding
  - 托管模型

---

import Admonition from '@theme/Admonition';


# 托管模型

Zilliz Cloud 支持在 Zilliz 的基础设施上托管 Embedding 与 Reranking 模型。您可以部署全托管的模型，并直接在 Zilliz Cloud 中调用，从而获得稳定、高性能的推理能力。

使用托管模型后，您可以将原始数据直接写入 Collection。Zilliz Cloud 会在数据写入（Ingestion）过程中使用已部署的模型自动生成向量 Embedding。进行语义检索时，您只需提供原始查询文本。Zilliz Cloud 会使用同一模型生成查询向量，与 Zilliz Cloud 向量数据库中存储的向量进行比对，并返回最相关的结果。

下图展示了使用托管模型的整体流程。

![VavawBo20hXd11bzBEScVh23nOd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/VavawBo20hXd11bzBEScVh23nOd.png)

## 部署模型\{#deploy-a-model}

当前，Zilliz Cloud支持以下云地域、机型和模型。

<Admonition type="info" icon="📘" title="说明">

如果您对托管模型有其他具体的需求，请[联系我们](http://support.zilliz.com.cn/)。

</Admonition>

### 支持的云地域\{#supported-regions}

部署模型的云地域需要与您的集群云地域保持一致。支持的云地域包括：

<table>
   <tr>
     <th><p><strong>云地域</strong></p></th>
   </tr>
   <tr>
     <td><p>阿里云华北2（北京）</p></td>
   </tr>
</table>

### 支持的机型\{#supported-instance-type}

机型决定了模型可用的计算资源。支持的机型包括：

<table>
   <tr>
     <th><p><strong>机型</strong></p></th>
     <th><p><strong>资源</strong></p></th>
   </tr>
   <tr>
     <td><p>ecs.gn7i-c8g1.2xlarge</p></td>
     <td><ul><li><p>1 Nvidia A10 GPU</p></li><li><p>8 vCPU</p></li><li><p>30 GB RAM</p></li></ul></td>
   </tr>
</table>

### 支持的模型\{#supported-models}

支持的模型包括：

<table>
   <tr>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>模型</strong></p></th>
   </tr>
   <tr>
     <td rowspan="8"><p>Embedding</p></td>
     <td><p>Qwen/Qwen3-Embedding-0.6B</p></td>
   </tr>
   <tr>
     <td><p>Qwen/Qwen3-Embedding-4B</p></td>
   </tr>
   <tr>
     <td><p>BAAI/bge-small-en-v1.5</p></td>
   </tr>
   <tr>
     <td><p>BAAI/bge-small-zh-v1.5</p></td>
   </tr>
   <tr>
     <td><p>BAAI/bge-base-en-v1.5</p></td>
   </tr>
   <tr>
     <td><p>BAAI/bge-base-zh-v1.5</p></td>
   </tr>
   <tr>
     <td><p>BAAI/bge-large-en-v1.5</p></td>
   </tr>
   <tr>
     <td><p>BAAI/bge-large-zh-v1.5</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>Reranking</p></td>
     <td><p>BAAI/bge-reranker-base</p></td>
   </tr>
   <tr>
     <td><p>BAAI/bge-reranker-large</p></td>
   </tr>
   <tr>
     <td><p>Qwen/Qwen3-Reranker-0.6B</p></td>
   </tr>
   <tr>
     <td><p>Qwen/Qwen3-Reranker-4B</p></td>
   </tr>
   <tr>
     <td><p>Qwen/Qwen3-Reranker-8B</p></td>
   </tr>
   <tr>
     <td><p>Semantic Highlighter</p></td>
     <td><p>zilliz/semantic-highlight-bilingual-v1</p></td>
   </tr>
</table>

## 获取 Deployment ID\{#obtain-a-deployment-id}

根据您提供的模型部署需求，Zilliz 会帮您部署模型，大约需要 15 分钟。部署完成后， Zilliz Cloud 技术支持团队会返还给您一个 **Deployment ID**。您可以使用该 Deployment ID 创建 Embedding 或 Reranking Function。

```bash
"deploymentId": "68f8889be4b01215a275972a"
```

## 在 Function 中使用模型\{#use-the-deployed-model-in-a-function}

获取到 **Deployment ID** 后，您可以在创建 Collection 时定义 Function 并使用已部署的托管模型。

### 使用 Embedding Function\{#use-an-embedding-function}

1. 创建 Collection 并定义 Embedding Function。

    - 需要至少包含 1 个 `VARCHAR` 字段用于存储原始文本

    - 需要至少包含 1 个向量字段用户存储托管模型生成的 Embedding 向量。

    - 向量字段的维度需要与模型输出的向量维度保持一致。

    ```python
    schema = milvus_client.create_schema()
    schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
    schema.add_field("document", DataType.VARCHAR, max_length=9000)
    schema.add_field("dense", DataType.FLOAT_VECTOR, dim=384) # important, the dimension must be supported by the deployed model.
    
    # define embedding function
    text_embedding_function = Function(
        name="zilliz-bge-small-en-v1.5",
        function_type=FunctionType.TEXTEMBEDDING,
        input_field_names=["document"], # Scalar field(s) containing text data to embed
        output_field_names="dense", # Vector field(s) for storing embeddings
     # highlight-start
        params={
            "provider": "zilliz",
            "model_deployment_id": "...", # Use the model deployment ID we provide you
            "truncation": True, # Optional: if true, inputs greater than the max supported input length of the model will be truncated
            "dimension": "384",                # Optional: Shorten the output vector dimension, only if supported by the model
        }
    # highlight-end
    )
    
    schema.add_function(text_embedding_function)
    
    index_params = milvus_client.prepare_index_params()
    index_params.add_index(
        field_name="dense",
        index_name="dense_index",
        index_type="AUTOINDEX",
        metric_type="IP",
    )
    
    ret = milvus_client.create_collection(collection_name, schema=schema, index_params=index_params, consistency_level="Strong")
    ```

1. 插入原始文本数据。

    您只需要向 Collection 中插入原始的文本。Zilliz Cloud 会自动调用 Embedding Function 生成向量并存储于向量字段中。

    ```python
    rows = [
            {"id": 1, "document": "Artificial intelligence was founded as an academic discipline in 1956."},
            {"id": 2, "document": "Alan Turing was the first person to conduct substantial research in AI."},
            {"id": 3, "document": "Born in Maida Vale, London, Turing was raised in southern England."},
    ]
    
    insert_result = milvus_client.insert(collection_name, rows, progress_bar=True)
    
    ```

1. 使用原始文本数据进行相似性搜索。

    查询时您只需要提供原始文本。Zilliz Cloud 会使用相同的托管模型，将查询文本转化为向量并进行相似性搜索。

    ```python
    search_params = {
        "params": {"nprobe": 10},
    }
    queries = ["When was artificial intelligence founded", 
               "Where was Alan Turing born?"]
    
    result = milvus_client.search(collection_name, data=queries, anns_field="dense", search_params=search_params, limit=3, output_fields=["document"], consistency_level="Strong")
    ```

### 使用 Reranking Function\{#use-a-reranking-function}

您也可以设置 Reranking Function 并调用托管模型对搜索结果进行重排。 

```python
import numpy as np
rng = np.random.default_rng(seed=19530)
vectors_to_search = rng.random((1, dim))

# define reranking function
ranker = Function(
    name="model_rerank_fn",
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model", 
        "provider": "zilliz",
        "model_deployment_id": "...", # Use the model deployment ID we provide you,
        "queries": ["machine learning for time series"] * len(vectors_to_search),  # Query text, the number of query strings must match exactly the number of queries in your search operation
    }
)

# Use it during search
result = milvus_client.search(collection_name, vectors_to_search, limit=3, output_fields=["*"], ranker=ranker)
```

### 使用 Semantic Highlighter Function\{#use-a-semantic-highlighter-function}

搜索时，您可以指定 Semantic Highlighter Function对您的搜索结果进行处理，高亮与查询语义上相关的文本片段。

```python
from pymilvus import SemanticHighlighter

# Define the search query
queries = ["When was artificial intelligence founded"]

# Configure semantic highlighter
# highlight-start
highlighter = SemanticHighlighter(
    queries,
    ["document"],                           # Fields to highlight
    pre_tags=["<mark>"],                    # Tag before highlighted text
    post_tags=["</mark>"],                  # Tag after highlighted text
    model_deployment_id="YOUR_MODEL_ID",    # Deployed highlight model ID
)
# highlight-end

# Perform search with highlighting
results = milvus_client.search(
    collection_name,
    data=queries,
    anns_field="dense",
    search_params={"params": {"nprobe": 10}},
    limit=3,
    output_fields=["document"],
    highlighter=highlighter
)

# Process results
for hits in results:
    for hit in hits:
        highlight = hit.get("highlight", {}).get("document", {})
        print(f"ID: {hit['id']}")
        print(f"Search Score: {hit['distance']:.4f}")      # Vector similarity score
        print(f"Fragments: {highlight.get('fragments', [])}")
        print(f"Highlight Confidence: {highlight.get('scores', [])}")  # Semantic relevance score
        print()
```

## 计费\{#billing}

使用托管模型仅会产生 Function 与模型服务费用。推理服务过程中数据不会经过公网传输，所以不会产生数据传输费用。

如需了解不同地域模型的单价，请[联系销售](http://zilliz.com.cn/contact-sales)。

### 计算公式\{#cost-calculation}

```plaintext
Function 与模型服务费用 = 模型单价 x 使用时长
```

- **模型单价**: 请[联系销售](http://zilliz.com.cn/contact-sales)。

- **使用时长**: 模型运行的总时长，按小时计费。无论模型是否被实际调用，模型运行都会计入使用时长。

