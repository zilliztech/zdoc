---
title: "describeCollection() | Node.js"
slug: /node/node/Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出特定 Collection 的详细信息。 | Node.js"
type: docx
token: IuTYdjSHHoznXNx5f7jcKqvYnhr
sidebar_position: 8
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - LLM 幻觉
  - Zilliz
  - Zilliz Cloud
  - 云
  - describeCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# describeCollection()

此操作会列出特定 Collection 的详细信息。

```javascript
await milvusClient.describeCollection(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.describeCollection({ 
    db_name: string,
    collection_name: string,
    cache?: boolean
})
```

**参数：**

- **db_name** (*string*) -

    目标 Collection 所在的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **cache** (*boolean*) -

    是否使用缓存的 Collection Schema。该值默认为 **false**。

- **timeout** (*number*)  

    此操作的超时时间。

    将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

**返回：**

*Promise&lt;DescribeCollectionResponse&gt;*

此方法返回一个 Promise，该 Promise 解析为 **DescribeCollectionResponse** 对象。

```javascript
{
    schema: CollectionSchema,
    collectionID: string,
    collection_name: string,
    consistency_level: string,
    aliases: string[],
    virtual_channel_names: string[],
    physical_channel_names: string[],
    start_positions: string[],
    properties: KeyValuePair[],
    created_timestamp: string,
    created_utc_timestamp: string,
    shards_num: number,
    num_partitions: string,
    db_name: string,
    functions: FunctionObject[],
    update_timestamp_str: string,
    update_timestamp: number,
    anns_fields: Record<string, FieldSchema>,
    scalar_fields: Record<string, FieldSchema>,
    function_fields: Record<string, FieldSchema>,
    status:  ResStatus
}
```

**参数：**

- **schema** (*CollectionSchema*) -
Collection 的 Schema。

    - **name** (*string*) -

        Collection 名称。

    - **description** (*string*) -

        Collection 的可选描述。

    - **enable_dynamic_field** (*boolean*) -

        是否启用动态字段。当为 **true** 时，未在 Schema 中声明的字段将存储在隐藏的 `$meta` JSON 字段中。

    - **autoID** (*boolean*) -

        主键是否由 Milvus 自动生成。

    - **fields** (*FieldSchema[]*) -

        Collection 上声明的所有标量字段和向量字段。有关完整的 **FieldSchema** 字段参考，请参见 `FieldSchema` 类文档。

    - **functions** (*[FunctionObject](./Collections-FunctionObject)[]*) -

        附加到 Collection 的 doc-in / doc-out 函数（例如 BM25 稀疏向量函数）。

    - **struct_array_fields** (*FieldSchema[]*) -

        Collection 上声明的所有 struct 字段和 array 字段。

    - **external_source** (*string*) -

        外部源路径。可选。

    - **external_spec** (*string*) -

        外部 spec 配置。可选。

    - **file_resource_ids** (*string[]*) -

        外部文件资源 ID。可选。

- **collectionID** (*string*) -
由 Milvus 分配的内部 Collection ID。

- **collection_name** (*string*) -
Collection 名称。

- **consistency_level** (*string*) -
针对此 Collection 查询时使用的默认一致性级别。可选值为 **Strong**、**Session**、**Bounded**、**Eventually** 和 **Customized**。

- **aliases** (*string[]*) -
指向此 Collection 的别名列表。

- **virtual_channel_names** (*string[]*) -
分配给 Collection 的虚拟通道名称。该值当前没有用处。

- **physical_channel_names** (*string[]*) -
分配给 Collection 的物理通道名称。该值当前没有用处。

- **start_positions** (*string[]*) -
Collection 创建时的起始位置。

- **properties** (*KeyValuePair[]*) -
创建时声明的或通过 `alterCollectionProperties()` 设置的 Collection 级属性（例如 **mmap.enabled**、**collection.ttl.seconds**）。

- **created_timestamp** (*string*) -
创建 Collection 时使用的混合时间戳。

- **created_utc_timestamp** (*string*) -
创建 Collection 时的 UTC 时间戳，以毫秒为单位。

- **shards_num** (*number*) -
Collection 上配置的分片数量。

- **num_partitions** (*string*) -
Collection 上配置的 Partition 数量。仅当声明了 Partition key 字段时，此值才有意义。

- **db_name** (*string*) -
拥有此 Collection 的 Database。

- **functions** (*[FunctionObject](./Collections-FunctionObject)[]*) -

附加到 Collection 的 doc-in / doc-out 函数的扁平列表。

- **update_timestamp_str** (*string*) -
Collection 上次更新时的混合时间戳，以字符串形式表示。

- **update_timestamp** (*number*) -
上次更新时间戳的数值形式。

- **anns_fields** (*Record&lt;string, FieldSchema&gt;*) -
从向量字段名称到其 **FieldSchema** 的映射，涵盖 Collection 上声明的所有向量字段。

- **scalar_fields** (*Record&lt;string, FieldSchema&gt;*) -
从标量字段名称到其 **FieldSchema** 的映射，涵盖 Collection 上声明的所有标量字段。

- **function_fields** (*Record&lt;string, FieldSchema&gt;*) -
从函数输出字段名称到其 **FieldSchema** 的映射。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        指示所发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则该值保持为空字符串。


**异常：**

- **Error**

    当此操作期间发生任何错误时，会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```

