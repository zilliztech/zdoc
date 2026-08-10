---
title: "dropAlias() | Node.js"
slug: /node/node/Collections-dropAlias
sidebar_label: "dropAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除指定 Collection 的别名。| Node.js"
type: docx
token: FubcdxJ0LoyQiJxmUMjcZnbjnbc
sidebar_position: 9
keywords: 
  - 自然语言处理搜索
  - 幻觉 大语言模型
  - 多模态搜索
  - 向量搜索算法
  - zilliz
  - zilliz cloud
  - 云
  - dropAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropAlias()

此操作会删除指定 Collection 的别名。

```javascript
await milvusClient.dropAlias(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropAlias({
   alias: string,
   db_name: string,
   collection_name: string,
   timeout?: number
 })
```

**参数：**

- **alias** (*string*) -

    **[必需]**

    Collection 的别名。

    执行此操作前，请确保该别名存在。否则会引发异常。

- **db_name** (*string*) -

    包含指定 Collection 的 Database 名称。

- **collection_name** (*string*) -

    该别名所绑定的 Collection 名称。

- **timeout** (*number*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的状态码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值为 **Success**。

- **reason** (*string*) - 

    表示已报告错误原因的说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
});
```

