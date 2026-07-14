---
title: "dropUser() | Java | v2"
slug: /java/java/v2-Authentication-dropUser
sidebar_label: "dropUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーを削除します。 | Java | v2"
type: docx
token: RFv2dtZ1qoP9XQxJEGqcgLGUnhc
sidebar_position: 9
keywords: 
  - vector database はどのように動作するか
  - vector db 比較
  - openai vector db
  - 自然言語処理 database
  - zilliz
  - zilliz cloud
  - cloud
  - dropUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropUser()

この操作はユーザーを削除します。

```java
public void dropUser(DropUserReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropUser(DropUserReq.builder()
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `userName(String userName)`

    削除するユーザーの名前。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropUserReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a user
DropUserReq dropUserReq = DropUserReq.builder()
        .userName("test")
        .build();
client.dropUser(dropUserReq);
```
