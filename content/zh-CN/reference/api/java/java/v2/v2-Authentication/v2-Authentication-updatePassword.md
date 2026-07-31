---
title: "updatePassword() | Java | v2"
slug: /java/java/v2-Authentication-updatePassword
sidebar_label: "updatePassword()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新用户密码，也可以更新用户描述。 | Java | v2"
type: docx
token: AnuCd3jgDojhA8x2kNFcddCynLh
sidebar_position: 20
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - updatePassword()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updatePassword()

此操作会更新用户密码，也可以更新用户描述。

```java
public void updatePassword(UpdatePasswordReq request)
```

## 请求语法\{#request-syntax}

```java
client.updatePassword(UpdatePasswordReq.builder()
    .userName(String userName)
    .password(String password)
    .newPassword(String newPassword)
    .resetConnection(Boolean resetConnection)
    .description(String description)
    .build()
);
```

**构建器方法：**

- `userName(String userName)`

    **[必填]**

    要更新的用户名称。

- `password(String password)`

    用户的当前密码。更改密码时，请将此参数与 `newPassword` 一起提供。

- `newPassword(String newPassword)`

    用户的新密码。更改密码时，请将此参数与 `password` 一起提供。

- `resetConnection(Boolean resetConnection)`

    密码更新后是否重置当前客户端连接。默认为 `false`。

- `description(String description)`

    用户的可选新描述。默认为空字符串。

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.UpdatePasswordReq;

client.updatePassword(UpdatePasswordReq.builder()
    .userName("analyst_user")
    .password("P@ssw0rd!")
    .newPassword("N3wP@ssw0rd!")
    .resetConnection(true)
    .description("Read-only analyst account")
    .build());
```
