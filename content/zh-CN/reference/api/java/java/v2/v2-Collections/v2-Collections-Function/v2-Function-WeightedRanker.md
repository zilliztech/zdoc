---
title: "WeightedRanker | Java | v2"
slug: /java/java/v2-Function-WeightedRanker
sidebar_label: "WeightedRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "WeightedRanker 类继承自 Function 类，并提供额外参数。 | Java | v2"
type: docx
token: V9YUdnfxDoc5Gmx80Wec9P6Sn2d
sidebar_position: 7
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - WeightedRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# WeightedRanker

**WeightedRanker** 类继承自 **Function** 类，并提供额外参数。

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

**BUILDER 方法：**

- `name(String name)`

    函数的名称。该标识符用于在查询和集合中引用该函数。

- `description(String description)`

    对函数用途的简要描述。这在较大的项目中可用于文档说明或提升可读性，默认值为空字符串。

- `params(Map<String, String> params)`

    一组用于配置函数属性的键值对。

- `weights(List<Float> weights)`

    与每个搜索路径对应的权重数组；数组中的每个值范围为 `0` 到 `1`。

**返回类型：**

*WeightedRanker*

**返回：**

一个加权排序器实例。

## 示例：\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker
import java.util.Collections;

// use the WeightedRanker class
WeightedRanker.builder()
    .weights([0.4, 0.6])
    .build());
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "weighted")
    .param("params", "{\"weights\": [0.4, 0.6]}")
    .build();
```

