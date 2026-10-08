---
title: "getFunctionList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFunctionList
sidebar_label: "getFunctionList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation returns the list of functions defined in the collection schema. | Java | v2"
type: docx
token: UJg8dnXiUoB6FnxanBicIzcLnsb
sidebar_position: 6
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - getFunctionList()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctionList()

This operation returns the list of functions defined in the collection schema.

```java
public List<CreateCollectionReq.Function> getFunctionList()
```

**RETURN TYPE:**

*List&lt;CreateCollectionReq.Function&gt;*

**RETURNS:**

A list of **CreateCollectionReq.Function** objects. Each **CreateCollectionReq.Function** object contains the following fields:

**PARAMETERS:**

- **name** (*String*) -

    The name of the function. This identifier is used to reference the function within queries and collections. Defaults to an empty string.

- **description** (*String*) -

    A brief description of the function's purpose. Defaults to an empty string.

- **functionType** (*FunctionType*) -

    The type of the function. For example, `FunctionType.BM25` uses the BM25 algorithm to generate sparse embeddings from a `VARCHAR` field.

- **inputFieldNames** (*List&lt;String&gt;*) -

    The names of the fields containing the raw data that requires conversion to vector representation. For functions using `FunctionType.BM25`, this accepts only one field name.

- **outputFieldNames** (*List&lt;String&gt;*) -

    The names of the fields where the generated outputs are stored. This should correspond to a vector field defined in the collection schema. For functions using `FunctionType.BM25`, this accepts only one field name.

- **params** (*Map&lt;String, String&gt;*) -

    Function-specific parameters passed to the server, such as the analyzer parameters of a BM25 function.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.Function> functions = schema.getFunctionList();
```
