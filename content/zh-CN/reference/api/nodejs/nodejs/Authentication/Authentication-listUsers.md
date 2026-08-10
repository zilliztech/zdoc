---
title: "listUsers() | Node.js"
slug: /node/node/Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出当前可用的用户。 | Node.js"
type: docx
token: Z0EOd1PXooNeowx4SQgcq3synBc
sidebar_position: 21
keywords: 
  - llm 幻觉
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - zilliz
  - zilliz cloud
  - 云
  - listUsers()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listUsers()

此操作列出当前可用的用户。

```javascript
await milvusClient.listUsers(data)
```

## 请求语法\{#request-syntax}

```javascript
milvusClient.listUsers()
```

**参数：**

- **timeout** (*number*)  

    此操作的超时时长。

    将此项设置为 **None** 表示，当收到任何响应或发生任何错误时，此操作即超时。

**返回** *Promise&lt;ListCredUsersResponse&gt;*

此方法返回一个 promise，解析为 **ListCredUsersResponse** 对象。

```typescript
{
    usernames: string[],
    status:  ResStatus
}
```

**参数：**

- **usernames** (*string[]*) -<br/>
  当前 Milvus 实例中存在的用户名列表。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则该值保持为空字符串。

## 示例\{#example}

```java
milvusClient.listUsers()
```

