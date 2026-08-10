---
title: "dropIndex() | Node.js"
slug: /node/node/Management-dropIndex
sidebar_label: "dropIndex()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从特定 Collection 中删除一个索引。 | Node.js"
type: docx
token: UBbndftiQo2HdOxUNtocIISnnVh
sidebar_position: 5
keywords: 
  - 向量 Database 如何工作
  - 向量数据库比较
  - openai 向量数据库
  - 自然语言处理 Database
  - zilliz
  - zilliz cloud
  - 云
  - dropIndex()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropIndex()

此操作会从特定 Collection 中删除一个索引。

```javascript
await milvusClient.dropIndex(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropPartition({
    db_name: string,
    collection_name: string,
    field_name?: string,
    index_name?: string,
    timeout?: number
 });
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **field_name** (*string*) -

    Collection 中现有字段的名称。

- **index_name** (string) -

    要删除的索引名称。

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为 **ResStatus** 对象。

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
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const dropIndexReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.dropIndex(dropIndexReq);
console.log(res);
```

