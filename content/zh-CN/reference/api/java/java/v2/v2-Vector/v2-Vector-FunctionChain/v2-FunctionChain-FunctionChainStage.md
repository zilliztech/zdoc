---
title: "FunctionChainStage | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainStage
sidebar_label: "FunctionChainStage"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainStage 实例指定函数链运行所处的执行阶段。数值与 gRPC `FunctionChainStage` 消息一致。 | Java | v2"
type: docx
token: E1GAdX9woo39BTxEwfocb6fVnCb
sidebar_position: 5
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChainStage
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# FunctionChainStage

FunctionChainStage 实例指定函数链运行所处的执行阶段。数值与 gRPC `FunctionChainStage` 消息一致。

```java
io.milvus.v2.service.vector.request.FunctionChainStage
```

## 常量\{#constants}

- **UNSPECIFIED**

    未设置的阶段。

- **INGESTION**

    在数据摄取期间运行。

- **PRE_PROCESS**

    在搜索之前运行。

- **L0_RERANK**

    应用于搜索结果的第一个重排阶段。

- **L1_RERANK**

    应用于搜索结果的第二个重排阶段。

- **L2_RERANK**

    应用于搜索结果的第三个重排阶段。

- **POST_PROCESS**

    在搜索之后运行。

## 示例\{#example}

```java
FunctionChain chain = FunctionChain.builder()
        .stage(FunctionChainStage.L2_RERANK)
        .name("fresh_popular_rerank")
        .build();
```
