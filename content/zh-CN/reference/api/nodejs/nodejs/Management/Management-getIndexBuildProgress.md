---
title: "getIndexBuildProgress() | Node.js"
slug: /node/node/Management-getIndexBuildProgress
sidebar_label: "getIndexBuildProgress()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作获取指定索引的构建进度。 | Node.js"
type: docx
token: G6CGdbM4QoNgr5xS1ZAc94lhnFd
sidebar_position: 11
keywords: 
  - Pinecone 向量数据库
  - 音频搜索
  - 什么是语义搜索
  - Embedding 模型
  - zilliz
  - zilliz cloud
  - cloud
  - getIndexBuildProgress()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getIndexBuildProgress()

此操作获取指定索引的构建进度。

```javascript
await milvusClient.getIndexBuildProgress(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getIndexBuildProgress({
      db_name?: string,
      collection_name: string,
      field_name: string,
      index_name: string,
      timeout?: number
});
```

**参数：**

- **db_name** (*string*) -

    包含目标 collection 的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    已存在 collection 的名称。

- **index_name** (*string*) -

    **[REQUIRED]**

    目标索引的名称。此参数与 `field_name` 互斥。

- **field_name** (*string*) -

    **[REQUIRED]**

    目标字段的名称。此参数与 `index_name` 互斥。使用此参数时，请确保已在指定字段上构建索引。

- **timeout** (number) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise&lt;GetIndexBuildProgressResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **GetIndexBuildProgressResponse** 对象。

```typescript
{
    indexed_rows: number,
    total_rows: number,
    status:  ResStatus
}
```

**参数：**

- **indexed_rows** (*number*) -<br/>
  到目前为止已建立索引的行数。

- **total_rows** (*number*) -<br/>
  该索引覆盖的总行数。当 **indexed_rows** 等于 **total_rows** 时，构建完成。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        指示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const getIndexBuildProgressReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.getIndexBuildProgress(getIndexBuildProgressReq);
console.log(res);
```

