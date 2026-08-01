---
title: "Hugging Face Ranker | Cloud"
slug: /hugging-face-ranker
sidebar_label: "Hugging Face Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "向量搜索按向量距离对结果排序，但初始顺序未必能反映每个候选项的文本对查询的回答程度。借助Hugging Face 模型服务集成，Hugging Face Ranker 使用 Hugging Face sentence-similarity 任务返回的分数，对向量搜索返回的候选项重新排序。 | Cloud"
type: origin
token: Y8zAw8Nr5iMpsRkKcQRc3Rn8nXt
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Hugging Face Ranker

向量搜索按向量距离对结果排序，但初始顺序未必能反映每个候选项的文本对查询的回答程度。借助[Hugging Face 模型服务集成](./integrate-with-model-providers)，Hugging Face Ranker 使用 Hugging Face sentence-similarity 任务返回的分数，对向量搜索返回的候选项重新排序。

## 工作原理\{#}

Hugging Face Ranker 在向量搜索完成后对候选 Entity 重新排序。下图展示了应用、Zilliz Cloud 与 Hugging Face 之间的总体工作流。

![ANDBwJZUVhYwo2bW79wcIPi6nVf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ANDBwJZUVhYwo2bW79wcIPi6nVf.png)

总体工作流包含以下四个步骤：

1. **检索候选 Entity。** Zilliz Cloud 针对配置的向量字段执行向量搜索并返回候选 Entity。

1. **准备用于重新排序的文本。** Ranker 从 `params.queries` 读取查询文本，并从 `input_field_names` 指定的不可为 null 的 `VARCHAR` 字段读取候选文本。

1. **请求重新排序分数。** Zilliz Cloud 将查询文本和候选文本发送到 Hugging Face，并为每个候选项接收一个重新计算的相似度分数。

1. **重新排序并返回结果。** Zilliz Cloud 将分数映射到候选 Entity，按分数从高到低排序，并返回重新排序后的结果。

**重新排序分数的计算方式**

上述总体工作流说明了重新排序发生的位置。以下流程说明 Hugging Face 如何为每个候选项计算新的相似度分数。

![FjWqwsTfEhuK3fbrvuHcoE5unxg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/FjWqwsTfEhuK3fbrvuHcoE5unxg.png)

1. **准备文本输入。** Ranker 从 `params.queries` 读取查询文本，并从 `input_field_names` 指定的 `VARCHAR` 字段读取非空候选文本。

1. **创建 Embedding。** Zilliz Cloud 通过 `hf-inference` 将查询文本作为 `source_sentence`、将候选文本作为 `sentences` 发送到 Hugging Face，以执行 [Sentence Similarity](https://huggingface.co/docs/huggingface_hub/package_reference/inference_client#huggingface_hub.InferenceClient.sentence_similarity) 任务。从概念上看，模型会创建一个查询 Embedding，并为各候选文本分别创建 Embedding。

1. **计算并返回分数。** 模型将查询 Embedding 与每个候选 Embedding 进行比较，并为每个候选项返回一个相似度分数。

图中的 Embedding 是模型处理过程中的中间结果；Hugging Face API 仅返回相似度分数。向量检索与重新排序使用不同的表示和分数。Hugging Face Ranker 不会复用候选向量或检索分数。用于创建搜索向量的 Embedding 模型与用于重新排序的 Hugging Face 模型相互独立，可以使用不同的模型。

如果 Insert 的是预计算向量，还应将原始候选文本存储在 `VARCHAR` 字段中，以便 Hugging Face Ranker 在重新排序时读取。

## 开始之前\{#}

使用 Hugging Face Ranker 前：

<Admonition type="info" icon="📘" title="说明">

Zilliz Cloud 通过 [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) 连接到 Hugging Face，并为 Hugging Face Ranker 使用 [`sentence-similarity`](https://huggingface.co/tasks/sentence-similarity) 任务。Zilliz Cloud 无法控制特定模型当前是否由 `hf-inference` 提供服务、是否持续可用，也无法保证其满足你的稳定性、延迟和输出质量要求。在生产环境中使用模型之前，请在 Hugging Face 上确认所选模型，并根据你的工作负载进行评估。

</Admonition>

- 创建 Hugging Face 模型服务集成并复制其集成 ID。有关操作说明，请参阅[集成模型服务](./integrate-with-model-providers)。

- 打开模型的 Hugging Face 页面，查看 **Inference Providers** 部分。确认 `hf-inference` 当前为该模型提供 `sentence-similarity` 任务服务。

- 确保 Collection 将候选文本存储在不可为 null 的 `VARCHAR` 字段中。Rerank Function 必须在 `input_field_names` 中准确引用一个这样的字段。Collection 可以包含其他文本字段。

## 使用 Hugging Face Ranker\{#hugging-face-ranker}

Hugging Face Ranker 在搜索时定义并应用。你可以为每个搜索请求启用、禁用或更换 Ranker，而无需修改 Collection Schema。

### 准备工作\{#}

以下设置创建一个包含三个字段的 Collection：`id` 作为主键，`document` 作为存储用于重新排序的候选文本的 `VARCHAR` 字段，`dense` 作为用于初始搜索的向量字段。该设置还会 Insert 搜索和重新排序示例所需的示例数据。

<details>

<summary>**准备包含示例数据的 Collection**</summary>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "hugging_face_rerank_demo"

schema = client.create_schema()

schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=1000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=4)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params,
)

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

client.insert(collection_name=collection_name, data=data)
```

</details>

### 定义 Rerank Function\{#rerank-function}

定义一个 `RERANK` Function，使用 `document` 中存储的文本对向量搜索返回的候选项重新排序。该 Function 还会指定查询文本、Hugging Face 模型和模型服务集成。

```python
from pymilvus import Function, FunctionType

hugging_face_ranker = Function(
    name="hugging_face_semantic_ranker",
    # Use the text stored in the "document" VARCHAR field for reranking.
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    # highlight-start
    params={
        "reranker": "model",
        "provider": "huggingface",
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "queries": ["renewable energy developments"],
        "integration_id": "YOUR_INTEGRATION_ID",
        "max_client_batch_size": 32,
    },
    # highlight-end
)
```

该示例使用 `sentence-transformers/all-MiniLM-L6-v2` 仅用于演示配置。此模型并不代表 Zilliz Cloud 对其作出推荐或认证。

下表介绍 Hugging Face Ranker 的 `params` 中所有可由用户配置的参数：

| 参数 | 是否必填 | 说明 |
| --- | --- | --- |
| `reranker` | 是 | 重新排序实现。将此值设置为 `model`。 |
| `provider` | 是 | Zilliz Cloud 模型服务提供商。将此值设置为 `huggingface`。 |
| `model_name` | 是 | 当前通过 `hf-inference` 为 `sentence-similarity` 任务提供服务的模型所对应的 Hugging Face Model ID。 |
| `queries` | 是 | 用于重新排序的查询文本列表。即使初始搜索使用查询向量，也要为每个搜索查询（`nq`）提供一个字符串。 |
| `integration_id` | 是 | Hugging Face 模型服务集成的 ID。有关操作说明，请参阅[集成模型服务](./integrate-with-model-providers)。 |
| `max_client_batch_size` | 否 | 单次请求发送到 Hugging Face 的最大候选文本数量。默认值为 `32`，且必须大于 `0`。 |

不要在 Function 定义中包含 Hugging Face 凭证。

### 使用 Rerank Function 执行搜索\{#rerank-function}

通过 `ranker` 参数将该 Function 传递给 `search()`。

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    # highlight-next-line
    ranker=hugging_face_ranker,
)

print(results)
```

搜索首先从 `dense` 向量字段检索候选 Entity。随后，Hugging Face Ranker 使用 `queries` 中的查询文本和每个候选项的 `document` 文本，通过 sentence-similarity 任务计算相似度分数。Zilliz Cloud 按分数降序返回候选项。

## 故障排查\{#}

### 模型无法用于 sentence-similarity 任务\{#sentence-similarity}

打开模型的 Hugging Face 页面，查看 **Inference Providers** 部分。确认 `hf-inference` 当前为该模型提供服务，并且该模型支持 `sentence-similarity`。如果任一要求不满足，请选择其他模型，并在其模型页面上进行确认。Zilliz Cloud 不维护 Hugging Face 模型的受支持模型目录。

### 查询文本数量与搜索请求不匹配\{#}

`queries` 中的字符串数量必须与搜索查询数量（`nq`）相等。对于包含一个查询向量的搜索，应准确提供一个查询字符串。

## 后续步骤\{#}

Hugging Face Ranker 也可以用于混合搜索。搜索与混合搜索以相同方式应用 Ranker：在搜索时通过 `ranker` 参数传递 Rerank Function。

有关详细信息，请参阅[多向量混合搜索](./hybrid-search)。