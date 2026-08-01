---
title: "Hugging Face | Cloud"
slug: /hugging-face
sidebar_label: "Hugging Face"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "通常情况下，使用 Hugging Face Embedding 模型要求应用自行管理凭证、单独调用模型，并确保为 Insert 数据和搜索查询生成一致的 Embedding。借助 Hugging Face 模型服务集成和 Text Embedding Function，Zilliz Cloud 可在 Insert 和搜索期间将原始文本转换为向量。 | Cloud"
type: origin
token: ZhnIwddbqi8R8ekhLiXcho3CnZf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Hugging Face

通常情况下，使用 Hugging Face Embedding 模型要求应用自行管理凭证、单独调用模型，并确保为 Insert 数据和搜索查询生成一致的 Embedding。借助 Hugging Face 模型服务集成和 Text Embedding Function，Zilliz Cloud 可在 Insert 和搜索期间将原始文本转换为向量。

## 工作原理\{#}

![Qm8Twbq1ah5kphbDr4gcnaEbnve](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Qm8Twbq1ah5kphbDr4gcnaEbnve.png)

该工作流包含以下三个步骤：

1. **发送原始文本。** 应用在 Insert 或搜索请求中提供原始文本。

1. **生成 Embedding。** Text Embedding Function 使用 `integration_id` 引用 Hugging Face 模型服务集成，并使用 `model_name` 选择模型。Zilliz Cloud 通过 `hf-inference` 将文本发送到 Hugging Face，以执行 [Feature Extraction](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction) 任务。

1. **使用 Embedding。** Hugging Face 返回浮点 Embedding 向量。执行 Insert 时，Zilliz Cloud 将向量存储在 Function 的输出字段中；执行搜索时，Zilliz Cloud 将该向量用作查询向量。

Insert 和搜索使用相同的 Function 配置，从而确保模型和推理参数保持一致。

## 模型兼容性\{#}

要将 Hugging Face 模型用于 Text Embedding Function，该模型必须具备 [Feature Extraction](https://huggingface.co/docs/inference-providers/tasks/feature-extraction#api-specification) 能力，并能通过配置的 [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) 集成成功返回 Embedding。Function 输出字段必须是 `FLOAT_VECTOR` 字段，且其 `dim` 必须与模型的 Embedding 维度一致。

以下模型已在所列日期通过 Zilliz Cloud 兼容性测试。

| 模型 | 能力 | 维度 | 最近测试日期 |
| --- | --- | --- | --- |
| [`BAAI/bge-m3`](https://huggingface.co/BAAI/bge-m3) | Feature Extraction | 1024 | 2026-07-27 |
| [`BAAI/bge-large-zh-v1.5`](https://huggingface.co/BAAI/bge-large-zh-v1.5) | Feature Extraction | 1024 | 2026-07-27 |
| [`BAAI/bge-large-en-v1.5`](https://huggingface.co/BAAI/bge-large-en-v1.5) | Feature Extraction | 1024 | 2026-07-27 |
| [`BAAI/bge-small-en-v1.5`](https://huggingface.co/BAAI/bge-small-en-v1.5) | Feature Extraction | 384 | 2026-07-27 |
| [`dragonkue/snowflake-arctic-embed-l-v2.0-ko`](https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko) | Feature Extraction | 1024 | 2026-07-27 |
| [`upskyy/bge-m3-korean`](https://huggingface.co/upskyy/bge-m3-korean) | Feature Extraction | 1024 | 2026-07-27 |

<Admonition type="info" icon="📘" title="说明">

此表并未穷举所有兼容模型。未列出的模型仍可能与该集成兼容。

兼容性结果反映的是所列日期的测试情况。Zilliz Cloud 无法控制某个模型是否仍可通过 [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) 使用，也无法保证其满足你的稳定性、延迟和输出质量要求。Zilliz Cloud 不承诺定期重新测试历史结果。在生产环境中使用模型之前，请在 Hugging Face 上确认所选模型当前可用，并根据你的工作负载进行评估。

</Admonition>

## 开始之前\{#}

使用 Hugging Face 文本 Embedding 前：

- 创建 Hugging Face 模型服务集成并复制其集成 ID。将 **Provider** 设置为 `hf-inference`。有关操作说明，请参阅集成模型服务。

- 打开模型的 Hugging Face 页面，查看 **Inference Providers** 部分。确认 `hf-inference` 当前为该模型提供 `feature-extraction` 任务服务。

- 检查模型的输出维度。Function 输出字段必须是 `FLOAT_VECTOR` 字段，且其 `dim` 必须与模型输出维度一致。不支持自定义输出维度。

以下示例使用 `BAAI/bge-small-en-v1.5`。在撰写本文时，该模型通过 `hf-inference` 生成 384 维 Embedding。此模型仅用于演示配置，并不代表 Zilliz Cloud 对其作出推荐或认证。

## 使用 Hugging Face 文本 Embedding\{#hugging-face-embedding}

### 第 1 步：创建包含文本 Embedding Function 的 Collection\{#1-embedding-function-collection}

#### 定义 Schema 字段\{#schema}

创建包含以下字段的 Collection Schema：

- 用于唯一标识每个 Entity 的主键字段。

- 用于存储原始文本的 `VARCHAR` 字段。

- 维度与所选模型输出维度一致的 `FLOAT_VECTOR` 字段。

以下示例使用 `BAAI/bge-small-en-v1.5`，该模型生成 384 维向量。

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

schema = client.create_schema()

schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=False,
)

schema.add_field(
    field_name="document",
    datatype=DataType.VARCHAR,
    max_length=9000
,
)

# The vector dimension must match the model's output dimension.
schema.add_field(
    field_name="dense",
    datatype=DataType.FLOAT_VECTOR,
    # highlight-next-line
    dim=384,
)
```

#### 定义文本 Embedding Function\{#embedding-function}

定义一个 `TEXTEMBEDDING` Function，将 `document` 字段中的值转换为 Embedding，并将其写入 `dense` 字段。

```python
text_embedding_function = Function(
    name="hugging_face_embedding",
    input_field_names=["document"],
    output_field_names=["dense"],
    function_type=FunctionType.TEXTEMBEDDING,
    # highlight-start
    params={
        "provider": "huggingface",
        "model_name": "BAAI/bge-small-en-v1.5",
        "integration_id": "YOUR_INTEGRATION_ID",
        "normalize": "true",
        "truncate": "true",
    },
    # highlight-end
)

schema.add_function(text_embedding_function)
```

下表介绍 `params` 中支持的所有配置项。Hugging Face 请求选项遵循 [Feature Extraction API 规范](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction#api-specification)；`provider`、`model_name`、`integration_id` 和 `max_client_batch_size` 用于配置 Zilliz Cloud 集成。

| 参数 | 是否必填 | 说明 |
| --- | --- | --- |
| `provider` | 是 | Zilliz Cloud 模型服务提供商。将此值设置为 `huggingface`。 |
| `model_name` | 是 | 当前通过 `hf-inference` 为 `feature-extraction` 任务提供服务的模型所对应的 Hugging Face Model ID。 |
| `integration_id` | 是 | Hugging Face 模型服务集成的 ID。有关操作说明，请参阅集成模型服务。 |
| `normalize` | 否 | 是否请求归一化 Embedding。如省略，Zilliz Cloud 不会在 Hugging Face 请求中设置此选项；具体行为取决于所选模型。 |
| `prompt_name` | 否 | 所选模型的 Sentence Transformers 配置中定义的 prompt 名称。Hugging Face 会在编码前添加对应的 prompt 文本。如省略，则不请求使用 prompt。 |
| `truncate` | 否 | 当输入超出模型支持的长度时，是否请求执行截断。如省略，Zilliz Cloud 不会在 Hugging Face 请求中设置此选项；具体行为取决于所选模型。 |
| `truncation_direction` | 否 | Hugging Face 从输入的哪个方向执行截断。支持的值为 `left` 和 `right`。 |
| `max_client_batch_size` | 否 | 单次请求发送到 Hugging Face 的最大输入文本数量。默认值为 `128`，且必须大于 `0`。 |

#### 配置索引\{#}

为输出向量字段配置索引。以下示例使用 `AUTOINDEX` 和余弦相似度。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)
```

#### 创建 Collection\{#collection}

使用 Schema 和索引参数创建 Collection。

```python
client.create_collection(
    collection_name="hugging_face_demo",
    schema=schema,
    index_params=index_params,
)
```

该 Collection 已创建，并包含一个将 384 维向量写入 `dense` 字段的文本 Embedding Function。

### 第 2 步：Insert 数据\{#2-insert}

Insert 原始文本，无需提供向量。Zilliz Cloud 调用 Hugging Face 模型，并将生成的 Embedding 写入 `dense` 字段。

```python
client.insert(
    collection_name="hugging_face_demo",
    data=[
        {
            "id": 1,
            "document": "Milvus simplifies semantic search through embeddings.",
        },
        {
            "id": 2,
            "document": "Vector embeddings convert text into searchable numeric data.",
        },
        {
            "id": 3,
            "document": "Semantic search helps users find relevant information quickly.",
        },
    ],
)
```

Insert 操作会存储原始文本，并为每个 Entity 生成一个 Embedding。

### 第 3 步：使用文本搜索\{#3}

使用原始查询文本执行搜索。在进行向量搜索之前，Zilliz Cloud 使用相同的 Function、模型和可选推理参数将查询文本转换为 Embedding。

```python
results = client.search(
    collection_name="hugging_face_demo",
    data=["How does Milvus handle semantic search?"],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
)

print(results)
```

搜索结果包含与查询文本最相关的文档，并按余弦相似度排序。

## 故障排查\{#}

### 模型无法用于 feature-extraction 任务\{#feature-extraction}

打开模型的 Hugging Face 页面，查看 **Inference Providers** 部分。确认 `hf-inference` 当前为该模型提供服务，并且该模型支持 `feature-extraction`。如果任一要求不满足，请选择其他模型，并在其模型页面上进行确认。模型兼容性表并未穷举所有模型，未列出的模型仍可能兼容。如果更换模型，请确保 Function 输出字段的维度与替换后模型的维度一致。

### 返回的向量维度与 Schema 不匹配\{#schema}

检查模型的输出维度，并将其与 Function 的 `FLOAT_VECTOR` 输出字段中配置的 `dim` 进行比较。要使用不同维度的模型，请创建兼容的向量字段或 Collection。不支持自定义输出维度。

## 后续步骤\{#}

有关 Function 的一般信息，请参阅 [Function 概述](./undefined)。

要使用 Hugging Face Sentence Similarity 分数对向量搜索候选项重新排序，请参阅 [Hugging Face Ranker](./hugging-face-ranker)。