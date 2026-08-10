---
title: "FunctionScore | Java | v2"
slug: /java/java/v2-Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`FunctionScore` 实例是由用作重排器的 `Function` 实例组成的列表。| Java | v2"
type: docx
token: Au6Wda1HUonyXOx5Pfzc0Cpjnab
sidebar_position: 2
keywords: 
  - 异常检测
  - 句子转换器
  - 推荐系统
  - 信息检索
  - zilliz
  - zilliz cloud
  - 云
  - FunctionScore
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

`FunctionScore` 实例是由用作重排器的 `Function` 实例组成的列表。

```java
io.milvus.v2.service.vector.request.FunctionScore
```

## 构造函数\{#constructor}

此构造函数会初始化一个由一个或多个 ranker 组成的新 `FunctionScore` 实例。

```java
FunctionScore.builder()
    .functions(List<CreateCollectionReq.Function> functions)
    .params(Map<String, String> params)
    .build()
```

**构建器方法：**

- `functions(List<CreateCollectionReq.Function> functions)`

    由 `Function` 实例组成的列表。

- `params(Map<String, String> params)`

    指定函数如何协同工作的额外参数。对于 Boost ranker，您可以设置以下参数：

    - `boost_mode` (String)

        指定所设权重如何影响任何匹配 Entity 的分数。可能的值包括：

        - `Multiple`

            表示加权值等于匹配 Entity 的原始分数乘以指定权重。

            这是默认值。

        - `Sum`

            表示加权值等于匹配 Entity 的原始分数与指定权重之和

    - `function_mode` (String)

        指定如何处理来自各个 Boost Ranker 的加权值。可能的值包括：

        - `Multiplify`

            表示匹配 Entity 的最终分数等于所有 Boost Ranker 的加权值之积。

            这是默认值。

        - `Sum`

            表示匹配 Entity 的最终分数等于所有 Boost Ranker 的加权值之和。

**返回类型：**

*FunctionScore*

**返回：**

一个 **FunctionScore** 实例。

## 示例\{#example}

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
