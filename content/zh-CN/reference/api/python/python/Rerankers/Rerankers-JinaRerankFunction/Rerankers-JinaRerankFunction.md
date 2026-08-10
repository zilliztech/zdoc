---
title: "JinaRerankFunction | Python"
slug: /python/python/Rerankers-JinaRerankFunction
sidebar_label: "JinaRerankFunction"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "JinaRerankFunction 是 milvusmodel 中的一个类，它以查询和文档作为输入，并直接返回相似度分数，而不是嵌入。这一功能使用底层的 Jina AI 重排模型。 | Python"
type: docx
token: E3opdXwZCoY8igxMjQ1cwsTbnzh
sidebar_position: 1
keywords: 
  - llm 评估
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - zilliz
  - zilliz cloud
  - 云
  - JinaRerankFunction
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# JinaRerankFunction

JinaRerankFunction 是 [milvus_model](https://github.com/milvus-io/milvus-model) 中的一个类，它以查询和文档作为输入，并直接返回相似度分数，而不是嵌入。这一功能使用底层的 Jina AI 重排模型。

```python
pymilvus.model.reranker.JinaRerankFunction
```

## 构造函数\{#constructor}

构造一个适用于常见用例的 JinaRerankFunction。

```python
JinaRerankFunction(
    model_name: str = "jina-reranker-v2-base-multilingual",
    api_key: Optional[str] = None
)
```

**参数：**

- **model_name** (*string*)

    用于编码的 Jina AI 重排器模型名称。如果您未指定此参数，则将使用 `jina-reranker-v2-base-multilingual`。有关可用模型列表，请参阅 [Jina AI Rerankers](https://jina.ai/reranker/)。

- **api_key** (*string*)

    用于访问 Jina AI API 的 API 密钥。

## 示例\{#examples}

```python
from pymilvus.model.reranker import JinaRerankFunction

jina_rf = JinaRerankFunction(
    model_name="jina-reranker-v2-base-multilingual", # Defaults to `jina-reranker-v2-base-multilingual`
    api_key="YOUR_JINAAI_API_KEY"
)
```
