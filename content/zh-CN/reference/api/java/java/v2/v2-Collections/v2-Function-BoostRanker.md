---
title: "BoostRanker | Java | v2"
slug: /java/java/v2-Function-BoostRanker
sidebar_label: "BoostRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "BoostRanker 实例是一种重排序函数，可提升与过滤表达式匹配的 Entity 的分数，并通过额外参数扩展 **Function** 类。 | Java | v2"
type: docx
token: Gl75dvp4MoxJRAxNsPYcdtunnFc
sidebar_position: 39
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - Zilliz
  - Zilliz Cloud
  - 云
  - BoostRanker
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# BoostRanker

BoostRanker 实例是一种重排序函数，可提升与过滤表达式匹配的 Entity 的分数，并通过额外参数扩展 **Function** 类。

```java
public class BoostRanker extends CreateCollectionReq.Function
```

## 请求语法\{#request-syntax}

```java
BoostRanker.builder()
    .name(String name)
    .description(String description)
    .inputFieldNames(List<String> inputFieldNames)
    .params(Map<String, String> params)
    .filter(String filter)
    .weight(Float weight)
    .randomScoreSeed(Long randomScoreSeed)
    .randomScoreField(String randomScoreField)
    .build()
```

**构建器方法：**

- `name(String name)`

    函数名称。此标识符用于在查询和 Collection 中引用该函数。

- `description(String description)`

    对函数用途的简要说明。这有助于编写文档，或在较大项目中保持清晰；该值默认为空字符串。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.RERANK` 的函数，此参数仅接受一个字段名称。

- `params(Map<String, String> params)`

    一组用于配置函数属性的键值对。

- `filter(String filter)`

    用于在搜索结果 Entity 中匹配 Entity 的过滤表达式。它可以是 Filtering Explained 中提到的任何有效的基础过滤表达式。

    仅使用基础运算符，例如 `==`、`>` 或 `<`。使用 `text_match` 或 `phrase_match` 等高级运算符会降低搜索性能。

- `weight(Float weight)`

    将与原始搜索结果中任何匹配 Entity 的分数相乘的权重。

    该值应为浮点数。

    - 要强调匹配 Entity 的重要性，请将其设置为可提升分数的值。

    - 要降低匹配 Entity 的排名，请为此参数分配一个可降低其分数的值。

- `randomScoreSeed(Long randomScoreSeed)`

    随机函数，与 `randomScoreField(String randomScoreField)` 配合使用，随机生成一个介于 `0` 和 `1` 之间的值。

    您应指定一个初始值，以启动伪随机数生成器（PRNG）。

- `randomScoreField(String randomScoreField)`

    随机函数，与 `randomScoreSeed(Long randomScoreSeed)` 配合使用，随机生成一个介于 `0` 和 `1` 之间的值。

    您应指定一个字段名称，其值将用作生成随机数时的随机因子。具有唯一值的字段即可满足要求。

**返回类型：**

*BoostRanker*

**返回值：**

一个 boost ranker 实例。

**参数：**

- **functionType** （*FunctionType*）-

    此 ranker 的函数类型：始终为 `RERANK`。

- **filter** （*String*）-

    用于选择要提升的 Entity 的过滤表达式。

- **weight** （*Float*）-

    应用于被提升 Entity 分数的权重。

- **randomScoreSeed** （*Long*）-

    启用随机提升时用于随机分数的种子。

- **randomScoreField** （*String*）-

    用作随机分数基础的字段。

## 示例\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.BoostRanker;

// use the BoostRanker class
BoostRanker boost = BoostRanker.builder()
    .name("xxx_boost")
    .description("boost on xxx")
    .filter("xxx == 2")
    .weight(0.5f)
    .randomScoreSeed(123L)
    .randomScoreField("id")
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function boostFn = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("xxx_boost")
    .description("boost on xxx")
    .param("reranker", "boost")
    .param("filter", "xxx == 2")
    .param("weight", "0.5")
    .param("random_score", "{\"seed\": 123, \"field\": \"id\"}")
    .build();
```
