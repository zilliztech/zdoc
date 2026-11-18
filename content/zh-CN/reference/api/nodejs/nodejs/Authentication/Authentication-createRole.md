---
title: "createRole() | Node.js"
slug: /node/node/Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个自定义角色。 | Node.js"
type: docx
token: SDoYdccLWo1W3PxkNFncibwDnch
sidebar_position: 6
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - Zilliz
  - Zilliz Cloud
  - 云
  - createRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createRole()

此操作会创建一个自定义角色。

```javascript
await milvusClient.createRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.createRole({
   roleName: string,
   description?: string,
   timeout?: number
 })
```

**参数：**

- **roleName**（*string*）-

    **[必需]**

    要创建的角色名称。

- **description**（*string*）-

    要创建的角色描述。

- **timeout**（*number*）-

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

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

    表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.createRole({
   roleName: 'exampleRole',
 })
```
