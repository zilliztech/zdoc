---
title: "run_analyzer() | Python | MilvusClient"
slug: /python/python/CollectionSchema-run_analyzer
sidebar_label: "run_analyzer()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会处理输入数据并生成分词输出。 | Python | MilvusClient"
type: docx
token: TWzjdJ61ho613AxKSd7clQt9nrg
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
    texts: Union[str, List[str]],
    analyzer_params: Union[str, Dict, None] = None,
    with_hash: bool = False,
    with_detail: bool = False,
    timeout: Optional[float] = None,
)
```

**参数：**

- `texts` (*Union[str, List[str]]*) -

    要分析的输入文本或文本列表。

- `analyzer_params` (*Union[str, Dict, None]*) -

    Analyzer 的参数。如果设置为 `None`，则默认为空字典。

- `with_hash` (*bool*) -

    用于指示是否包含基于哈希的处理的可选标志。

- `with_detail` (*bool*) -

    用于指示是否返回详细分析输出的可选标志。

- `timeout` (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示当发生任何响应或错误时，此操作会超时。

**返回类型：**

*List[str], List[List[str]]*

**返回值：**

一个元组，包含：

- 一个字符串列表，表示主要的分词输出。

- 一个由字符串列表组成的列表，表示详细的 token 信息（如果启用了详细输出）。

**异常：**

- `MilvusException` - 如果此操作期间发生任何错误，则会引发该异常。

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
