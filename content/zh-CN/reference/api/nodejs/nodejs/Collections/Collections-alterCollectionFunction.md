---
title: "alterCollectionFunction() | Node.js"
slug: /node/node/Collections-alterCollectionFunction
sidebar_label: "alterCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改现有 Collection 中的自定义函数。 | Node.js"
type: docx
token: DBEFdVorMomen0x4xNEcKkM1n8O
sidebar_position: 22
keywords: 
  - knn
  - 图像搜索
  - LLMs
  - 机器学习
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# alterCollectionFunction()

此操作会修改现有 Collection 中的自定义函数。

```javascript
await milvusClient.alterCollectionFunction(data: AlterCollectionFunctionReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterCollectionFunction({
    collection_name: string,
    function_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    包含要修改的函数的 Collection 名称。

- **function_name** （*string*） -

    **[必需]**

    要修改的函数名称。

- **function** (*[FunctionObject](./Collections-FunctionObject)*) -

    **[必需]**

    更新后的函数 Schema。请参见 [FunctionObject](./Collections-FunctionObject)。

- **db_name** （*string*） -

    Collection 所在 Database 的名称。

- **timeout** （*number*） -

    此操作的超时时间，单位为毫秒。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 Promise，其解析结果为 **ResStatus** 对象。

**异常：**

- **Error**

    此操作期间发生任何错误时，将引发此异常。

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
