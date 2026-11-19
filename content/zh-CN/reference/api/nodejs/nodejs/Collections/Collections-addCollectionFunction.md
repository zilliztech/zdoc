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
  - Zilliz Cloud
  - 云
  - addCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# addCollectionFunction()

<Admonition type="warning" icon="🚧" title="Warning">

**已弃用。**

此方法已弃用。请改用 [addFunctionField()](./Collections-addFunctionField)。

</Admonition>

此操作会向现有 Collection 添加自定义函数。

```javascript
await milvusClient.addCollectionFunction(data: AddCollectionFunctionReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addCollectionFunction({
    collection_name: string,
    function: FunctionObject,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    要添加函数的 Collection 名称。

- **function** （*[FunctionObject](./Collections-FunctionObject)*） -

    **[必需]**

    要添加到 Collection 的函数。请参阅 [FunctionObject](./Collections-FunctionObject)。

- **db_name** （*string*） -

    Collection 所在的 Database 名称。

- **timeout** （*number*） -

    此操作的超时时间，以毫秒为单位。

**返回：**

*Promise&lt;ResStatus&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **ResStatus** 对象。

**异常：**

- **Error**

    当此操作期间发生任何错误时，将引发此异常。

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
