---
title: "getIndexStatistics() | Node.js"
slug: /node/node/Management-getIndexStatistics
sidebar_label: "getIndexStatistics()"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "此操作获取指定索引的索引统计信息，包括已索引行数和总行数。 | Node.js"
type: origin
token: shared-Management-getIndexStatistics
displayed_sidebar: nodeSidebar

---

# getIndexStatistics()

此操作获取指定索引的索引统计信息，包括已索引行数和总行数。

```javascript
await milvusClient.getIndexStatistics(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getIndexStatistics({
      db_name?: string,
      collection_name: string,
      field_name?: string,
      index_name?: string,
      timeout?: number
});
```

**参数：**

- **db_name**（*string*）-

    包含目标 Collection 的 Database 的名称。

- **collection_name**（*string*）-

    **[必需]**

    现有 Collection 的名称。

- **field_name**（*string*）-

    Collection 中现有字段的名称。

- **index_name**（*string*）-

    要获取其统计信息的索引的名称。

- **timeout**（*number*）-

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

**返回：**

*Promise&lt;DescribeIndexResponse&gt;*

此方法返回一个 Promise，其解析结果为 **DescribeIndexResponse** 对象。

```javascript
{
    index_descriptions: IndexDescription[],
    status:  ResStatus
}
```

**参数：**

- **index_descriptions**（*IndexDescription[]*）-

请求的索引的索引描述列表。每个条目都包含 **indexed_rows** 和 **total_rows**。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code**（*number*）-

        指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code**（*string* | *number*）-

        指示所发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason**（*string*）-

        说明所报告错误的原因。如果此操作成功，则该值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.getIndexStatistics({
    collection_name: 'my_collection',
    index_name: 'my_index',
});
```
