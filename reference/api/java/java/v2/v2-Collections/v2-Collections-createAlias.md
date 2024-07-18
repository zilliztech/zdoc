---
displayed_sidbar: javaSidebar
slug: /java/java/v2-Collections-createAlias
beta: false
notebook: false
type: docx
token: NMAOdxhL1oo0E7xcFqXcF6yPnBg
sidebar_position: 4
displayed_sidebar: javaSidebar

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
    <li><p><code>collection_1</code>'s alias = ["bob"]</p></li>
    <li><p><code>collection_2</code>'s alias = []</p></li>
    </ul>
    <p>After calling the <code>alterAlias</code> function with the parameters <code>collection_2</code> and <code>bob</code>:</p>
    <ul>
    <li><p><code>collection_1</code>'s alias = []</p></li>
    <li><p><code>collection_2</code>'s alias = ["bob"]</p></li>
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
// create a alias "test_alias" for collection "test"
CreateAliasReq createAliasReq = CreateAliasReq.builder()
        .collectionName("test")
        .alias("test_alias")
        .build();
client.createAlias(createAliasReq);
```

