---
title: "getFunctions() | Java | v2"
slug: /java/java/v2-FunctionScore-getFunctions
sidebar_label: "getFunctions()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This getter returns the list of functions defined in this FunctionScore object. | Java | v2"
type: docx
token: RsqKdZaMnoHbaRxYr1fcqRbRnth
sidebar_position: 3
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - getFunctions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctions()

This getter returns the list of functions defined in this FunctionScore object.

```java
public List<CreateCollectionReq.Function> getFunctions()
```

**RETURNS:**

*List&lt;CreateCollectionReq.Function&gt;*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .addFunction(func)
    .build();
List<CreateCollectionReq.Function> functions = score.getFunctions();
```
