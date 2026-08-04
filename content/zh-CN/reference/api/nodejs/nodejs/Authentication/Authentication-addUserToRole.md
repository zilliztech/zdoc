---
title: "addUserToRole() | Node.js"
slug: /node/node/Authentication-addUserToRole
sidebar_label: "addUserToRole()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将用户添加到特定角色。 | Node.js"
type: docx
token: Qc72dTKgroNdHjxIG2xcwNdmnHb
sidebar_position: 2
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - addUserToRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addUserToRole()

此操作将用户添加到特定角色。

```javascript
await milvusClient.addUserToRole(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addUserToRole({
   username: string,
   rolename: string,
   timeout?: number
 })
```

**参数：**

- **username** (*string*) -

    **[必需]**

    用户名称。

- **rolename** (*string*) -

    **[必需]**

    角色名称

- **timeout** (*number*) -  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 Promise，该 Promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    指示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    指示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。 

- **reason** (*string*) - 

    指示所报告错误原因的原因说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
await milvusClient.addUserToRole({
    username: 'myUser',
    roleName: 'myRole'
});
```

