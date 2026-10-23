---
title: "ModelRanker | Java | v2"
slug: /java/java/v2-Function-ModelRanker
sidebar_label: "ModelRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ModelRanker 实例是一种重排函数，它使用语言模型计算查询与文档之间的相关性分数，并通过额外参数扩展 Function 类。 | Java | v2"
type: docx
token: ZKj1dLHd2otxtAxRL33cxVZznDb
sidebar_position: 44
keywords: 
  - 向量 Database 对比
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - ModelRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ModelRanker

ModelRanker 实例是一种重排函数，它使用语言模型计算查询与文档之间的相关性分数，并通过额外参数扩展 **Function** 类。

```java
public class ModelRanker extends CreateCollectionReq.Function
```

## 请求语法\{#request-syntax}

```java
ModelRanker.builder()
    .name(String name)
    .description(String description)
    .inputFieldNames(List<String> inputFieldNames)
    .params(Map<String, String> params)
    .provider(String provider)
    .queries(List<String> queries)
    .endpoint(String endpoint)
    .build()
```

**构建器方法：**

- `name(String name)`

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `description(String description)`

    函数用途的简要说明。这可用于文档说明，或在较大项目中提高清晰度。该值默认为空字符串。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.RERANK` 的函数，此参数仅接受一个字段名称。

- `params(Map<String, String> params)`

    用于配置函数属性的一组键值对。

- `max_client_batch_size`（int） -

    单个批次中要处理的最大文档数。较大的值可提高吞吐量，但需要更多内存。该值默认为 `32`。

- `provider(String provider)`

    重排模型提供方的名称。有关可选值，请参见“选择适合您需求的模型提供方”。

- `queries(List<String> queries)`

    用于重排模型计算相关性分数的查询字符串列表。查询字符串的数量必须与搜索操作中的查询数量完全一致（即使使用查询向量而非文本）。否则将报告错误。

- `endpoint(String endpoint)`

    模型服务的 URL。

**返回类型：**

*ModelRanker*

**返回：**

一个模型重排器实例。

**参数：**

- **functionType**（*FunctionType*） -

    此重排器的函数类型：始终为 `RERANK`。

- **provider**（*String*） -

    重排模型提供方的名称，例如 `tei` 或 `vllm`。

- **queries**（*List&lt;String&gt;*） -

    模型用于计算相关性分数的查询字符串。

- **Endpoint**（*String*） -

    已部署的重排模型服务的 URL。

## 示例\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.ModelRanker;

import java.util.Collections;

// use the ModelRanker class
ModelRanker ranker = ModelRanker.builder()
    .name("TEI ranker")
    .inputFieldNames(Collections.singletonList("document"))
    .provider("tei")
    .queries(Collections.singletonList("machine learning for time series"))
    .endpoint("http://model-service:8080")
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("semantic_ranker")
    .description("semantic ranker")
    .inputFieldNames(Collections.singletonList("document"))
    .param("reranker", "model")
    .param("provider", "tei")
    .param("queries", "[\"machine learning for time series\"]")
    .param("endpoint", "http://model-service:8080")
    .build();
```
