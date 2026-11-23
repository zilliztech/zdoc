---
title: "backupRBAC() | Node.js"
slug: /node/node/Authentication-backupRBAC
sidebar_label: "backupRBAC()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会备份当前 RBAC 配置。 | Node.js"
type: origin
token: shared-Authentication-backupRBAC
keywords: 
  - 备份
  - RBAC 备份
  - RBAC
  - Zilliz
  - Zilliz Cloud
  - 云
  - backupRBAC()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# backupRBAC()

此操作会备份当前 RBAC 配置。

```javascript
await milvusClient.backupRBAC(data?)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.backupRBAC({
   timeout?: number
 })
```

**参数：**

- **timeout** (*number*) -  

    此操作的超时持续时间。 

    将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

**返回：**

*Promise&lt;BackupRBACResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **BackupRBACResponse** 对象。

```javascript
{
    RBAC_meta: RBACMeta,
    status:  ResStatus
}
```

**参数：**

- **RBAC_meta** (*[RBACMeta](./Authentication-RBACMeta)*) -

当前 Milvus 实例中所有 RBAC 元数据的快照。将此值传递给 `restoreRBAC()`，以便在另一个实例中重新创建相同的用户、角色、授权和权限组。有关字段参考，请参见 [RBACMeta](./Authentication-RBACMeta)。

- **ResStatus**

一个 **ResStatus** 对象。

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
milvusClient.backupRBAC();
```
