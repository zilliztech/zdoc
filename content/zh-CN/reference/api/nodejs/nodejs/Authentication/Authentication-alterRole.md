---
title: "alterRole() | Node.js"
slug: /node/node/Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更改现有角色的描述。 | Node.js"
type: docx
token: Fvw0dyRalo2ceVxdY4Fcf9uTnBg
sidebar_position: 30
keywords: 
  - 更改角色
  - 角色
  - RBAC
  - Zilliz
  - Zilliz Cloud
  - 云
  - alterRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterRole()

此操作会更新现有角色的描述。

```javascript
await milvusClient.alterRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterRole({
    roleName: string,
    description: string,
    timeout?: number
})
```

**参数：**

- **roleName**（*string*） -

    **[必需]**

    要更改的角色名称。

- **description**（*string*） -

    **[必需]**

    角色的新描述。

- **timeout**（*number*） -

    此操作的超时时间，单位为毫秒。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 promise，解析为 **ResStatus** 对象。

**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.alterRole({
    roleName: 'my_role',
    description: 'Role updated description',
});
```
