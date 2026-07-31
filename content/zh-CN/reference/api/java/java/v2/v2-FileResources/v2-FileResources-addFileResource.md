---
title: "addFileResource() | Java | v2"
slug: /java/java/v2-FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "将本地文件上传为具名资源，以便其他 Milvus 操作（例如函数、分析器）引用。名称在每个数据库内必须唯一——重复使用同一名称会覆盖现有资源。 | Java | v2"
type: docx
token: H0kadFay8oD1d0xserJcuL8wnhf
sidebar_position: 1
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - addFileResource()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFileResource()

将本地文件上传为具名资源，以便其他 Milvus 操作（例如函数、分析器）引用。名称在每个数据库内必须唯一——重复使用同一名称会覆盖现有资源。

```java
public void addFileResource(AddFileResourceReq request)
```

## 请求语法\{#request-syntax}

```java
addFileResource(AddFileResourceReq.builder()
    .name(String name)
    .path(String path)
    .build()
);
```

**构建器方法：**

- `name(String name)` -

    **[必填]**

    文件资源的唯一名称。

- `path(String path)` -

    **[必填]**

    要上传文件的本地文件系统路径。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.utility.request.AddFileResourceReq;

client.addFileResource(AddFileResourceReq.builder()
    .name("stopwords")
    .path("/data/stopwords-en.txt")
    .build());
```
