---
title: "describeDatabase() | Node.js"
slug: /node/node/Database-describeDatabase
sidebar_label: "describeDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于描述数据库，返回数据库名称、ID、创建时间戳和属性等详细信息。 | Node.js"
type: docx
token: PzXldcfljoU9rOx9TFUcIoNknt6
sidebar_position: 8
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeDatabase()

此操作用于描述数据库，返回数据库名称、ID、创建时间戳和属性等详细信息。

```javascript
await milvusClient.describeDatabase(data: DescribeDatabaseRequest)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.describeDatabase({
    db_name: string,
    timeout?: number,
})
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要描述的数据库名称。

- **timeout** (*number*) -

    以毫秒为单位的 RPC 超时时间。可选。

**返回值** *Promise&lt;DescribeDatabaseResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **DescribeDatabaseResponse** 对象。

```typescript
{
    db_name: string,
    dbID: number,
    created_timestamp: number,
    properties: KeyValuePair[],
    status:  ResStatus
}
```

**参数：**

- **db_name** (*string*) -<br/>
  数据库名称。

- **dbID** (*number*) -<br/>
  数据库的内部标识符。

- **created_timestamp** (*number*) -<br/>
  数据库的创建时间戳，以毫秒为单位。

- **properties** (*KeyValuePair[]*) -<br/>
  数据库级属性（例如 **database.replica.number**、**database.resource_groups**），可在创建时声明，或通过 `alterDatabaseProperties()` 设置。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示发生错误的错误码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.describeDatabase({ db_name: 'default' });
console.log(res.db_name, res.dbID, res.properties);
```
