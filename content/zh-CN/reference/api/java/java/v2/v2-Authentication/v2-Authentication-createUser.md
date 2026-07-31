---
title: "createUser() | Java | v2"
slug: /java/java/v2-Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作将创建一个用户，并可选择为该用户存储描述。 | Java | v2"
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

此操作将创建一个用户，并可选择为该用户存储描述。

```java
public void createUser(CreateUserReq request)
```

## 请求语法\{#request-syntax}

```java
client.createUser(CreateUserReq.builder()
    .userName(String userName)
    .password(String password)
    .description(String description)
    .build()
);
```

**构建器方法：**

- `userName(String userName)`

    **[必需]**

    要创建的用户名。

- `password(String password)`

    **[必需]**

    用户的密码。

- `description(String description)`

    用户的可选描述。默认为空字符串。

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.CreateUserReq;

client.createUser(CreateUserReq.builder()
    .userName("analyst_user")
    .password("P@ssw0rd!")
    .description("Read-only analyst account")
    .build());
```
