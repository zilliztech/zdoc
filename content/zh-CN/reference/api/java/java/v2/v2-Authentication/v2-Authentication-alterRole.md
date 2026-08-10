---
title: "alterRole() | Java | v2"
slug: /java/java/v2-Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新现有角色的描述。 | Java | v2"
type: docx
token: Ufpqdh2gaossHmxZ4CacIO0Hnyc
sidebar_position: 21
keywords: 
  - LLMs
  - 机器学习
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - alterRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterRole()

此操作会更新现有角色的描述。

```java
public void alterRole(AlterRoleReq request)
```

## 请求语法\{#request-syntax}

```java
client.alterRole(AlterRoleReq.builder()
    .roleName(String roleName)
    .description(String description)
    .build()
);
```

**构建器方法：**

- `roleName(String roleName)`

    **[必需]**

    要更新的角色名称。

- `description(String description)`

    角色的新描述。使用空字符串可清除该描述。

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.AlterRoleReq;

client.alterRole(AlterRoleReq.builder()
    .roleName("analytics_reader")
    .description("Grants read-only access to analytics collections")
    .build());
```
