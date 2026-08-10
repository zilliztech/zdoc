---
title: "MetricType | Java | v2"
slug: /java/java/v2-Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Java | v2"
type: docx
token: GEcrdVWnboOetOx08RrcRHVhn3g
sidebar_position: 14
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - 云
  - MetricType
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

这是一个提供以下常量的枚举。

## 常量\{#constants}

- INVALID

    将指标类型设置为 **INVALID**。

- L2

    将指标类型设置为 **L2**。这仅适用于浮点向量。

- IP

    将指标类型设置为 **IP**。这仅适用于浮点向量。

- COSINE

    将指标类型设置为 **COSINE**。这仅适用于浮点向量。

- HAMMING

    将指标类型设置为 **HAMMING**。这仅适用于二进制向量。

- JACCARD

    将指标类型设置为 **JACCARD**。这仅适用于二进制向量。

- BM25

    将指标类型设置为 **BM25**。这适用于从 BM25 函数派生的稀疏向量字段。

- MAX_SIM

    将指标类型设置为 **MAX_SIM**。这仅适用于 Struct 元素中的所有向量。

- MAX_SIM_COSINE

    将指标类型设置为 **MAX_SIM_COSINE**。这仅适用于 Struct 元素中的浮点向量。

- MAX_SIM_IP

    将指标类型设置为 **MAX_SIM_IP**。这仅适用于 Struct 元素中的浮点向量。

- MAX_SIM_L2

    将指标类型设置为 **MAX_SIM_L2**。这仅适用于 Struct 元素中的浮点向量。

- MAX_SIM_JACCARD

    将指标类型设置为 **MAX_SIM_JACCARD**。这仅适用于 Struct 元素中的二进制向量。

- MAX_SIM_HAMMING

    将指标类型设置为 **MAX_SIM_HAMMING**。这仅适用于 Struct 元素中的二进制向量。

