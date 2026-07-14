---
title: "addFileResource() | Java | v2"
slug: /java/java/v2-FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "ローカルファイルを名前付きリソースとしてアップロードし、他の Milvus 操作（例: functions、analyzers）から参照できるようにします。名前はデータベースごとに一意で、同じ名前を再利用すると既存のリソースが上書きされます。 | Java | v2"
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

ローカルファイルを名前付きリソースとしてアップロードし、他の Milvus 操作（例: functions、analyzers）から参照できるようにします。名前はデータベースごとに一意で、同じ名前を再利用すると既存のリソースが上書きされます。

```java
public void addFileResource(AddFileResourceReq request)
```

## リクエスト構文\{#request-syntax}

```java
addFileResource(AddFileResourceReq.builder()
    .name(String name)
    .path(String path)
    .build()
);
```

**BUILDER メソッド:**

- `name(String name)` -

    **[REQUIRED]**

    ファイルリソースの一意の名前。

- `path(String path)` -

    **[REQUIRED]**

    アップロードするファイルのローカルファイルシステム上のパス。

**戻り値:**

*void*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#example}

```java
import io.milvus.v2.service.utility.request.AddFileResourceReq;

client.addFileResource(AddFileResourceReq.builder()
    .name("stopwords")
    .path("/data/stopwords-en.txt")
    .build());
```
