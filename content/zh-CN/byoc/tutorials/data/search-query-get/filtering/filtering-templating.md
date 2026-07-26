---
title: "过滤表达式模板 | BYOC"
slug: /filtering-templating
sidebar_label: "过滤表达式模板"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，具有众多元素的复杂过滤表达式，特别是那些涉及非ASCII字符（如CJK字符）的表达式，会显着影响查询性能。为了解决这个问题，Zilliz Cloud 引入了一种过滤表达式模板机制，旨在通过减少解析复杂表达式所花费的时间来提高效率。本页解释了在搜索、查询和删除操作中使用过滤表达式模板。 | BYOC"
type: origin
token: V0Tkw5vEJit4TYkKcEGcAwwanwB
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - query
  - 查询
  - filter
  - 过滤
  - 过滤表达式模板

---

import Admonition from '@theme/Admonition';


# 过滤表达式模板

在 Zilliz Cloud 中，具有众多元素的复杂过滤表达式，特别是那些涉及非ASCII字符（如CJK字符）的表达式，会显着影响查询性能。为了解决这个问题，Zilliz Cloud 引入了一种过滤表达式模板机制，旨在通过减少解析复杂表达式所花费的时间来提高效率。本页解释了在搜索、查询和删除操作中使用过滤表达式模板。

## 概述\{#overview}

过滤表达式模板化允许您创建带有占位符的过滤表达式，在查询执行期间可以动态替换为值。使用模板化，您可以避免将大型数组或复杂表达式直接嵌入过滤器中，减少解析时间并提高查询性能。

假设你有一个包含两个字段的过滤表达式，年龄和城市，你想找到所有年龄大于25且居住在“北京”或“上海”的人。你可以使用模板来代替直接嵌入过滤表达式中的值：

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

在这里，`{age}`和`{city}`是占位符，将在执行查询时替换为`filter_params`中的实际值。

在 Zilliz Cloud 中使用过滤表达式模板有几个关键优势：

- **减少解析时间**：通过用占位符替换大型或复杂的过滤表达式，系统花费更少的时间解析和处理过滤器。

- **改进的查询性能**：减少了解析开销，提高了查询性能，从而提高了QPS和更快的响应时间。

- **可扩展性**：随着数据集的增长和过滤表达式变得更加复杂，模板可确保性能保持高效和可扩展。

## 搜索操作\{#search-operations}

对于 Zilliz Cloud 中的搜索操作，过滤表达式用于定义过滤条件，`filter_params`参数用于指定占位符的值。`filter_params`字典包含 Zilliz Cloud 将用于替换到过滤表达式中的动态值。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.search(
    "hello_milvus",
    vectors[:nq],
    filter=expr,
    limit=10,
    output_fields=["age", "city"],
    search_params={"metric_type": "COSINE", "params": {"search_list": 100}},
    filter_params=filter_params,
)
```

在此示例中，Zilliz Cloud 将在执行搜索时动态地将`{age}`替换为`25`，将`{city}`替换为`["北京"，"上海"]`。

## 查询操作\{#query-operations}

相同的模板机制可以应用于 Zilliz Cloud 中的查询操作。在Query 方法中，您定义过滤表达式并使用`filter_params`指定要替换的值。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.query(
    "hello_milvus",
    filter=expr,
    output_fields=["age", "city"],
    filter_params=filter_params
)
```

通过使用`filter_params`，Zilliz Cloud 有效地处理值的动态插入，提高了查询执行的速度。

## 删除操作\{#delete-operations}

您还可以在删除操作中使用过滤表达式模板。与搜索和查询类似，过滤表达式定义条件，`filter_params`为占位符提供动态值。

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.delete(
    "hello_milvus",
    filter=expr,
    filter_params=filter_params
)
```

这种方法提高了删除操作的性能，尤其是在处理复杂的过滤条件时。

## 小结\{#conclusion}

过滤表达式模板是 Zilliz Cloud 中优化查询性能的必备工具。通过使用占位符和`filter_params`字典，您可以显著减少解析复杂过滤表达式所花费的时间。这导致更快的查询执行和更好的整体性能。