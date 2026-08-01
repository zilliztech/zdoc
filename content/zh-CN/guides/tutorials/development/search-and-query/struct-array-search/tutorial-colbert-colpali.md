---
title: "使用 EmbeddingList 搜索：ColBERT 和 ColPali | Cloud"
slug: /tutorial-colbert-colpali
sidebar_label: "使用 EmbeddingList 搜索：ColBERT 和 ColPali"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本教程介绍如何在 Zilliz Cloud 中，基于 StructArray Vector 子字段上的 EmbeddingList Search 构建 ColBERT 风格和 ColPali 风格的检索系统。当查询和存储数据都表示为 Vector 列表，并且你希望使用 `MAXSIM` metric 进行 Entity-level late-interaction 检索时，可以参考本教程。 | Cloud"
type: origin
token: Pl4Qwn8oZiQGI1kwHPEcjOXynyh
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用 EmbeddingList 搜索：ColBERT 和 ColPali

本教程介绍如何在 Zilliz Cloud 中，基于 StructArray Vector 子字段上的 EmbeddingList Search 构建 ColBERT 风格和 ColPali 风格的检索系统。当查询和存储数据都表示为 Vector 列表，并且你希望使用 `MAX_SIM*` metric 进行 Entity-level late-interaction 检索时，可以参考本教程。

关于本教程背后的 StructArray 基础知识，请参见[创建 StructArray Field](./create-struct-array)、[为 StructArray Field 创建 Index](./index-struct-array)和[使用 StructArray 进行基础向量搜索](./search-with-struct-array)。本教程聚焦 ColBERT 和 ColPali 工作流，而不是通用 StructArray 语法。

## 概述\{#overview}

构建文本检索系统时，你可能需要将文档切分为 chunk，并将每个 chunk 及其 Embedding 作为一条 Entity 存入向量数据库，以保证检索精度和准确性。对于长文档尤其如此，因为全文 Embedding 可能会稀释语义细节，或者超出模型输入限制。

不过，将数据按 chunk 存储会得到 chunk 级搜索结果，也就是说，检索首先识别的是相关*片段*，而不是完整、连贯的*文档*。为了解决这一点，通常需要额外的搜索后处理。

ColBERT（arXiv: [2004.12832](https://arxiv.org/abs/2004.12832)）是一个文本到文本检索系统，通过 BERT 上下文化表示的 late interaction 提供高效且有效的 passage 搜索。它支持对查询和文档进行独立的 token-wise encoding，并计算二者之间的相似度。

### Token-wise encoding\{#token-wise-encoding}

在 ColBERT 的数据导入过程中，每个文档会被切分为 token，然后向量化并存储为一个 EmbeddingList，如 $d \rightarrow E_d = [e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$。当查询到来时，也会被 token 化、向量化并存储为一个 EmbeddingList，如 $q \rightarrow E_q = [e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$。

在上述公式中：

- $d$：一个文档。

- $q$：查询。

- $E_d$：表示文档的 EmbeddingList。

- $E_q$：表示查询的 EmbeddingList。

- $[e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$：表示文档的 EmbeddingList 中的 Vector Embedding 数量位于 $\R^\{n×d\}$ 范围内。

- $[e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$：表示查询的 EmbeddingList 中的 Vector Embedding 数量位于 $\R^\{m×d\}$ 范围内。

### Late interaction\{#late-interaction}

向量化完成后，查询 EmbeddingList 会逐 token 与每个文档 EmbeddingList 比较，以确定最终相似度评分。

在一个简化示例中，查询包含两个 token，即 `machine` 和 `learning`；窗口中的文档包含四个 token：`neural`、`network`、`python` 和 `tutorial`。这些 token 被向量化后，每个查询 token 的 Vector Embedding 会与文档中的 Vector Embedding 比较，得到一组相似度评分。随后，对每组评分取最高值并求和，得到最终评分。确定文档最终评分的过程称为 maximum similarity（**MAX_SIM**）。关于 maximum similarity 的详细信息，请参见 Maximum similarity。

<Admonition type="info" icon="📘" title="Notes">

在 Milvus 中实现类似 ColBERT 的文本检索系统时，并不局限于按 token 切分文档。
你可以按任意合适的粒度将文档切分为片段，为每个片段生成 EmbeddingList，并将文档及其已 Embedding 的片段一起存储为一条 Entity。

</Admonition>

### ColPali 扩展\{#colpali-extension}

ColPali（arXiv: [2407.01449](https://arxiv.org/abs/2407.01449?spm=a2ty_o01.29997173.0.0.31c4c9217HFv28&file=2407.01449)）基于 ColBERT，提出了一种利用 Vision-Language Model（VLM）检索视觉丰富文档的新方法。在数据导入期间，每个文档页会被渲染为高分辨率图像，然后切分为 patch，而不是 token。例如，一张 448 x 448 像素的文档页图像可以生成 1,024 个 patch，每个 patch 大小为 14 x 14 像素。

这种方法可以保留文档布局、图片、表格结构等非文本信息，而这些信息在纯文本检索系统中会丢失。

![HOJawuFAhhu6kwbAOZocazWtnaf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/HOJawuFAhhu6kwbAOZocazWtnaf.png)

ColPali 使用的 VLM 称为 PaliGemma（arXiv: [2407.07726](https://arxiv.org/html/2407.07726v2#S1)），由图像编码器（**SigLIP-400M**）、decoder-only 语言模型（**Gemma2-2B**）以及一个将图像编码器输出投影到语言模型向量空间的线性层组成，如上图所示。

在数据导入期间，以原始图像表示的文档页会被切分为多个视觉 patch，每个 patch 都会被 Embedding，生成一个 Vector Embedding 列表。随后，这些 Embedding 会被投影到语言模型的向量空间，得到最终 EmbeddingList，如 $d \rightarrow E_d = [e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$。当查询到来时，查询会被 token 化，每个 token 都会被 Embedding，生成一个 Vector Embedding 列表，如 $q \rightarrow E_q = [e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$。然后应用 **MAX_SIM** 比较两个 EmbeddingList，并得到查询与文档页之间的最终评分。

## ColBERT 文本检索系统\{#colbert-text-retrieval-system}

本节将使用 StructArray 搭建一个 ColBERT 文本检索系统。在开始前，请先部署一个 兼容 Milvus v2.6.x 的 Zilliz Cloud cluster，并获取 Cohere access token。

### Step 1: 安装依赖\{#step-1-install-the-dependencies}

运行以下命令安装依赖。

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus cohere
```

### Step 2: 加载 Cohere 数据集\{#step-2-load-the-cohere-dataset}

在此示例中，我们将使用 Cohere 的 Wikipedia 数据集，并获取前 10,000 条记录。你可以在[此页面](https://huggingface.co/datasets/Cohere/wikipedia-2023-11-embed-multilingual-v3)查看该数据集的信息。

```python
from datasets import load_dataset

lang = "simple"
docs = load_dataset(
    "Cohere/wikipedia-2023-11-embed-multilingual-v3", 
    lang, 
    split="train[:10000]"
)
```

如果本地没有该数据集，运行上述脚本会下载数据集。数据集中的每条记录都是来自 Wikipedia 页面的一个段落。下表展示了该数据集的结构。

| 列名 | 说明 |
| --- | --- |
| `_id` | 记录 ID。 |
| `url` | 当前记录的 URL。 |
| `title` | 源文档标题。 |
| `text` | 源文档中的一个段落。 |
| `emb` | 源文档文本的 Embedding。 |

### Step 3: 按 title 分组段落\{#step-3-group-paragraphs-by-title}

为了搜索文档而不是段落，应按 title 对段落进行分组。

```python
df = docs.to_pandas()
groups = df.groupby('title')

data = []

for title, group in groups:
  data.append({
      "title": title,
      "paragraphs": [{
          "text": row['text'],
          'emb': row['emb']
      } for _, row in group.iterrows()]
  })
```

在这段代码中，我们将分组后的段落作为文档存储，并放入 `data` 列表。每个文档都有一个 `paragraphs` key，它是段落列表；每个段落对象都包含 `text` 和 `emb` key。

### Step 4: 为 Cohere 数据集创建 Collection\{#step-4-create-a-collection-for-the-cohere-dataset}

数据准备好后，我们将创建一个 Collection。在该 Collection 中，`paragraphs` 是一个 StructArray Field。关于 StructArray Schema 的一般说明，请参见[创建 StructArray Field](./create-struct-array)。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create collection schema
schema = client.create_schema()

schema.add_field('id', DataType.INT64, is_primary=True, auto_id=True)
schema.add_field('title', DataType.VARCHAR, max_length=512)

# Create struct schema
struct_schema = client.create_struct_field_schema()
struct_schema.add_field('text', DataType.VARCHAR, max_length=65535)
struct_schema.add_field('emb', DataType.FLOAT_VECTOR, dim=512)

schema.add_field('paragraphs', DataType.ARRAY,
                 element_type=DataType.STRUCT,
                 struct_schema=struct_schema, max_capacity=200)

# Create index parameters
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="paragraphs[emb]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE"
)

# Create a collection
client.create_collection(
    collection_name='wiki_documents', 
    schema=schema, 
    index_params=index_params
)
```

### Step 5: 将 Cohere 数据集插入 Collection\{#step-5-insert-cohere-dataset-into-the-collection}

现在可以将准备好的数据插入上面创建的 Collection。

```python
client.insert(
    collection_name='wiki_documents', 
    data=data
)
```

### Step 6: 在 Cohere 数据集中搜索\{#step-6-search-within-the-cohere-dataset}

按照 ColBERT 的设计，查询文本应先被 token 化，然后 Embedding 为一个 EmbeddingList。在此步骤中，我们将使用 Cohere 为 Wikipedia 数据集中的段落生成 Embedding 时使用的同一个模型。

```python
import cohere

co = cohere.ClientV2("COHERE_API_KEY")

query_inputs = [
    {
        'content': [
            {'type': 'text', 'text': 'Adobe'},
        ]
    },
    {
        'content': [
            {'type': 'text', 'text': 'software'}
        ]
    }
]

embeddings = co.embed(
    inputs=query_inputs,
    model='embed-multilingual-v3.0',
    input_type="classification",
    embedding_types=["float"],
)
```

在这段代码中，查询文本会在 `query_inputs` 中组织成 token，并 Embedding 为一组 float Vector。然后可以使用 Milvus 的 EmbeddingList 执行相似度搜索，如下所示。

```python
from pymilvus.client.embedding_list import EmbeddingList

query_emb_list = EmbeddingList()

if (embeddings.embeddings.float):
  query_emb_list.add_batch(embeddings.embeddings.float)

results = client.search(
    collection_name="wiki_documents",
    data=[query_emb_list],
    anns_field="paragraphs[emb]",
    limit=10,
    output_fields=["title"]
)

for hit in results[0]:
  print(f"Document {hit['entity']['title']}: {hit['distance']:.4f}")
```

上述代码的输出类似如下：

```python
# Document Software: 2.3035
# Document Application: 2.1875
# Document Adobe Illustrator: 2.1167
# Document Open source: 2.0542
# Document Computer: 1.9811
# Document Microsoft: 1.9784
# Document Web browser: 1.9655
# Document Program: 1.9627
# Document Website: 1.9594
# Document Computer science: 1.9460
```

每个两两 cosine similarity 分数范围为 `-1` 到 `1`。最终的 `MAX_SIM_COSINE` 分数可能大于 `1`，因为它聚合了多个 token-level maximum similarity 分数。

## ColPali 文档检索系统\{#colpali-document-retrieval-system}

本节将使用 StructArray 搭建一个基于 ColPali 的文档检索系统。在开始前，请先部署一个 兼容 Milvus v2.6.x 的 Zilliz Cloud cluster。

### Step 1: 安装依赖\{#step-1-install-the-dependencies}

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus 'colpali-engine>=0.3.0,<0.4.0'
```

### Step 2: 加载 Vidore 数据集\{#step-2-load-the-vidore-dataset}

本节使用名为 **vidore_v2_finance_en** 的 Vidore 数据集。该数据集是银行业年度报告语料库，用于长文档理解任务，也是 ViDoRe v3 Benchmark 所包含的 10 个语料库之一。你可以在[此页面](https://huggingface.co/datasets/vidore/vidore_v3_finance_en)查看该数据集的详细信息。

```python
from datasets import load_dataset

ds = load_dataset("vidore/vidore_v3_finance_en", "corpus")
df = ds['test'].to_pandas()
```

如果本地没有该数据集，运行上述脚本会下载数据集。数据集中的每条记录都是金融报告中的一页。下表展示了该数据集的结构。

| 列名 | 说明 |
| --- | --- |
| `corpus_id` | 语料库中的一条记录。 |
| `image` | 页面图像的字节内容。 |
| `doc_id` | 描述性文档 ID。 |
| `page_number_in_doc` | 当前页在文档中的页码。 |

### Step 3: 为页面图像生成 Embedding\{#step-3-generate-embeddings-for-the-page-images}

如[概述](./tutorial-colbert-colpali)中所示，ColPali 模型是一个 VLM，会将图像投影到文本模型的向量空间中。在此步骤中，我们将使用最新的 ColPali 模型 **vidore/colpali-v1.3**。你可以在[此页面](https://huggingface.co/vidore/colpali-v1.3)查看该模型的详细信息。

```python
import torch
from typing import cast
from colpali_engine.models import ColPali, ColPaliProcessor

model_name = "vidore/colpali-v1.3"

model = ColPali.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="cuda:0",  # or "mps" if on Apple Silicon
).eval()

processor = ColPaliProcessor.from_pretrained(model_name)
```

模型准备好后，可以尝试为某张指定图像生成 patch，如下所示。

```python
from PIL import Image
from io import BytesIO

# Use the iterrows() generator to get the first row.
row = next(df.iterrows())[1]

# Decode the image bytes and generate patch embeddings.
images = [Image.open(BytesIO(row["image"]["bytes"]))]
batch_images = processor.process_images(images).to(model.device)

with torch.no_grad():
    patches_embeddings = model(**batch_images)[0]

# Check the shape of the embeddings generated for the patches.
print(patches_embeddings.shape)

# [1031, 128]
```

在上述代码中，ColPali 模型会将图像 resize 为 448 x 448 像素，然后切分为 patch，每个 patch 大小为 14 x 14 像素。最后，这些 patch 会被 Embedding 为 1,031 个 Embedding，每个 Embedding 有 128 维。

可以使用如下循环为所有图像生成 Embedding：

```python
data = []

for _, row in df.iterrows():
    corpus_id = row["corpus_id"]
    images = [Image.open(BytesIO(row["image"]["bytes"]))]
    batch_images = processor.process_images(images).to(model.device)

    with torch.no_grad():
        patches = model(**batch_images)[0]

    doc_id = row["doc_id"]
    page_number_in_doc = row["page_number_in_doc"]

    data.append({
        "corpus_id": corpus_id,
        "patches": [
            {"emb": emb.float().cpu().tolist()}
            for emb in patches
        ],
        "doc_id": doc_id,
        "page_number_in_doc": page_number_in_doc,
    })
```

<Admonition type="info" icon="📘" title="Notes">

由于需要为大量数据生成 Embedding，此步骤比较耗时。

</Admonition>

### Step 4: 为金融报告数据集创建 Collection\{#step-4-create-a-collection-for-the-financial-reports-dataset}

数据准备好后，我们将创建一个 Collection。在该 Collection 中，`patches` 是 StructArray Field。每个 Struct 元素存储一个 patch Embedding。关于 StructArray Vector 子字段的 Index 要求，请参见[为 StructArray Field 创建 Index](./index-struct-array)。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri=YOUR_CLUSTER_ENDPOINT,
    token=YOUR_API_KEY
)

schema = client.create_schema()

schema.add_field(
    field_name="corpus_id",
    datatype=DataType.INT64,
    is_primary=True
)

patch_schema = client.create_struct_field_schema()

patch_schema.add_field(
    field_name="emb",
    datatype=DataType.FLOAT_VECTOR,
    dim=128
)

schema.add_field(
    field_name="patches",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=patch_schema,
    max_capacity=1031
)

schema.add_field(
    field_name="doc_id",
    datatype=DataType.VARCHAR,
    max_length=512
)

schema.add_field(
    field_name="page_number_in_doc",
    datatype=DataType.INT64
)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="patches[emb]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE"
)

client.create_collection(
    collection_name="financial_reports",
    schema=schema,
    index_params=index_params
)
```

### Step 5: 插入金融报告\{#step-5-insert-the-financial-reports-into-the-collection}

现在可以将准备好的金融报告数据插入 Collection。

```python
client.insert(
    collection_name="financial_reports",
    data=data
)
```

<Admonition type="info" icon="📘" title="Notes">

插入金融报告可能需要较长时间。每一页都可能包含一千多个 patch Vector，并且每个 Vector 都存储在 `patches` StructArray Field 中。对于更大的数据集，请将 `data` 切分为较小的 batch，并逐批插入。

</Admonition>

从输出中可以看到，Vidore 数据集中的所有页面都已插入。

### Step 6: 在金融报告中搜索\{#step-6-search-within-the-financial-reports}

数据准备好后，可以按如下方式在 Collection 中执行搜索：

```python
from pymilvus.client.embedding_list import EmbeddingList

queries = [
    "quarterly revenue growth chart"
]

batch_queries = processor.process_queries(queries).to(model.device)

with torch.no_grad():
    query_embeddings = model(**batch_queries)

query_emb_list = EmbeddingList()
query_emb_list.add_batch(query_embeddings[0].float().cpu().tolist())

results = client.search(
    collection_name="financial_reports",
    data=[query_emb_list],
    anns_field="patches[emb]",
    limit=10,
    output_fields=["doc_id", "page_number_in_doc"]
)
```
