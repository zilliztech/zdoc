---
title: "createUser() | Node.js"
slug: /node/node/Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个用户。 | Node.js"
type: docx
token: JNZxdKEX3ohBl2xud7Wckhq7nVh
sidebar_position: 7
keywords: 
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - createUser()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createUser()

此操作会创建一个用户。

```javascript
await milvusClient.createUser(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.createUser({
   username: string,
   password: string,
   description?: string,
   timeout?: number
 })
```

**参数：**

- **username**（*string*）-

    **[必需]**

    要创建的用户名。

- **password**（*string*）-

    **[必需]**

    要创建的用户密码。

- **description**（*string*）-

    要创建用户的描述。

- **timeout**（*number*）  -

    此操作的超时持续时间。

    将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

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

- **code**（*number*） -

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code**（*string* | *number*） -

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

- **reason**（*string*） -

    用于说明所报告错误的原因。如果此操作成功，该值为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.createUser({
   username: 'exampleUser',
   password: 'examplePassword',
 })
```
