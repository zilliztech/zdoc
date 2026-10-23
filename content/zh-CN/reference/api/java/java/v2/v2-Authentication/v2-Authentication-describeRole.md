---
title: "describeRole() | Java | v2"
slug: /java/java/v2-Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回授予角色的权限以及角色说明。 | Java | v2"
type: docx
token: ZmeDd4zoPo7EynxnyGOckvzvnsh
sidebar_position: 5
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI 智能体
  - 语义搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - describeRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeRole()

此操作返回授予角色的权限以及角色说明。

```java
public DescribeRoleResp describeRole(DescribeRoleReq request)
```

## 请求语法\{#request-syntax}

```java
DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName(String roleName)
    .build()
);
```

**构建器方法：**

- `roleName(String roleName)`

    **[必需]**

    要描述的角色的名称。

- `dbName(String dbName)`

    该角色适用的 Database 的名称。省略时默认为当前 Database。

**返回类型：**

*DescribeRoleResp*

**返回：**

一个 **DescribeRoleResp** 对象，包含以下字段：

**参数：**

- **roleName**（*String*）-

    角色的名称。

- **grantInfos**（*List&lt;GrantInfo&gt;*）-

    授予该角色的权限列表，其中每一项都是一个 **GrantInfo** 对象，包含以下字段：

    - **objectType**（*String*）-

        权限适用的对象的类型。

    - **objectName**（*String*）-

        权限适用的对象的名称。

    - **roleName**（*String*）-

        被授予该权限的角色的名称。

    - **grantor**（*String*）-

        授予该权限的用户的名称。

    - **privilege**（*String*）-

        授予的权限。

    - **dbName**（*String*）-

        授予该权限的 Database 的名称。

- **description**（*String*）-

    角色的说明。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeRoleReq;
import io.milvus.v2.service.rbac.response.DescribeRoleResp;

DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName("analytics_reader")
    .build());
System.out.println(resp.getDescription());
```
