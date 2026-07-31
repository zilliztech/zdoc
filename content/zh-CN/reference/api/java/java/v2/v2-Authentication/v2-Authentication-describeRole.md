---
title: "describeRole() | Java | v2"
slug: /java/java/v2-Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回授予某个角色的权限以及角色描述。 | Java | v2"
type: docx
token: ZmeDd4zoPo7EynxnyGOckvzvnsh
sidebar_position: 5
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - describeRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeRole()

此操作返回授予某个角色的权限以及角色描述。

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

    要描述的角色名称。

**返回：**

*DescribeRoleResp*

响应包含 `roleName`、`grantInfos` 和 `description`。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeRoleReq;
import io.milvus.v2.service.rbac.response.DescribeRoleResp;

DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName("analytics_reader")
    .build());
System.out.println(resp.getDescription());
```
