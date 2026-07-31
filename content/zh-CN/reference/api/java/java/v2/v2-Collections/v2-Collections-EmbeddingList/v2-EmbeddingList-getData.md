---
title: "getData() | Java | v2"
slug: /java/java/v2-EmbeddingList-getData
sidebar_label: "getData()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此 getter 返回此嵌入列表中包含的原始嵌入数据。 | Java | v2"
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

此 getter 返回此嵌入列表中包含的原始嵌入数据。

```java
public Object getData()
```

**返回：**

*Object*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
EmbeddingList embeddingList = new EmbeddingList();
Object data = embeddingList.getData();
```
