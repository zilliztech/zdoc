---
title: "listPrivilegeGroups() | Node.js"
slug: /node/node/Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出所有权限组。 | Node.js"
type: docx
token: HGpSdc7AOo7AV3xKCmOcWaIEnrd
sidebar_position: 19
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - listPrivilegeGroups()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPrivilegeGroups()

此操作列出所有权限组。

```javascript
await milvusClient.listPrivilegeGroups(data?)
```

## 请求语法\{#request-syntax}

```javascript
 milvusClient.listPrivilegeGroups({
   timeout?: number
 })
```

**参数：**

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回值** *Promise&lt;ListPrivilegeGroupsResponse&gt;*

此方法返回一个 Promise，该 Promise 解析为 **ListPrivilegeGroupsResponse** 对象。

```typescript
{
    privilege_groups: PrivelegeGroup[],
    status:  ResStatus
}
```

**参数：**

- **privilege_groups** (*PrivelegeGroup[]*) -<br/>
  当前 Milvus 实例中定义的权限组列表。

    - **group_name** (*string*) -

        权限组的名称。

    - **privileges** (*PrivilegeEntity[]*) -

        组中包含的权限。

        - **name** (*string*) -

        权限名称（例如 **Insert**、**Search**、**CreateCollection**）。

        - **name** (*string*) -

            权限名称（例如 **Insert**、**Search**、**CreateCollection**）。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
await milvusClient.listPrivilegeGroups();
```

