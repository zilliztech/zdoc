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
  - 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - describeUser()
  - javaV230
displayed_sidebar: javaSidebar

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

    **[必需]**

    要描述的用户名称。

**返回类型：**

*DescribeUserResp*

**返回：**

**DescribeUserResp** 对象包含以下字段：

**参数：**

- **userName** （*String*） -

    用户的名称。

- **roles** （*List&lt;String&gt;*） -

    授予该用户的角色列表。

- **description** （*String*） -

    用户的描述。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeUserReq;
import io.milvus.v2.service.rbac.response.DescribeUserResp;

DescribeUserResp resp = client.describeUser(DescribeUserReq.builder()
    .userName("analyst_user")
    .build());
System.out.println(resp.getDescription());
```
