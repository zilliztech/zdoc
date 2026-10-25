---
title: "BatchDescribeCollections() | Cloud"
slug: /cpp/cpp/Collections-BatchDescribeCollections
sidebar_label: "BatchDescribeCollections()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作可在一次调用中获取多个 Collection 的完整描述。 | Cloud"
type: docx
token: IpztddRkJo1o6JxKNWHcPjO8n8f
sidebar_position: 8
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - zilliz
  - zilliz cloud
  - cloud
  - BatchDescribeCollections()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# BatchDescribeCollections()

此操作可在一次调用中获取多个 Collection 的完整描述。

```c++
Status BatchDescribeCollections(const BatchDescribeCollectionsRequest& request, BatchDescribeCollectionsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = BatchDescribeCollectionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionNames(collection_names)
    .AddCollectionName(collection_name)
    .WithCollectionIDs(collection_ids)
    .AddCollectionID(collection_id);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置包含要描述的 Collection 的 Database 名称。

- `WithCollectionNames(std::vector<std::string>&& collection_names)`

    设置要描述的 Collection 名称。

- `AddCollectionName(const std::string& collection_name)`

    添加要描述的一个 Collection 名称。

- `WithCollectionIDs(std::vector<int64_t>&& collection_ids)`

    设置要描述的 Collection ID。

- `AddCollectionID(int64_t collection_id)`

    添加要描述的一个 Collection ID。

**返回：**

*Status*

返回指示操作是否成功的状态。响应包含所请求 Collection 的完整描述。

- **response** (*BatchDescribeCollectionsResponse*) -

    - **Descs** (*const std::vector&lt;CollectionDesc&gt;&*) -

        获取 Collection 描述。

        - **DatabaseName** (*const std::string&*) -

            此 Collection 所属的 Database 名称。

        - **CollectionName** (*const std::string&*) -

            Collection 名称。

        - **Description** (*const std::string&*) -

            Collection 的描述。

        - **NumShards** (*int64_t*) -

            Collection 的分片数。

        - **Schema** (*const CollectionSchema&*) -

            Collection 的 Schema。

            - **Name** (*const std::string&*) -

                Collection 名称，不能为空。

            - **Description** (*const std::string&*) -

                Collection 描述，可以为空。

            - **ShardsNum** (*int32_t*) -

                Collection 分片数，该数值必须大于零，默认值为 2。

            - **EnableDynamicField** (*bool*) -

                未声明的字段是否存储在隐藏的 `meta` 动态字段中。启用后，任何未在 Schema 中声明的字段都将作为键值对存储在名为 `meta` 的隐藏 JSON 字段中。

            - **Fields** (*const std::vector&lt;FieldSchema&gt;&*) -

                字段 Schema 数组。

                - **Name** (*const std::string&*) -

                    此字段的名称，不能为空。

                - **Description** (*const std::string&*) -

                    此字段的描述，可以为空。

                - **FieldDataType** ([DataType](./Collections-DataType)) -

                    字段数据类型。

                - **ElementType** ([DataType](./Collections-DataType)) -

                    数组字段的元素类型。

                - **IsPrimaryKey** (*bool*) -

                    此字段是否为主键。每个 Collection 都恰好有一个主键。只有 INT64 和 VARCHAR 字段可以作主键。

                - **AutoID** (*bool*) -

                    字段项的 ID 是否自动生成。仅适用于主键字段。如果为 true，服务器会在插入时生成 ID。否则，客户端必须为每个 Entity 提供一个 ID。

                - **IsPartitionKey** (*bool*) -

                    字段项的 ID 是否为 Partition 键。Partition 键会将每个 Entity 路由到一个 Partition。Partition 键字段不能为可空。

                - **IsClusteringKey** (*bool*) -

                    字段项的 ID 是否为聚类键。

                - **TypeParams** (*const std::map&lt;std::string, std::string>&*) -

                    此字段的额外键值对设置。

                - **Dimension** (*uint32_t*) -

                    获取向量字段的维度。

                - **MaxLength** (*uint32_t*) -

                    获取 varchar 字段的最大长度。

                - **MaxCapacity** (*uint32_t*) -

                    获取数组字段的最大容量。

                - **IsEnableAnalyzer** (*bool*) -

                    获取是否启用 Analyzer 的标志。

                - **IsEnableMatch** (*bool*) -

                    获取是否启用文本匹配的标志。

                - **AnalyzerParams** (*nlohmann::json*) -

                    获取 Analyzer 参数。

                - **MultiAnalyzerParams** (*nlohmann::json*) -

                    获取多 Analyzer 参数。

                - **IsNullable** (*bool*) -

                    获取字段值是否为可空的标志。可空字段在其值被省略或在插入时显式设为 NULL 时存储 NULL。主键和 Partition 键字段不能为可空；含 NULL 的向量字段无法通过 IS NULL 表达式进行过滤。

                - **DefaultValue** (*const nlohmann::json&*) -

                    获取此字段的默认值。

                - **ExternalField** (*const std::string&*) -

                    获取外部字段映射名称。

            - **StructFields** (*const std::vector&lt;StructFieldSchema&gt;&*) -

                结构体字段 Schema 数组。

                - **Name** (*const std::string&*) -

                    此字段的名称，不能为空。

                - **Description** (*const std::string&*) -

                    此字段的描述，可以为空。

                - **MaxCapacity** (*int64_t*) -

                    获取结构体字段的最大容量。

                - **IsNullable** (*bool*) -

                    结构体字段是否可为空。

                - **Fields** (*const std::vector&lt;FieldSchema&gt;&*) -

                    获取结构体字段的子字段。

                    - **Name** (*const std::string&*) -

                        此字段的名称，不能为空。

                    - **Description** (*const std::string&*) -

                        此字段的描述，可以为空。

                    - **FieldDataType** ([DataType](./Collections-DataType)) -

                        字段数据类型。

                    - **ElementType** ([DataType](./Collections-DataType)) -

                        数组字段的元素类型。

                    - **IsPrimaryKey** (*bool*) -

                        此字段是否为主键。每个 Collection 都恰好有一个主键。只有 INT64 和 VARCHAR 字段可以作主键。

                    - **AutoID** (*bool*) -

                        字段项的 ID 是否自动生成。仅适用于主键字段。如果为 true，服务器会在插入时生成 ID。否则，客户端必须为每个 Entity 提供一个 ID。

                    - **IsPartitionKey** (*bool*) -

                        字段项的 ID 是否为 Partition 键。Partition 键会将每个 Entity 路由到一个 Partition。Partition 键字段不能为可空。

                    - **IsClusteringKey** (*bool*) -

                        字段项的 ID 是否为聚类键。

                    - **TypeParams** (*const std::map&lt;std::string, std::string>&*) -

                        此字段的额外键值对设置。

                    - **Dimension** (*uint32_t*) -

                        获取向量字段的维度。

                    - **MaxLength** (*uint32_t*) -

                        获取 varchar 字段的最大长度。

                    - **MaxCapacity** (*uint32_t*) -

                        获取数组字段的最大容量。

                    - **IsEnableAnalyzer** (*bool*) -

                        获取是否启用 Analyzer 的标志。

                    - **IsEnableMatch** (*bool*) -

                        获取是否启用文本匹配的标志。

                    - **AnalyzerParams** (*nlohmann::json*) -

                        获取 Analyzer 参数。

                    - **MultiAnalyzerParams** (*nlohmann::json*) -

                        获取多 Analyzer 参数。

                    - **IsNullable** (*bool*) -

                        获取字段值是否为可空的标志。可空字段在其值被省略或在插入时显式设为 NULL 时存储 NULL。主键和 Partition 键字段不能为可空；含 NULL 的向量字段无法通过 IS NULL 表达式进行过滤。

                    - **DefaultValue** (*const nlohmann::json&*) -

                        获取此字段的默认值。

                    - **ExternalField** (*const std::string&*) -

                        获取外部字段映射名称。

            - **AnnsFieldNames** (*std::unordered_set&lt;std::string&gt;*) -

                返回 Anns 字段名称。

            - **PrimaryFieldName** (*std::string*) -

                返回主键字段名称。

            - **Functions** (*const std::vector&lt;FunctionPtr&gt;&*) -

                获取函数数组。

                - **Name** (*const std::string&*) -

                    此函数的名称，不能为空。

                - **Description** (*const std::string&*) -

                    此函数的描述，可以为空。

                - **GetFunctionType** (*FunctionType*) -

                    函数类型。

                - **InputFieldNames** (*const std::vector&lt;std::string&gt;&*) -

                    获取输入字段名称。

                - **OutputFieldNames** (*const std::vector&lt;std::string&gt;&*) -

                    获取输出字段名称。

                - **Params** (*const std::unordered_map&lt;std::string, std::string>&*) -

                    获取额外参数。

            - **ExternalSource** (*const std::string&*) -

                获取外部 Collection 源路径。

            - **ExternalSpec** (*const nlohmann::json&*) -

                获取外部 Collection 规格 JSON。

        - **ID** (*int64_t*) -

            Collection ID。

        - **Alias** (*const std::vector&lt;std::string&gt;&*) -

            Collection 别名。

        - **CreatedTime** (*uint64_t*) -

            Collection 创建时的时间戳。

        - **UpdateTime** (*uint64_t*) -

            Collection 更新时的时间戳。

        - **Properties** (*const std::unordered_map&lt;std::string, std::string>&*) -

            Collection 属性。

        - **ExternalSource** (*const std::string&*) -

            获取 Collection 的外部数据源。

        - **ExternalSpec** (*const nlohmann::json&*) -

            获取 Collection 的外部文件规格。

        - **GetConsistencyLevel** ([ConsistencyLevel](./Collections-ConsistencyLevel)) -

            Collection 的一致性级别。

        - **NumPartitions** (*int64_t*) -

            Collection 的 Partition 数量。仅当 Collection 使用 Partition 键创建时有效。

**异常处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 BatchDescribeCollections()，以在单个请求中按名称获取多个 Collection 的完整描述。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::BatchDescribeCollectionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionNames(std::move(collection_names))
    .AddCollectionName(collection_name);
milvus::BatchDescribeCollectionsResponse response;
status = client->BatchDescribeCollections(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto descs = response.Descs();
std::cout << "Described " << descs.size() << " collections" << std::endl;
```
