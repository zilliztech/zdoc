---
title: "createCollection() | Node.js"
slug: /node/node/Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作可使用默认或自定义设置创建集合。 | Node.js"
type: docx
token: KPZZd2TiAodSeWxUdlJciHGcnbg
sidebar_position: 5
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量数据库
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

此操作可使用默认或自定义设置创建集合。 

```javascript
await milvusClient.createCollection(data)
```

## 请求语法\{#request-syntax}

此方法有以下几种形式。

### 使用 CreateColReq\{#with-createcolreq}

使用此请求体时，你只需设置集合名称和向量字段的维度即可创建集合。

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

    目标集合所属数据库的名称。

- **collection_name** (*string*) -

    **[必填]**

    要创建的集合名称。

- **dimension** (*number*) -

    向量嵌入的维度。该值应为大于 1 的整数。如果你需要自定义集合 schema，请跳过此参数。

- **auto_id** (*boolean*) - 

    是否在向该集合插入数据时让主字段自动递增。

    默认值为 **False**。设置为 **True** 时，主字段将自动递增。在这种情况下，为避免报错，待插入数据中不应包含主字段。自动生成的 ID 具有固定长度，且无法更改。

    此参数用于快速创建集合；如果 **schema** 不为 **None**，则会忽略此参数。

- **consistency_level** (*number* | *string*)

    目标集合的一致性级别。

    默认值为 **Bounded**，可选值包括 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="说明">

    什么是一致性级别？
    
        在分布式数据库中，一致性特指这样一种属性：在某一时刻进行数据写入或读取时，确保每个节点或副本看到的数据视图相同。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认级别为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，你可以轻松调整一致性级别，使其更适合你的应用场景。

    </Admonition>

- **description** (*string)* -

    要创建的集合描述。

- **enable_dynamic_field** (*boolean)* -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    默认值为 **True**，表示使用 meta 字段。

- **id_type** (*Int64* | *VarChar*) -

    主字段的数据类型。

- **index_params** (*CreatIndexParam*) -

    要创建的集合的索引参数。

- **metric_type** (*string*) -

    度量类型决定了如何衡量向量嵌入之间的相似度。

- **primary_field_name** (*string*) -

    主字段的自定义名称。

- **vector_field_name** (*string*) -

    向量字段的自定义名称。

- **timeout** (number) -

    此操作的超时时长。设置为 **None** 表示此操作会在任意响应返回或发生错误时超时。

- **external_source** (*string*) -

    外部源路径。适用于创建外部集合。

- **external_spec** (*string*) -

    外部规格配置。适用于创建外部集合。

- **do_physical_backfill** (*boolean*) -

    是否对外部数据执行物理回填。适用于创建外部集合。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部文件资源 ID。适用于创建外部集合。

### 使用 CreateCollectionReq\{#with-createcollectionreq}

使用此请求体时，你可以自定义集合的 schema 设置。

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

    目标集合所属数据库的名称。

- **collection_name** (*string*) -

    **[必填]**

    要创建的集合名称。

- **consistency_level** (*number* | *string*)

    目标集合的一致性级别。

    默认值为 **Bounded**，可选值包括 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="说明">

    什么是一致性级别？
    
        在分布式数据库中，一致性特指这样一种属性：在某一时刻进行数据写入或读取时，确保每个节点或副本看到的数据视图相同。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认级别为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，你可以轻松调整一致性级别，使其更适合你的应用场景。

    </Admonition>

- **description** (*string)* -

    要创建的集合描述。

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

        一个布尔值，表示该字段是否将作为分区键字段。

    - **is_primary_key** (*boolean)* -

        该字段是否作为主键。

        默认值为 **False**。设置为 **True** 时，该字段将成为在整个集合中唯一的主键字段。

    - **is_function_output** (boolean) -

        该字段是否作为函数的输出字段。

    - **type_params** (*string* | *number)* -

        字段的其他参数。

        - **dim** (*string* | *number*) -

            保存向量嵌入的集合字段的维度。 

            该值应为大于 1 的整数，通常由你用于生成向量嵌入的模型决定。

        - **element_type** (string) -

            数组中元素的数据类型。 

            当当前字段为数组字段时适用此参数。

        - **max_capacity** (*string* | *number)* -

            数组中的元素数量。

            当当前字段为数组字段时适用此参数。

        - **max_length** (*string*) -

            该字段中字符串的最大长度。

            当此字段的 **data_type** 为 **VarChar** 时，此参数为必填。

        - **enable_analyzer** (*boolean*) -

            是否为指定的 `VarChar` 字段启用文本分析。设置为 `true` 时，将指示 Milvus 使用文本分析器，对该字段中的文本内容进行分词和过滤。

        - **enable_match** (*boolean*)

            是否为指定的 `VarChar` 字段启用关键词匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，从而支持快速高效的关键词查找。`enable_match` 与 `enable_analyzer` 配合使用，可提供结构化的基于词项的文本搜索，其中 `enable_analyzer` 负责分词，`enable_match` 负责在这些词元上执行搜索操作。

        - **analyzer_params** (*object*)

            配置用于文本处理的分析器，特别适用于 `VarChar` 字段。此参数用于配置分词器和过滤器设置，尤其适用于 [keyword matching](https://milvus.io/docs/keyword-match.md) 或 [full text search](https://milvus.io/docs/full-text-search.md) 中使用的文本字段。根据分析器类型，可使用以下任一方式进行配置：

            - 内置分析器

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus 内置的预配置分析器类型，可通过指定其名称直接使用。可选值：`standard`、`english`、`chinese`。更多信息请参见 [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md) 和 [Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md)。

            - 自定义分析器

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    定义分词器类型。可选值：`standard`（默认）、`whitespace`、`jieba`。更多信息请参见 [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md) 和 [Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md)。

                - `filter` (*list*) -

                    列出用于优化分词器生成词元的过滤器，支持内置过滤器和自定义过滤器。更多信息请参见 [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) 等。

        - **multi_analyzer_params** (*object*) -

            配置多个用于文本处理的分析器。此参数的值是单个 JSON 对象，用于确定 Milvus 如何为每个实体选择合适的分析器：

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

        是否在向该集合插入数据时让主字段自动递增。

        默认值为 **False**。设置为 **True** 时，主字段将自动递增。如果你需要设置自定义 schema 的集合，请跳过此参数。

    - **nullable** (*boolean*) -

        一个布尔参数，用于指定字段是否可接受空值。有效值如下：

        - **true**：字段可以包含空值，表示该字段为可选字段，允许条目中缺少该数据。

        - **false**（默认）：字段在每个实体中都必须包含有效值；不允许缺少数据，因此该字段为必填。

        更多信息请参见 [Nullable & Default](https://milvus.io/docs/nullable-and-default.md)。

    - **default_value** (*object*)

        在创建集合 schema 时，为其中某个特定字段设置默认值。当你希望某些字段即使在插入数据时未显式提供值，也拥有初始值时，这一功能尤其有用。

- **functions** (*list*)

    将数据转换为向量嵌入。此函数将被添加到集合的 schema 中。

    - **name** (*string*)

        函数名称。此标识符用于在查询和集合中引用该函数。

    - **description** (*string*)

        对函数用途的简要说明。这在较大的项目中有助于文档编写或提升可读性，默认值为空字符串。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        用于处理原始数据的函数类型。可选值：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** (*string[]*)

        包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

    - **output_field_names** (*string[]*)

        用于存储生成嵌入的字段名称。该字段应对应于集合 schema 中定义的向量字段。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

- **num_partitions** (*number)* -

    要在集合中创建的分区数量。

    <Admonition type="info" icon="📘" title="说明">

    什么是分区？
    
        数据分区是一种基于特定条件组织数据的技术。使用数据分区后，你可以分别创建、加载、释放和删除分区，也可以在分区内执行搜索和查询。

    </Admonition>

- **partition_key_field** (*string*) -

    作为分区键的字段名称。

    <Admonition type="info" icon="📘" title="说明">

    什么是分区键？
    
        分区键用于根据实体的键值将实体存储到不同分区中。换句话说，分区键会将具有相同键的实体归入同一组；当你按该键字段进行过滤时，无关分区可避免被扫描。与传统过滤方式相比，分区键可以显著提升查询性能。

    </Admonition>

- **shards_num** (*number)* -

    创建此集合时要一同创建的分片数量。 

    默认值为 **1**，表示会随此集合一起创建一个分片。

    <Admonition type="info" icon="📘" title="说明">

    什么是分片？
    
        分片是指将写操作分发到不同节点，以充分利用 Milvus 集群在数据写入方面的并行计算能力。
    
        默认情况下，一个集合包含一个分片。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    集合的额外属性，以键值对形式表示。可选值包括：

    - **collection.ttl.seconds** (*number*) -

        当前集合的存活时间（TTL），单位为秒。

    - **mmap.enabled** (*boolean*) -

        是否在整个集合范围内启用 mmap。

    - **partitionkey.isolation** (*boolean*) -

        是否启用分区键隔离。

    - **dynamicfield.enabled** (*boolean*) -

        是否启用动态字段。

    - **allow_insert_auto_id** (*boolean*) -

        在启用 autoID 时，是否允许插入主键。

- **timeout** (*float* | *None*) -

    此操作的超时时长。设置为 **None** 表示此操作会在任意响应返回或发生错误时超时。

- **external_source** (*string*) -

    外部源路径。适用于创建外部集合。

- **external_spec** (*string*) -

    外部规格配置。适用于创建外部集合。

- **do_physical_backfill** (*boolean*) -

    是否对外部数据执行物理回填。适用于创建外部集合。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部文件资源 ID。适用于创建外部集合。

### 使用 CreateCollectionWithSchemaAndIndexParamsReq\{#with-createcollectionwithschemaandindexparamsreq}

使用此请求体，您可以自定义集合的 schema 和索引设置。集合创建后会自动加载。

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

    目标集合所属数据库的名称。

- **collection_name** (*string*) -

    **[必填]**

    要创建的集合名称。

- **consistency_level** (*number* | *string*)

    目标集合的一致性级别。

    默认值为 **Bounded**，可选值包括 **Strong**、**Bounded**、**Session**、**Eventually** 和 **Customized**。

    <Admonition type="info" icon="📘" title="说明">

    什么是一致性级别？
    
        在分布式数据库中，一致性特指在某一时刻进行数据写入或读取时，确保每个节点或副本对数据具有相同视图的属性。
    
        Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认值为 **Bounded Staleness**。
    
        在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其更适合您的应用场景。

    </Admonition>

- **description** (*string)* -

    要创建集合的描述。

- **enable_dynamic_field** (*boolean)* -

    是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

    默认值为 **True**，表示使用 meta 字段。

- **schema** (*FieldType[]*) -

    - **name** (*string)* -

        字段名称。

    - **data_type** (*string)* -

        字段的数据类型。所有可用数据类型的枚举，请参见 [DataType](./Collections-DataType)。

    - **description** (*string)* -

        字段描述。

    - **is_partition_key** (*boolean)* -

        布尔值，表示该字段是否作为分区键字段使用。

    - **is_primary_key** (*boolean)* -

        该字段是否作为主键使用。

    - **is_function_output** (boolean) -

        该字段是否作为函数的输出字段。

    - **type_params** (*string* | *number)* -

        字段的其他参数。

        - **dim** (*string* | *number*) -

            保存向量嵌入的集合字段的维度。 

            该值应为大于 1 的整数，通常由您用于生成向量嵌入的模型决定。

        - **element_type** (string) -

            数组中元素的数据类型。 

            当前字段为数组字段时适用此参数。

        - **max_capacity** (*string* | *number)* -

            数组中的元素数量。

            当前字段为数组字段时适用此参数。

        - **max_length** (*string*) -

            此字段中字符串的最大长度。

            当该字段的 **data_type** 为 **VarChar** 时，此参数为必填。

        - **enable_analyzer** (*boolean*) -

            是否为指定的 `VarChar` 字段启用文本分析。设置为 `true` 时，Milvus 会使用文本分析器，对该字段的文本内容进行分词和过滤。

        - **enable_match** (*boolean*)

            是否为指定的 `VarChar` 字段启用关键词匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，从而实现快速高效的关键词查找。`enable_match` 与 `enable_analyzer` 配合使用，以提供基于术语的结构化文本搜索，其中 `enable_analyzer` 负责分词，`enable_match` 负责基于这些 token 执行搜索操作。

        - **analyzer_params** (*object*)

            配置用于文本处理的分析器，特别适用于 `VarChar` 字段。此参数用于配置 tokenizer 和 filter 设置，尤其适用于 [keyword matching](https://milvus.io/docs/keyword-match.md) 或 [full text search](https://milvus.io/docs/full-text-search.md) 中使用的文本字段。根据分析器类型，可通过以下任一方式进行配置：

            - 内置分析器

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus 内置的预配置分析器类型，可通过指定其名称开箱即用。可选值：`standard`、`english`、`chinese`。更多信息，请参见 [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md) 和 [Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md)。

            - 自定义分析器

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    定义 tokenizer 类型。可选值：`standard`（默认）、`whitespace`、`jieba`。更多信息，请参见 [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md) 和 [Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md)。

                - `filter` (*list*) -

                    列出用于细化 tokenizer 生成 token 的过滤器，支持内置过滤器和自定义过滤器。更多信息，请参见 [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) 等。

        - **multi_analyzer_params** (*object*) -

            配置多个用于文本处理的分析器。该参数的值是一个 JSON 对象，用于决定 Milvus 如何为每个实体选择合适的分析器：

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

        主字段在向此集合插入数据时是否自动递增。

        默认值为 **False**。设置为 **True** 时，主字段会自动递增。如果您需要使用自定义 schema 创建集合，请跳过此参数。

    - **nullable** (*boolean*) -

        一个布尔参数，用于指定该字段是否可接受 null 值。有效值如下：

        - **true**：字段可包含 null 值，表示该字段是可选的，允许条目中缺失数据。

        - **false**（默认）：字段对每个实体都必须包含有效值；不允许缺失数据，即该字段为必填。

        更多信息，请参见 [Nullable & Default](https://milvus.io/docs/nullable-and-default.md)。

    - **default_value** (*[DataType](./Collections-DataType)*)

        在创建集合 schema 时，为特定字段设置默认值。当您希望某些字段即使在插入数据时未显式提供值，也能具有初始值时，此功能尤其有用。

- **functions** (*list*)

    将数据转换为向量嵌入。该函数会被添加到集合的 schema 中。

    - **name** (*string*)

        函数名称。该标识符用于在查询和集合中引用此函数。

    - **description** (*string*)

        对函数用途的简要说明。这对于文档编写或大型项目中的理解很有帮助，默认值为空字符串。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        用于处理原始数据的函数类型。可选值：

        - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

    - **input_field_names** (*string[]*)

        包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

    - **output_field_names** (*string[]*)

        用于存储生成嵌入的字段名称。该字段应对应于集合 schema 中定义的向量字段。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

- **num_partitions** (*number)* -

    要在集合中创建的分区数量。

    <Admonition type="info" icon="📘" title="说明">

    什么是分区？
    
        数据分区是一种基于特定条件组织数据的技术。通过数据分区，您可以分别创建、加载、释放和删除分区，也可以在分区内执行搜索和查询。

    </Admonition>

- **partition_key_field** (*boolean)* -

    布尔值，表示是否启用分区键。

    <Admonition type="info" icon="📘" title="说明">

    什么是分区键？
    
        分区键用于根据实体的键值将其存储到不同分区中。换句话说，分区键会将具有相同键的实体归为一组；当您按键字段进行过滤时，就可以避免扫描无关分区。与传统过滤方式相比，分区键可以显著提升查询性能。

    </Admonition>

- **shards_num** (*number)* -

    创建此集合时一同创建的 shard 数量。 

    默认值为 **1**，表示会随集合一起创建一个 shard。

    <Admonition type="info" icon="📘" title="说明">

    什么是分片？
    
        分片是指将写入操作分发到不同节点，以最大限度利用 Milvus 集群在数据写入方面的并行计算能力。
    
        默认情况下，一个集合包含一个 shard。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    集合的额外属性，以键值对形式提供。可选值包括：

    - **collection.ttl.seconds** (*number*) -

        当前集合的生存时间（TTL），单位为秒。

    - **mmap.enabled** (*boolean*) -

        是否在整个集合范围内启用 mmap。

    - **partitionkey.isolation** (*boolean*) -

        是否启用分区键隔离。

    - **dynamicfield.enabled** (*boolean*) -

        是否启用动态字段。

    - **allow_insert_auto_id** (*boolean*) -

        在启用 autoID 时，是否允许插入主键。

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

        以键值对形式提供的其他索引相关参数。

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作超时。

- **external_source** (*string*) -

    外部源路径。适用于创建外部集合。

- **external_spec** (*string*) -

    外部规格配置。适用于创建外部集合。

- **do_physical_backfill** (*boolean*) -

    是否对外部数据执行物理回填。适用于创建外部集合。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部文件资源 ID。适用于创建外部集合。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则该值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则该值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。

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

