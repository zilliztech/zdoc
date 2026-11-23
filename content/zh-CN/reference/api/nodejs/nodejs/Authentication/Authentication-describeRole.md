---
title: "describeRole() | Node.js"
slug: /node/node/Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作描述特定角色。 | Node.js"
type: docx
token: ItZPd1o4uoodqtx1sxIcq38hn7e
sidebar_position: 9
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - 多模态向量 Database 检索
  - zilliz
  - zilliz cloud
  - 云
  - describeRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# describeRole()

此操作描述特定角色。

```javascript
await milvusClient.describeRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.describeRole({
    includeUserInfo?: boolean,
    roleName: string,
    timeout?: number
})
```

**参数：**

- **roleName** (*string*) -

    **[必需]**

    要描述的角色名称。

- **includeUserInfo** (*boolean*) -

    一个布尔值，指示是否包含用户信息。

- **timeout** (*number*)  

    此操作的超时时长。 

    将此项设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值：**

*Promise&lt;SelectRoleResponse&gt;*

此方法返回一个 promise，解析为 **SelectRoleResponse** 对象。

```javascript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**参数：**

- **results** (*RoleResult[]*) -
**RoleResult** 对象的列表。对于 `describeRole()`，此列表包含一个描述所请求角色的条目。

    - **role** (*[RoleEntity](./Authentication-RoleEntity)*) -

        描述该角色的 **RoleEntity** 对象。

    - **users** (*[User](./Authentication-User)[]*) -

        拥有此角色的用户列表。

    - **entities** (*[GrantEntity](./Authentication-GrantEntity)[]*) -

        附加到此角色的授权列表。每个条目都包含被授予的权限、目标对象以及授予该权限的用户。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作发生任何错误时都会引发此异常。

## 示例\{#example}

```javascript
milvusClient.describeRole({roleName: 'myrole'});
```

