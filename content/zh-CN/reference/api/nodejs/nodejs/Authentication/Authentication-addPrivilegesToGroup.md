---
title: "addPrivilegesToGroup() | Node.js"
slug: /node/node/Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向 Milvus 中的特定权限组添加权限。 | Node.js"
type: origin
token: shared-Authentication-addPrivilegesToGroup
keywords: 
  - 添加权限
  - 权限组
  - RBAC
  - Zilliz
  - Zilliz Cloud
  - 云
  - addPrivilegesToGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addPrivilegesToGroup()

此操作会向 Milvus 中的特定权限组添加权限。

```javascript
await milvusClient.addPrivilegesToGroup(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addPrivilegesToGroup({
   group_name: string,
   privileges: string[],
   timeout?: number
 })
```

**参数：**

- **group_name**（*string*） -

    **[必需]**

    权限组的名称。

- **privileges**（*string[]*） -

    **[必需]**

    要添加到上述权限组的权限列表。

- **timeout**（*number*） -  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

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

    表示已发生错误的错误码。如果此操作成功，则其值为 **Success**。

- **reason**（*string*） - 

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.addPrivilegesToGroup({
    group_name: 'exampleGroup',
    privileges: ['CreateCollection', 'DropCollection'],
});
```
