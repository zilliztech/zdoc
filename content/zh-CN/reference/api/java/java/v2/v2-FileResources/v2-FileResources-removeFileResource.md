---
title: "removeFileResource() | Java | v2"
slug: /java/java/v2-FileResources-removeFileResource
sidebar_label: "removeFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "按名称删除先前上传的文件资源。如果要删除的资源仍被活跃的函数或 Analyzer 引用，则会报错。 | Java | v2"
type: docx
token: I5yTdfJXNoHDICxSwWXcNjwxnoc
sidebar_position: 3
keywords: 
  - 稠密向量
  - Hierarchical Navigable Small Worlds
  - 稠密嵌入
  - Faiss 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - removeFileResource()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# removeFileResource()

按名称删除先前上传的文件资源。如果要删除的资源仍被活跃的函数或 Analyzer 引用，则会报错。

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

    要删除的文件资源名称。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.utility.request.RemoveFileResourceReq;

client.removeFileResource(RemoveFileResourceReq.builder()
    .name("stopwords")
    .build());
```
