---
title: "addFunction() | Java | v2"
slug: /java/java/v2-FunctionScore-addFunction
sidebar_key: java/v2-FunctionScore-addFunction
sidebar_label: "addFunction()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation adds a function to the `FunctionScore` instance. | Java | v2"
type: docx
token: HPs6dFV29ovzyBxpgUacXnnjngd
sidebar_position: 1
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - addFunction()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addFunction()

This operation adds a function to the `FunctionScore` instance.

```java
public B addFunction(CreateCollectionReq.Function func)
```

## Request Syntax\{#request-syntax}

```java
addFunction(
    CreateCollectionReq.Function func
)
```

**PARAMETERS:**

- **func** (*CreateCollectionReq.Function*) 

    A function.

**RETURN TYPE:**

*B extends FunctionScore.FunctionScoreBuilder\<C, B>*

**RETURNS**

A **[FunctionScore](./v2-Vector-FunctionScore)** builder for chaining up multiple `addFunction()` methods.

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
