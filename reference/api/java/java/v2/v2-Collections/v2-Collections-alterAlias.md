---
title: "alterAlias() | Java | v2"
slug: /java/java/v2-Collections-alterAlias
sidebar_key: java/v2-Collections-alterAlias
sidebar_label: "alterAlias()"
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
beta: false
notebook: false
description: "This operation reassigns the alias of one collection to another. | Java | v2"
type: docx
token: Fv8EdYIt4oThstxgpzqcm7C0nug
sidebar_position: 1
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - alterAlias()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterAlias()

This operation reassigns the alias of one collection to another.

```java
public void alterAlias(AlterAliasReq request)
```

## Request Syntax\{#request-syntax}

```java
alterAlias(AlterAliasReq.builder()
    .alias(String alias)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `alias(String alias)`

    The alias of the collection. Note that the alias should exist beforehand.

    <Admonition type="info" icon="📘" title="What is a collection alias?">

    A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. 

    On Zilliz Cloud, a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.

    Below is an example of reassigning the alias of one collection to another:

    Suppose there are two collections: `collection_1` and `collection_2`. There is also a collection alias named `bob`, which was originally assigned to `collection_1`:

    - `collection_1`'s alias = ["bob"]

    - `collection_2`'s alias = []

    After calling the `alterAlias` function with the parameters `collection_2` and `bob`:

    - `collection_1`'s alias = []

    - `collection_2`'s alias = ["bob"]

    </Admonition>

- `collectionName(String collectionName)`

    The name of the target collection to reassign an alias to.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.AlterAliasReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the alias for collection "test"
AlterAliasReq alterAliasReq = AlterAliasReq.builder()
        .collectionName("test")
        .alias("test_alias2")
        .build();
client.alterAlias(alterAliasReq);
```

