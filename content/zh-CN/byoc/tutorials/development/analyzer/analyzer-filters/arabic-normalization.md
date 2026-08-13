---
title: "阿拉伯语文本规范化 | BYOC"
slug: /arabic-normalization
sidebar_label: "阿拉伯语文本规范化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`arabicnormalization` 过滤器是用于阿拉伯语文本的内置 token 过滤器。它会规范化阿拉伯语特有的字母变体，并移除可选标记，避免等效的阿拉伯语词项在文本分析时呈现为不同形式。 | BYOC"
type: origin
token: D8oFwsLhhif1NhkPOo0cCDNNnhY
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 阿拉伯语文本规范化

`arabic_normalization` 过滤器是用于阿拉伯语文本的内置 token 过滤器。它会规范化阿拉伯语特有的字母变体，并移除可选标记，避免等效的阿拉伯语词项在文本分析时呈现为不同形式。

## 配置\{#configuration}

<Admonition type="info" icon="📘" title="说明">

对于阿拉伯语文本，大多数情况下请使用内置的 [阿拉伯语 Analyzer](./arabic-analyzer)。该内置 Analyzer 将此过滤器与标准分词、小写转换、十进制数字规范化、阿拉伯语词干提取及阿拉伯语停用词移除结合使用。仅当您需要构建自定义 Analyzer 流水线时，才直接使用 `arabic_normalization`。

</Admonition>

要在自定义 Analyzer 中使用 `arabic_normalization` 过滤器，请将其添加到 `analyzer_params` 的 `filter` 部分：

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["arabic_normalization"],
}
```

`arabic_normalization` 过滤器没有可配置参数。

该过滤器会执行以下转换：

| **转换规则** | **转换前** | **转换后** |
| --- | --- | --- |
| Hamza + Alef 变体 | `آ`、`أ`、`إ` | `ا` |
| Teh Marbuta | `ة` | `ه` |
| Alef Maksura | `ى` | `ي` |
| Harakat 变音符号 | `U+064B` 至 `U+065F` | 移除 |
| Tatweel / Kashida 延长符 | `ـ` | 移除 |

该过滤器作用于分词器生成的词元。上述配置特意展示一个自定义 Analyzer 示例，并不包含完整的阿拉伯语处理流水线。

## 示例\{#examples}

在将 Analyzer 配置应用到 Collection Schema 之前，请使用 `run_analyzer` 方法验证其行为。

### Analyzer 配置\{#analyzer-configuration}

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["arabic_normalization"],
}
```

### 使用 `run_analyzer` 验证\{#verification-using-runanalyzer}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي"

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

### 预期输出\{#expected-output}

```plaintext
['ادم', 'احمد', 'اسلام', 'مدرسه', 'كبري', 'كتاب', 'عربي']
```
