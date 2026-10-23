---
title: "DescribeCollection() | Cloud"
slug: /cpp/cpp/Collections-DescribeCollection
sidebar_label: "DescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 Collection 的描述信息，包括其 Schema 和属性。 | Cloud"
type: docx
token: LwzwdSZkSoV2Nrxsv49cyb4SnZf
sidebar_position: 18
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeCollection()

此操作返回 Collection 的描述信息，包括其 Schema 和属性。

```c++
Status DescribeCollection(const DescribeCollectionRequest& request, DescribeCollectionResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = DescribeCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 的名称。

**返回值：**

*Status*

返回一个 Status，指示操作是否成功。成功时，响应中会包含完整的 Collection 描述信息，包括其 Schema 和属性。

- **response**（*DescribeCollectionResponse*）-

    - **Desc**（*const CollectionDesc&*）-

        获取 Collection 描述信息。

        - **DatabaseName**（*const std::string&*）-

            此 Collection 所属的 Database 名称。

        - **CollectionName**（*const std::string&*）-

            Collection 名称。

        - **Description**（*const std::string&*）-

            Collection 的描述信息。

        - **NumShards**（*int64_t*）-

            Collection 的分片数量。

        - **Schema**（*const CollectionSchema&*）-

            Collection Schema。

            - **Name**（*const std::string&*）-

                Collection 名称，不能为空。

            - **Description**（*const std::string&*）-

                Collection 描述信息，可以为空。

            - **ShardsNum**（*int32_t*）-

                Collection 的分片数量，该值必须大于零，默认值为 2。

            - **EnableDynamicField**（*bool*）-

                未声明的字段是否存储在隐藏的 `meta` 动态字段中。启用后，任何未在 Schema 中声明的字段都会以键值对形式存储在名为 `meta` 的隐藏 JSON 字段中。

            - **Fields**（*const std::vector&lt;FieldSchema&gt;&*）-

                字段 Schema 数组。

                - **Name**（*const std::string&*）-

                    此字段的名称，不能为空。

                - **Description**（*const std::string&*）-

                    此字段的描述信息，可以为空。

                - **FieldDataType**（[DataType](./Collections-DataType)）-

                    字段数据类型。

                - **ElementType**（[DataType](./Collections-DataType)）-

                    数组字段的元素类型。

                - **IsPrimaryKey**（*bool*）-

                    该字段是否为主键。每个 Collection 都恰好有一个主键。只有 INT64 和 VARCHAR 字段可以作为主键。

                - **AutoID**（*bool*）-

                    字段项的 ID 是否自动生成。仅适用于主键字段。如果为 true，服务端会在插入时生成 ID。否则，客户端必须为每个 Entity 提供 ID。

                - **IsPartitionKey**（*bool*）-

                    字段项的 ID 是否为 Partition key。Partition key 会将每个 Entity 路由到某个 Partition。Partition key 字段不能为空。

                - **IsClusteringKey**（*bool*）-

                    字段项的 ID 是否为 Clustering Key。

                - **TypeParams**（*const std::map&lt;std::string, std::string>&*）-

                    此字段的额外键值对设置。

                - **Dimension**（*uint32_t*）-

                    获取向量字段的维度。

                - **MaxLength**（*uint32_t*）-

                    获取 varchar 字段的最大长度。

                - **MaxCapacity**（*uint32_t*）-

                    获取数组字段的最大容量。

                - **IsEnableAnalyzer**（*bool*）-

                    获取是否启用 Analyzer 的标志。

                - **IsEnableMatch**（*bool*）-

                    获取是否启用文本匹配的标志。

                - **AnalyzerParams**（*nlohmann::json*）-

                    获取 Analyzer 参数。

                - **MultiAnalyzerParams**（*nlohmann::json*）-

                    获取多 Analyzer 参数。

                - **IsNullable**（*bool*）-

                    获取字段值是否可为空的标志。可空字段在其值被省略或在插入时显式设为 NULL 时会存储 NULL。主键和 Partition key 字段不能为空；值为 NULL 的向量字段无法通过 IS NULL 表达式进行过滤。

                - **DefaultValue**（*const nlohmann::json&*）-

                    获取此字段的默认值。

                - **ExternalField**（*const std::string&*）-

                    获取外部字段映射名称。

            - **StructFields**（*const std::vector&lt;StructFieldSchema&gt;&*）-

                Struct 字段 Schema 数组。

                - **Name**（*const std::string&*）-

                    此字段的名称，不能为空。

                - **Description**（*const std::string&*）-

                    此字段的描述信息，可以为空。

                - **MaxCapacity**（*int64_t*）-

                    获取 Struct 字段的最大容量。

                - **IsNullable**（*bool*）-

                    Struct 字段是否可为空。

                - **Fields**（*const std::vector&lt;FieldSchema&gt;&*）-

                    获取 Struct 字段的子字段。

                    - **Name**（*const std::string&*）-

                        此字段的名称，不能为空。

                    - **Description**（*const std::string&*）-

                        此字段的描述信息，可以为空。

                    - **FieldDataType**（[DataType](./Collections-DataType)）-

                        字段数据类型。

                    - **ElementType**（[DataType](./Collections-DataType)）-

                        数组字段的元素类型。

                    - **IsPrimaryKey**（*bool*）-

                        该字段是否为主键。每个 Collection 都恰好有一个主键。只有 INT64 和 VARCHAR 字段可以作为主键。

                    - **AutoID**（*bool*）-

                        字段项的 ID 是否自动生成。仅适用于主键字段。如果为 true，服务端会在插入时生成 ID。否则，客户端必须为每个 Entity 提供 ID。

                    - **IsPartitionKey**（*bool*）-

                        字段项的 ID 是否为 Partition key。Partition key 会将每个 Entity 路由到某个 Partition。Partition key 字段不能为空。

                    - **IsClusteringKey**（*bool*）-

                        字段项的 ID 是否为 Clustering Key。

                    - **TypeParams**（*const std::map&lt;std::string, std::string>&*）-

                        此字段的额外键值对设置。

                    - **Dimension**（*uint32_t*）-

                        获取向量字段的维度。

                    - **MaxLength**（*uint32_t*）-

                        获取 varchar 字段的最大长度。

                    - **MaxCapacity**（*uint32_t*）-

                        获取数组字段的最大容量。

                    - **IsEnableAnalyzer**（*bool*）-

                        获取是否启用 Analyzer 的标志。

                    - **IsEnableMatch**（*bool*）-

                        获取是否启用文本匹配的标志。

                    - **AnalyzerParams**（*nlohmann::json*）-

                        获取 Analyzer 参数。

                    - **MultiAnalyzerParams**（*nlohmann::json*）-

                        获取多 Analyzer 参数。

                    - **IsNullable**（*bool*）-

                        获取字段值是否可为空的标志。可空字段在其值被省略或在插入时显式设为 NULL 时会存储 NULL。主键和 Partition key 字段不能为空；值为 NULL 的向量字段无法通过 IS NULL 表达式进行过滤。

                    - **DefaultValue**（*const nlohmann::json&*）-

                        获取此字段的默认值。

                    - **ExternalField**（*const std::string&*）-

                        获取外部字段映射名称。

            - **AnnsFieldNames**（*std::unordered_set&lt;std::string&gt;*）-

                返回 Anns 字段名称。

            - **PrimaryFieldName**（*std::string*）-

                返回主键字段名称。

            - **Functions**（*const std::vector&lt;FunctionPtr&gt;&*）-

                获取函数数组。

                - **Name**（*const std::string&*）-

                    此函数的名称，不能为空。

                - **Description**（*const std::string&*）-

                    此函数的描述信息，可以为空。

                - **GetFunctionType**（*FunctionType*）-

                    函数类型。

                - **InputFieldNames**（*const std::vector&lt;std::string&gt;&*）-

                    获取输入字段名称。

                - **OutputFieldNames**（*const std::vector&lt;std::string&gt;&*）-

                    获取输出字段名称。

                - **Params**（*const std::unordered_map&lt;std::string, std::string>&*）-

                    获取额外参数。

            - **ExternalSource**（*const std::string&*）-

                获取外部 Collection 源路径。

            - **ExternalSpec**（*const nlohmann::json&*）-

                获取外部 Collection 规范 JSON。

        - **ID**（*int64_t*）-

            Collection ID。

        - **Alias**（*const std::vector&lt;std::string&gt;&*）-

            Collection 别名。

        - **CreatedTime**（*uint64_t*）-

            Collection 创建时的时间戳。

        - **UpdateTime**（*uint64_t*）-

            Collection 更新时的时间戳。

        - **Properties**（*const std::unordered_map&lt;std::string, std::string>&*）-

            Collection 属性。

        - **ExternalSource**（*const std::string&*）-

            获取 Collection 的外部数据源。

        - **ExternalSpec**（*const nlohmann::json&*）-

            获取 Collection 的外部文件规范。

        - **GetConsistencyLevel**（[ConsistencyLevel](./Collections-ConsistencyLevel)）-

            Collection 的一致性级别。

        - **NumPartitions**（*int64_t*）-

            Collection 的 Partition 数量。仅当 Collection 使用 Partition key 创建时有效。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 DescribeCollection()，将 Collection 的描述信息（包括其 Schema 和属性）获取到 DescribeCollectionResponse 中。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::DescribeCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
milvus::DescribeCollectionResponse response;
status = client->DescribeCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const milvus::CollectionDesc& desc = response.Desc();
std::cout << "collection: " << desc.CollectionName() << std::endl;
```
