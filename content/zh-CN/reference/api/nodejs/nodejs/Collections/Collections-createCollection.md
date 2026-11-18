---
title: "createCollection() | Node.js"
slug: /node/node/Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用默认设置或自定义设置创建 Collection。 | Node.js"
type: docx
token: KPZZd2TiAodSeWxUdlJciHGcnbg
sidebar_position: 5
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - zilliz cloud
  - cloud
  - createCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# createCollection()

此操作使用默认设置或自定义设置创建 Collection。

```javascript
await milvusClient.createCollection(data)
```

## 请求语法\{#request-syntax}

此方法提供以下几种方式。

### 使用 CreateColReq\{#with-createcolreq}

使用此请求体，您只需设置 Collection 名称和向量字段维度即可创建 Collection。

```javascript
await milvusClient.createCollection({
    db_name?: string
    collection_name: string;
    dimension: number;
    auto_id?: boolean;
    consistency_level?: "Strong" | "Session" | "Bounded" | "Eventually" | "Customized";
    description?: string;
    enable_dynamic_field?: boolean;
    enableDynamicField?: boolean;
    id_type?: Int64 | VarChar;
    index_params?: CreateIndexParam;
    metric_type?: string | MetricType;
    primary_field_name?: string;
    vector_field_name?: string;
    timeout?: number;
 })
```

**参数：**

- **db_name**（*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name**（*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **dimension**（*number*） -

    **[必需]**

    向量嵌入的维度。该值应为大于 1 的整数。如果您需要自定义 Collection Schema，请跳过此参数。

- **auto_id**（*boolean*） - 

    向此 Collection 插入数据时，主字段是否自动递增。

    该值默认为 **False**。设置为 **True** 时，主字段将自动递增。在这种情况下，待插入数据中不应包含主字段，以避免错误。自动生成的 ID 长度固定且不可更改。

    此参数用于快速创建 Collection；如果 **schema** 不为 **None**，则会忽略此参数。

- **consistency_level**（*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    在分布式 Database 中，一致性特指这样一种属性：在某一时刻写入或读取数据时，确保每个节点或副本看到的数据视图相同。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description**（*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field**（*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **enableDynamicField**（*boolean*） -

    **enable_dynamic_field** 的别名。

- **id_type**（*Int64* | *VarChar*） -

    主字段的数据类型。

- **index_params**（*CreateIndexParam*） -

    要创建的 Collection 的索引参数。

- **metric_type**（*string* | *MetricType*） -

    度量类型决定如何衡量向量嵌入之间的相似性。

- **primary_field_name**（*string*） -

    主字段的自定义名称。

- **vector_field_name**（*string*） -

    向量字段的自定义名称。

- **timeout** (number) -

    此操作的超时时长。将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

### 使用 CreateCollectionReq\{#with-createcollectionreq}

使用此请求体，您可以自定义 Collection 的 Schema 设置。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: string,
   description: string,
   enable_dynamic_field: boolean,
   fields?: FieldType[],
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
       is_clustering_key?: boolean,
       type_params: {
         dim: number,
         max_length: number,
         max_capacity: number,
         analyzer_params: Record<String, any>,
         enable_analyzer: boolean,
         enable_match: boolean,
         multi_analyzer_params: Record<String, any>,
         'mmap.enabled': boolean
       },
       autoID?: boolean,
       nullable: boolean,
       default_value: number | string
     }
   ],
   functions: [
      {
        name: string,
        description: string,
        type: FunctionType,
        input_field_names: string[],
        output_field_names: string[],
        params: Record<string, any>,
      },
   ],
   num_partitions?: number,
   partition_key_field?: string,
   clustering_key_field?: string,
   shards_num?: number,
   properties?: Properties,
   timeout?: number,
   external_source?: string;
   external_spec?: string;
   file_resource_ids?: Array<number | string>;
})
```

**参数：**

- **db_name**（*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name**（*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **consistency_level**（*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    在分布式 Database 中，一致性特指这样一种属性：在某一时刻写入或读取数据时，确保每个节点或副本看到的数据视图相同。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description**（*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field**（*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **schema**（*FieldType[]*） -

    Collection 的 Schema，以 Schema 字段定义列表的形式表示。

- **fields**（*FieldType[]*） -

    作为 **schema** 的替代参数，用于以字段定义列表的形式列出 Collection 的 Schema 字段。

- **functions**（*FunctionObject[]*）

    将数据转换为向量嵌入。此函数会添加到 Collection 的 Schema 中。

    - **name**（*string*）

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description**（*string*）

        对函数用途的简要说明。这有助于文档编写或在较大的项目中提升清晰度，该值默认为空字符串。

    - **type**（*[FunctionType](./Collections-FunctionType)*）

        用于处理原始数据的函数类型。可能的值如下：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names**（*string[]*）

        包含需要转换为向量表示形式的原始数据的字段的名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

    - **output_field_names**（*string[]*）

        用于存储生成嵌入的字段的名称。此字段应与 Collection Schema 中定义的向量字段对应。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

- **num_partitions**（*number*） -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Notes">
    
    数据分区是一种基于特定条件组织数据的技术。借助数据分区，您可以分别创建、加载、释放和删除 Partition，也可以在其中执行搜索和查询。

    </Admonition>

- **partition_key_field**（*string*） -

    用作 Partition 键的字段的名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Partition 键用于根据键值将 Entity 存储到不同的 Partition 中。换句话说，Partition 键会将具有相同键的 Entity 分组在一起，因此在按键字段过滤时，可以避免扫描无关的 Partition。与传统过滤方法相比，Partition 键可以大幅提升查询性能。

    </Admonition>

- **clustering_key_field**（*string*） -

    用作聚类键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction 是 Milvus 中的一项功能，它会根据标量字段中的值在 Collection 的 Segment 之间重新分配 Entity。要启用此功能，您首先需要选择一个标量字段作为聚类键。这样，当 Entity 的聚类键值落在特定范围内时，Milvus 便可以将其重新分配到同一个 Segment 中。触发聚类 Compaction 时，Milvus 会生成或更新（generates/updates）名为 PartitionStats 的全局索引，该索引记录 Segment 与聚类键值之间的映射关系。

    </Admonition>

- **shards_num**（*number*） -

    创建此 Collection 时一并创建的分片数量。

    该值默认为 **1**，表示创建此 Collection 时会同时创建一个分片。

    <Admonition type="info" icon="📘" title="Notes">
    
    分片是指将写入操作分配到不同节点，以充分利用 Milvus 集群在数据写入方面的并行计算能力。
    
    默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    Collection 的附加属性，以键值对形式提供。可能的值包括：

    - **collection.ttl.seconds**（*number*） -

        当前 Collection 的生存时间（TTL），单位为秒。

    - **mmap.enabled**（*boolean*） -

        是否在整个 Collection 范围内启用 mmap。

    - **partitionkey.isolation**（*boolean*） -

        是否启用 Partition 键隔离。

    - **dynamicfield.enabled**（*boolean*） -

        是否启用动态字段。

    - **allow_insert_auto_id**（*boolean*） -

        启用 autoID 时，是否允许插入主键。

- **timeout**（*float* | *None*） -

    此操作的超时时长。将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

- **external_source**（*string*） -

    外部源路径。此参数适用于创建外部 Collection。

- **external_spec**（*string*） -

    外部规范配置。此参数适用于创建外部 Collection。

- **file_resource_ids**（*Array&lt;number | string&gt;*） -

    外部文件资源 ID。此参数适用于创建外部 Collection。

### 使用 CreateColWithSchemaAndIndexParamsReq\{#with-createcolwithschemaandindexparamsreq}

使用此请求体，您可以自定义 Collection 的 Schema 和索引设置。创建后，Collection 会自动加载。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: string,
   description: string,
   enable_dynamic_field: boolean,
   fields?: FieldType[],
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
       is_clustering_key?: boolean,
       type_params: {
         dim: number,
         max_length: number,
         max_capacity: number,
         analyzer_params: Record<String, any>,
         enable_analyzer: boolean,
         enable_match: boolean,
         multi_analyzer_params: Record<String, any>,
         'mmap.enabled': boolean
       },
       nullable: boolean,
       default_value: number | string
     }
   ],
   functions: [
      {
        name: string,
        description: string,
        type: FunctionType,
        input_field_names: string[],
        output_field_names: string[],
        params: Record<string, any>,
      },
   ],
   num_partitions?: number,
   partition_key_field?: string,
   shards_num?: number,
   properties?: Properties,
   index_params: [
     {
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type?: string,
       params?: keyValueObj
     }     
   ],
   timeout?: number
 })
```

**参数：**

- **db_name**（*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name**（*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **consistency_level**（*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    在分布式 Database 中，一致性特指这样一种属性：在某一时刻写入或读取数据时，确保每个节点或副本看到的数据视图相同。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description**（*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field**（*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **schema**（*FieldType[]*） -

    Collection 的 Schema，以 Schema 字段定义列表的形式表示。

- **fields**（*FieldType[]*） -

    作为 **schema** 的替代参数，用于以字段定义列表的形式列出 Collection 的 Schema 字段。

- **functions**（*FunctionObject[]*）

    将数据转换为向量嵌入。此函数会添加到 Collection 的 Schema 中。

    - **name**（*string*）

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description**（*string*）

        对函数用途的简要说明。这有助于文档编写或在较大的项目中提升清晰度，该值默认为空字符串。

    - **type**（*[FunctionType](./Collections-FunctionType)*）

        用于处理原始数据的函数类型。可能的值如下：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names**（*string[]*）

        包含需要转换为向量表示形式的原始数据的字段的名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

    - **output_field_names**（*string[]*）

        用于存储生成嵌入的字段的名称。此字段应与 Collection Schema 中定义的向量字段对应。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

- **num_partitions**（*number*） -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Notes">
    
    数据分区是一种基于特定条件组织数据的技术。借助数据分区，您可以分别创建、加载、释放和删除 Partition，也可以在其中执行搜索和查询。

    </Admonition>

- **partition_key_field**（*string*） -

    用作 Partition 键的字段的名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Partition 键用于根据键值将 Entity 存储到不同的 Partition 中。换句话说，Partition 键会将具有相同键的 Entity 分组在一起，因此在按键字段过滤时，可以避免扫描无关的 Partition。与传统过滤方法相比，Partition 键可以大幅提升查询性能。

    </Admonition>

- **clustering_key_field**（*string*） -

    用作聚类键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction 是 Milvus 中的一项功能，它会根据标量字段中的值在 Collection 的 Segment 之间重新分配 Entity。要启用此功能，您首先需要选择一个标量字段作为聚类键。这样，当 Entity 的聚类键值落在特定范围内时，Milvus 便可以将其重新分配到同一个 Segment 中。触发聚类 Compaction 时，Milvus 会生成或更新（generates/updates）名为 PartitionStats 的全局索引，该索引记录 Segment 与聚类键值之间的映射关系。

    </Admonition>

- **shards_num**（*number*） -

    创建此 Collection 时一并创建的分片数量。

    该值默认为 **1**，表示创建此 Collection 时会同时创建一个分片。

    <Admonition type="info" icon="📘" title="Notes">
    
    分片是指将写入操作分配到不同节点，以充分利用 Milvus 集群在数据写入方面的并行计算能力。
    
    默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    Collection 的附加属性，以键值对形式提供。可能的值包括：

    - **collection.ttl.seconds**（*number*） -

        当前 Collection 的生存时间（TTL），单位为秒。

    - **mmap.enabled**（*boolean*） -

        是否在整个 Collection 范围内启用 mmap。

    - **partitionkey.isolation**（*boolean*） -

        是否启用 Partition 键隔离。

    - **dynamicfield.enabled**（*boolean*） -

        是否启用动态字段。

    - **allow_insert_auto_id**（*boolean*） -

        启用 autoID 时，是否允许插入主键。

- **index_params**（*CreateIndexSimpleReq[]* | *CreateIndexSimpleReq*）

    索引参数。

    - **field_name**（*string*） -

        要建立索引的字段的名称。

    - **index_name**（*string*） -

        要生成的索引文件的名称。

    - **index_type**（*string*） -

        要使用的索引算法类型。

    - **metric_type**（*string*） -

        用于衡量向量嵌入之间相似性的度量类型。

    - **params**（*KeyValueObj*） -

        额外的索引相关参数，以键值对形式提供。

- **timeout**（*number*） -

    此操作的超时时长。将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

- **external_source**（*string*） -

    外部源路径。此参数适用于创建外部 Collection。

- **external_spec**（*string*） -

    外部规范配置。此参数适用于创建外部 Collection。

- **file_resource_ids**（*Array&lt;number | string&gt;*） -

    外部文件资源 ID。此参数适用于创建外部 Collection。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 promise，解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code**（*number*） -

    表示操作结果的代码。如果操作成功，该值为 **0**。

- **error_code**（*string* | *number*） -

    表示已发生错误的错误码。如果操作成功，该值为 **Success**。

- **reason**（*string*） - 

    表示所报告错误原因的说明。如果操作成功，该值为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.createCollection({
   collection_name: 'my_collection',
   fields: [
     {
       name: "vector_01",
       description: "vector field",
       data_type: DataType.FloatVector,
       type_params: {
         dim: "8"
       }
     },
     {
       name: "age",
       data_type: DataType.Int64,
       autoID: true,
       is_primary_key: true,
       description: "",
     },
   ],
 });
```
