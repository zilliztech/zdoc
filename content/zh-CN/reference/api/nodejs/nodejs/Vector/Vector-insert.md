---
title: "insert() | Node.js"
slug: /node/node/Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将数据插入到指定的 Collection 中。 | Node.js"
type: docx
token: SZNQds74zoKniRxtJwdcfdz1nCh
sidebar_position: 5
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - zilliz
  - zilliz cloud
  - 云
  - insert()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# insert()

此操作会将数据插入到指定的 Collection 中。

```javascript
await milvusClient.insert(data: InsertReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.insert({
    collection_name: string,
    data: RowData | RowData[],
    partition_name?: string,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **data** (*RowData[]*) -

    要插入到当前 Collection 中的数据。

    要插入的数据应为与当前 Collection 的 Schema 匹配的字典，或此类字典组成的列表。 

    以下代码假设当前 Collection 的 Schema 中包含两个名为 **id** 和 **vector** 的字段。前者是主字段，后者是用于保存 5 维向量嵌入的字段。

    ```javascript
    // A dictionary, or
    data={
        'id': 0,
        'vector': [
            0.6186516144460161,
            0.5927442462488592,
            0.848608119657156,
            0.9287046808231654,
            -0.42215796530168403
        ]
    }
    
    // A list of dictionaries
    data = [
        {
            'id': 1,
            'vector': [
                0.37417449965222693,
                -0.9401784221711342,
                0.9197526367693833,
                0.49519396415367245,
                -0.558567588166478
            ]
        },
        {
            'id': 2,
            'vector': [
                0.46949086179692356,
                -0.533609076732849,
                -0.8344432775467099,
                0.9797361846081416,
                0.6294256393761057
            ]
        }
    ]
    ```

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **partition_name** (*string* | *None*) -

    当前 Collection 中某个 Partition 的名称。 

    如果指定，则数据将插入到指定的 Partition 中。

**返回值** *Promise&lt;MutationResult&gt;*

此方法返回一个 promise，解析为 **MutationResult** 对象。

```typescript
{
    succ_index: number[],
    err_index: number[],
    acknowledged: boolean,
    insert_cnt: string,
    delete_cnt: string,
    upsert_cnt: string,
    timestamp: string,
    IDs: { int_id?: { data: number[] }, str_id?: { data: string[] }, id_field: 'int_id' | 'str_id' },
    status:  ResStatus
}
```

**参数：**

- **succ_index** (*number[]*) -<br/>
  输入数据中成功插入行的从 0 开始的位置。

- **err_index** (*number[]*) -<br/>
  被拒绝行的从 0 开始的位置。当所有行都成功时，此列表为空。

- **acknowledged** (*boolean*) -<br/>
  写入是否已被 Milvus 确认。

- **insert_cnt** (*string*) -<br/>
  已插入的行数，格式为字符串。

- **delete_cnt** (*string*) -<br/>
  此操作删除的行数。对于`insert()`，该值始终为 **"0"**。

- **upsert_cnt** (*string*) -<br/>
  此操作 upsert 的行数。对于`insert()`，该值始终为 **"0"**。

- **timestamp** (*string*) -<br/>
  此次写入变为可见时的混合时间戳。请将此值用于时间旅行查询。

- **IDs** (*StringArrayId* | *NumberArrayId*) -<br/>
  分配给已插入行的主键。对于 autoID Collection，这些值由 Milvus 生成；否则，它们与输入键相同。

    - **int_id** (*\{ data: number[] }*) -

        当主键为整数字段时设置。

    - **str_id** (*\{ data: string[] }*) -

        当主键为 VARCHAR 字段时设置。

    - **id_field** (*'int_id' | 'str_id'*) -

        指示两个 id 数组中哪一个承载这些值。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值保持为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.insert({
    collection_name: 'my_collection',
    data: [
        { id: 1, vector: [0.1, 0.2, 0.3, 0.4, 0.5], text: 'Hello' },
        { id: 2, vector: [0.6, 0.7, 0.8, 0.9, 1.0], text: 'World' },
    ],
});

console.log(res.insert_cnt); // '2'
```

