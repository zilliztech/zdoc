---
title: "WeightedRanker | Java | v2"
slug: /java/java/v2-Function-WeightedRanker
sidebar_label: "WeightedRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "WeightedRanker 实例是一种重排函数，它通过对多条搜索路径的加权分数求平均值来重新为结果评分，并通过额外参数扩展 Function 类。 | Java | v2"
type: docx
token: WNqcdscscoj64pxr24jcITJKnLb
sidebar_position: 46
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - WeightedRanker
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# WeightedRanker

WeightedRanker 实例是一种重排函数，它通过对多条搜索路径的加权分数求平均值来重新为结果评分，并通过额外参数扩展 **Function** 类。

```java
public class WeightedRanker extends CreateCollectionReq.Function
```

## 请求语法\{#request-syntax}

```java
WeightedRanker.builder()
    .name(String name)
    .description(String description)
    .functionType(FunctionType functionType)
    .params(Map<String, String> params)
    .weights(List<Float> weights)
    .build()    
```

**构建器方法：**

- `name(String name)`

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `description(String description)`

    函数的用途简述。这可用于文档说明，或让较大项目中的用途更清晰；该值默认为空字符串。

- `params(Map<String, String> params)`

    用于配置函数属性的一组键值对。

- `weights(List<Float> weights)`

    与每条搜索路径对应的权重数组；数组中每个值的范围为 `0` 到 `1`。

**返回类型：**

*WeightedRanker*

**返回：**

一个加权重排器实例。

**参数：**

- **functionType** (*FunctionType*) -

    此重排器的函数类型：始终为 `RERANK`。

- **weights** (*List&lt;Float&gt;*) -

    搜索路径的权重，每个值的范围为 `0` 到 `1`。

## 示例\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;

import java.util.Arrays;

// use the WeightedRanker class
WeightedRanker weighted = WeightedRanker.builder()
    .weights(Arrays.asList(0.4f, 0.6f))
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "weighted")
    .param("params", "{\"weights\": [0.4, 0.6]}")
    .build();
```
