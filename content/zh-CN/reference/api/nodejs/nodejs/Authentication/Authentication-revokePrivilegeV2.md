---
title: "revokePrivilegeV2() | Node.js"
slug: /node/node/Authentication-revokePrivilegeV2
sidebar_label: "revokePrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会撤销已分配给某个角色的权限。 | Node.js"
type: docx
token: UlAUdLNkCo1Mp8xFZYWclSL9n6b
sidebar_position: 26
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - revokePrivilegeV2()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# revokePrivilegeV2()

此操作会撤销已分配给某个角色的权限。

```javascript
await milvusClient.revokePrivilegeV2(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.revokePrivilege({
   role: string,
   privilege: string,
   db_name: string,
   collection_name: string,
   timeout?: number
 })
```

**参数：**

- **role** (*string*) -

    **[必需]**

    要从中撤销指定权限的角色名称。

- **privilege** (*string*) -

    **[必需]**

    要分配的权限或权限组名称。 

    详情请参见[Users and Roles](https://milvus.io/docs/users_and_roles.md)。

- **db_name** (*string*) -

    **[必需]**

    此操作的目标数据库名称。 

- **collection_name** (*string*) -

    **[必需]**

    此操作的目标集合名称。 

- **timeout** (*float* | *None*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
await milvusClient.revokePrivilegeV2({
    role: 'exampleRole',
    privilege: 'CreateCollection',
    db_name: 'exampleDB',
    collection_name: 'exampleCollection',
});
```

