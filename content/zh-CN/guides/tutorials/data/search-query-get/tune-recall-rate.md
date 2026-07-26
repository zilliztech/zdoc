---
title: "召回调优 | Cloud"
slug: /tune-recall-rate
sidebar_key: tune-recall-rate
sidebar_label: "召回调优"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 引入了一个名为 `level` 的搜索参数，允许用户通过调整该参数来平衡召回率和搜索性能。同时，Zilliz Cloud 还允许用户设置 `enablerecallcalculation` 参数来决定是否在搜索结果中包含预估召回率信息。您可以配合使用这两个参数来对向量搜索结果进行调优。 | Cloud"
type: origin
token: Wb3KwVJBDiQvzikvXNbcUiZonEf
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 召回调优
  - recall rate
  - estimated recall rate

---

import Admonition from '@theme/Admonition';


# 召回调优

Zilliz Cloud 引入了一个名为 `level` 的搜索参数，允许用户通过调整该参数来平衡召回率和搜索性能。同时，Zilliz Cloud 还允许用户设置 `enable_recall_calculation` 参数来决定是否在搜索结果中包含预估召回率信息。您可以配合使用这两个参数来对向量搜索结果进行调优。

<Admonition type="info" icon="📘" title="说明">

召回调优适用于所有搜索类型，包括基本 Vector Search、Filtered Search、Range Search、Grouping Search、多向量混合搜索以及 Search Iterator。

</Admonition>

## 概述\{#}

Zilliz Cloud 向量搜索中的召回率通常是指成功召回的相关结果数量占所有相关结果数量的比值。该指标通常用来衡量集群准确召回相关结果的能力。

![JHafbESR3oZ9GzxgELeci02inyg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/JHafbESR3oZ9GzxgELeci02inyg.png "JHafbESR3oZ9GzxgELeci02inyg")

根据上述公式，您可以用搜索结果中获取的相关结果数量除以所有相关结果数量获得本次搜索的召回率。例如，如果某次向量搜索获取到了 100 条相关结果中的 90 条，那么此次向量搜索的召回率为 **0.9** 或 **90%**。

高召回率通常意味着更加精确的搜索结果，搜索耗时可能也更长。您可能希望通过调节召回率在搜索效率和搜索准确率之间找到平衡。

## 设置搜索参数\{#}

您可以通过在搜索请求中添加 `level` 参数的方式将该请求变更为可调优请求。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 1 # The precision control
        }
    }
)
```

该参数取值范围在 `1` 到 `10` 之间，默认值为 `1`。默认值通常能获得 `90%` 以上的召回率，能够满足大多数场景的需要。

对于有高召回率要求的场景（如 99% 及以上），可以将 `level` 值设置为 `6` 到 `10` 之间的某个整数。如果搜索效率指标没有要求，您可以考虑将该参数的值直接设置为 `10` 以获取最精确的搜索结果。

<Admonition type="info" icon="📘" title="说明">

如果将该参数设置为最大值仍无法满足要求，您可以联系 [Zilliz Cloud 支持](https://zilliz.com.cn/contact-sales)。

</Admonition>

## 调节召回率\{#}

为了方便您调整 `level` 参数，Zilliz Cloud 还提供了另一个名为 `enable_recall_calculation` 的参数。通过设置该参数为 `True`，您可以让 Zilliz Cloud 在搜索结果中包含本次搜索的预估召回率。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            "level": 6 # The precision control
            # highlight-next-line
            "enable_recall_calculation": True # Ask for recall rate calculation
        }
    }
)
```

在使用上述搜索请求进行向量搜索后，您可以得到如下响应，其中 `recalls` 即为预估召回率。

```python
# data: [...], recalls: [0.98]
```

在预估过程中， Zilliz Cloud 执行了如下操作：

1. 使用用户指定的 `level` 值进行向量搜索。

1. 使用内部高精模式再次执行向量搜索。

1. 使用第二次搜索的结果作为分母计算预估召回率。

在设置 `enable_recall_calculation` 为 `True` 时，您可以通过调整 `level` 参数的取值执行多次搜索来查看预估召回率的变化。通过评估预估召回率和搜索耗时等指标，粗略估计合适的 `level` 参数取值。

<Admonition type="info" icon="📘" title="说明">

开启 `enable_recall_calculation` 可能会影响搜索性能，不建议在生产环境使用。

</Admonition>

## 限制\{#}

该功能当前仅对基本 Vector Search、Filtered Search 和 Range Search 有效。