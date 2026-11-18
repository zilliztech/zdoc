---
title: "listRoles() | Node.js"
slug: /node/node/Authentication-listRoles
sidebar_label: "listRoles()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出所有自定义角色。 | Node.js"
type: docx
token: GIeMdvjlMoLwGrxUOu3cFw7bnWc
sidebar_position: 20
keywords: 
  - IVF
  - knn
  - 图片搜索
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - listRoles()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listRoles()

此操作列出所有自定义角色。

```javascript
await milvusClient.listRoles(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listRoles(
    includeUserInfo?: boolean,
    timeout?: number
)
```

**参数：**

- **includeUserInfo** (*boolean*) -

    一个布尔值，用于指示是否包含用户信息。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回：**

*Promise&lt;SelectRoleResponse&gt;*

此方法返回一个 promise，解析为 **SelectRoleResponse** 对象。

```javascript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**参数：**

- **results** (*RoleResult[]*) -
**RoleResult** 对象列表，当前 Milvus 实例中定义的每个角色对应一个对象。有关 **RoleResult** 的完整字段参考，请参阅 `describeRole()` 文档。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    当此操作期间发生任何错误时，会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listRoles({ includeUserInfo: true });
```
