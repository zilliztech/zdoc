---
title: "阿拉伯语 Analyzer | Cloud"
slug: /arabic-analyzer
sidebar_label: "阿拉伯语 Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`arabic` Analyzer 是一款用于处理阿拉伯语文本的内置 Analyzer。当您需要 Zilliz Cloud 对阿拉伯字母变体进行规范化、移除变音符号和 Tatweel 延长符、转换阿拉伯-印度数字、执行阿拉伯语词干提取以及移除阿拉伯语停用词时，可使用此 Analyzer。 | Cloud"
type: origin
token: B0CwwnxeRiBzu0knv5kch2EDn0d
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 阿拉伯语 Analyzer

`arabic` Analyzer 是一款用于处理阿拉伯语文本的内置 Analyzer。当您需要 Zilliz Cloud 对阿拉伯字母变体进行规范化、移除变音符号和 Tatweel 延长符、转换阿拉伯-印度数字、执行阿拉伯语词干提取以及移除阿拉伯语停用词时，可使用此 Analyzer。

## 配置\{#}

内置 Analyzer 是由 Milvus 提供的 Analyzer 模板。要使用内置 Analyzer，请在 `analyzer_params` 中将 `type` 设置为预定义的 Analyzer 名称。

要使用内置的阿拉伯语 Analyzer，请将 `type` 设置为 `arabic`：

```python
analyzer_params = {
    "type": "arabic",
}
```

`arabic` Analyzer 支持以下可选参数：

| **参数** | **类型** | **默认值** | **说明** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_arabic_` | 分词时要额外移除的停用词列表。默认情况下，`arabic` Analyzer 使用内置的 `_arabic_` 词典。要查看默认词典，请参阅[阿拉伯语停用词列表](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/arabic.txt)。该列表来源于 Apache Lucene 的[阿拉伯语停用词文件](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/ar/stopwords.txt)。 |

要添加自定义停用词，请添加 `stop_words`：

```python
analyzer_params = {
    "type": "arabic",
    "stop_words": ["ميلفوس"],
}
```

除内置的 `_arabic_` 词典外，Zilliz Cloud 还会应用自定义停用词。

内置的 `arabic` Analyzer 等同于以下自定义 Analyzer 配置：

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        "decimaldigit",
        "arabic_normalization",
        {
            "type": "stemmer",
            "language": "arabic",
        },
        {
            "type": "stop",
            "stop_words": "_arabic_",
        },
    ],
}
```

此 Analyzer 执行以下处理步骤：

- **分词**：使用 `standard` 分词器将文本切分为词元。

- **数字规范化**：使用 `decimaldigit` 过滤器将阿拉伯-印度数字及其他 Unicode 十进制数字转换为 ASCII 数字。

- **阿拉伯语规范化**：使用 `arabic_normalization` 过滤器规范化 Alef 变体、Teh Marbuta 和 Alef Maksura，并移除 Harakat 变音符号和 Tatweel 延长符。

- **词干提取**：使用 `stemmer` 过滤器，并将 `language` 设置为 `arabic`。

- **移除停用词**：使用 `stop` 过滤器和内置的 `_arabic_` 词典。

定义 `analyzer_params` 后，在定义 Collection Schema 时，可以将该 Analyzer 应用于 `VARCHAR` 字段。有关详细信息，请参阅[使用示例](./analyzer-overview)。

## 示例\{#}

将 Analyzer 配置应用于 Collection Schema 前，请使用 `run_analyzer` 方法验证其行为。

### Analyzer 配置\{#analyzer}

```python
analyzer_params = {
    "type": "arabic",
}
```

### 使用 `run_analyzer` 验证\{#runanalyzer}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "كِتَابٌ عـــربي ١٢٣"

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

### 预期输出\{#}

```python
['كتاب', 'عرب', '123']
```
