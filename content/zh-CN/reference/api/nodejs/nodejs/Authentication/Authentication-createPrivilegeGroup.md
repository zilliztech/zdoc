---
title: "createPrivilegeGroup() | Node.js"
slug: /node/node/Authentication-createPrivilegeGroup
sidebar_label: "createPrivilegeGroup()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会创建一个新的权限组。 | Node.js"
type: origin
token: shared-Authentication-createPrivilegeGroup
keywords: 
  - 创建权限组
  - 权限组
  - RBAC
  - Zilliz
  - Zilliz Cloud
  - 云
  - createPrivilegeGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createPrivilegeGroup()

此操作会创建一个新的权限组。

```javascript
await milvusClient.createPrivilegeGroup(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.createPrivilegeGroup({
    group_name: string,
    timeout?: number
})
```

**参数：**

- **group_name**（*string*）-

    **[必需]**

    要创建的权限组的名称。

- **timeout**（*number*）-  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code**（*number*）-

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code**（*string* | *number*）-

    表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

- **reason**（*string*）- 

    表示所报告错误的原因。如果此操作成功，则其值为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.createPrivilegeGroup({
  group_name: 'exampleGroup',
});
```
