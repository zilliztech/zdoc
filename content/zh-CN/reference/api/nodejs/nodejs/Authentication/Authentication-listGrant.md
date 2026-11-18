---
title: "listGrant() | Node.js"
slug: /node/node/Authentication-listGrant
sidebar_label: "listGrant()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出授予指定角色的权限。 | Node.js"
type: docx
token: HSIDdxQGEoPdyaxkMDjcAWGQnpd
sidebar_position: 17
keywords: 
  - 什么是向量 Database
  - 向量 Database 比较
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - cloud
  - listGrant()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listGrant()

此操作会列出授予指定角色的权限。

```javascript
await milvusClient.listGrant(data)
```

## 请求语法\{#request-syntax}

```javascript
 milvusClient.listGrant({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*',
   db_name?: string
 });
```

**参数：**

- **roleName** (*string*)  

    目标角色名称

    将此项设置为不存在的角色名称可能会导致错误。

- **object** (*string*)

    有效权限对象组的名称。可能的值包括 **Global**、**Collection** 和 **User**。

- **objectName** (*string*)

    指定对象组中特定对象的名称。使用通配符（*）表示将授予指定组中的所有权限。

- **db_name** (*string*)

    目标对象所属的 Database 名称。

- **timeout** (*number*) 

    此操作的超时时长。

**返回：**

*Promise&lt;SelectGrantResponse&gt;*

此方法返回一个 promise，该 promise 解析为 **SelectGrantResponse** 对象。

```javascript
{
    "entities": [
        {
            db_name: string,
            grantor: { privilege: { name: string }, user: { name: string } },
            object: { name: string },
            object_name: string,
            role: { name: string }
        }
    ],
    "status": ResStatus
```

**参数：**

- **entities** (*GrantEntity[]*) -

    授权 Entity 列表，其中每个 Entity 的结构如下。

- **status** (*ResStatus*) -

    一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。 

    - **reason** (*string*) - 

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
 milvusClient.listGrant({
   roleName: 'roleName',
   object: 'Collection',
   objectName: '*'
 });
```
