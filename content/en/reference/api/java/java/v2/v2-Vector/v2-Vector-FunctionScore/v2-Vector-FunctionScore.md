---
title: "FunctionScore | Java | v2"
slug: /java/java/v2-Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A FunctionScore instance is a list of `Function` instances used as rerankers. | Java | v2"
type: docx
token: QwsCdrceioo36Bxu2ricF15knUh
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

A FunctionScore instance is a list of `Function` instances used as rerankers.

```java
io.milvus.v2.service.vector.request.FunctionScore
```

## Constructor\{#constructor}

This constructor initializes a new `FunctionScore` instance that comprises one or more rankers.

```java
FunctionScore.builder()
    .functions(List<CreateCollectionReq.Function> functions)
    .params(Map<String, String> params)
    .build()
```

**BUILDER METHODS:**

- `functions(List<CreateCollectionReq.Function> functions)`

    A list of `Function` instances.

- `params(Map<String, String> params)`

    Extra parameters for how the specified functions work together. For a Boost ranker, you can set the following parameters:

- `boost_mode` (String)

    Specifies how the specified weights influence the scores of any matching entities. Possible values are:

    - `Multiply`

        Indicates that the weighted value is equal to the original score of a matching entity multiplied by the specified weight.

        This is the default value.

    - `Sum`

        Indicates that the weighted value is equal to the sum of the original score of a matching entity and the specified weight.

- `function_mode` (String)

    Specifies how the weighted values from various Boost rankers are processed. Possible values are:

    - `Multiply`

        Indicates that the final score of a matching entity is equal to the product of the weighted values from all Boost rankers.

        This is the default value.

    - `Sum`

        Indicates that the final score of a matching entity is equal to the sum of the weighted values from all Boost rankers.

**RETURN TYPE:**

*FunctionScore*

**RETURNS:**

A **FunctionScore** instance.

**PARAMETERS:**

- **functions** (*List&lt;CreateCollectionReq.Function&gt;*) -

    A list of `Function` instances used as rerankers.

- **params** (*Map&lt;String, String&gt;*) -

    Extra parameters for how the specified functions work together.

## Example\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CreateCollectionReq.Function ranker = CreateCollectionReq.Function.builder()
                 .functionType(FunctionType.RERANK)
                 .name("boost")
                 .param("reranker", "boost")
                 .param("filter", "doctype == \"abstract\"")
                 .param("weight", "0.5")
                 .param("random_score", "{\"seed\": 126, \"field\": \"id\"}")
                 .build();

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .functionScore(FunctionScore.builder()
                .addFunction(ranker)
                .build())
        .build());
```
