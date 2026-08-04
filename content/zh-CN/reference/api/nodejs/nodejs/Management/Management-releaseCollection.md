---
title: "releaseCollection() | Node.js"
slug: /node/node/Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将特定 collection 的数据从内存中释放。 | Node.js"
type: docx
token: UxOXdeKF1oOIBuxTjPhcKBtPnRb
sidebar_position: 20
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - releaseCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# releaseCollection()

此操作会将特定 collection 的数据从内存中释放。

```javascript
await milvusClient.releaseCollection(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.releaseCollection({ 
    db_name: string,
    collection_name: 'my_collection',
    timeout?: number 
})
```

**参数：**

- **db_name** (*string*) -

    持有目标 collection 的数据库名称。

- **collection_name** (*str*) -

    **[必需]**

    collection 的名称。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示此操作会在返回任意响应或发生错误时超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值保持为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.releaseCollection({ collection_name: 'my_collection' });
```

