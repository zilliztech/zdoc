---
title: "use() | Node.js"
slug: /node/node/Client-use
sidebar_label: "use()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为 gRPC 客户端设置活动 Database。调用此方法后，所有后续操作都将以指定的 Database 为目标。 | Node.js"
type: docx
token: Dc3JdXF5dogLOLxqUPGclM6jn6f
sidebar_position: 9
keywords: 
  - Milvus 基准测试
  - 托管式 Milvus
  - Serverless 向量 Database
  - 开源 Milvus
  - zilliz
  - zilliz cloud
  - 云
  - use()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# use()

此操作为 gRPC 客户端设置活动 Database。调用此方法后，所有后续操作都将以指定的 Database 为目标。

```javascript
await milvusClient.use({ db_name: string })
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.use({
    db_name: string,
})
```

**参数：**

- **db_name** (*string*) -

    要使用的 Database 名称。

**返回值：**

*Promise\<ResStatus\>*

**异常：**

- **MilvusError**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.use({ db_name: 'my_database' });
```
