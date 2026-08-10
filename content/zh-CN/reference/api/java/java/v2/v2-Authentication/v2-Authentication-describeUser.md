---
title: "describeUser() | Java | v2"
slug: /java/java/v2-Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回分配给用户的角色以及用户描述。 | Java | v2"
type: docx
token: TR9OdLX5PoMZbMx4l2tcWKVmn3b
sidebar_position: 6
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - zilliz cloud
  - 云
  - describeUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeUser()

此操作返回分配给用户的角色以及用户描述。

```java
public DescribeUserResp describeUser(DescribeUserReq request)
```

## 请求语法\{#request-syntax}

```java
DescribeUserResp resp = client.describeUser(DescribeUserReq.builder()
    .userName(String userName)
    .build()
);
```

**构建器方法：**

- `userName(String userName)`

    **[必填]**

    要描述的用户名称。

**返回：**

*DescribeUserResp*

响应包含 `userName`、`roles` 和 `description`。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeUserReq;
import io.milvus.v2.service.rbac.response.DescribeUserResp;

DescribeUserResp resp = client.describeUser(DescribeUserReq.builder()
    .userName("analyst_user")
    .build());
System.out.println(resp.getDescription());
```
