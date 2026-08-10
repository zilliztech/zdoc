---
title: "alterAlias() | Node.js"
slug: /node/node/Collections-alterAlias
sidebar_label: "alterAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将一个 Collection 的别名重新分配给另一个 Collection。 | Node.js"
type: docx
token: DXTLdtFCso7fo6xJHShc7XLpngh
sidebar_position: 1
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - 云
  - alterAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterAlias()

此操作会将一个 Collection 的别名重新分配给另一个 Collection。

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

    Collection 的别名。请注意，该别名必须预先存在。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Collection 别名？
    
        Collection 别名是 Collection 的附加名称。当您希望将应用程序切换到新的 Collection 而无需对代码进行任何更改时，Collection 别名会很有用。 
    
        在 Zilliz Cloud 上，Collection 别名是全局唯一标识符。一个别名只能分配给且仅能分配给一个 Collection。反过来，一个 Collection 可以拥有多个别名。
    
        下面是将一个 Collection 的别名重新分配给另一个 Collection 的示例：
    
        假设有两个 Collection：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的 Collection 别名，它最初被分配给 `collection_1`：
    
        - `collection_1` 的别名 = ["bob"]
    
        - `collection_2` 的别名 = []
    
        调用 `alter_alias("collection_2", "bob")` 后：
    
        - `collection_1` 的别名 = []
    
        - `collection_2` 的别名 = ["bob"]

    </Admonition>

- **db_name** (*str*) -

    保存目标 Collection 的 Database 名称。

- **collection_name** (*str*) -

    **[必需]**

    要重新分配别名的目标 Collection 名称。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

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

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。 

- **reason** (*string*) - 

    表示已报告错误原因的说明。如果此操作成功，则其值为空字符串。

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

