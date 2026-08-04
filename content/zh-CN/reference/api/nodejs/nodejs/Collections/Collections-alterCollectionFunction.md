---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改现有 collection 中的自定义函数。 | Node.js"
type: docx
token: DBEFdVorMomen0x4xNEcKkM1n8O
sidebar_position: 22
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFunction()

此操作会修改现有 collection 中的自定义函数。

```typescript
await milvusClient.alterCollectionFunction(data: AlterCollectionFunctionReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.alterCollectionFunction({
    collection_name: string,
    function_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必需]**

    包含待修改函数的 collection 名称。

- **function_name** (*string*) -

    **[必需]**

    要修改的函数名称。

- **function** (*FunctionObject*) -

    **[必需]**

    更新后的函数 schema。有关 `FunctionObject` 字段的完整参考，请参阅 `addCollectionFunction()`。

- **db_name** (*string*) -

    collection 所在数据库的名称。

- **timeout** (*number*) -

    此操作的超时时长，单位为毫秒。

**返回：**

*Promise\<ResStatus\>*

**异常：**

- **MilvusError**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.alterCollectionFunction({
    collection_name: 'my_collection',
    function_name: 'my_bm25_function',
    function: {
        name: 'my_bm25_function',
        description: 'Updated BM25 sparse embedding function',
        type: FunctionType.BM25,
        input_field_names: ['text'],
        output_field_names: ['sparse_vector'],
        params: {},
    },
});
```
