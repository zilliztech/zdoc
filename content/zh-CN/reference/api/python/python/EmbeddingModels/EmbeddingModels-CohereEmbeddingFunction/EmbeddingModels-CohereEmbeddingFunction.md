---
title: "CohereEmbeddingFunction | Python"
slug: /python/python/EmbeddingModels-CohereEmbeddingFunction
sidebar_label: "CohereEmbeddingFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "CohereEmbeddingFunction 是 pymilvus 中的一个类，使用 Cohere 嵌入模型将文本编码为向量嵌入，以支持在 Milvus 中进行嵌入检索。 | Python"
type: docx
token: JzDLdkv3QoCY8OxKpBjc5zsmnId
sidebar_position: 1
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - CohereEmbeddingFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CohereEmbeddingFunction

CohereEmbeddingFunction 是 pymilvus 中的一个类，使用 Cohere 嵌入模型将文本编码为向量嵌入，以支持在 Milvus 中进行嵌入检索。

```python
pymilvus.model.dense.CohereEmbeddingFunction
```

## 构造函数\{#constructor}

构造一个适用于常见场景的 CohereEmbeddingFunction。

```python
CohereEmbeddingFunction(
    model_name: str = "embed-english-light-v3.0",
    api_key: Optional[str] = None,
    input_type: str = "search_document",
    embedding_types: Optional[List[str]] = None,
    truncate: Optional[str] = None,
    **kwargs
)
```

**参数：**

- **model_name** (*string*)

    用于编码的 Cohere 嵌入模型名称。你可以指定任何可用的 Cohere 嵌入模型名称，例如 `embed-english-v3.0`、`embed-multilingual-v3.0` 等。如果不指定此参数，将使用 `embed-english-light-v3.0`。可用模型列表请参见 [Embed](https://docs.cohere.com/docs/models#embed)。

- **api_key** (*string*)

    用于访问 Cohere API 的 API 密钥。

- **input_type** (*string*)

    传递给模型的输入类型。对于 v3 及更高版本的嵌入模型，此参数为必填项。

    - `"search_document"`：用于存储在向量数据库中的嵌入，适用于搜索场景。

    - `"search_query"`：用于针对向量数据库执行搜索查询的嵌入，以查找相关文档。

    - `"classification"`：用于传递给文本分类器的嵌入。

    - `"clustering"`：用于通过聚类算法处理的嵌入。

- **embedding_types** (*List[str]*)

    你希望返回的嵌入类型。此参数非必填，默认值为 None，此时返回 Embed Floats 响应类型。目前，该参数只能指定单个值。可选值如下：

    - `"float"`：当你希望返回默认的浮点嵌入时使用。对所有模型均有效。

    - `"binary"`：当你希望返回有符号二进制嵌入时使用。仅对 v3 模型有效。

    - `"ubinary"`：当你希望返回无符号二进制嵌入时使用。仅对 v3 模型有效。

- **truncate** (*string*)

    可选值为 `NONE`|`START`|`END`，用于指定当输入长度超过最大 token 长度时，API 将如何处理。

    传入 `START` 将丢弃输入开头的内容。`END` 将丢弃输入结尾的内容。在这两种情况下，都会持续丢弃输入内容，直到剩余输入恰好达到该模型允许的最大输入 token 长度。

    如果选择 `NONE`，当输入超过最大输入 token 长度时，将返回错误。

    默认值：`END`

- **kwargs**

    允许在模型初始化时传递额外的关键字参数。更多信息请参见 [Embed](https://docs.cohere.com/reference/embed)。

## 示例\{#examples}

```python
from pymilvus.model.dense import CohereEmbeddingFunction

cohere_ef = CohereEmbeddingFunction(
    model_name="embed-english-light-v3.0",
    api_key="YOUR_COHERE_API_KEY",
    input_type="search_document",
    embedding_types=["float"]
)
```
