---
title: "泰语分词器 | Cloud"
slug: /thai-tokenizer
sidebar_label: "泰语分词器"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`thai` 分词器无需依赖空格即可将泰语文本切分为词元。当您需要为泰语文本或泰语/英语混合文本构建自定义 Analyzer 管道时，请使用此分词器。 | Cloud"
type: origin
token: QBsRwmVohirAJWkD0PgcBsILn6X
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 泰语分词器

`thai` 分词器无需依赖空格即可将泰语文本切分为词元。当您需要为泰语文本或泰语/英语混合文本构建自定义 Analyzer 管道时，请使用此分词器。

## 配置\{#}

<Admonition type="info" icon="📘" title="说明">

对于泰语文本，大多数情况下应使用内置的 `thai` Analyzer。内置 Analyzer 将此分词器与小写转换、十进制数字规范化和泰语停用词移除功能组合使用。只有在需要构建自定义 Analyzer 管道时，才应直接使用 `thai` 分词器。有关详细信息，请参阅[泰语 Analyzer](./thai-analyzer)。

</Admonition>

要使用 `thai` 分词器配置 Analyzer，请在 `analyzer_params` 中将 `tokenizer` 设置为 `thai`。

```python
analyzer_params = {
    "tokenizer": "thai",
}
```

`thai` 分词器没有可配置参数。

该分词器可与一个或多个过滤器配合使用。例如，以下配置将 `thai` 分词器与 `lowercase` 和 `decimaldigit` 过滤器搭配使用：

```python
analyzer_params = {
    "tokenizer": "thai",
    "filter": [
        "lowercase",
        "decimaldigit",
    ],
}
```

此自定义管道不等同于内置的 `thai` Analyzer，因为它不包含内置的 `_thai_` 停用词词典。要使用完整的预定义管道，请指定 `{"type": "thai"}`。

该分词器具有以下行为：

- **泰语分词**：无需依赖空白字符，将泰语文本切分为词元。

- **空白字符和标点符号过滤**：过滤掉仅含空白字符或标点符号的片段。这与 `icu` 分词器不同，后者可以将标点符号和空格保留为词元。

- **混合文字文本**：在泰语/英语混合文本中输出拉丁字母单词词元。

- **仅分词器**：不将词元转为小写、不规范化 Unicode 数字，也不移除停用词。如需执行这些步骤，请添加过滤器或使用内置的 `thai` Analyzer。

- **位置语义**：采用基于字符的词元位置，并计入跳过的空白字符和标点符号，从而使短语匹配和邻近匹配行为与其他非拉丁文字分词器保持一致。

定义 `analyzer_params` 后，在定义 Collection Schema 时，可以将该 Analyzer 应用于 `VARCHAR` 字段。有关详细信息，请参阅[使用示例](./analyzer-overview)。

## 示例\{#}

将 Analyzer 配置应用于 Collection Schema 前，请使用 `run_analyzer` 方法验证其行为。

### Analyzer 配置\{#analyzer}

```python
analyzer_params = {
    "tokenizer": "thai",
}
```

### 使用 `run_analyzer` 验证\{#runanalyzer}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓"

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

### 预期输出\{#}

```plaintext
['สวัสดี', 'ทดสอบ', 'ระบบ', 'Milvus', '๑๒๓']
```
