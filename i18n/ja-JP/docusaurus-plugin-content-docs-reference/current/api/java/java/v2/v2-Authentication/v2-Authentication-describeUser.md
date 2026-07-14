---
title: "describeUser() | Java | v2"
slug: /java/java/v2-Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ユーザーに割り当てられたロールとユーザーの説明を返します。 | Java | v2"
type: docx
token: TR9OdLX5PoMZbMx4l2tcWKVmn3b
sidebar_position: 6
keywords: 
  - AI chatbots
  - cosine distance
  - vector database とは
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - describeUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeUser()

この操作は、ユーザーに割り当てられたロールとユーザーの説明を返します。

```java
public DescribeUserResp describeUser(DescribeUserReq request)
```

## リクエスト構文\{#request-syntax}

```java
DescribeUserResp resp = client.describeUser(DescribeUserReq.builder()
    .userName(String userName)
    .build()
);
```

**BUILDER メソッド:**

- `userName(String userName)`

    **[REQUIRED]**

    説明を取得するユーザーの名前。

**戻り値:**

*DescribeUserResp*

レスポンスには、`userName`、`roles`、`description` が含まれます。

**例外:**

- **MilvusClientException**

    この操作中にエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeUserReq;
import io.milvus.v2.service.rbac.response.DescribeUserResp;

DescribeUserResp resp = client.describeUser(DescribeUserReq.builder()
    .userName("analyst_user")
    .build());
System.out.println(resp.getDescription());
```
