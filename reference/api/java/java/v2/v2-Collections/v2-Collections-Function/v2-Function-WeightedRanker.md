---
title: "WeightedRanker | Java | v2"
slug: /java/java/v2-Function-WeightedRanker
sidebar_label: "WeightedRanker"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "The WeightedRanker class extends from the Function class and provides extra parameters. | Java | v2"
type: docx
token: V9YUdnfxDoc5Gmx80Wec9P6Sn2d
sidebar_position: 7
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - WeightedRanker
  - javaV226
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# WeightedRanker

The **WeightedRanker** class extends from the **Function** class and provides extra parameters.

```java
public class WeightedRanker extends CreateCollectionReq.Function
```

## Request Syntax\{#request-syntax}

```java
WeightedRanker.builder()
    .name(String name)
    .description(String description)
    .functionType(FunctionType functionType)
    .params(Map<String, String> params)
    .weights(List<Float> weights)
    .build()    
```

**BUILDER METHODS:**

- `name(String name)`

    The name of the function. This identifier is used to reference the function within queries and collections.

- `description(String description)`

    A brief description of the function's purpose. This can be useful for documentation or clarity in larger projects and defaults to an empty string.

- `params(Map<String, String> params)`

    A set of key-value pairs that configures the function properties.

- `weights(List<Float> weights)`

    An array of weights corresponding to each search path; each value in the array ranges from `0` to `1`.

**RETURN TYPE:**

*WeightedRanker*

**RETURNS:**

 A weighted ranker instance.

## Examples:\{#examples}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker
import java.util.Collections;

// use the WeightedRanker class
WeightedRanker.builder()
    .weights([0.4, 0.6])
    .build());
    
// Instead, you can use the Function class as well
CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .param("strategy", "weighted")
    .param("params", "{\"weights\": [0.4, 0.6]}")
    .build();
```

