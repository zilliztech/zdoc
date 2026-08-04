---
title: "removeFileResource() | Java | v2"
slug: /java/java/v2-FileResources-removeFileResource
sidebar_label: "removeFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "按名称移除先前上传的文件资源。移除仍被活动函数或分析器引用的资源将因错误而失败。 | Java | v2"
type: docx
token: I5yTdfJXNoHDICxSwWXcNjwxnoc
sidebar_position: 3
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - removeFileResource()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# removeFileResource()

按名称移除先前上传的文件资源。移除仍被活动函数或分析器引用的资源将因错误而失败。

```java
public void removeFileResource(RemoveFileResourceReq request)
```

## 请求语法\{#request-syntax}

```java
removeFileResource(RemoveFileResourceReq.builder()
    .name(String name)
    .build()
);
```

**构建器方法：**

- `name(String name)` -

    **[必需]**

    要移除的文件资源名称。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.utility.request.RemoveFileResourceReq;

client.removeFileResource(RemoveFileResourceReq.builder()
    .name("stopwords")
    .build());
```
