---
title: "createCollection() | Node.js"
slug: /node/node/Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用默认设置或自定义设置创建 Collection。| Node.js"
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

displayed_sidbar: nodeSidebar
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
    id_type?: Int64 | VarChar;
    index_params?: CreateIndexParam;
    metric_type?: string;
    primary_field_name?: string;
    vector_field_name?: string;
    timeout?: number;
    external_source?: string;
    external_spec?: string;
    do_physical_backfill?: boolean;
    file_source_ids?: Array<number | string>;
 })
```

**参数：**

- **db_name** (*string*) -

    目标 Collection 所属的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    要创建的 Collection 名称。

- **dimension** (*number*) -

    向量嵌入的维度。该值应为大于 1 的整数。如果您需要自定义 Collection Schema，请跳过此参数。

- **auto_id** (*boolean*) - 

    是否在向此 Collection 插入数据时让主字段自动递增。

    默认值为 **False**。设置为 **True** 时，主字段将自动递增。在这种情况下，待插入数据中不应包含主字段，以避免错误。自动生成的 ID 长度固定且不可更改。

    此参数用于快速创建 Collection；如果 **schema** 不为 **None**，则会忽略此参数。

- **consistency_level** (*number* | *string*)

    目标 Collection 的一致性级别。

    默认值为 **Bounded**，可选值包括 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Note">

    什么是一致性级别？
    
        在分布式 Database 中，一致性特指这样一种属性：在某一时刻写入或读取数据时，确保每个节点或副本看到的数据视图相同。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认值为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** (*string)* -

    要创建的 Collection 的描述。

- **enable_dynamic_field** (*boolean)* -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    默认值为 **True**，表示使用 meta 字段。

- **id_type** (*Int64* | *VarChar*) -

    主字段的数据类型。

- **index_params** (*CreatIndexParam*) -

    要创建的 Collection 的索引参数。

- **metric_type** (*string*) -

    度量类型决定如何衡量向量嵌入之间的相似性。

- **primary_field_name** (*string*) -

    主字段的自定义名称。

- **vector_field_name** (*string*) -

    向量字段的自定义名称。

- **timeout** (number) -

    此操作的超时时长。将其设置为 **None** 表示此操作会在返回任意响应或发生错误时超时。

- **external_source** (*string*) -

    外部源路径。适用于创建外部 Collection。

- **external_spec** (*string*) -

    外部规范配置。适用于创建外部 Collection。

- **do_physical_backfill** (*boolean*) -

    是否对外部数据执行物理回填。适用于创建外部 Collection。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部文件资源 ID。适用于创建外部 Collection。

### 使用 CreateCollectionReq\{#with-createcollectionreq}

使用此请求体，您可以自定义 Collection 的 Schema 设置。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: number | string,
   description: string,
   enable_dynamic_field: boolean,
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
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
       default_value: object,
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
   timeout?: number,
   external_source?: string;
   external_spec?: string;
   do_physical_backfill?: boolean;
   file_source_ids?: Array<number | string>;
})
```

**参数：**

- **db_name** (*string*) -

    目标 Collection 所属的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    要创建的 Collection 名称。

- **consistency_level** (*number* | *string*)

    目标 Collection 的一致性级别。

    默认值为 **Bounded**，可选值包括 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Note">

    什么是一致性级别？
    
        在分布式 Database 中，一致性特指这样一种属性：在某一时刻写入或读取数据时，确保每个节点或副本看到的数据视图相同。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认值为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** (*string)* -

    要创建的 Collection 的描述。

- **enable_dynamic_field** (*boolean)* -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    默认值为 **True**，表示使用 meta 字段。

- **schema** (*FieldType[]*) -

    - **name** (*string)* -

        字段名称。

    - **data_type** (*string)* -

        字段的数据类型。有关所有可用数据类型的枚举，请参见 [DataType](./Collections-DataType)。

    - **description** (*string)* -

        字段描述。

    - **is_partition_key** (*boolean)* -

        布尔值，表示此字段是否作为 Partition 键字段。

    - **is_primary_key** (*boolean)* -

        该字段是否作为主键。

        默认值为 **False**。设置为 **True** 时，该字段将成为主键字段，并在整个 Collection 中保持唯一。

    - **is_function_output** (boolean) -

        该字段是否作为函数的输出字段。

    - **type_params** (*string* | *number)* -

        字段的其他参数。

        - **dim** (*string* | *number*) -

            保存向量嵌入的 Collection 字段的维度。

            该值应为大于 1 的整数，通常由您用于生成向量嵌入的模型决定。

        - **element_type** (string) -

            数组中元素的数据类型。

            如果当前字段是数组字段，则此参数适用。

        - **max_capacity** (*string* | *number)* -

            数组中的元素数量。

            如果当前字段是数组字段，则此参数适用。

        - **max_length** (*string*) -

            此字段中字符串的最大长度。

            当此字段的 **data_type** 为 **VarChar** 时，此参数为必需。

        - **enable_analyzer** (*boolean*) -

            是否为指定的 `VarChar` 字段启用文本分析。设置为 `true` 时，将指示 Milvus 使用文本 Analyzer，对该字段的文本内容执行分词和过滤。

        - **enable_match** (*boolean*)

            是否为指定的 `VarChar` 字段启用关键词匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，以便快速高效地进行关键词查找。`enable_match` 会与 `enable_analyzer` 配合使用，以提供结构化的基于术语的文本搜索，其中 `enable_analyzer` 负责分词，`enable_match` 负责基于这些词元执行搜索操作。

        - **analyzer_params** (*object*)

            为文本处理配置 Analyzer，特别适用于 `VarChar` 字段。此参数用于配置分词器和过滤器设置，尤其适用于 [关键词匹配](https://milvus.io/docs/keyword-match.md) 或 [全文搜索](https://milvus.io/docs/full-text-search.md) 中使用的文本字段。根据 Analyzer 的类型，可以通过以下任一方式进行配置：

            - 内置 Analyzer

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus 内置的预配置 Analyzer 类型，只需指定其名称即可开箱即用。可选值：`standard`、`english`、`chinese`。更多信息，请参见 [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md) 和 [Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md)。

            - 自定义 Analyzer

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    定义分词器类型。可选值：`standard`（默认）、`whitespace`、`jieba`。更多信息，请参见 [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md) 和 [Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md)。

                - `filter` (*list*) -

                    列出用于优化分词器生成词元的过滤器，包括内置过滤器和自定义过滤器。更多信息，请参见 [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) 等。

        - **multi_analyzer_params** (*object*) -

            为文本处理配置多个 Analyzer。该参数的值是一个 JSON 对象，用于确定 Milvus 如何为每个 Entity 选择合适的 Analyzer：

            ```javascript
            const multi_analyzer_params = {
              // Define language-specific analyzers
              // Each analyzer follows this format: <analyzer_name>: <analyzer_params>
              "analyzers": {
                "english": {"type": "english"},          // English-optimized analyzer
                "chinese": {"type": "chinese"},          // Chinese-optimized analyzer
                "default": {"tokenizer": "icu"}          // Required fallback analyzer
              },
              "by_field": "language",                    // Field determining analyzer selection
              "alias": {
                "cn": "chinese",                         // Use "cn" as shorthand for Chinese
                "en": "english"                          // Use "en" as shorthand for English
              }
            }
            ```

    - **autoID** (*boolean)* -

        是否在向此 Collection 插入数据时让主字段自动递增。

        默认值为 **False**。设置为 **True** 时，主字段将自动递增。如果您需要使用自定义 Schema 设置 Collection，请跳过此参数。

    - **nullable** (*boolean*) -

        一个布尔参数，用于指定字段是否可以接受 null 值。有效值如下：

        - **true**：字段可以包含 null 值，表示该字段是可选的，并且条目中允许缺失数据。

        - **false**（默认）：字段必须为每个 Entity 包含有效值；不允许缺失数据，因此该字段是必填的。

        更多信息，请参见 [Nullable & Default](https://milvus.io/docs/nullable-and-default.md)。

    - **default_value** (*object*)

        在创建 Collection Schema 时，为特定字段设置默认值。当您希望某些字段即使在插入数据时未显式提供值也具有初始值时，此功能特别有用。

- **functions** (*list*)

    将数据转换为向量嵌入。此函数将添加到 Collection 的 Schema 中。

    - **name** (*string*)

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description** (*string*)

        对函数用途的简要说明。这对于文档编写或在较大的项目中提高清晰度会很有帮助，默认值为空字符串。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        用于处理原始数据的函数类型。可能的值包括：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** (*string[]*)

        包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数只接受一个字段名。

    - **output_field_names** (*string[]*)

        用于存储生成嵌入的字段名称。它应与 Collection Schema 中定义的向量字段对应。对于使用 `FunctionType.BM25` 的函数，此参数只接受一个字段名。

- **num_partitions** (*number)* -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Note">

    什么是分区？
    
        数据分区是一种基于特定条件组织数据的技术。通过数据分区，您可以分别创建、加载、释放和删除各个 Partition，还可以在其中执行搜索和查询。

    </Admonition>

- **partition_key_field** (*string*) -

    用作 Partition 键的字段名称。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Partition 键？
    
        Partition 键用于根据键值将 Entity 存储到不同的 Partition 中。换句话说，Partition 键会将具有相同键的 Entity 分组在一起，因此当您按键字段进行过滤时，可以避免扫描无关的 Partition。与传统过滤方法相比，Partition 键可以大幅提升查询性能。

    </Admonition>

- **shards_num** (*number)* -

    在创建此 Collection 时要同时创建的分片数量。

    默认值为 **1**，表示会随此 Collection 一同创建一个分片。

    <Admonition type="info" icon="📘" title="Note">

    什么是分片？
    
        分片是指将写入操作分布到不同节点，以最大化利用 Milvus 集群在数据写入方面的并行计算能力。
    
        默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    Collection 的额外属性，以键值对形式指定。可能的值包括：

    - **collection.ttl.seconds** (*number*) -

        当前 Collection 的生存时间（秒）。

    - **mmap.enabled** (*boolean*) -

        是否在整个 Collection 范围内启用 mmap。

    - **partitionkey.isolation** (*boolean*) -

        是否启用 Partition 键隔离。

    - **dynamicfield.enabled** (*boolean*) -

        是否启用动态字段。

    - **allow_insert_auto_id** (*boolean*) -

        启用 autoID 时，是否允许插入主键。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示此操作会在返回任意响应或发生错误时超时。

- **external_source** (*string*) -

    外部源路径。适用于创建外部 Collection。

- **external_spec** (*string*) -

    外部规范配置。适用于创建外部 Collection。

- **do_physical_backfill** (*boolean*) -

    是否对外部数据执行物理回填。适用于创建外部 Collection。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部文件资源 ID。适用于创建外部 Collection。

### 使用 CreateCollectionWithSchemaAndIndexParamsReq\{#with-createcollectionwithschemaandindexparamsreq}

使用此请求体，您可以自定义 Collection 的 Schema 和索引设置。创建后，Collection 会自动加载。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: number | string,
   description: string,
   enable_dynamic_field: boolean,
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
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
       default_value: object
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

- **db_name** (*string*) -

    目标 Collection 所属 Database 的名称。

- **collection_name** (*string*) -

    **[必填]**

    要创建的 Collection 名称。

- **consistency_level** (*number* | *string*)

    目标 Collection 的一致性级别。

    默认值为 **Bounded**，可选值包括 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="Note">

    什么是一致性级别？
    
        在分布式 Database 中，一致性特指这样一种属性：在某一时刻写入或读取数据时，确保每个节点或副本看到的数据视图相同。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认值为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其最适合您的应用。

    </Admonition>

- **description** (*string)* -

    要创建的 Collection 的描述。

- **enable_dynamic_field** (*boolean)* -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    默认值为 **True**，表示使用 meta 字段。

- **schema** (*FieldType[]*) -

    - **name** (*string)* -

        字段名称。

    - **data_type** (*string)* -

        字段的数据类型。有关所有可用数据类型的枚举，请参见 [DataType](./Collections-DataType)。

    - **description** (*string)* -

        字段描述。

    - **is_partition_key** (*boolean)* -

        布尔值，表示此字段是否作为 Partition key 字段。

    - **is_primary_key** (*boolean)* -

        该字段是否作为主键。

    - **is_function_output** (boolean) -

        该字段是否作为函数的输出字段。

    - **type_params** (*string* | *number)* -

        字段的其他参数。

        - **dim** (*string* | *number*) -

            包含向量嵌入的 Collection 字段的维度。

            该值应为大于 1 的整数，通常由您用于生成向量嵌入的模型决定。

        - **element_type** (string) -

            数组中元素的数据类型。

            如果当前字段是数组字段，则此参数适用。

        - **max_capacity** (*string* | *number)* -

            数组中的元素个数。

            如果当前字段是数组字段，则此参数适用。

        - **max_length** (*string*) -

            此字段中字符串的最大长度。

            当此字段的 **data_type** 为 **VarChar** 时，此参数为必填。

        - **enable_analyzer** (*boolean*) -

            是否为指定的 `VarChar` 字段启用文本分析。设置为 `true` 时，会指示 Milvus 使用文本 Analyzer，对字段中的文本内容进行分词和过滤。

        - **enable_match** (*boolean*)

            是否为指定的 `VarChar` 字段启用关键词匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，从而实现快速高效的关键词查找。`enable_match` 与 `enable_analyzer` 配合使用，可提供结构化的基于术语的文本搜索，其中 `enable_analyzer` 负责分词，`enable_match` 负责对这些词元执行搜索操作。

        - **analyzer_params** (*object*)

            配置用于文本处理的 Analyzer，特别适用于 `VarChar` 字段。此参数用于配置分词器和过滤器设置，尤其适用于 [keyword matching](https://milvus.io/docs/keyword-match.md) 或 [full text search](https://milvus.io/docs/full-text-search.md) 中使用的文本字段。根据 Analyzer 的类型，可通过以下任一方式进行配置：

            - 内置 Analyzer

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus 内置的预配置 Analyzer 类型，只需指定其名称即可开箱即用。可能的值包括：`standard`、`english`、`chinese`。更多信息请参见 [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md) 和 [Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md)。

            - 自定义 Analyzer

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    定义分词器类型。可能的值包括：`standard`（默认）、`whitespace`、`jieba`。更多信息请参见 [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md) 和 [Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md)。

                - `filter` (*list*) -

                    列出用于优化分词器生成词元的过滤器，可选择内置过滤器和自定义过滤器。更多信息请参见 [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) 等。

        - **multi_analyzer_params** (*object*) -

            配置多个 Analyzer 用于文本处理。该参数的值是一个 JSON 对象，用于确定 Milvus 如何为每个 Entity 选择合适的 Analyzer：

            ```javascript
            const multi_analyzer_params = {
              // Define language-specific analyzers
              // Each analyzer follows this format: <analyzer_name>: <analyzer_params>
              "analyzers": {
                "english": {"type": "english"},          // English-optimized analyzer
                "chinese": {"type": "chinese"},          // Chinese-optimized analyzer
                "default": {"tokenizer": "icu"}          // Required fallback analyzer
              },
              "by_field": "language",                    // Field determining analyzer selection
              "alias": {
                "cn": "chinese",                         // Use "cn" as shorthand for Chinese
                "en": "english"                          // Use "en" as shorthand for English
              }
            }
            ```

    - **autoID** (*boolean)* -

        向此 Collection 插入数据时，主字段是否自动递增。

        默认值为 **False**。将其设置为 **True** 会使主字段自动递增。如果您需要创建具有自定义 Schema 的 Collection，请跳过此参数。

    - **nullable** (*boolean*) -

        用于指定字段是否可接受空值的布尔参数。有效值如下：

        - **true**：字段可包含空值，表示该字段为可选字段，条目允许缺失数据。

        - **false**（默认）：字段必须为每个 Entity 包含有效值；不允许缺失数据，因此该字段为必填字段。

        更多信息请参见 [Nullable & Default](https://milvus.io/docs/nullable-and-default.md)。

    - **default_value** (*[DataType](./Collections-DataType)*)

        在创建 Collection Schema 时，为特定字段设置默认值。当您希望某些字段即使在插入数据时未显式提供值，也能具有初始值时，此功能特别有用。

- **functions** (*list*)

    将数据转换为向量嵌入。此函数将被添加到 Collection 的 Schema 中。

    - **name** (*string*)

        函数名称。此标识符用于在查询和 Collection 中引用该函数。

    - **description** (*string*)

        对函数用途的简要说明。这有助于文档编写或提升大型项目中的清晰度，默认值为空字符串。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        用于处理原始数据的函数类型。可能的值如下：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** (*string[]*)

        包含需要转换为向量表示形式的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

    - **output_field_names** (*string[]*)

        用于存储生成嵌入的字段名称。该字段应与 Collection Schema 中定义的向量字段对应。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

- **num_partitions** (*number)* -

    要在 Collection 中创建的 Partition 数量。

    <Admonition type="info" icon="📘" title="Note">

    什么是分区？
    
        数据分区是一种基于特定条件组织数据的技术。借助数据分区，您可以分别创建、加载、释放和删除 Partition，也可以在其中执行搜索和查询。

    </Admonition>

- **partition_key_field** (*boolean)* -

    布尔值，表示是否启用 Partition key。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Partition key？
    
        Partition key 用于根据键值将 Entity 存储到不同的 Partition 中。换句话说，Partition key 会将具有相同键的 Entity 分组在一起，因此在按键字段过滤时，可以避免扫描无关的 Partition。与传统过滤方法相比，Partition key 可以大幅提升查询性能。

    </Admonition>

- **shards_num** (*number)* -

    创建此 Collection 时一并创建的分片数量。

    默认值为 **1**，表示创建此 Collection 时会同时创建一个分片。

    <Admonition type="info" icon="📘" title="Note">

    什么是分片？
    
        分片是指将写入操作分配到不同节点，以充分利用 Milvus 集群在数据写入方面的并行计算能力。
    
        默认情况下，一个 Collection 包含一个分片。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    Collection 的附加属性，以键值对形式提供。可能的值包括：

    - **collection.ttl.seconds** (*number*) -

        当前 Collection 的生存时间（TTL），单位为秒。

    - **mmap.enabled** (*boolean*) -

        是否在整个 Collection 范围内启用 mmap。

    - **partitionkey.isolation** (*boolean*) -

        是否启用 Partition key 隔离。

    - **dynamicfield.enabled** (*boolean*) -

        是否启用动态字段。

    - **allow_insert_auto_id** (*boolean*) -

        启用 autoID 时，是否允许插入主键。

- **index_params** (*CreateIndexSimpleReq[]* | *CreateIndexSimpleReq*)

    索引参数。

    - **field_name** (*string*) -

        要建立索引的字段名称。

    - **index_name** (*string*) -

        要生成的索引文件名称。

    - **index_type** (*string*) -

        要使用的索引算法类型。

    - **metric_type** (*string*) -

        用于衡量向量嵌入之间相似度的度量类型。

    - **params** (*KeyValueObj*) -

        额外的索引相关参数，以键值对形式提供。

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

- **external_source** (*string*) -

    外部源路径。此参数适用于创建外部 Collection。

- **external_spec** (*string*) -

    外部规范配置。此参数适用于创建外部 Collection。

- **do_physical_backfill** (*boolean*) -

    是否对外部数据执行物理回填。此参数适用于创建外部 Collection。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部文件资源 ID。此参数适用于创建外部 Collection。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果操作成功，该值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果操作成功，该值为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果操作成功，该值为空字符串。

## 示例\{#example}

```java
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

