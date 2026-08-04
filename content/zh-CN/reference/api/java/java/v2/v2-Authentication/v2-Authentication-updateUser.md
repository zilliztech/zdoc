---
title: "updateUser() | Java | v2"
slug: /java/java/v2-Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新现有用户的描述，而不更改用户密码。 | Java | v2"
type: docx
token: AAudd8xDRoRfNLx6OpgcsfkpnVb
sidebar_position: 22
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - updateUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updateUser()

此操作会更新现有用户的描述，而不更改用户密码。

```java
public void updateUser(UpdateUserReq request)
```

## 请求语法\{#request-syntax}

```java
client.updateUser(UpdateUserReq.builder()
    .userName(String userName)
    .description(String description)
    .build()
);
```

**构建器方法：**

- `userName(String userName)`

    **[必需]**

    要更新的用户名称。

- `description(String description)`

    用户的新描述。使用空字符串可清除此描述。

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.UpdateUserReq;

client.updateUser(UpdateUserReq.builder()
    .userName("analyst_user")
    .description("Read-only analyst account")
    .build());
```
