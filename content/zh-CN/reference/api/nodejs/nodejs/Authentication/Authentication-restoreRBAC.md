---
title: "restoreRBAC() | Node.js"
slug: /node/node/Authentication-restoreRBAC
sidebar_label: "restoreRBAC()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从备份中恢复 RBAC 配置。 | Node.js"
type: origin
token: shared-Authentication-restoreRBAC
keywords: 
  - 恢复
  - 恢复 RBAC
  - RBAC
  - Zilliz
  - Zilliz Cloud
  - 云
  - restoreRBAC()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# restoreRBAC()

此操作会从备份中恢复 RBAC 配置。

```javascript
await milvusClient.restoreRBAC(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.restoreRBAC({
    RBAC_meta: RBACMeta,
    timeout?: number
})
```

**参数：**

- **RBAC_meta** (*[RBACMeta](./Authentication-RBACMeta)*) -

    **[必需]**

    要恢复的完整 RBAC 元数据，包括用户、角色、授权和权限组。

- **timeout** (*number*) -  

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

- **code** (*number*) -

    用于指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

- **error_code** (*string* | *number*) -

    用于指示所发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。 

- **reason** (*string*) - 

    用于指示所报告错误的原因。如果此操作成功，则该值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const rbacMeta = {
    users: [],
    roles: [],
    grants: [],
    privilege_groups: []
}

await milvusClient.restoreRBAC({
  RBAC_meta: rbacMeta,
});
```
