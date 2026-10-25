---
title: "addFileResource() | Java | v2"
slug: /java/java/v2-FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ローカルファイルを名前付きリソースとしてアップロードし、他の Milvus 操作（関数、アナライザーなど）から参照できるようにします。名前はデータベースごとに一意です。同じ名前を再利用すると、既存のリソースが上書きされます。 | Java | v2"
type: docx
token: H0kadFay8oD1d0xserJcuL8wnhf
sidebar_position: 1
keywords: 
  - レキシカル検索
  - 最近傍検索
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - addFileResource()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addFileResource()

この操作は、ローカルファイルを名前付きリソースとしてアップロードし、他の Milvus 操作（関数、アナライザーなど）から参照できるようにします。名前はデータベースごとに一意です。同じ名前を再利用すると、既存のリソースが上書きされます。

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

**ビルダーメソッド：**

- `name(String name)` -

    **[必須]**

    ファイルリソースの一意の名前です。

- `path(String path)` -

    **[必須]**

    アップロードするファイルのローカルファイルシステム上のパスです。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.utility.request.AddFileResourceReq;

client.addFileResource(AddFileResourceReq.builder()
    .name("stopwords")
    .path("/data/stopwords-en.txt")
    .build());
```
