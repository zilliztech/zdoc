---
title: "getData() | Java | v2"
slug: /java/java/v2-EmbeddingList-getData
sidebar_label: "getData()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は、この embedding list に含まれる生の embedding データを返します。 | Java | v2"
type: docx
token: KaW0dGLZ9os1SExEsbqcHM4yn8c
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getData()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getData()

この getter は、この embedding list に含まれる生の embedding データを返します。

```java
public Object getData()
```

**戻り値:**

*Object*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
EmbeddingList embeddingList = new EmbeddingList();
Object data = embeddingList.getData();
```
