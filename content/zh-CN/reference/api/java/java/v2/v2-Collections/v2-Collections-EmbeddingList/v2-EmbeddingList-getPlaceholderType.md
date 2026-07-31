---
title: "getPlaceholderType() | Java | v2"
slug: /java/java/v2-EmbeddingList-getPlaceholderType
sidebar_label: "getPlaceholderType()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此 getter 返回 embedding 列表的占位符类型，用于指示向量数据格式。 | Java | v2"
type: docx
token: D0UGdkudVo5vtLxlZw3c6cdqnmc
sidebar_position: 4
keywords: 
  - 托管向量数据库
  - Pinecone 向量数据库
  - 音频搜索
  - 什么是语义搜索
  - zilliz
  - zilliz cloud
  - 云
  - getPlaceholderType()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPlaceholderType()

此 getter 返回 embedding 列表的占位符类型，用于指示向量数据格式。

```java
public PlaceholderType getPlaceholderType()
```

**返回：**

*PlaceholderType*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
EmbeddingList embeddingList = new EmbeddingList();
PlaceholderType type = embeddingList.getPlaceholderType();
```
