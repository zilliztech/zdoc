---
displayed_sidbar: javaSidebar
slug: /java/Management-loadCollection
beta: false
notebook: false
type: docx
token: G9QJdgzrVoGLqwxxHo6cgzwfnEh
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# loadCollection()

This operation loads the data of a specific collection into memory.

```java
public void loadCollection(LoadCollectionReq request)
```

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is required only if the target collection is not loaded. A collection is in the <strong>NotLoad</strong> state only if you have released the collection or you have created the collection without any index parameters.</p>

</Admonition>

## Request Syntax{#request-syntax}

```java
loadCollection(LoadCollectionReq.builder()
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

__BUILDER METHODS:__

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionNames(List<String> partitionNames)`

    A list of partition names to load.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
LoadCollectionReq loadCollectionReq = LoadCollectionReq._builder_()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);
```

