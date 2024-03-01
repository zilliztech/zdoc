---
displayed_sidbar: javaSidebar
slug: /java/Collections-createAlias
beta: false
notebook: false
type: docx
token: VU1odD6KIoV6kWxTJHScVhDRnkb
sidebar_position: 4
---

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

__BUILDER METHODS:__

- `alias(String alias)`

    The alias of the collection. Before this operation, ensure that the alias does not already exist. If it does, exceptions will occur.

    <div class="admonition note">

    <p><b>what is a collection alias?</b></p>

    <p>A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. </p>
    <p>In Milvus, a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.</p>
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

    </div>

- `collectionName(String collectionName)`

    The name of the collection to create an alias for.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateAliasReq createAliasReq = CreateAliasReq._builder_()
        .collectionName("test")
        .alias("test_alias")
        .build();
client.createAlias(createAliasReq);
```

