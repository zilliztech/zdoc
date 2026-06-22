---
title: "getParams() | Java | v2"
slug: /java/java/v2-FunctionScore-getParams
sidebar_key: java/v2-FunctionScore-getParams
sidebar_label: "getParams()"
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This getter returns the parameters map of this FunctionScore object. | Java | v2"
type: docx
token: DUJsdflImor0joxV14ecSwpnnDb
sidebar_position: 4
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - getParams()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getParams()

This getter returns the parameters map of this FunctionScore object.

```java
public Map<String, String> getParams()
```

**RETURNS:**

*Map&lt;String, String&gt;*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .params(Map.of("weight", "0.8"))
    .build();
Map<String, String> params = score.getParams();
```
