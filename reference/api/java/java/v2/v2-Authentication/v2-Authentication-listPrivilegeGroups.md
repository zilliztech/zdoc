---
displayed_sidbar: javaSidebar
title: "listPrivilegeGroups() | Java | v2"
slug: /java/java/v2-Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
notebook: false
description: "This operation lists all privilege groups. | Java | v2"
type: docx
token: TGsXduN5OoAjVyxZTvRc8HR2nse
sidebar_position: 13
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listPrivilegeGroups()
  - javaV225
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listPrivilegeGroups()

This operation lists all privilege groups.

```java
public ListPrivilegeGroupsResp listPrivilegeGroups(ListPrivilegeGroupsReq request)
```

## Request Syntax{#request-syntax}

```java
listPrivilegeGroups(ListPrivilegeGroupsReq.builder()
    .build()
)
```

**RETURN TYPE:**

*ListPrivilegeGroupsResp*

**RETURNS:**

A **ListPrivilegeGroupsResp** object contains the following fields:

- **privilegeGroups** (*List\<PrivilegeGroup>*) -

    A list of privilege groups, each of which is a **PrivilegeGroup** object.

    - **groupName** (String) -

        The name of the current privilege group.

    - **privileges** (List\<String>) - 

        The privileges added into the current privilege group.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

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

