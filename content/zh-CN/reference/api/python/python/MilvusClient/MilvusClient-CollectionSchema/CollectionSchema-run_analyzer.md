---
title: "run_analyzer() | Python | MilvusClient"
slug: /python/python/CollectionSchema-run_analyzer
sidebar_label: "run_analyzer()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会处理输入数据并生成分词输出。 | Python | MilvusClient"
type: docx
token: X7tsd4oAxoqVEvxXRkNc1Exqnif
sidebar_position: 6
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - zilliz
  - zilliz cloud
  - 云
  - run_analyzer()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# run_analyzer()

此操作会处理输入数据并生成分词输出。

## 请求语法\{#request-syntax}

```python
run_analyzer(
```

**参数：**

- **texts** （*Union[str, List[str]]*） -

    要分析的输入文本或文本列表。

- **analyzer_params** （*Union[str, Dict, None]*） -

    Analyzer 的参数。如果设置为 None，则默认为空字典。

- **with_hash** （*bool*） -

    一个可选标志，用于指示是否包含基于哈希的处理。

- **with_detail** （*bool*） -

    一个可选标志，用于指示是否返回详细的分析输出。

- **collection_name** （*str | None*） -

    要在其上运行 Analyzer 的 Collection 名称。

- **field_name** （*str | None*） -

    其 Analyzer 设置用于分析输入文本的字段名称。

- **analyzer_names** （*str | list[str] | None*） -

    要运行的内置 Analyzer 的名称或名称列表。

- **timeout** （*float | None*） -

    此操作的超时时长。将其设置为 *None* 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*List[str], List[List[str]]*

**返回：**

一个元组，包含：- 一个表示主要分词输出的字符串列表。- 一个由字符串列表组成的列表，表示详细的 token 信息（如果启用了详细输出）。

**异常：**

- **MilvusException**

    如果此操作期间发生任何错误，则会引发此异常。如果此操作期间发生任何错误，则会引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
)

analyzer_params = {
    "type": "standard", # Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] # Defines a list of common words (stop words) to exclude from tokenization
}

# Sample text to analyze
text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

# Run analyzer
result = client.run_analyzer(
    text,
    analyzer_params
)

print(result)

# Expected output:
# ['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```
