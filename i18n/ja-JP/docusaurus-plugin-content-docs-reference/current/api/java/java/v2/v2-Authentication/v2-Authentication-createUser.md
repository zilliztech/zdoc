---
title: "createUser() | Java | v2"
slug: /java/java/v2-Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はユーザーを作成し、必要に応じてそのユーザーの説明を保存します。 | Java | v2"
type: docx
token: DMr4dKSItoNvtYx2XFscQA8RnWf
sidebar_position: 4
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - createUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createUser()

この操作はユーザーを作成し、必要に応じてそのユーザーの説明を保存します。

```java
public void createUser(CreateUserReq request)
```

## Request Syntax\{#request-syntax}

```java
client.createUser(CreateUserReq.builder()
    .userName(String userName)
    .password(String password)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `userName(String userName)`

    **[REQUIRED]**

    作成するユーザーの名前。

- `password(String password)`

    **[REQUIRED]**

    ユーザーのパスワード。

- `description(String description)`

    ユーザーの任意の説明です。デフォルトは空文字列です。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.CreateUserReq;

client.createUser(CreateUserReq.builder()
    .userName("analyst_user")
    .password("P@ssw0rd!")
    .description("Read-only analyst account")
    .build());
```
