---
title: "ModelRanker | Java | v2"
slug: /java/java/v2-Function-ModelRanker
sidebar_label: "ModelRanker"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A ModelRanker instance is a rerank function that uses a language model to compute relevance scores between queries and documents, extending the Function class with extra parameters. | Java | v2"
type: docx
token: ZKj1dLHd2otxtAxRL33cxVZznDb
sidebar_position: 44
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - ModelRanker
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ModelRanker

A ModelRanker instance is a rerank function that uses a language model to compute relevance scores between queries and documents, extending the **Function** class with extra parameters.

```java
public class ModelRanker extends CreateCollectionReq.Function
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `name(String name)`

    The name of the function. This identifier is used to reference the function within queries and collections.

- `description(String description)`

    A brief description of the function's purpose. This can be useful for documentation or clarity in larger projects. It defaults to an empty string.

- `inputFieldNames(List<String> inputFieldNames)`

    The name of the field containing the raw data that requires conversion to vector representation. For functions using `FunctionType.RERANK`, this parameter accepts only one field name.

- `params(Map<String, String> params)`

    A set of key-value pairs that configures the function properties.

- `max_client_batch_size`(int) -

    The maximum number of documents to process in a single batch. Larger values increase throughput but require more memory. The value defaults to `32`.

- `provider(String provider)`

    The name of the reranking model provider. For possible values, refer to Choose a model provider for your needs.

- `queries(List<String> queries)`

    A list of query strings used by the reranking model to calculate relevance scores. The number of query strings must exactly match the number of queries in your search operation (even when using query vectors instead of text). Otherwise, an error will be reported.

- `endpoint(String endpoint)`

    The URL of the model service.

**RETURN TYPE:**

*ModelRanker*

**RETURNS:**

A model ranker instance.

**PARAMETERS:**

- **functionType** (*FunctionType*) -

    The function type of this ranker: always `RERANK`.

- **provider** (*String*) -

    The name of the reranking model provider, for example `tei` or `vllm`.

- **queries** (*List&lt;String&gt;*) -

    The query strings used by the model to compute relevance scores.

- **endpoint** (*String*) -

    The URL of the deployed rerank model service.

## Examples:\{#examples}

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
