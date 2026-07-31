---
title: "listPrivilegeGroups() | Java | v2"
slug: /java/java/v2-Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有权限组。 | Java | v2"
type: docx
token: TGsXduN5OoAjVyxZTvRc8HR2nse
sidebar_position: 13
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - listPrivilegeGroups()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listPrivilegeGroups()

此操作列出所有权限组。

```java
public ListPrivilegeGroupsResp listPrivilegeGroups(ListPrivilegeGroupsReq request)
```

## 请求语法\{#request-syntax}

```java
listPrivilegeGroups(ListPrivilegeGroupsReq.builder()
    .build()
)
```

**返回类型：**

*ListPrivilegeGroupsResp*

**返回：**

**ListPrivilegeGroupsResp** 对象包含以下字段：

- **privilegeGroups** (*List&lt;PrivilegeGroup&gt;*) -

    权限组列表，其中每一项都是一个 **PrivilegeGroup** 对象。

    - **groupName** (String) -

        当前权限组的名称。

    - **privileges** (List&lt;String&gt;) - 

        添加到当前权限组中的权限。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.PrivilegeGroup;
import io.milvus.v2.service.rbac.request.ListPrivilegeGroupsReq;
import io.milvus.v2.service.rbac.response.ListPrivilegeGroupsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List privilege groups
ListPrivilegeGroupsReq listPrivilegeGroupsReq = ListPrivilegeGroupsReq.builder()
        .build();
        
ListPrivilegeGroupsResp resp = client.listPrivilegeGroups(listPrivilegeGroupsReq);
List<PrivilegeGroup> groups = resp.getPrivilegeGroups();
for (PrivilegeGroup group : groups) {
    System.out.println(group.getGroupName() + group.getPrivileges());
}
```

