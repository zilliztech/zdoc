---
title: "grantRole() | Node.js"
slug: /node/node/Authentication-grantRole
sidebar_label: "grantRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向用户授予角色。 | Node.js"
type: docx
token: LPJsdEnvwo6apcxjhZgc3rpDnuc
sidebar_position: 16
keywords: 
  - 嵌入模型
  - 图像相似性搜索
  - 上下文窗口
  - 自然语言搜索
  - zilliz
  - zilliz cloud
  - 云
  - grantRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# grantRole()

此操作会向用户授予角色。

```javascript
await milvusClient.grantRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.grantRole({
   username: string,
   roleName: string,
   timeout?: number
 })
```

**参数：**

- **username**（*string*） -

    **[必需]**

    现有用户的名称。

- **roleName**（*string*） -

    **[必需]**

    要分配的角色名称。

- **timeout** (number)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 promise，该 promise 会解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.grantRole({
   username: 'my',
   roleName: 'myrole'
 })
```
