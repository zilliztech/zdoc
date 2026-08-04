---
title: "DecayRanker | Java | v2"
slug: /java/java/v2-Function-DecayRanker
sidebar_label: "DecayRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "DecayRanker 类继承自 Function 类，并提供额外参数。 | Java | v2"
type: docx
token: QIpldgpB1oP5IYxNSSdcyRNcn1c
sidebar_position: 2
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - DecayRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# DecayRanker

**DecayRanker** 类继承自 **Function** 类，并提供额外参数。

```java
public class DecayRanker extends CreateCollectionReq.Function
```

## Constructor\{#constructor}

此构造器会初始化一个新的 `DecayRanker` 实例，用于创建一个 decay ranker 实例。

```java
DecayRanker.builder()
    .name(String name)
    .description(String description)
    .functionType(FunctionType functionType)
    .inputFieldNames(List<String> inputFieldNames)
    .params(Map<String, String> params)
    .function(String function)
    .origin(Number origin)
    .scale(Number scale)
    .offset(Number offset)
    .decay(Number decay)
    .build();
```

**构建器方法：**

- `name(String name)`

    函数的名称。该标识符用于在查询和集合中引用此函数。

- `description(String description)`

    对函数用途的简要说明。这在较大的项目中可用于文档说明或提升可读性，默认为空字符串。

- `functionType(FunctionType functionType)`

    用于处理原始数据的函数类型。对于 **DecayRanker**，请将其设置为 `FunctionType.RERANK`。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.RERANK` 的函数，此参数仅接受一个字段名。

- `params(Map<String, String> params)`

    用于配置函数属性的一组键值对。

- `function(String function)`

    要创建的 decay ranker 类型。可选值为：`gauss`、`exp` 和 `linear`。

- `origin(Number origin)`

    计算衰减分数的参考点。位于该值处的项会获得最高相关性分数。对于基于时间的衰减，时间单位必须与集合数据保持一致。

- `scale(Number scale)`

    相关性下降到 `decay` 值时的距离或时间。它控制相关性下降的速度。对于基于时间的衰减，时间单位必须与集合数据保持一致。较大的值会使相关性下降更平缓；较小的值会使相关性下降更陡峭。

- `offset(Number offset)`

    `origin` 周围的“无衰减区”，该区域内的项保持满分（decay score = 1.0）。

    对于基于时间的衰减，时间单位必须与集合数据保持一致。

    与 `origin` 距离处于该范围内的项将保持最高相关性。

- `decay(Number decay)`

    在 `scale` 距离处的分数值，用于控制曲线陡峭程度。较低的值会形成更陡峭的下降曲线；较高的值会形成更平缓的下降曲线。

    该值必须介于 0 和 1 之间。

**返回类型：**

*DecayRanker*

**返回：**

一个 decay ranker 实例。

## 示例：\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.DecayRanker
import java.util.Collections;

// use the DecayRanker class
DecayRanker.builder()
    .function("gauss")
    .name("time decay")
    .inputFieldNames(Collections.singletonList("timestamp"))
    .origin(1000)
    .scale(10000)
    .offset(24)
    .decay(0.5)
    .build());
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("time_decay")
    .description("time decay")
    .inputFieldNames(Collections.singletonList("timestamp"))
    .param("reranker", "decay")
    .param("function", "gauss")
    .param("origin", "1000")
    .param("scale", "10000")
    .param("offset", "24")
    .param("decay", "0.5")
    .build();
```
