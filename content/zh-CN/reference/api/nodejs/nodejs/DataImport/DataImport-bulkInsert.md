---
title: "bulkInsert() | Node.js"
slug: /node/node/DataImport-bulkInsert
sidebar_label: "bulkInsert()"
beta: false
added_since: inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作将指定数据文件中的数据导入到 Milvus。 | Node.js"
type: docx
token: V65MdZWnsoMwpfxkt0sc5qQPnbb
sidebar_position: 9
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - zilliz
  - zilliz cloud
  - cloud
  - bulkInsert()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# bulkInsert()

此操作将指定数据文件中的数据导入到 Milvus。

```javascript
await milvusClient.bulkInsert(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.bulkInsert({
    db_name?: string,
    collection_name: string,
    partition_name?: string,
    files: string[],
    timeout?: number,
    options?: KeyValuePair<string, string | number>[]
})
```

**参数：**

- **db_name** (*string*) -

    目标集合所属数据库的名称。

- **collection_name** (*string*) -

    **[必需]**

    目标集合的名称。

- **partition_name** (*string*) -

    目标分区的名称。

- **files** (*string[]*) -

    要从中导入数据的数据文件路径列表。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作将超时。

- **options** (*KeyValuePair&lt;string, string | number&gt;[]*) -   

    当前操作的额外键值对选项。

**返回类型：**

*Promise*\<*ImportResponse*>

**返回** *Promise&lt;ImportResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **ImportResponse** 对象。

```typescript
{
    tasks: number[],
    status:  ResStatus
}
```

**参数：**

- **tasks** (*number[]*) -<br/>
  分派到数据节点的异步导入任务标识符。将这些值传递给 `listImportTasks()` 以轮询完成状态。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        指示已发生错误的错误码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#examples}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const importResponse = await milvusClient.bulkInsert({
  collection_name: 'my_collection',
  files: ['path-to-data-file.json'],
});
```
