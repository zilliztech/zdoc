---
title: "泰语 Analyzer | Cloud"
slug: /thai-analyzer
sidebar_label: "泰语 Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`thai` 分析器是一款用于处理泰语文本的内置分析器。当您需要 Zilliz Cloud 对泰语文本进行分词、规范化泰文数字、将混合文本中的拉丁字母转换为小写，以及移除泰语停用词时，可使用此分析器。 | Cloud"
type: origin
token: QWPqwmppOiIPhEkLAEXcZKMznlh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 泰语 Analyzer

`thai` 分析器是一款用于处理泰语文本的内置分析器。当您需要 Zilliz Cloud 对泰语文本进行分词、规范化泰文数字、将混合文本中的拉丁字母转换为小写，以及移除泰语停用词时，可使用此分析器。

## 配置\{#}

内置分析器是由 Milvus 提供的分析器模板。要使用内置分析器，请在 `analyzer_params` 中将 `type` 设置为预定义的分析器名称。

要使用内置的泰语分析器，请将 `type` 设置为 `thai`：

```python
analyzer_params = {
    "type": "thai",
}
```

`thai` 分析器接受以下可选参数：

| **参数** | **类型** | **默认值** | **说明** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_thai_` | 要在分词时额外移除的停用词列表。默认情况下，`thai` 分析器使用内置的 `_thai_` 词典。要查看默认词典，请参阅 Zilliz Cloud 的[泰语停用词列表](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/thai.txt)。该列表来源于 Apache Lucene 的[泰语停用词文件](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/th/stopwords.txt)。 |

要添加自定义停用词，请添加 `stop_words`：

```python
analyzer_params = {
    "type": "thai",
    "stop_words": ["มิลวัส"],
}
```

除内置的 `_thai_` 词典外，Zilliz Cloud 还会应用自定义停用词。

内置的 `thai` 分析器等同于以下自定义分析器配置：

```python
analyzer_params = {
    "tokenizer": "thai",
    "filter": [
        "lowercase",
        "decimaldigit",
        {
            "type": "stop",
            "stop_words": ["_thai_"],
        },
    ],
}
```

此分析器执行以下处理步骤：

- **分词**：使用 `thai` 分词器将泰语文本切分为词元，无需依赖空格。该分词器会过滤掉仅包含空白字符或标点符号的片段。有关详细信息，请参阅[泰语 Analyzer](./thai-analyzer)。

- **大小写规范化**：使用 `lowercase` 过滤器，该过滤器会处理泰语和英语混合文本中的拉丁字母。

- **数字规范化**：使用 `decimaldigit` 过滤器，将泰文数字和其他 Unicode 十进制数字转换为 ASCII 数字。

- **移除停用词**：使用 `stop` 过滤器和内置的 `_thai_` 词典。

- **不进行词干提取**：内置的 `thai` 分析器不应用 `stemmer` 过滤器。

定义 `analyzer_params` 后，您可以在定义 Collection Schema 时，将该分析器应用于 `VARCHAR` 字段。有关详细信息，请参阅[使用示例](./analyzer-overview)。

## 示例\{#}

将分析器配置应用于 Collection Schema 前，请使用 `run_analyzer` 方法验证其行为。

### 分析器配置\{#}

```python
analyzer_params = {
    "type": "thai",
}
```

### 使用 `run_analyzer` 验证\{#runanalyzer}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "ฉันรักการค้นหาข้อความใน Milvus ๑๒๓"

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

### 预期输出\{#}

```plaintext
['ฉัน', 'รัก', 'ค้นหา', 'ข้อความ', 'milvus', '123']
```
