---
title: "addCollectionFunction() | Node.js"
slug: /node/node/Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加自定义函数。 | Node.js"
type: docx
token: SmI4dGF4qoAjbKxamfhcndjxnCc
sidebar_position: 21
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - zilliz
  - zilliz cloud
  - 云
  - addCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

此操作会向现有 Collection 添加自定义函数。

```typescript
await milvusClient.addCollectionFunction(data: AddCollectionFunctionReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.addCollectionFunction({
    collection_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    要向其添加函数的 Collection 名称。

- **function** (*FunctionObject*) -

    **[必需]**

    要添加到 Collection 的函数。有关完整字段说明，请参见下方的 FunctionObject 部分。

- **db_name** (*string*) -

    Collection 所在的 Database 名称。

- **timeout** (*number*) -

    此操作的超时时长（以毫秒为单位）。

**返回：**

*Promise\<ResStatus\>*

**异常：**

- **MilvusError**

    当此操作期间发生任何错误时，将引发此异常。

## FunctionObject\{#functionobject}

**FunctionObject** 定义了一个服务器端函数，用于在插入和搜索期间自动将数据转换为向量嵌入。

**参数：**

- **name** (*string*) -

    **[必需]**

    函数名称。用于在查询和 Collection 中引用该函数。

- **type** (*FunctionType*) -

    **[必需]**

    函数类型。可能的值包括：`FunctionType.BM25`（使用 BM25 从文本生成稀疏嵌入）、`FunctionType.TEXTEMBEDDING`（从文本生成稠密嵌入）、`FunctionType.RERANK`（重排函数）。

- **input_field_names** (*string[]*) -

    **[必需]**

    包含待转换原始数据的字段名称。对于 `FunctionType.BM25`，应仅指定一个字段名。

- **output_field_names** (*string[]*) -

    用于存储生成嵌入的字段名称。对于 `FunctionType.BM25`，应仅指定一个字段名。

- **params** (*object*) -

    附加函数参数，以键值对形式提供。

- **description** (*string*) -

    对函数用途的简要说明。默认为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.addCollectionFunction({
    collection_name: 'my_collection',
    function: {
        name: 'my_bm25_function',
        description: 'BM25 sparse embedding function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
});
```

