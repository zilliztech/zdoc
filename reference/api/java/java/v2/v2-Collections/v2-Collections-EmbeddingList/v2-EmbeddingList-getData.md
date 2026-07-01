---
title: "getData() | Java | v2"
slug: /java/java/v2-EmbeddingList-getData
sidebar_key: java/v2-EmbeddingList-getData
sidebar_label: "getData()"
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This getter returns the raw embedding data contained in this embedding list. | Java | v2"
type: docx
token: KaW0dGLZ9os1SExEsbqcHM4yn8c
sidebar_position: 3
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - getData()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getData()

This getter returns the raw embedding data contained in this embedding list.

```java
public Object getData()
```

**RETURNS:**

*Object*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
EmbeddingList embeddingList = new EmbeddingList();
Object data = embeddingList.getData();
```
