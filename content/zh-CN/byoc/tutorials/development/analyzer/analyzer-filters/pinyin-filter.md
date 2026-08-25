---
title: "Pinyin | BYOC"
slug: /pinyin-filter
sidebar_label: "Pinyin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "中文文本搜索通常要求用户输入与索引文本中完全一致的汉字。在名称查找、自动补全和边输入边搜索等工作流中，用户经常输入拼音而不是汉字。例如，用户可能输入 `zuqiu` 来搜索 `足球`。`pinyin` 过滤器会在 Analyzer 输出中添加拼音 token，使中文文本无需维护单独的拼音字段即可匹配拼音输入。 | BYOC"
type: origin
token: KMNdwKnqkibpRbk6bYDcpa12nih
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Pinyin

中文文本搜索通常要求用户输入与索引文本中完全一致的汉字。在名称查找、自动补全和边输入边搜索等工作流中，用户经常输入拼音而不是汉字。例如，用户可能输入 `zuqiu` 来搜索 `足球`。`pinyin` 过滤器会在 Analyzer 输出中添加拼音 token，使中文文本无需维护单独的拼音字段即可匹配拼音输入。

`pinyin` 过滤器通常与中文文本的 [Jieba](./jieba-tokenizer) tokenizer 搭配使用。它可用于自定义 Analyzer 过滤器管道，并能为同一个中文 token 输出多种拼音 token 形式。

## 配置\{#configuration}

要使用默认选项，请在 `analyzer_params` 的 `filter` 部分指定 `"pinyin"`。

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-next-line
    "filter": ["pinyin"],
}
```

这种简写形式会保留原始中文 token，并输出字符级拼音 token。除非显式启用相关选项，否则不会输出拼接后的完整拼音或拼音首字母。

如需完全控制，请将过滤器指定为对象，并配置 Zilliz Cloud 输出的拼音 token 形式。

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-start
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": True,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": False,
        }
    ],
    # highlight-end
}
```

该过滤器支持以下参数。

| **参数** | **类型** | **默认值** | **描述** |
| --- | --- | --- | --- |
| `keep_original` | 布尔值 | `true` | 保留 Analyzer 输出中的原始中文 token。 |
| `keep_full_pinyin` | 布尔值 | `true` | 输出字符级拼音 token。例如，`中文` 会生成 `zhong` 和 `wen`。 |
| `keep_joined_full_pinyin` | 布尔值 | `false` | 为每个源 token 输出拼接后的拼音 token。例如，`中文` 会生成 `zhongwen`。 |
| `keep_separate_first_letter` | 布尔值 | `false` | 为每个源 token 输出拼音首字母 token。例如，`中文` 会生成 `zw`。 |

该过滤器处理 tokenizer 生成的 token。对于中文文本，请搭配 `jieba` 等 tokenizer 使用。

## 示例\{#examples}

将 Analyzer 配置应用于 Collection Schema 之前，请使用 `run_analyzer` 验证其行为。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "中文测试"
```

### 使用字符级拼音匹配中文文本\{#match-chinese-text-with-character-level-pinyin}

默认的 `pinyin` 过滤器会保留原始中文 token，并输出字符级拼音 token。

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["pinyin"],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

预期输出：

```plaintext
['中文', 'zhong', 'wen', '测试', 'ce', 'shi']
```

### 使用拼接后的完整拼音匹配中文词语\{#match-chinese-terms-with-joined-pinyin}

当需要使用完整拼接拼音形式匹配中文词语时，请启用 `keep_joined_full_pinyin`。

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": True,
            "keep_separate_first_letter": False,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

预期输出：

```plaintext
['中文', 'zhongwen', '测试', 'ceshi']
```

### 使用拼音首字母匹配中文词语\{#match-chinese-terms-with-pinyin-initials}

当需要使用拼音首字母形式匹配中文词语时，请启用 `keep_separate_first_letter`。

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": True,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

预期输出：

```plaintext
['中文', 'zw', '测试', 'cs']
```
