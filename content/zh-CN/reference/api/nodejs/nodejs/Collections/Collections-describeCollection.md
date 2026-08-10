---
title: "describeCollection() | Node.js"
slug: /node/node/Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出特定 Collection 的详细信息。 | Node.js"
type: docx
token: IuTYdjSHHoznXNx5f7jcKqvYnhr
sidebar_position: 8
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - describeCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeCollection()

此操作列出特定 Collection 的详细信息。

```javascript
await milvusClient.describeCollection(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.describeCollection({ 
    db_name: string,
    collection_name: string 
})
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise&lt;DescribeCollectionResponse&gt;*

此方法返回一个 promise，解析为 **DescribeCollectionResponse** 对象。

```typescript
{
    schema: CollectionSchema,
    collectionID: string,
    collection_name: string,
    consistency_level: string,
    aliases: string[],
    properties: KeyValuePair[],
    created_timestamp: string,
    created_utc_timestamp: string,
    shards_num: number,
    num_partitions: string,
    db_name: string,
    functions: FunctionObject[],
    external_source?: string,
    external_spec?: string,
    do_physical_backfill?: boolean,
    file_resource_ids?: string[],
    update_timestamp_str: string,
    update_timestamp: number,
    anns_fields: Record<string, FieldSchema>,
    scalar_fields: Record<string, FieldSchema>,
    function_fields: Record<string, FieldSchema>,
    status:  ResStatus
}
```

**参数：**

- **schema** (*CollectionSchema*) -<br/>
  Collection 的 Schema。

    - **name** (*string*) -

        Collection 名称。

    - **description** (*string*) -

        Collection 的可选描述。

    - **enable_dynamic_field** (*boolean*) -

        是否启用动态字段。当为 **true** 时，Schema 中未声明的字段会存储在隐藏的 `$meta` JSON 字段中。

    - **autoID** (*boolean*) -

        主键是否由 Milvus 自动生成。

    - **fields** (*FieldSchema[]*) -

        Collection 上声明的所有标量字段和向量字段。有关完整的 **FieldSchema** 字段参考，请参阅 `FieldSchema` 类文档。

    - **functions** (*FunctionObject[]*) -

        附加到 Collection 的 doc-in / doc-out 函数（例如 BM25 稀疏向量函数）。

- **collectionID** (*string*) -<br/>
  由 Milvus 分配的 Collection 内部 ID。

- **collection_name** (*string*) -<br/>
  Collection 名称。

- **consistency_level** (*string*) -<br/>
  针对此 Collection 查询的默认一致性级别。可能的值包括 **Strong**、**Session**、**Bounded**、**Eventually** 和 **Customized**。

- **aliases** (*string[]*) -<br/>
  指向此 Collection 的别名列表。

- **properties** (*KeyValuePair[]*) -<br/>
  在创建时声明或通过 `alterCollectionProperties()` 设置的 Collection 级属性（例如 **mmap.enabled**、**collection.ttl.seconds**）。

- **created_timestamp** (*string*) -<br/>
  Collection 创建时的混合时间戳。

- **created_utc_timestamp** (*string*) -<br/>
  Collection 创建时的 UTC 时间戳（以毫秒为单位）。

- **shards_num** (*number*) -<br/>
  为 Collection 配置的分片数量。

- **num_partitions** (*string*) -<br/>
  为 Collection 配置的 Partition 数量。仅当声明了 Partition 键字段时，此值才有意义。

- **db_name** (*string*) -<br/>
  拥有此 Collection 的 Database。

- **functions** (*FunctionObject[]*) -<br/>
  附加到 Collection 的 doc-in / doc-out 函数的扁平列表。

- **external_source** (*string*) -

    外部源路径。可选。

- **external_spec** (*string*) -

    外部规范配置。可选。

- **do_physical_backfill** (*boolean*) -

    是否对外部数据执行物理回填。可选。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部文件资源 ID。可选。

- **update_timestamp_str** (*string*) -<br/>
  Collection 上次更新时的混合时间戳，格式为字符串。

- **update_timestamp** (*number*) -<br/>
  上次更新时间戳的数值形式。

- **anns_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  从向量字段名称到其 **FieldSchema** 的映射，涵盖 Collection 上声明的所有向量字段。

- **scalar_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  从标量字段名称到其 **FieldSchema** 的映射，涵盖 Collection 上声明的所有标量字段。

- **function_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  从函数输出字段名称到其 **FieldSchema** 的映射。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```

