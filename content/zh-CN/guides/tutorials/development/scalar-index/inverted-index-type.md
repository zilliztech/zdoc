---
title: "INVERTED | Cloud"
slug: /inverted-index-type
sidebar_label: "INVERTED"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "倒排索引（Inverted Index）是一种用于提高文本字段查询性能的索引技术，特别适合快速全文检索。其工作原理是将每个词汇映射到包含该词汇的文档列表（即倒排列表），从而在进行关键词搜索时，可以快速定位相关文档，大大减少检索时间。 | Cloud"
type: origin
token: QeJCwBNh6iYssQkYcATcbjYun6c
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# INVERTED

倒排索引（Inverted Index）是一种用于提高文本字段查询性能的索引技术，特别适合快速全文检索。其工作原理是将每个词汇映射到包含该词汇的文档列表（即倒排列表），从而在进行关键词搜索时，可以快速定位相关文档，大大减少检索时间。

在 Milvus 中，倒排索引基于 [Tantivy](https://github.com/quickwit-oss/tantivy) 实现，Tantivy 是一个高效的全文搜索引擎库，这使得倒排索引能够支持多种查询类型，如[全文搜索](./full-text-search)、[精确文本匹配](./text-match)等。

## 概述\{#}

倒排索引的主要组成部分包括**词项**和**倒排列表**：

- **词项**：词项是文档集合中每个独立的词汇，通常用于文本搜索。词项字典包含所有被分词后的词汇，并按字母顺序排列。

- **倒排列表**：每个词项对应一个倒排列表，其中存储了包含该词项的所有文档的标识符。

例如，有两个文档：

- 文档 1：**"machine learning is amazing"**

- 文档 2：**"deep learning is about AI"**

为了创建倒排索引，Milvus 首先通过分词器（Tokenizer）将每个文档的内容字段按特定规则分割成单独的词汇（即词项或分词），然后创建一个包含所有唯一词项的排序列表，并列出每个词项出现在哪些文档中。结果如下所示：

![PPlAwzWF6hNbU7bKaKwcvKXxnZf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/PPlAwzWF6hNbU7bKaKwcvKXxnZf.png)

通过倒排索引，可以快速找到包含特定词项（如 "deep learning"）的文档：

- 词项 "deep" 仅出现在文档 2 中。

- 词项 "learning" 出现在文档 1 和文档 2 中。

通过这种方式，倒排索引能够快速锁定包含特定词汇的文档，大大提高检索效率。

## 创建倒排索引\{#}

要创建倒排索引，可以使用 `create_index()` 方法，将 `index_type` 参数设置为 `INVERTED` 。

```python
# 准备一个空的IndexParams对象，无需指定任何索引参数
index_params = client.create_index_params()
index_params.add_index(
    field_name="text",  # 要索引的标量字段名称
    index_type="INVERTED",    # 要创建的索引类型
    index_name="inverted_index"  # 要创建的索引名称
)

client.create_index(
    collection_name="my_collection",  # 指定 Collection 名称
    index_params=index_params
)
```

在以上示例中，我们在名为 `my_collection` 的 Collection 的 `text` 字段上创建了倒排索引。`add_index()` 方法用于指定字段名称、索引类型和索引名称。

创建倒排索引后，您可以在搜索查询中使用 `filter` 参数来基于索引字段执行标量过滤。这样可以利用倒排索引高效地缩小搜索结果范围。关于更多详细信息，请参考[过滤表达式概览](./filtering-overview)。

## 删除索引\{#drop-an-index}

您也可以使用 `drop_index()` 从 Collection 中删除指定字段上的索引。

<Admonition type="info" icon="📘" title="说明">

如果您的集群与 Milvus v2.6.x 兼容，您可以删除标量字段上的索引，无须对 Collection 执行 Release 操作。

</Admonition>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_index" # Name of the index to drop
)
```

## 使用限制\{#}

- 目前，倒排索引（`INVERTED`）支持 INT8、INT16、INT32、INT64、FLOAT、DOUBLE、BOOL、VARCHAR 和 ARRAY 数据类型，但不支持 JSON 数据类型。

