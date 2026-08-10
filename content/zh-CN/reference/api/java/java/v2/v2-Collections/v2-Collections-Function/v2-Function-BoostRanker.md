---
title: "BoostRanker | Java | v2"
slug: /java/java/v2-Function-BoostRanker
sidebar_label: "BoostRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "BoostRanker 继承自 **Function** 类，并提供额外参数。 | Java | v2"
type: docx
token: QO5ldltYOoo5uFxS4ZJc24JWnUh
sidebar_position: 1
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - zilliz
  - Zilliz Cloud
  - 云
  - BoostRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# BoostRanker

BoostRanker 继承自 **Function** 类，并提供额外参数。

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

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `description(String description)`

    对函数用途的简要描述。这有助于在较大的项目中进行文档说明或提高清晰度，默认值为空字符串。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示形式的原始数据的字段名称。对于使用 `FunctionType.RERANK` 的函数，此参数仅接受一个字段名。

- `params(Map<String, String> params)`

    用于配置函数属性的一组键值对。

- `filter(String filter)`

    用于在搜索结果 Entity 中匹配 Entity 的过滤表达式。它可以是 [过滤说明](https://milvus.io/docs/boolean.md) 中提到的任何有效基础过滤表达式。

    <Admonition type="info" icon="📘" title="Notes">

    仅使用基础运算符，例如 `==`、`>` 或 `<`。使用高级运算符（例如 `text_match` 或 `phrase_match`）会降低搜索性能。

    </Admonition>

- `weight(Float weight)`

    将乘以原始搜索结果中任何匹配 Entity 得分的权重。

    该值应为浮点数。

    - 要强调匹配 Entity 的重要性，请将其设置为能够提高得分的值。

    - 要降低匹配 Entity 的排序，请为此参数指定一个会降低其得分的值。

- `randomScoreSeed(Long randomScoreSeed)`

    与 `randomScoreField(String randomScoreField)` 配合使用的随机函数，用于随机生成一个介于 `0` 和 `1` 之间的值。 

    您应指定一个初始值来启动伪随机数生成器（PRNG）。

- `randomScoreField(String randomScoreField)`

    与 `randomScoreSeed(Long randomScoreSeed)` 配合使用的随机函数，用于随机生成一个介于 `0` 和 `1` 之间的值。 

    您应指定一个字段名称，该字段的值将作为生成随机数时的随机因子。具有唯一值的字段即可满足要求。

**返回类型：**

*BoostRanker*

**返回：**

一个 boost ranker 实例。

## 示例：\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.BoostRanker
import java.util.Collections;

// use the ModelRanker class
BoostRanker boost = BoostRanker.builder()
    .name("xxx_boost")
    .description("boost on xxx")
    .filter("xxx == 2")
    .weight(0.5)
    .randomScoreSeed(123)
    .randomScoreField("id")
    .build()
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function boost = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("xxx_boost")
    .description("boost on xxx")
    .param("reranker", "boost")
    .param("filter", "xxx == 2")
    .param("weight", "0.5")
    .param("random_score", "{\"seed\": 123, \"field\": \"id\"}")
    .build();
```

