---
title: "describeAlias() | Node.js"
slug: /node/node/Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于描述特定别名。 | Node.js"
type: docx
token: YCzNdg5yWoeZVrxj7jGcb1UXnBd
sidebar_position: 7
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - describeAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeAlias()

此操作用于描述特定别名。

```javascript
await milvusClient.describeAlias(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.describeAlias({
    db_name: string,
    alias: string,
    collection_name: string
})
```

**参数：**

- **db_name** (*str*) -

    保存目标集合的数据库名称。

- **alias** (*str*) -

    **[REQUIRED]**

    集合的别名。请注意，该别名应预先存在。

    <Admonition type="info" icon="📘" title="说明">

    什么是集合别名？
    
        集合别名是集合的附加名称。当你希望将应用切换到新集合而无需修改代码时，集合别名会很有用。 
    
        在 Zilliz Cloud 上，集合别名是全局唯一标识符。一个别名只能分配给且仅分配给一个集合。反过来，一个集合可以拥有多个别名。
    
        下面是将一个集合的别名重新分配给另一个集合的示例：
    
        假设有两个集合：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的集合别名，最初分配给 `collection_1`：
    
        - `collection_1`'s alias = ["bob"]
    
        - `collection_2`'s alias = []
    
        调用 `alter_alias("collection_2", "bob")` 后：
    
        - `collection_1`'s alias = []
    
        - `collection_2`'s alias = ["bob"]

    </Admonition>

- **collection_name** (*str*) -

    **[REQUIRED]**

    具有指定别名的集合名称。

**返回值** *Promise&lt;DescribeAliasResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **DescribeAliasResponse** 对象。

```typescript
{
    db_name: string,
    alias: string,
    collection: string,
    status:  ResStatus
}
```

**参数：**

- **db_name** (*string*) -<br/>
  拥有该别名的数据库。

- **alias** (*string*) -<br/>
  别名名称。

- **collection** (*string*) -<br/>
  该别名当前指向的集合名称。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.describeAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
});
```
