---
title: "RRFRanker | Java | v2"
slug: /java/java/v2-Function-RRFRanker
sidebar_label: "RRFRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "RRFRanker 实例是一种重排序函数，它通过倒数排名融合合并多个搜索的结果，并通过额外参数扩展 Function 类。 | Java | v2"
type: docx
token: AVK9dgWG5oqvmgxYkxocGKLqnWb
sidebar_position: 45
keywords: 
  - Milvus
  - Zilliz
  - Milvus 向量 Database
  - Milvus Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - RRFRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# RRFRanker

RRFRanker 实例是一种重排序函数，它通过倒数排名融合合并多个搜索的结果，并通过额外参数扩展 **Function** 类。

```java
public class RRFRanker extends CreateCollectionReq.Function
```

## 请求语法\{#request-syntax}

```java
RRFRanker.builder()
    .name(String name)
    .description(String description)
    .params(Map<String, String> params)
    .k(int k)
    .build()
```

**构建器方法：**

- `name(String name)`

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `description(String description)`

    对函数用途的简要说明。这有助于文档记录或在大型项目中保持清晰；该值默认为空字符串。

- `params(Map<String, String> params)`

    一组用于配置函数属性的键值对。

- `k(int k)`

    控制文档排名影响的平滑参数；较高的 `k` 会降低对靠前排名的敏感度。该值的范围为 `1` 到 `16383`，默认为 `60`。

**返回类型：**

*RRFRanker*

**返回值：**

一个 RRF 排序器实例。

**参数：**

- **functionType**（*FunctionType*）-

    此排序器的函数类型：始终为 `RERANK`。

- **k**（*int*）-

    控制文档排名影响的平滑参数，范围为 `1` 到 `16383`。

## 示例：\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;

// use the RRFRanker class
RRFRanker rrf = RRFRanker.builder()
    .k(60)
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "rrf")
    .param("params", "{\"k\": 60}")
    .build();
```
