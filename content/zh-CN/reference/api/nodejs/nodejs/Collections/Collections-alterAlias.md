---
title: "alterAlias() | Node.js"
slug: /node/node/Collections-alterAlias
sidebar_label: "alterAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将一个集合的别名重新分配给另一个集合。 | Node.js"
type: docx
token: DXTLdtFCso7fo6xJHShc7XLpngh
sidebar_position: 1
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - alterAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterAlias()

此操作将一个集合的别名重新分配给另一个集合。

```javascript
await milvusClient.alterAlias(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterAlias({
   alias: string,
   db_name: string
   collection_name: string,
   timeout?: number
 })
```

**参数：**

- **alias** (*str*) -

    **[必需]**

    集合的别名。请注意，该别名必须预先存在。

    <Admonition type="info" icon="📘" title="说明">

    什么是集合别名？
    
        集合别名是集合的附加名称。当您希望在不修改代码的情况下将应用切换到新集合时，集合别名会非常有用。
    
        在 Zilliz Cloud 上，集合别名是全局唯一标识符。一个别名只能分配给一个集合。反过来，一个集合可以拥有多个别名。
    
        以下是将一个集合的别名重新分配给另一个集合的示例：
    
        假设有两个集合：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的集合别名，最初分配给了 `collection_1`：
    
        - `collection_1` 的别名 = ["bob"]
    
        - `collection_2` 的别名 = []
    
        调用 `alter_alias("collection_2", "bob")` 后：
    
        - `collection_1` 的别名 = []
    
        - `collection_2` 的别名 = ["bob"]

    </Admonition>

- **db_name** (*str*) -

    包含目标集合的数据库名称。

- **collection_name** (*str*) -

    **[必需]**

    要重新分配别名的目标集合名称。

- **timeout** (*number*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回** *Promise\<ResStatus>*

此方法返回一个 promise，解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示发生错误的错误码。如果此操作成功，则其值保持为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
});
```

