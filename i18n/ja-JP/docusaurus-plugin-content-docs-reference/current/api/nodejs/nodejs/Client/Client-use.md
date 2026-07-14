---
title: "use() | Node.js"
slug: /node/node/Client-use
sidebar_label: "use()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、gRPC client のアクティブなデータベースを設定します。このメソッドを呼び出した後、以降のすべての操作は指定されたデータベースを対象とします。 | Node.js"
type: docx
token: Dc3JdXF5dogLOLxqUPGclM6jn6f
sidebar_position: 9
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - use()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# use()

この操作は、gRPC client のアクティブなデータベースを設定します。このメソッドを呼び出した後、以降のすべての操作は指定されたデータベースを対象とします。

```javascript
await milvusClient.use({ db_name: string })
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.use({
    db_name: string,
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    使用するデータベースの名前。

**RETURNS:**

*Promise\<ResStatus\>*

**EXCEPTIONS:**

- **MilvusError**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.use({ db_name: 'my_database' });
```
