---
title: "createAlias() | Java | v2"
slug: /java/java/v2-Collections-createAlias
sidebar_label: "createAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an alias for an existing collection. | Java | v2"
type: docx
token: NMAOdxhL1oo0E7xcFqXcF6yPnBg
sidebar_position: 6
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - createAlias()
  - javaV225
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createAlias()

This operation creates an alias for an existing collection.

```java
public void createAlias(CreateAliasReq request)
```

## Request Syntax{#request-syntax}

```java
createAlias(CreateAliasReq.builder()
    .alias(String alias)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `alias(String alias)`

    The alias of the collection. Before this operation, ensure that the alias does not already exist. If it does, exceptions will occur.

    <Admonition type="info" icon="📘" title="What is a collection alias?">

    <p>A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. </p>
    <p>On Zilliz Cloud, a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.</p>
    <p>Below is an example of reassigning the alias of one collection to another:</p>
    <p>Suppose there are two collections: <code>collection_1</code> and <code>collection_2</code>. There is also a collection alias named <code>bob</code>, which was originally assigned to <code>collection_1</code>:</p>
    <ul>
    <li><p><code>collection_1</code>'s alias = &#91;"bob"&#93;</p></li>
    <li><p><code>collection_2</code>'s alias = &#91;&#93;</p></li>
    </ul>
    <p>After calling the <code>alterAlias</code> function with the parameters <code>collection_2</code> and <code>bob</code>:</p>
    <ul>
    <li><p><code>collection_1</code>'s alias = &#91;&#93;</p></li>
    <li><p><code>collection_2</code>'s alias = &#91;"bob"&#93;</p></li>
    </ul>

    </Admonition>

- `collectionName(String collectionName)`

    The name of the collection to create an alias for.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CreateAliasReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create an alias "test_alias" for collection "test"
CreateAliasReq createAliasReq = CreateAliasReq.builder()
        .collectionName("test")
        .alias("test_alias")
        .build();
client.createAlias(createAliasReq);
```

