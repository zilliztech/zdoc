---
title: "selectGrant() | Node.js"
slug: /node/node/Authentication-selectGrant
sidebar_label: "selectGrant()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "此操作会选择授予指定角色在指定对象上的权限。 | Node.js"
type: origin
token: shared-Authentication-selectGrant
displayed_sidebar: nodeSidebar

---

# selectGrant()

此操作会选择授予指定角色在指定对象上的权限。

```javascript
await milvusClient.selectGrant(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.selectGrant({
    roleName: string,
    object: string,
    objectName: string,
    db_name?: string,
    timeout?: number
})
```

**参数：**

- **roleName** （*string*） -

    **[必需]**

    角色名称。

- **object** （*string*） -

    授予权限的对象类型。可选值包括 **Global**、**Collection** 和 **User**。

- **objectName** （*string*） -

    授予该角色指定权限的对象的名称。

- **db_name** （*string*） -

    可选的 Database 名称。

- **timeout** （*number*） -

    可选的 RPC 超时时长，以毫秒为单位。

**返回：**

*Promise&lt;SelectGrantResponse&gt;*

此方法返回一个 Promise，其解析结果为 **SelectGrantResponse** 对象。

```javascript
{
    entities: GrantEntity[],
    status: ResStatus
}
```

**参数：**

- **entities** (**[GrantEntity](./Authentication-GrantEntity)[]**) -

    包含授权 Entity 的列表，这些 Entity 描述授予该角色的权限。

- **ResStatus**

    一个 **ResStatus** 对象。

    - **code** （*number*） -

        表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** （*string* | *number*） -

        表示已发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** （*string*） -

        表示所报告错误原因的原因。如果此操作成功，则该值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.selectGrant({
    roleName: 'my_role',
    object: 'Collection',
    objectName: 'my_collection',
});
```
