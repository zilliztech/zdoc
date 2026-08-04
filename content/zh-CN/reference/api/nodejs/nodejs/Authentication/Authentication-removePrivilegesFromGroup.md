---
title: "removePrivilegesFromGroup() | Node.js"
slug: /node/node/Authentication-removePrivilegesFromGroup
sidebar_label: "removePrivilegesFromGroup()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从 Milvus 中的特定权限组移除权限。 | Node.js"
type: docx
token: EeAfdukBNoIIgCxX248c6VULnOb
sidebar_position: 22
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - removePrivilegesFromGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# removePrivilegesFromGroup()

此操作从 Milvus 中的特定权限组移除权限。

```javascript
await milvusClient.removePrivilegesFromGroup(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.removePrivilegesFromGroup({
   group_name: string,
   privileges: string[],
   timeout?: number
 })
```

**参数：**

- **group_name** (*string*) -

    **[必需]**

    权限组的名称。

- **privileges** (*string[]*) -

    **[必需]**

    要从上述组中移除的权限列表。

- **timeout** (*number*) -  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
await milvusClient.removePrivilegesFromGroup({
    group_name: 'exampleGroup',
    privileges: ['CreateCollection', 'DropCollection'],
});
```

