---
title: "硅基流动 Ranker | Cloud"
slug: /siliconflow-model-ranker
sidebar_key: siliconflow-model-ranker
sidebar_label: "硅基流动 Ranker"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "硅基流动 Ranker 利用硅基流动的综合重排序模型，通过语义重排序来提高搜索相关性。它提供灵活的文档分块功能，并支持来自不同供应商的各种专业重排序模型。 | Cloud"
type: origin
token: FRwPwoZN4ieZeQkEog7cO3EHnMb
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - reranking
  - 重排
  - 搜索结果重排
  - 模型
  - siliconflow
  - 硅基流动

---

import Admonition from '@theme/Admonition';


# 硅基流动 Ranker

硅基流动 Ranker 利用[硅基流动](https://www.siliconflow.com/)的综合重排序模型，通过语义重排序来提高搜索相关性。它提供灵活的文档分块功能，并支持来自不同供应商的各种专业重排序模型。

硅基流动 Ranker对于需要以下条件的应用特别有价值：

- 高级文档分块，具备可配置的重叠部分，用于处理长文档

- 可访问多种重排序模型，包括BAAI/bge重排序器系列和其他专业模型

- 基于灵活分块的评分机制，其中得分最高的分块代表文档得分

- 具有成本效益的重排序，支持标准和专业模型变体

## 开始前\{#before-you-start}

在 Zilliz Cloud 中实施硅基流动 Ranker 之前，请确保您具备以下条件：

- **选择一个 rerank 模型**

    决定要使用的硅基流动 Ranker，例如 BAAI/bge-reranker-v2-m3。

    模型的选择将决定在重排序阶段如何评估语义相关性。

    有关可用模型及其差异，请参考[模型库入口](https://cloud.siliconflow.cn/me/models?types=reranker)。

- **与硅基流动集成并获取集成 ID**

    您必须在 Zilliz Cloud 中创建与硅基流动的模型提供方集成，并获取集成 ID。详见[模型供应商](./integrate-with-model-providers)。

- **规划包含可重排序文本字段的 Collection Schema**

    请确保你的 Collection 中至少包含一个 **VARCHAR** 字段，用于存储需要被重排序的文本内容。

## 使用硅基流动 Ranker\{#use-siliconflow-ranker}

本节展示如何在搜索过程中使用硅基流动 Ranker 对检索结果进行重排序。

硅基流动 Ranker 在**搜索时定义并应用**，而不是作为 Collection Schema 的一部分。这意味着你可以在每次查询中灵活地启用或禁用重排序。

### 准备工作\{#preparations}

以下示例展示了如何准备一个用于搜索和重排序的 Collection 及示例数据。

<details>

<summary><strong>准备 Collection 并插入示例数据</strong></summary>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "cohere_rerank_demo"

# Define collection schema 
schema = client.create_schema()

schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=1000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=4)

# Configure index
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

# Create collection
client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params
)

# Insert sample data
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

client.insert(collection_name, data)
```

</details>

### 定义 rerank function\{#define-the-rerank-function}

硅基流动 Ranker 是在**搜索时定义的**，而不是在创建 Collection Schema 时定义。

该 rerank function 需要指定以下内容：

- 需要重排序的文本字段（VARCHAR）

- 使用的硅基流动 rerank 模型

- 用于评估相关性的查询文本

```python
from pymilvus import Function, FunctionType

siliconflow_ranker = Function(
    name="siliconflow_semantic_ranker",
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model",
        "provider": "siliconflow",
        "model_name": "BAAI/bge-reranker-v2-m3",
        "queries": ["renewable energy developments"],
        "integration_id": "YOUR_INTEGRATION_ID",
    }
)
```

<Admonition type="info" icon="📘" title="说明">

`queries` 中字符串的数量必须与搜索请求中发起的查询数量一致。

</Admonition>

### 使用 rerank function 进行搜索\{#search-with-the-rerank-function}

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    ranker=siliconflow_ranker,
)

print(results)
```

在该搜索过程中：

1. Zilliz Cloud 首先通过向量搜索检索候选结果

1. 硅基流动 Ranker 对每个候选结果进行语义相关性评估

1. 在返回结果之前，对结果集进行重新排序

## 下一步\{#next-steps}

硅基流动 Ranker 也可以与 混合搜索（Hybrid Search） 一起使用。

无论是搜索还是混合搜索，ranker 的应用方式都是一致的：

你只需在搜索请求中，通过 `ranker` 参数传入 rerank function。

有关更多信息，请参阅[多向量混合搜索](./hybrid-search)。