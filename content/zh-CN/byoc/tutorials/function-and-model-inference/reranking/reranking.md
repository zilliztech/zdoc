---
title: "Rerank Function | BYOC"
slug: /reranking
sidebar_label: "Rerank Function"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "混合搜索通过同时进行多个近似最近邻（ANN）搜索来实现更精确的搜索结果。多个搜索会返回多组结果，这就需要一种重排序策略来帮助合并和重新排序这些结果，并返回单组结果。本指南将介绍 Zilliz Cloud 支持的重排序策略，并提供选择合适重排序策略的建议。 | BYOC"
type: origin
token: Kjd1wyJbAi1idRkqEJqcM3mfnx1
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - reranking
  - 重排
  - 搜索结果重排

---

import Admonition from '@theme/Admonition';


# Rerank Function

混合搜索通过同时进行多个近似最近邻（ANN）搜索来实现更精确的搜索结果。多个搜索会返回多组结果，这就需要一种重排序策略来帮助合并和重新排序这些结果，并返回单组结果。本指南将介绍 Zilliz Cloud 支持的重排序策略，并提供选择合适重排序策略的建议。

import DocCardList from '@theme/DocCardList';

<DocCardList />