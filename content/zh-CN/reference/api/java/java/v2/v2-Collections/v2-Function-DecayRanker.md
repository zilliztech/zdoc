---
title: "DecayRanker | Java | v2"
slug: /java/java/v2-Function-DecayRanker
sidebar_label: "DecayRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "DecayRanker 实例是一个重排函数，它根据数值字段值调整搜索排名，并通过额外参数扩展 Function 类。 | Java | v2"
type: docx
token: Knf4dT9GFopG6Hx89JKcl9CLnWN
sidebar_position: 40
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - DecayRanker
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# DecayRanker

DecayRanker 实例是一个重排函数，它根据数值字段值调整搜索排名，并通过额外参数扩展 **Function** 类。

```java
public class DecayRanker extends CreateCollectionReq.Function
```

## 构造函数\{#constructor}

此构造函数初始化一个新的 DecayRanker 实例。

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

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `description(String description)`

    对函数用途的简要说明。这有助于文档记录或在大型项目中提高清晰度，默认为空字符串。

- `functionType(FunctionType functionType)`

    用于处理原始数据的函数类型。对于 **DecayRanker**，请将其设置为 `FunctionType.RERANK`。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示的原始数据的字段名。对于使用 `FunctionType.RERANK` 的函数，此参数仅接受一个字段名。

- `params(Map<String, String> params)`

    用于配置函数属性的一组键值对。

- `function(String function)`

    要创建的衰减排序器类型。可选值为 `gauss`、`exp` 和 `linear`。

- `origin(Number origin)`

    计算衰减分数所依据的参考点。处于该值的条目会获得最高相关性分数。对于基于时间的衰减，时间单位必须与您的 Collection 数据一致。

- `scale(Number scale)`

    相关性降至 `decay` 值时的距离或时间。控制相关性下降的速度。对于基于时间的衰减，时间单位必须与您的 Collection 数据一致。值越大，相关性下降越平缓；值越小，下降越陡峭。

- `offset(Number offset)`

    `origin` 周围的一个“无衰减区”，其中的条目保持完整分数（衰减分数 = 1.0）。

    对于基于时间的衰减，时间单位必须与您的 Collection 数据一致。

    位于 `origin` 此范围内的条目保持最高相关性。

- `decay(Number decay)`

    位于 scale 距离处、控制曲线陡峭程度的分数值。值越小，下降曲线越陡峭；值越大，下降曲线越平缓。

    必须介于 0 到 1 之间。

**返回类型：**

*DecayRanker*

**返回：**

一个衰减排序器实例。

**参数：**

- **functionType** (*FunctionType*) -

    此排序器的函数类型：始终为 `RERANK`。

- **function** (*String*) -

    要应用的衰减函数：`gauss`、`exp` 或 `linear`。

- **origin** (*Number*) -

    计算衰减分数所依据的参考点。

- **offset** (*Number*) -

    `origin` 周围分数不会衰减的范围。

- **scale** (*Number*) -

    相关性降至 `decay` 值时的距离或时间。

- **decay** (*Number*) -

    在 `scale` 距离处控制相关性下降速度的衰减率。

## 示例：\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

import java.util.Collections;

// use the DecayRanker class
DecayRanker decay = DecayRanker.builder()
    .function("gauss")
    .name("time decay")
    .inputFieldNames(Collections.singletonList("timestamp"))
    .origin(1000)
    .scale(10000)
    .offset(24)
    .decay(0.5)
    .build();

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
