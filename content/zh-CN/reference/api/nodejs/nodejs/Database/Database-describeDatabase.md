---
title: "describeDatabase() | Node.js"
slug: /node/node/Database-describeDatabase
sidebar_label: "describeDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作描述一个 Database，返回 Database 名称、ID、创建时间戳和属性等详细信息。 | Node.js"
type: docx
token: PzXldcfljoU9rOx9TFUcIoNknt6
sidebar_position: 8
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus 数据库
  - Milvus 向量数据库
  - Zilliz
  - Zilliz Cloud
  - 云
  - describeDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# describeDatabase()

此操作描述一个 Database，返回 Database 名称、ID、创建时间戳和属性等详细信息。

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

    要描述的 Database 的名称。

- **timeout** (*number*) -

    以毫秒为单位的 RPC 超时时间。可选。

**返回：**

*Promise&lt;DescribeDatabaseResponse&gt;*

此方法返回一个 promise，解析为 **DescribeDatabaseResponse** 对象。

```javascript
{
    db_name: string,
    dbID: number,
    created_timestamp: number,
    properties: KeyValuePair[],
    status:  ResStatus
}
```

**参数：**

- **db_name** (*string*) -
Database 名称。

- **dbID** (*number*) -
Database 的内部标识符。

- **created_timestamp** (*number*) -
Database 的创建时间戳，单位为毫秒。

- **properties** (*KeyValuePair[]*) -
Database 级别的属性（例如 **database.replica.number**、**database.resource_groups**），可在创建时声明，或通过 `alterDatabaseProperties()` 设置。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

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
