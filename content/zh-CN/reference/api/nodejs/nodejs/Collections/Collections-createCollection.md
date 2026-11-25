---
title: "createCollection() | Node.js"
slug: /node/node/Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会使用默认或自定义设置创建 Collection。 | Node.js"
type: docx
token: KPZZd2TiAodSeWxUdlJciHGcnbg
sidebar_position: 5
keywords: 
  - 视频相似度搜索
  - 向量检索
  - 音频相似度搜索
  - 弹性向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - createCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# createCollection()

此操作会使用默认或自定义设置创建 Collection。

```javascript
await milvusClient.createCollection(data)
```

## 请求语法\{#request-syntax}

此方法提供了以下替代方式。

### 使用 CreateColReq\{#with-createcolreq}

使用此请求体时，您只需设置 Collection 名称和向量字段维度即可创建 Collection。

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

- **db_name** （*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name** （*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **dimension** （*number*） -

    **[必需]**

    向量嵌入的维度。该值应为大于 1 的整数。如果需要自定义 Collection Schema，请跳过此参数。

- **auto_id** （*boolean*） - 

    主键字段是否在向此 Collection 插入数据时自动递增。

    该值默认为 **False**。将其设置为 **True** 会使主键字段自动递增。在这种情况下，为避免出错，插入的数据中不应包含主键字段。自动生成的 ID 具有固定长度，且无法更改。

    此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**（即提供了 Schema），则会忽略此参数。

- **consistency_level** （*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    分布式 Database 中的一致性特指一种属性，即确保每个节点或副本在给定时间写入或读取数据时具有相同的数据视图。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似度搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** （*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field** （*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **enableDynamicField** （*boolean*） -

    **enable_dynamic_field** 的别名。

- **id_type** （*Int64* | *VarChar*） -

    主键字段的数据类型。

- **index_params** （*CreateIndexParam*） -

    要创建的 Collection 的索引参数。

- **metric_type** （*string* | *MetricType*） -

    度量类型决定如何度量向量嵌入之间的相似度。

- **primary_field_name** （*string*） -

    主键字段的自定义名称。

- **vector_field_name** （*string*） -

    向量字段的自定义名称。

- **timeout** （number） -

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

### 使用 CreateCollectionReq\{#with-createcollectionreq}

使用此请求体时，您可以自定义 Collection 的 Schema 设置。

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

<NextChannel action="exclude">

- **db_name** （*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name** （*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **consistency_level** （*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    分布式 Database 中的一致性特指一种属性，即确保每个节点或副本在给定时间写入或读取数据时具有相同的数据视图。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似度搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** （*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field** （*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **schema**（Schema）（*[FieldType](./Collections-FieldType)[]*） -

    作为字段定义列表的 Collection Schema。

- **fields** （*[FieldType](./Collections-FieldType)[]*） -

    **schema**（Schema）的替代项，以字段定义列表的形式列出 Collection 的字段。

- **functions** （*[FunctionObject](./Collections-FunctionObject)[]*）

    将数据转换为向量嵌入。此函数将添加到 Collection 的 Schema 中。

    - **name** （*string*）

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description** （*string*）

        函数用途的简要说明。这对于文档或大型项目中的清晰性可能很有用，默认为空字符串。

    - **type** （*[FunctionType](./Collections-FunctionType)*）

        用于处理原始数据的函数类型。可选值：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** （*string[]*）

        包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

    - **output_field_names** （*string[]*）

        用于存储所生成嵌入的字段名称。这应与 Collection Schema 中定义的向量字段相对应。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- **num_partitions** （*number*） -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Notes">
    
    数据分区是一种根据特定条件组织数据的技术。通过数据分区，您可以分别创建、加载、释放和删除 Partition，并在其中执行搜索和查询。

    </Admonition>

- **partition_key_field** （*string*） -

    用作 Partition 键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Partition 键用于根据 Entity 的键值将其存储到不同的 Partition 中。换言之，Partition 键会将键相同的 Entity 归为一组，并且在您使用该键字段进行过滤时，可以避免扫描不相关的 Partition。与传统过滤方法相比，Partition 键可以显著提升查询性能。

    </Admonition>

- **clustering_key_field** （*string*） -

    用作聚类键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction 是 Milvus 中的一项功能，它会根据标量字段中的值在 Collection 的各 Segment 之间重新分配 Entity。要启用此功能，您首先需要选择一个标量字段作为聚类键。这样，当 Entity 的聚类键值落在特定范围内时，Milvus 就可以将这些 Entity 重新分配到某个 Segment 中。当您触发 Clustering Compaction 时，Milvus 会生成或更新（generates/updates）名为 PartitionStats 的全局索引，该索引记录 Segment 与聚类键值之间的映射关系。

    </Admonition>

- **shards_num** （*number*） -

    创建此 Collection 时同时要创建的分片数量。

    该值默认为 **1**，表示在创建此 Collection 时同时创建一个分片。

    <Admonition type="info" icon="📘" title="Notes">
    
    分片是指将写操作分配到不同节点，以充分利用 Milvus 集群写入数据时的并行计算能力。
    
    默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** （Record&lt;string, string | number | boolean&gt;） 

    以键值对形式表示的 Collection 额外属性。可选值：

    - **collection.ttl.seconds** （*number*） -

        当前 Collection 的生存时间，以秒为单位。

    - **mmap.enabled** （*boolean*） -

        是否在 Collection 范围内启用 mmap。

    - **partitionkey.isolation** （*boolean*） -

        是否启用 Partition 键隔离。

    - **dynamicfield.enabled** （*boolean*） -

        是否启用动态字段。

    - **allow_insert_auto_id** （*boolean*） -

        启用 autoID 时是否允许插入主键。

- **timeout** （*float* | *None*） -

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

- **external_source** （*string*） -

    外部源路径。此参数适用于创建外部 Collection。

    在 Zilliz Cloud 上，`external_source` 接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。`milvus://` 方案指向同一项目和区域中另一个与 Milvus v3.0.x 兼容的集群上的 Collection；该方案必须为小写，三个 Segment 均为必需，并且允许一个末尾斜杠。创建外部 Collection 时，此参数为必需项。

- **external_spec** （*string*） -

    外部规格配置。此参数适用于创建外部 Collection。

    在 Zilliz Cloud 上，创建外部 Collection 时 `external_spec` 为可选项：对于 `milvus://` 源，省略此项会将 `format` 默认为 `milvus-table`；对于其他源，请提供具有匹配 `format` 的规格（`parquet`、`vortex`、`lance-table`、`iceberg-table`）。

- **file_resource_ids** （*Array&lt;number | string&gt;*） -

    外部文件资源 ID。此参数适用于创建外部 Collection。

</NextChannel>

<NextChannel action="include">

- **db_name** （*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name** （*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **consistency_level** （*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    分布式 Database 中的一致性特指一种属性，即确保每个节点或副本在给定时间写入或读取数据时具有相同的数据视图。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似度搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** （*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field** （*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **schema**（Schema）（*[FieldType](./Collections-FieldType)[]*） -

    作为字段定义列表的 Collection Schema。

- **fields** （*[FieldType](./Collections-FieldType)[]*） -

    **schema**（Schema）的替代项，以字段定义列表的形式列出 Collection 的字段。

- **functions** （*[FunctionObject](./Collections-FunctionObject)[]*）

    将数据转换为向量嵌入。此函数将添加到 Collection 的 Schema 中。

    - **name** （*string*）

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description** （*string*）

        函数用途的简要说明。这对于文档或大型项目中的清晰性可能很有用，默认为空字符串。

    - **type** （*[FunctionType](./Collections-FunctionType)*）

        用于处理原始数据的函数类型。可选值：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** （*string[]*）

        包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

    - **output_field_names** （*string[]*）

        用于存储所生成嵌入的字段名称。这应与 Collection Schema 中定义的向量字段相对应。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- **num_partitions** （*number*） -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Notes">
    
    数据分区是一种根据特定条件组织数据的技术。通过数据分区，您可以分别创建、加载、释放和删除 Partition，并在其中执行搜索和查询。

    </Admonition>

- **partition_key_field** （*string*） -

    用作 Partition 键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Partition 键用于根据 Entity 的键值将其存储到不同的 Partition 中。换言之，Partition 键会将键相同的 Entity 归为一组，并且在您使用该键字段进行过滤时，可以避免扫描不相关的 Partition。与传统过滤方法相比，Partition 键可以显著提升查询性能。

    </Admonition>

- **clustering_key_field** （*string*） -

    用作聚类键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction 是 Milvus 中的一项功能，它会根据标量字段中的值在 Collection 的各 Segment 之间重新分配 Entity。要启用此功能，您首先需要选择一个标量字段作为聚类键。这样，当 Entity 的聚类键值落在特定范围内时，Milvus 就可以将这些 Entity 重新分配到某个 Segment 中。当您触发 Clustering Compaction 时，Milvus 会生成或更新（generates/updates）名为 PartitionStats 的全局索引，该索引记录 Segment 与聚类键值之间的映射关系。

    </Admonition>

- **shards_num** （*number*） -

    创建此 Collection 时同时要创建的分片数量。

    该值默认为 **1**，表示在创建此 Collection 时同时创建一个分片。

    <Admonition type="info" icon="📘" title="Notes">
    
    分片是指将写操作分配到不同节点，以充分利用 Milvus 集群写入数据时的并行计算能力。
    
    默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** （Record&lt;string, string | number | boolean&gt;） 

    以键值对形式表示的 Collection 额外属性。可选值：

    - **collection.ttl.seconds** （*number*） -

        当前 Collection 的生存时间，以秒为单位。

    - **mmap.enabled** （*boolean*） -

        是否在 Collection 范围内启用 mmap。

    - **partitionkey.isolation** （*boolean*） -

        是否启用 Partition 键隔离。

    - **dynamicfield.enabled** （*boolean*） -

        是否启用动态字段。

    - **allow_insert_auto_id** （*boolean*） -

        启用 autoID 时是否允许插入主键。

- **timeout** （*float* | *None*） -

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

- **external_source** （*string*） -

    外部源路径。此参数适用于创建外部 Collection。

    在 Zilliz Cloud 上，`external_source` 接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。`milvus://` 方案指向同一项目和区域中另一个与 Milvus v3.0.x 兼容的集群上的 Collection；该方案必须为小写，三个 Segment 均为必需，并且允许一个末尾斜杠。创建外部 Collection 时，此参数为必需项。

- **external_spec** （*string*） -

    外部规格配置。此参数适用于创建外部 Collection。

    该规范是一个包含 `format` 等次级参数的 JSON 字符串。`format` 的可选值为 `parquet`、`vortex`、`lance-table`、`iceberg-table` 和 `milvus-table`。对于 `milvus-table`，请将 `external_source` 设置为 Milvus 快照元数据 JSON 路径，例如 `s3://bucket/snapshots/{collection_id}/metadata/{snapshot_id}.json`。

    在 Zilliz Cloud 上，创建外部 Collection 时 `external_spec` 为可选项：对于 `milvus://` 源，省略此项会将 `format` 默认为 `milvus-table`；对于其他源，请提供具有匹配 `format` 的规格（`parquet`、`vortex`、`lance-table`、`iceberg-table`）。

- **file_resource_ids** （*Array&lt;number | string&gt;*） -

    外部文件资源 ID。此参数适用于创建外部 Collection。

</NextChannel>

### 使用 CreateColWithSchemaAndIndexParamsReq\{#with-createcolwithschemaandindexparamsreq}

使用此请求体时，您可以自定义 Collection 的 Schema 和索引设置。创建后，Collection 会自动加载。

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

<NextChannel action="exclude">

- **db_name** （*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name** （*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **consistency_level** （*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    分布式 Database 中的一致性特指一种属性，即确保每个节点或副本在给定时间写入或读取数据时具有相同的数据视图。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似度搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** （*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field** （*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **schema**（Schema）（*[FieldType](./Collections-FieldType)[]*） -

    作为字段定义列表的 Collection Schema。

- **fields** （*[FieldType](./Collections-FieldType)[]*） -

    **schema**（Schema）的替代项，以字段定义列表的形式列出 Collection 的字段。

- **functions** （*[FunctionObject](./Collections-FunctionObject)[]*）

    将数据转换为向量嵌入。此函数将添加到 Collection 的 Schema 中。

    - **name** （*string*）

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description** （*string*）

        函数用途的简要说明。这对于文档或大型项目中的清晰性可能很有用，默认为空字符串。

    - **type** （*[FunctionType](./Collections-FunctionType)*）

        用于处理原始数据的函数类型。可选值：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** （*string[]*）

        包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

    - **output_field_names** （*string[]*）

        用于存储所生成嵌入的字段名称。这应与 Collection Schema 中定义的向量字段相对应。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- **num_partitions** （*number*） -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Notes">
    
    数据分区是一种根据特定条件组织数据的技术。通过数据分区，您可以分别创建、加载、释放和删除 Partition，并在其中执行搜索和查询。

    </Admonition>

- **partition_key_field** （*string*） -

    用作 Partition 键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Partition 键用于根据 Entity 的键值将其存储到不同的 Partition 中。换言之，Partition 键会将键相同的 Entity 归为一组，并且在您使用该键字段进行过滤时，可以避免扫描不相关的 Partition。与传统过滤方法相比，Partition 键可以显著提升查询性能。

    </Admonition>

- **clustering_key_field** （*string*） -

    用作聚类键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction 是 Milvus 中的一项功能，它会根据标量字段中的值在 Collection 的各 Segment 之间重新分配 Entity。要启用此功能，您首先需要选择一个标量字段作为聚类键。这样，当 Entity 的聚类键值落在特定范围内时，Milvus 就可以将这些 Entity 重新分配到某个 Segment 中。当您触发 Clustering Compaction 时，Milvus 会生成或更新（generates/updates）名为 PartitionStats 的全局索引，该索引记录 Segment 与聚类键值之间的映射关系。

    </Admonition>

- **shards_num** （*number*） -

    创建此 Collection 时同时要创建的分片数量。

    该值默认为 **1**，表示在创建此 Collection 时同时创建一个分片。

    <Admonition type="info" icon="📘" title="Notes">
    
    分片是指将写操作分配到不同节点，以充分利用 Milvus 集群写入数据时的并行计算能力。
    
    默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** （Record&lt;string, string | number | boolean&gt;） 

    以键值对形式表示的 Collection 额外属性。可选值：

    - **collection.ttl.seconds** （*number*） -

        当前 Collection 的生存时间，以秒为单位。

    - **mmap.enabled** （*boolean*） -

        是否在 Collection 范围内启用 mmap。

    - **partitionkey.isolation** （*boolean*） -

        是否启用 Partition 键隔离。

    - **dynamicfield.enabled** （*boolean*） -

        是否启用动态字段。

    - **allow_insert_auto_id** （*boolean*） -

        启用 autoID 时是否允许插入主键。

- **index_params** （*CreateIndexSimpleReq[]* | *CreateIndexSimpleReq*）

    索引参数。

    - **field_name** （*string*） -

        要索引的字段名称。

    - **index_name** （*string*） -

        要生成的索引文件名称。

    - **index_type** （*string*） -

        要使用的索引算法类型。

    - **metric_type** （*string*） -

        用于度量向量嵌入之间相似度的度量类型。

    - **params** （*KeyValueObj*） -

        以键值对形式表示的额外索引相关参数。

- **timeout** （*number*） -

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

- **external_source** （*string*） -

    外部源路径。此参数适用于创建外部 Collection。

    在 Zilliz Cloud 上，`external_source` 接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。`milvus://` 方案指向同一项目和区域中另一个与 Milvus v3.0.x 兼容的集群上的 Collection；该方案必须为小写，三个 Segment 均为必需，并且允许一个末尾斜杠。创建外部 Collection 时，此参数为必需项。

- **external_spec** （*string*） -

    外部规格配置。此参数适用于创建外部 Collection。

    在 Zilliz Cloud 上，创建外部 Collection 时 `external_spec` 为可选项：对于 `milvus://` 源，省略此项会将 `format` 默认为 `milvus-table`；对于其他源，请提供具有匹配 `format` 的规格（`parquet`、`vortex`、`lance-table`、`iceberg-table`）。

- **file_resource_ids** （*Array&lt;number | string&gt;*） -

    外部文件资源 ID。此参数适用于创建外部 Collection。

</NextChannel>

<NextChannel action="include">

- **db_name** （*string*） -

    目标 Collection 所属的 Database 名称。

- **collection_name** （*string*） -

    **[必需]**

    要创建的 Collection 名称。

- **consistency_level** （*string*）

    目标 Collection 的一致性级别。

    该值默认为 **Bounded**，可选值为 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Notes">
    
    分布式 Database 中的一致性特指一种属性，即确保每个节点或副本在给定时间写入或读取数据时具有相同的数据视图。
    
    Milvus 支持四种一致性级别：**Strong**、**Bounded Staleness**、**Session** 和 **Eventually**。Milvus 中的默认一致性级别为 **Bounded Staleness**。
    
    在执行向量相似度搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** （*string*） -

    要创建的 Collection 的描述。

- **enable_dynamic_field** （*boolean*） -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    该值默认为 **True**，表示使用 meta 字段。

- **schema**（Schema）（*[FieldType](./Collections-FieldType)[]*） -

    作为字段定义列表的 Collection Schema。

- **fields** （*[FieldType](./Collections-FieldType)[]*） -

    **schema**（Schema）的替代项，以字段定义列表的形式列出 Collection 的字段。

- **functions** （*[FunctionObject](./Collections-FunctionObject)[]*）

    将数据转换为向量嵌入。此函数将添加到 Collection 的 Schema 中。

    - **name** （*string*）

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description** （*string*）

        函数用途的简要说明。这对于文档或大型项目中的清晰性可能很有用，默认为空字符串。

    - **type** （*[FunctionType](./Collections-FunctionType)*）

        用于处理原始数据的函数类型。可选值：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** （*string[]*）

        包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

    - **output_field_names** （*string[]*）

        用于存储所生成嵌入的字段名称。这应与 Collection Schema 中定义的向量字段相对应。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- **num_partitions** （*number*） -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Notes">
    
    数据分区是一种根据特定条件组织数据的技术。通过数据分区，您可以分别创建、加载、释放和删除 Partition，并在其中执行搜索和查询。

    </Admonition>

- **partition_key_field** （*string*） -

    用作 Partition 键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Partition 键用于根据 Entity 的键值将其存储到不同的 Partition 中。换言之，Partition 键会将键相同的 Entity 归为一组，并且在您使用该键字段进行过滤时，可以避免扫描不相关的 Partition。与传统过滤方法相比，Partition 键可以显著提升查询性能。

    </Admonition>

- **clustering_key_field** （*string*） -

    用作聚类键的字段名称。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction 是 Milvus 中的一项功能，它会根据标量字段中的值在 Collection 的各 Segment 之间重新分配 Entity。要启用此功能，您首先需要选择一个标量字段作为聚类键。这样，当 Entity 的聚类键值落在特定范围内时，Milvus 就可以将这些 Entity 重新分配到某个 Segment 中。当您触发 Clustering Compaction 时，Milvus 会生成或更新（generates/updates）名为 PartitionStats 的全局索引，该索引记录 Segment 与聚类键值之间的映射关系。

    </Admonition>

- **shards_num** （*number*） -

    创建此 Collection 时同时要创建的分片数量。

    该值默认为 **1**，表示在创建此 Collection 时同时创建一个分片。

    <Admonition type="info" icon="📘" title="Notes">
    
    分片是指将写操作分配到不同节点，以充分利用 Milvus 集群写入数据时的并行计算能力。
    
    默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** （Record&lt;string, string | number | boolean&gt;） 

    以键值对形式表示的 Collection 额外属性。可选值：

    - **collection.ttl.seconds** （*number*） -

        当前 Collection 的生存时间，以秒为单位。

    - **mmap.enabled** （*boolean*） -

        是否在 Collection 范围内启用 mmap。

    - **partitionkey.isolation** （*boolean*） -

        是否启用 Partition 键隔离。

    - **dynamicfield.enabled** （*boolean*） -

        是否启用动态字段。

    - **allow_insert_auto_id** （*boolean*） -

        启用 autoID 时是否允许插入主键。

- **index_params** （*CreateIndexSimpleReq[]* | *CreateIndexSimpleReq*）

    索引参数。

    - **field_name** （*string*） -

        要索引的字段名称。

    - **index_name** （*string*） -

        要生成的索引文件名称。

    - **index_type** （*string*） -

        要使用的索引算法类型。

    - **metric_type** （*string*） -

        用于度量向量嵌入之间相似度的度量类型。

    - **params** （*KeyValueObj*） -

        以键值对形式表示的额外索引相关参数。

- **timeout** （*number*） -

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

- **external_source** （*string*） -

    外部源路径。此参数适用于创建外部 Collection。

    在 Zilliz Cloud 上，`external_source` 接受两种方案：`volume://<volume_name>/<path>` 和 `milvus://<instance_id>/<db_name>/<collection_name>`。`milvus://` 方案指向同一项目和区域中另一个与 Milvus v3.0.x 兼容的集群上的 Collection；该方案必须为小写，三个 Segment 均为必需，并且允许一个末尾斜杠。创建外部 Collection 时，此参数为必需项。

- **external_spec** （*string*） -

    外部规格配置。此参数适用于创建外部 Collection。

    该规范是一个包含 `format` 等次级参数的 JSON 字符串。`format` 的可选值为 `parquet`、`vortex`、`lance-table`、`iceberg-table` 和 `milvus-table`。对于 `milvus-table`，请将 `external_source` 设置为 Milvus 快照元数据 JSON 路径，例如 `s3://bucket/snapshots/{collection_id}/metadata/{snapshot_id}.json`。

    在 Zilliz Cloud 上，创建外部 Collection 时 `external_spec` 为可选项：对于 `milvus://` 源，省略此项会将 `format` 默认为 `milvus-table`；对于其他源，请提供具有匹配 `format` 的规格（`parquet`、`vortex`、`lance-table`、`iceberg-table`）。

- **file_resource_ids** （*Array&lt;number | string&gt;*） -

    外部文件资源 ID。此参数适用于创建外部 Collection。

</NextChannel>

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 Promise，其解析结果为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** （*number*） -

    指示操作结果的代码。如果此操作成功，该值保持为 **0**。

- **error_code** （*string* | *number*） -

    指示所发生错误的错误代码。如果此操作成功，该值保持为 **Success**。

- **reason** （*string*） - 

    指示所报告错误原因的字符串。如果此操作成功，该值保持为空字符串。

**异常：**

- **Error**

    此操作期间发生任何错误时，会引发此异常。

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
