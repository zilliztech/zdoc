---
title: "Function 概述 | BYOC"
slug: /function-and-model-inference-overview
sidebar_label: "Function 概述"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了一套统一的搜索架构，用于构建现代检索系统，包括语义搜索、词法搜索、混合搜索以及智能重排。与将这些能力作为孤立功能暴露给用户不同，Zilliz Cloud 将它们统一组织在一个核心抽象之下：Function。 | BYOC"
type: origin
token: HNNmwLBt1ijq6XkSwmuc4PtCnud
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Function 概述

Zilliz Cloud 提供了一套统一的搜索架构，用于构建现代检索系统，包括语义搜索、词法搜索、混合搜索以及智能重排。与将这些能力作为孤立功能暴露给用户不同，Zilliz Cloud 将它们统一组织在一个核心抽象之下：**Function**。

## 什么是 Function？\{#what-is-a-function}

在 Zilliz Cloud 中，**Function** 是一种可配置的执行单元，用于在搜索工作流的特定阶段执行某一项具体操作。

一个 Function 通常回答以下三个实际问题：

- **这个操作在什么时候执行？**在搜索之前，还是在搜索之后。

- **它作用于什么输入？**原始文本、向量表示，或已检索到的候选结果。

- **它产生什么输出？**用于检索的向量 Embedding，或经过重排后的搜索结果。

从工作流的角度来看，Function 会在搜索流程中的两个不同阶段参与执行：

- **Pre-search**：Function 在搜索之前运行，将文本转换为向量表示。这些向量决定了哪些候选结果会被检索出来。

- **Post-search**：Function 在候选结果检索完成之后运行，用于在不改变候选集的前提下，对结果顺序进行优化。

下图以抽象方式展示了 Function 在搜索工作流中的整体作用方式。

![UUQ4wWNA3htUYtbe7qAcKnESnqe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/UUQ4wWNA3htUYtbe7qAcKnESnqe.png)

每一次搜索请求都会遵循相同的高层流程：

1. **Pre-search Function** 根据输入文本生成向量表示

1. 搜索引擎基于这些向量检索出候选结果

1. （可选）**Post-search Function** 对已检索到的候选结果进行重排

## Function 分类\{#function-categories}

在 Zilliz Cloud  中，Function 按照**在搜索工作流中执行的时机**以及**所扮演的角色**进行分类。总体来看，Function 可以分为两大类：

- **Pre-search Functions**：将文本转换为向量 Embedding，并决定候选结果的检索范围

- **Post-search Functions**：在候选结果检索完成后，对结果顺序进行优化

### Pre-search Function：将文本转换为向量 Embedding\{#pre-search-functions-convert-text-to-vector-embeddings}

Pre-search Function 在候选结果检索之前运行。它们的作用是将原始文本（包括已存储的文档和传入的查询文本）转换为向量表示，搜索引擎会基于这些向量来识别相关的候选结果。

不同的 Pre-search Functions 会生成不同类型的向量 Embedding，这将直接影响检索的方式和效果。

下表总结了当前支持的 Pre-search Function：

| Function 类型 | 向量类型 | 说明 | 典型场景 |
| --- | --- | --- | --- |
| **BM25 Function** | 稀疏向量 | 基于词项匹配、词频以及文档长度归一化计算词法相关性。<br/>作为本地机制完全在数据库引擎内执行；不需要[模型推理](./undefined#understand-model-inference)。 | 以关键词为中心的全文检索、文档搜索、代码搜索，或对精确词项匹配和本地高性能有要求的场景。 |
| **Model-based Embedding Functions** | 稠密向量 | 使用机器学习模型对文本的语义含义进行编码，实现超越精确关键词匹配的相似性检索。<br/>需要通过托管模型或第三方模型服务进行[模型推理](./undefined#understand-model-inference)。 | 语义搜索、自然语言查询、问答式检索，以及更关注概念相似性而非精确匹配的场景。 |

所有 Pre-search Function 都会以一致的方式同时作用于文档数据和查询文本，从而确保检索始终在同一表示空间中进行。

### Post-search Function：重排候选结果\{#post-search-functions-rerank-candidate-results}

Post-search Function 在候选结果检索完成之后运行。它们的作用是在**不改变候选集本身**的前提下，对检索结果的顺序进行优化。

Post-search Function 作用于搜索阶段返回的候选结果，通过额外的排序逻辑或相关性信号来提升最终结果质量。

下表总结了当前支持的 Post-search Function：

| **Function 类型** | **作用对象** | **说明** | **典型场景** |
| --- | --- | --- | --- |
| **Hybrid Search Ranker** | 来自混合搜索的多个结果集 | 使用加权排序或倒数排名融合（RRF）等方法，对不同检索策略返回的结果进行合并和平衡。 | 同时结合语义检索与词法检索，并需要对多种结果进行平衡融合的混合搜索场景。 |
| **Rule-based Ranker** | 单一向量检索或混合搜索返回的候选结果 | 基于预定义规则或数值信号（如加权、衰减）对结果进行调整。 | 受业务规则驱动的排序逻辑，如新内容提升、热门内容加权，以及需要可预测、非模型化重排的场景。 |
| **Model-based Ranker** | 单一向量检索或混合搜索返回的候选结果 | 使用机器学习模型评估相关性，并基于学习到的语义信号对结果重新排序。 | 智能重排、基于语义理解的相关性优化，以及使用大模型进行相关性评估的场景。 |

由于 Post-search Function 仅作用于已检索到的候选结果，它们只会影响结果顺序，而不会改变检索范围。