---
title: "BoostRanker | Java | v2"
slug: /java/java/v2-Function-BoostRanker
sidebar_label: "BoostRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A BoostRanker instance is a rerank function that boosts the scores of entities matching a filter expression, extending the Function class with extra parameters. | Java | v2"
type: docx
token: Gl75dvp4MoxJRAxNsPYcdtunnFc
sidebar_position: 39
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - BoostRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# BoostRanker

A BoostRanker instance is a rerank function that boosts the scores of entities matching a filter expression, extending the **Function** class with extra parameters.

```java
public class BoostRanker extends CreateCollectionReq.Function
```

## Request Syntax\{#request-syntax}

```java
BoostRanker.builder()
    .name(String name)
    .description(String description)
    .inputFieldNames(List<String> inputFieldNames)
    .params(Map<String, String> params)
    .filter(String filter)
    .weight(Float weight)
    .randomScoreSeed(Long randomScoreSeed)
    .randomScoreField(String randomScoreField)
    .build()
```

**BUILDER METHODS:**

- `name(String name)`

    The name of the function. This identifier is used to reference the function within queries and collections.

- `description(String description)`

    A brief description of the function's purpose. This can be useful for documentation or clarity in larger projects and defaults to an empty string.

- `inputFieldNames(List<String> inputFieldNames)`

    The name of the field containing the raw data that requires conversion to vector representation. For functions using `FunctionType.RERANK`, this parameter accepts only one field name.

- `params(Map<String, String> params)`

    A set of key-value pairs that configures the function properties.

- `filter(String filter)`

    The filter expression that will be used to match entities among search result entities. It can be any valid basic filter expression mentioned in Filtering Explained.

    Only use basic operators, such as `==`, `>`, or `<`. Using advanced operators, such as `text_match` or `phrase_match`, will degrade search performance.

- `weight(Float weight)`

    The weight that will be multiplied by the scores of any matching entities in the raw search results.

    The value should be a floating-point number.

    - To emphasize the importance of matching entities, set it to a value that boosts the scores.

    - To demote matching entities, assign this parameter a value that lowers their scores.

- `randomScoreSeed(Long randomScoreSeed)`

    The random function that works with `randomScoreField(String randomScoreField)` to generate a value between `0` and `1` randomly.

    You should specify an initial value to start a pseudorandom number generator (PRNG).

- `randomScoreField(String randomScoreField)`

    The random function that works with `randomScoreSeed(Long randomScoreSeed)` to generate a value between `0` and `1` randomly.

    You should specify the name of a field whose value will be used as a random factor in generating the random number. A field with unique values will suffice.

**RETURN TYPE:**

*BoostRanker*

**RETURNS:**

A boost ranker instance.

**PARAMETERS:**

- **functionType** (*FunctionType*) -

    The function type of this ranker: always `RERANK`.

- **filter** (*String*) -

    The filter expression that selects the entities to boost.

- **weight** (*Float*) -

    The weight applied to the scores of the boosted entities.

- **randomScoreSeed** (*Long*) -

    The seed used for the random score, when random boosting is enabled.

- **randomScoreField** (*String*) -

    The field used as the basis of the random score.

## Examples:\{#examples}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.ranker.BoostRanker;

// use the BoostRanker class
BoostRanker boost = BoostRanker.builder()
    .name("xxx_boost")
    .description("boost on xxx")
    .filter("xxx == 2")
    .weight(0.5f)
    .randomScoreSeed(123L)
    .randomScoreField("id")
    .build();

// Instead, you can use the Function class as well
CreateCollectionReq.Function boostFn = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.RERANK)
    .name("xxx_boost")
    .description("boost on xxx")
    .param("reranker", "boost")
    .param("filter", "xxx == 2")
    .param("weight", "0.5")
    .param("random_score", "{\"seed\": 123, \"field\": \"id\"}")
    .build();
```
