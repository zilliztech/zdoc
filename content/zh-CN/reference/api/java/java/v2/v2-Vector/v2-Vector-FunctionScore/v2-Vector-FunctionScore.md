---
title: "FunctionScore | Java | v2"
slug: /java/java/v2-Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "一个 `FunctionScore` 实例是一个 `Function` 实例列表，用作重排器。 | Java | v2"
type: docx
token: Au6Wda1HUonyXOx5Pfzc0Cpjnab
sidebar_position: 2
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionScore
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

`FunctionScore` 实例是一个 `Function` 实例列表，用作重排器。

```java
io.milvus.v2.service.vector.request.FunctionScore
```

## Constructor\{#constructor}

此构造函数用于初始化一个新的 `FunctionScore` 实例，该实例包含一个或多个重排器。

```java
FunctionScore.builder()
    .functions(List<CreateCollectionReq.Function> functions)
    .params(Map<String, String> params)
    .build()
```

**BUILDER METHODS:**

- `functions(List<CreateCollectionReq.Function> functions)`

    `Function` 实例列表。

- `params(Map<String, String> params)`

    用于指定这些函数如何协同工作的额外参数。对于 Boost ranker，您可以设置以下参数：

    - `boost_mode` (String)

        指定所设置的权重如何影响任何匹配实体的分数。可选值包括：

        - `Multiple`

            表示加权值等于匹配实体的原始分数乘以指定权重。

            这是默认值。

        - `Sum`

            表示加权值等于匹配实体的原始分数与指定权重之和

    - `function_mode` (String)

        指定如何处理来自多个 Boost Ranker 的加权值。可选值包括：

        - `Multiplify`

            表示匹配实体的最终分数等于所有 Boost Ranker 的加权值之积。

            这是默认值。

        - `Sum`

            表示匹配实体的最终分数等于所有 Boost Ranker 的加权值之和。

**RETURN TYPE:**

*FunctionScore*

**RETURNS:**

一个 **FunctionScore** 实例。

## Example\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

CreateCollectionReq.Function ranker = CreateCollectionReq.Function.builder()
                 .functionType(FunctionType.RERANK)
                 .name("boost")
                 .param("reranker", "boost")
                 .param("filter", "doctype == \"abstract\"")
                 .param("weight", "0.5")
                 .param("random_score", "{\"seed\": 126, \"field\": \"id\"}")
                 .build();
                 
SearchResp searchReq = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .functionScore(FunctionScore.builder()
                .addFunction(ranker)
                .build())
        .build());
SearchResp searchResp = client.search(searchReq);
```
