---
title: "MetricType | Java | v2"
slug: /java/java/v2-Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "MetricType 实例是一个枚举常量。该枚举提供以下常量。 | Java | v2"
type: docx
token: GEcrdVWnboOetOx08RrcRHVhn3g
sidebar_position: 14
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - LLM 作为评判者
  - Zilliz
  - Zilliz Cloud
  - 云
  - MetricType
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# MetricType

MetricType 实例是一个枚举常量。该枚举提供以下常量。

## 常量\{#constants}

- INVALID

    将度量类型设置为 **INVALID**。

- L2

    将度量类型设置为 **L2**。仅适用于浮点向量。

- IP

    将度量类型设置为 **IP**。仅适用于浮点向量。

- COSINE

    将度量类型设置为 **COSINE**。仅适用于浮点向量。

- HAMMING

    将度量类型设置为 **HAMMING**。仅适用于二值向量。

- JACCARD

    将度量类型设置为 **JACCARD**。仅适用于二值向量。

- BM25

    将度量类型设置为 **BM25**。适用于派生自 BM25 函数的稀疏向量字段。

- MAX_SIM

    将度量类型设置为 **MAX_SIM**。仅适用于 Struct 元素中的所有向量。

- MAX_SIM_COSINE

    将度量类型设置为 **MAX_SIM_COSINE**。仅适用于 Struct 元素中的浮点向量。

- MAX_SIM_IP

    将度量类型设置为 **MAX_SIM_IP**。仅适用于 Struct 元素中的浮点向量。

- MAX_SIM_L2

    将度量类型设置为 **MAX_SIM_L2**。仅适用于 Struct 元素中的浮点向量。

- MAX_SIM_JACCARD

    将度量类型设置为 **MAX_SIM_JACCARD**。仅适用于 Struct 元素中的二值向量。

- MAX_SIM_HAMMING

    将度量类型设置为 **MAX_SIM_HAMMING**。仅适用于 Struct 元素中的二值向量。
