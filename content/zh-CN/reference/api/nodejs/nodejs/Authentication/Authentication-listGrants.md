---
title: "listGrants() | Node.js"
slug: /node/node/Authentication-listGrants
sidebar_label: "listGrants()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出授予指定角色的权限。 | Node.js"
type: docx
token: CJ9DdmU1ooquOnxcK5AciA3sn3g
sidebar_position: 18
keywords: 
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - zilliz
  - zilliz cloud
  - 云
  - listGrants()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listGrants()

此操作会列出授予指定角色的权限。

```javascript
await milvusClient.listGrants(data)
```

## 请求语法\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
   db_name?: string,
   timeout?: number,
 });
```

**参数：**

- **roleName** （*string*）  

    目标角色名称。

    如果将其设置为不存在的角色名称，可能会导致错误。

- **db_name** （*string*）  

    目标角色所属的 Database 名称。

- **timeout** （*number*） -

    此操作的超时时长。将其设置为 **None** 表示，当收到任意响应或发生任意错误时，此操作即超时。

**返回：**

*Promise&lt;SelectGrantResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **SelectGrantResponse** 对象。

```javascript
{
    entities: GrantEntity[],
    status:  ResStatus
}
```

**参数：**

- **entities** （*[GrantEntity](./Authentication-GrantEntity)[]*） -

附加到所请求角色的授权列表。每个条目都将一项权限与目标对象以及授予该权限的主体配对。有关 **GrantEntity** 字段的完整参考，请参见 `describeRole()` 文档。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** （*number*） -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** （*string* | *number*） -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** （*string*） -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```
