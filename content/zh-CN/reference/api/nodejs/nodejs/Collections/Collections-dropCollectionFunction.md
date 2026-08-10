---
title: "dropCollectionFunction() | Node.js"
slug: /node/node/Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从现有 Collection 中移除自定义函数。 | Node.js"
type: docx
token: T6xNdPPtsotGiYxL1WActF3qnxb
sidebar_position: 24
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus db
  - Milvus 向量 db
  - zilliz
  - Zilliz Cloud
  - cloud
  - dropCollectionFunction()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

此操作会从现有 Collection 中移除自定义函数。

```javascript
await milvusClient.dropCollectionFunction(data: DropCollectionFunctionReq)
```

## 请求语法\{#request-syntax}

```javascript
dropCollectionFunction({
    collection_name: string,
    function_name: string,
    db_name: string,
    timeout: number
})
```

**参数：**

- **collection_name** (*string*) -

    **[必填]**

    包含待移除函数的 Collection 名称。

- **function_name** (*string*) -

    **[必填]**

    要删除的函数名称。

- **db_name** (*string*) -

    Collection 所在的 Database 名称。可选。

- **timeout** (*number*) -

    此操作的超时时长（以毫秒为单位）。可选。

**返回：**

*Promise\<ResStatus\>*

**异常：**

- **MilvusError**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropCollectionFunction({
    collection_name: 'my_collection',
    function_name: 'my_function'
});
```
