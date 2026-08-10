---
title: "createRole() | Java | v2"
slug: /java/java/v2-Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个角色，并可选择为该角色存储描述。 | Java | v2"
type: docx
token: IzfldHDU4o8dDRx377ecqJmlnSf
sidebar_position: 3
keywords: 
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - 视频去重
  - zilliz
  - zilliz cloud
  - 云
  - createRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createRole()

此操作会创建一个角色，并可选择为该角色存储描述。

```java
public void createRole(CreateRoleReq request)
```

## 请求语法\{#request-syntax}

```java
client.createRole(CreateRoleReq.builder()
    .roleName(String roleName)
    .description(String description)
    .build()
);
```

**构建器方法：**

- `roleName(String roleName)`

    **[必需]**

    要创建的角色名称。

- `description(String description)`

    角色的可选描述。默认为空字符串。

**返回值：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.CreateRoleReq;

client.createRole(CreateRoleReq.builder()
    .roleName("analytics_reader")
    .description("Grants read-only access to analytics collections")
    .build());
```
