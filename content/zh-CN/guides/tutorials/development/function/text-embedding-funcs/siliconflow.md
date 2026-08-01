---
title: "硅基流动 | Cloud"
slug: /siliconflow
sidebar_label: "硅基流动"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "了解如何在 Zilliz Cloud 中使用硅基流动的 Embedding 模型。 | Cloud"
type: origin
token: XMTNwxeHOiIGU5ksWpvcBlCmnPb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 硅基流动

了解如何在 Zilliz Cloud 中使用硅基流动的 Embedding 模型。

## 开始前\{#before-you-start}

在使用 Text Embedding Function 之前，请确保满足以下先决条件：

- **选择 Embedding 模型**

    请直接在硅基流动官方模型库查看最新与完整的 Embedding 模型列表与参数。详情请参考[模型库入口](https://cloud.siliconflow.cn/me/models?types=embedding)。

- **与硅基流动集成并获取集成 ID**

    您必须在 Zilliz Cloud 中创建与硅基流动的模型提供方集成，并获取集成 ID。详见[模型供应商](./integrate-with-model-providers)。

- **设计兼容的 Collection Schema**

    规划 Collection Schema 以包含：

    - 一个用于原始输入文本的文本字段（`VARCHAR`）

    - 一个稠密向量字段，其数据类型与维度应匹配所选 Embedding 模型

- **准备在插入与搜索时处理原始文本**

    启用 Text Embedding Function 后，你将直接插入与查询原始文本。系统会自动生成 Embedding 向量。

## 步骤 1：创建带有 Text Embedding Function 的 Collection\{#step-1-create-a-collection-with-a-text-embedding-function}

### 定义 Schema 字段\{#define-schema-fields}

要使用 Text Embedding Function，请创建具有特定 Schema 的 Collection。该模式至少需包含三个必要字段：

- 唯一标识 Collection 中每个实体的主键字段。

- 一个用于存储待嵌入原始数据的 VARCHAR 字段。

- 一个用于存储稠密向量的向量字段，向量由 Text Embedding Function 为文本 VARCHAR 字段生成。

下面示例定义了一个用于存储文本数据的 VARCHAR 字段 `document`，以及一个用于存储由 Text Embedding Function 生成的稠密向量的向量字段 `dense`。请务必将向量维度（`dim`）设置为与你所选 Embedding 模型的输出一致。

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)

schema.add_field("document", DataType.VARCHAR, max_length=9000)

schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1024)
```

### 定义 Text Embedding Function\{#define-the-text-embedding-function}

Text Embedding Function 会自动将存储在 VARCHAR 字段中的原始数据转换为向量 Embedding，并写入到明确定义的向量字段中。

下面示例添加了一个 Function（`siliconflow_embedding`），将标量字段 `document` 转换为向量 Embedding，并将结果向量存储在前面定义的 `dense` 向量字段中。

```python
text_embedding_function = Function(
    name="siliconflow_embedding",                        # Unique identifier for this embedding function
    function_type=FunctionType.TEXTEMBEDDING,       # Indicates a text embedding function
    input_field_names=["document"],                 # Scalar field(s) containing text data to embed
    output_field_names=["dense"],                   # Vector field(s) for storing embeddings
    params={                                      # Provider-specific embedding parameters (function-level)
        "provider": "siliconflow",                # Must be set to "siliconflow"
        "model_name": "BAAI/bge-large-en-v1.5",    # Specifies the SiliconFlow embedding model to use
        "integration_id": "YOUR_INTEGRATION_ID",    # Integration ID generated in the Zilliz Cloud console for the selected model provider
    }
)

schema.add_function(text_embedding_function)
```

### 配置索引\{#configure-the-index}

在定义好包含必要字段与内置 Function 后，为 Collection 设置索引。为简化流程，可将 index_type 设置为 AUTOINDEX，该选项允许 Zilliz Cloud 基于你的数据结构自动选择并配置最合适的索引类型。

```python
# Prepare index parameters
index_params = client.prepare_index_params()

# Add AUTOINDEX to automatically select optimal indexing method
index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE" 
)
```

### 创建 Collection\{#create-the-collection}

```python
# Create collection named "demo"
client.create_collection(
    collection_name='demo', 
    schema=schema, 
    index_params=index_params
)
```

## 步骤 2：插入数据\{#insert-data}

在创建好包含必要字段与 Text Embedding Function 的 Collection 后，可以开始插入原始文本数据。系统会自动为指定的 VARCHAR 字段生成向量 Embedding，并写入到对应的向量字段。

```python
# Insert sample documents
client.insert('demo', [
    {'id': 1, 'document': 'Milvus simplifies semantic search through embeddings.'},
    {'id': 2, 'document': 'Vector embeddings convert text into searchable numeric data.'},
    {'id': 3, 'document': 'Semantic search helps users find relevant information quickly.'},
])
```

## 步骤 3：文本搜索\{#search-with-text}

启用 Text Embedding Function 后，可以直接使用原始查询文本进行向量检索。系统会在查询时为输入文本生成向量 Embedding，并使用你在索引中配置的度量（例如 COSINE）进行相似度搜索。

```python
# Perform semantic search
results = client.search(
    collection_name='demo', 
    data=['How does Milvus handle semantic search?'], # Use text query rather than query vector
    anns_field='dense',   # Use the vector field that stores embeddings
    limit=1,
    output_fields=['document'],
)

print(results)
```
