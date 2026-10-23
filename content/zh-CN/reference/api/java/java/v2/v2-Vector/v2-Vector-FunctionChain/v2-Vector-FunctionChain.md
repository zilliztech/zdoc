---
title: "FunctionChain | Java | v2"
slug: /java/java/v2-Vector-FunctionChain
sidebar_label: "FunctionChain"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChain 实例是应用于搜索结果的有序 rerank/refine 方案。它由 `map`、`sort` 和 `limit` 操作组成，这些操作会对 `search()` 调用的结果列进行后处理。 | Java | v2"
type: docx
token: U0mKd1nlXoWkDqxf9zRcoURVnCb
sidebar_position: 1
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 Database
  - 什么是向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChain
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChain

FunctionChain 实例是应用于搜索结果的有序 rerank/refine 方案。它由 `map`、`sort` 和 `limit` 操作组成，这些操作会对 `search()` 调用的结果列进行后处理。

```java
io.milvus.v2.service.vector.request.FunctionChain
```

## 构造函数\{#constructor}

此构建器通过 map、sort 和 limit 操作组合出一个函数链。

```java
FunctionChain.builder()
    .stage(FunctionChainStage stage)
    .name(String name)
    .map(String output, FunctionChainExpr expr)
    .sort(String by, boolean desc, String tieBreakCol)
    .limit(int limit)
    .limit(int limit, int offset)
    .build()
```

**构建器方法：**

- `stage(FunctionChainStage stage)`

    此函数链运行所在的执行阶段。如果 stage 为 `null`，则抛出 `MilvusClientException`。

- `name(String name)`

    此函数链的名称。传入 null 时，默认为空字符串。

- `map(String output, FunctionChainExpr expr)`

    添加一个 `map` 操作，该操作会根据表达式计算新的输出列。

- `sort(String by, boolean desc, String tieBreakCol)`

    添加一个 `sort` 操作，该操作会按给定列对结果进行排序。为 `tieBreakCol` 传入 `null`，即可省略平局决胜列。

- `limit(int limit)`

    添加一个 `limit` 操作，该操作仅保留给定数量的结果，并从开头开始。

- `limit(int limit, int offset)`

    添加一个 `limit` 操作，该操作仅保留给定数量的结果，并跳过开头给定数量的结果。

**返回类型：**

*FunctionChain*

**返回：**

一个 **FunctionChain** 实例。

**参数：**

- **stage** (*FunctionChainStage*) -

    此函数链运行所在的执行阶段。

- **name** (*String*) -

    此函数链的名称。默认值为空字符串。

- **ops** (*List&lt;FunctionChainOp&gt;*) -

    此函数链中操作的有序列表。

**方法：**

- `FunctionChainStage getStage()`

    返回此函数链运行所在的执行阶段。

- `String getName()`

    返回此函数链的名称。

- `List<FunctionChainOp> getOps()`

    返回此函数链中操作的有序列表。

## 示例\{#example}

```java
FunctionChain chain = FunctionChain.builder()
        .stage(FunctionChainStage.L2_RERANK)
        .name("fresh_popular_rerank")
        .map("$score", FunctionChainExpr.builder()
                .name("num_combine")
                .arg(FunctionChainArg.col("$score"))
                .arg(FunctionChainArg.col("freshness"))
                .param("mode", "weighted")
                .param("weights", Arrays.asList(0.7, 0.2, 0.1))
                .build())
        .sort("$score", true, "$id")
        .limit(10)
        .build();

SearchResp response = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .annsField("vector")
        .functionChains(Collections.singletonList(chain))
        .build());
```
