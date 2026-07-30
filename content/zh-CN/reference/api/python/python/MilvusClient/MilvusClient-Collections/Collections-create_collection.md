---
title: "create_collection() | Python | MilvusClient"
slug: /python/python/Collections-create_collection
sidebar_label: "create_collection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作支持以两种不同的方式创建集合：快速设置或自定义设置。 | Python | MilvusClient"
type: docx
token: NbYidGUPcokra9xJ6IAcUNLEn9f
sidebar_position: 5
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - create_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_collection()

此操作支持以两种不同的方式创建集合：快速设置或自定义设置。

<Admonition type="info" icon="📘" title="说明">

此方法适用于专有服务集群和按需计算。

- 对于服务集群中的集合，请使用集群 endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的集合，请使用项目 endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
create_collection(
    collection_name: str,
    dimension: int,
    primary_field_name: str = "id",
    id_type: str = DataType,
    vector_field_name: str = "vector",
    metric_type: str = "COSINE",
    auto_id: bool = False,
    timeout: Optional[float] = None,
    schema: Optional[CollectionSchema] = None, # Used for custom setup
    index_params: Optional[IndexParams] = None, # Used for custom setup
    **kwargs,
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要创建的集合名称。

- **dimension** (*int*) -

    集合中用于存储向量嵌入的字段维度。

    该值通常由你用于生成向量嵌入的模型决定，并且应为大于 1 的整数。

    此参数用于集合的快速设置；如果 **schema** 不为 **None**，且 schema 中某个字段的 **dim** 被设置为正整数，则会忽略此参数。

- **primary_field_name** (*str*) -

    此集合中主字段的名称。

    默认值为 **id**。你也可以根据需要使用其他名称。如果你需要使用自定义 schema 创建集合，请跳过此参数。

    此参数用于集合的快速设置；如果 **schema** 不为 **None**，且 schema 中某个字段的 **is_primary** 被设置为 **True**，则会忽略此参数。

- **id_type** (*[DataType](./Collections-DataType)*) -

    此集合中主字段的数据类型。

    默认值为 **DataType.INT64**。可选值包括 **DataType.INT64** 和 **DataType.VARCHAR**。

    此参数用于集合的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **vector_field_name** (*str*) -

    集合中用于存储向量嵌入的字段名称。

    默认值为 **vector**。你也可以根据需要使用其他名称。

    此参数用于集合的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **metric_type** (*str*) -

    此集合用于衡量向量嵌入之间相似性的算法。

    默认值为 **COSINE**。可选值包括 **L2**、**IP** 和 **COSINE**。有关这些度量类型的详细信息，请参阅 [Similarity Metrics Explained](/docs/search-metrics-explained)。

    此参数用于集合的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **auto_id** (*bool*) -

    向此集合插入数据时，主字段是否自动递增。

    默认值为 **False**。将其设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，插入的数据中不应包含主字段。自动生成的 ID 长度固定，无法更改。

    此参数用于集合的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示该操作会在任意响应返回或发生错误时超时。

- **schema** (*[CollectionSchema](./MilvusClient-CollectionSchema)* | *None*)

    此集合的 schema。

    将其设置为 **None** 表示将以快速设置方式创建此集合。

    如需使用自定义 schema 创建集合，你需要先创建一个 **[CollectionSchema](./MilvusClient-CollectionSchema)** 对象，并在此处引用它。在这种情况下，Zilliz Cloud 会忽略请求中携带的所有其他与 schema 相关的设置。

- **index_params** (*IndexParams* | *None*)

    为此集合中的向量字段构建索引所需的参数。若要使用自定义 schema 创建集合并自动将集合加载到内存中，你需要创建一个 **IndexParams** 对象，并在此处引用它。

    你至少应为此集合中的向量字段添加一个索引。如果你希望稍后再设置索引参数，也可以跳过此参数。

- **kwargs** -

    - **enable_dynamic_field** (*bool*) -

        是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

        默认值为 **True**，表示使用 **&#36;meta** 字段。

        如果 **schema** 不为 **None**，则会忽略此参数。

    - **num_shards** (*int*) -

        创建此集合时一并创建的 shard 数量。

        默认值为 **1**，表示创建此集合时会同时创建 1 个 shard。

        <Admonition type="info" icon="📘" title="说明">

        什么是分片？
        
                分片是指将写操作分发到不同节点，以充分利用 Milvus 集群在数据写入方面的并行计算能力。
        
                默认情况下，一个集合包含一个 shard。

        </Admonition>

    - **partition_key_field** (*str*) -

        用作分区键的字段名称。每个集合可以有一个分区键。

        如果 **schema** 不为 **None**，且 schema 中某个字段的 **is_parition_key** 被设置为 **True**，则会忽略此参数。

        <Admonition type="info" icon="📘" title="说明">

        什么是分区键？
        
                为了支持面向分区的多租户，你可以将某个字段设置为分区键字段，以便 Zilliz Cloud 对该字段值进行哈希，并据此将实体分布到指定数量的分区中。
        
                检索实体时，请确保在布尔表达式中使用分区键字段进行过滤，以筛选出具有特定字段值的实体。
        
                更多详情，请参阅 [Use Partition Key](/docs/use-partition-key) 和 [Multi-tenancy](https://milvus.io/docs/multi_tenancy.md)。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        是否启用分区键隔离，以进一步提升按分区键进行标量过滤时的搜索性能。详情请参阅 [Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation)。

    - **num_partitions** (*int*) -

        为分区键功能创建的分区数量。

        默认值为 **64**，表示创建此集合时会同时创建 64 个分区。此参数在 **partition_key_field** 被设置为某个字段名称时生效。

    - **consistency_level** (*int* | *str*)

        目标集合的一致性级别。

        默认值为 **Bounded**（**2**），可选项包括 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。

        <Admonition type="info" icon="📘" title="说明">

        什么是一致性级别？
        
                在分布式数据库中，一致性特指这样一种属性：在给定时间进行写入或读取数据时，保证每个节点或副本看到的数据视图相同。
        
                Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认值为 **Bounded Staleness**。
        
                你可以在执行向量相似性搜索或查询时灵活调整一致性级别，使其更适合你的应用场景。

        </Admonition>

    - **properties** (*dict*) -

        以键值对形式提供的附加属性。

        - **collection.ttl.seconds** (*int*)

            集合级别的生存时间（TTL），单位为秒。

        - **ttl_field** (*str*)

            用作实体级 TTL 过期逻辑时间戳的 `TIMESTAMPTZ` 字段名称。

        - **mmap.enabled** (*bool*) -

            是否为集合中所有字段的原始数据和索引启用 mmap。

        - **partitionkey.isolation** (bool) -

            是否启用分区键隔离。详情请参阅 [Use Partition Key](/docs/use-partition-key)。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **PrimaryKeyException**

    如果主字段的数据类型不是整数或字符串，则会引发此异常。

- **MilvusException**

    如果此操作期间发生任何错误，则会引发此异常。

## 示例\{#examples}

### 设置 Milvus client\{#set-up-a-milvus-client}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)
```

### 创建集合\{#create-a-collection}

你可以按如下方式选择快速设置或自定义设置：

- **快速设置**

    快速设置创建的集合包含两个必需字段：主字段和向量字段。它还允许在动态字段中以键值对形式插入未定义字段及其值。

    ```python
    client.create_collection(
        collection_name="test_collection", 
        dimension=5
    )
    ```

    在上述设置中：

    - 主字段和向量字段使用默认名称（**id** 和 **vector**）。

    - 度量类型也设置为默认值（**COSINE**）。

    - 主字段接受整数，且不会自动递增。

    - 名为 **&#36;meta** 的保留 JSON 字段用于存储 schema 中未定义的字段及其值。

    你可以修改主字段和向量字段的名称，并更改度量类型。此外，还可以将主字段设置为自动递增。

    ```python
    client.create_collection(
        collection_name="quick_setup",
        dimension=5,
        primary_field_name="my_id",
        id_type="string",
        vector_field_name="my_vector",
        metric_type="L2",
        auto_id=True,
        max_length=512
    )
    ```

    在上述代码中，集合将被创建、建立索引并加载到内存中。

- **带索引参数的自定义设置**

    对于自定义设置，请预先创建 schema 和索引参数。

    ```python
    from pymilvus import MilvusClient, DataType
    
    # 1. Create schema
    schema = MilvusClient.create_schema(
        auto_id=False,
        enable_dynamic_field=False,
    )
    
    # 2. Add fields to schema
    schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
    schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)
    
    # 3. Prepare index parameters
    index_params = client.prepare_index_params()
    
    # 4. Add indexes
    index_params.add_index(
        field_name="my_id",
        index_type="STL_SORT"
    )
    
    index_params.add_index(
        field_name="my_vector", 
        index_type="AUTOINDEX",
        metric_type="L2",
        params={"nlist": 1024}
    )
    
    # 5. Create a collection
    client.create_collection(
        collection_name="customized_setup",
        schema=schema,
        index_params=index_params
    )
    ```

    在上述代码中，集合将被创建、建立索引并加载到内存中。

- **不带索引参数的自定义设置**

    ```python
    from pymilvus import MilvusClient, DataType
    
    # 1. Create schema
    schema = MilvusClient.create_schema(
        auto_id=False,
        enable_dynamic_field=False,
    )
    
    # 2. Add fields to schema
    schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
    schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)
    
    # 3. Create a collection
    client.create_collection(
        collection_name="customized_setup",
        schema=schema
    )
    ```

    在上述代码中，集合同样会被创建。但是，如果没有 `index_param`，集合中的数据不会被建立索引，也不会加载到内存中。

- **创建外部集合**

    ```python
    from pymilvus import MilvusClient, DataType
    
    # connect the database
    client = MilvusClient(
        uri="https://{project-id}.{region}.api.zillizcloud.com",
        token="YOUR_API_KEY"
    )
    
    schema = MilvusClient.create_schema(
        external_source='volume://my_volume/path/to/a/folder/',
        external_spec='{"format": "parquet"}'
    )
    
    schema.add_field(
        field_name="product_id",
        datatype=DataType.INT64,
        # highlight-next
        external_field="id" # field name in the external data file
    )
    schema.add_field(
        field_name="product_name",
        datatype=DataType.VARCHAR,
        max_length=512,
        # highlight-next
        external_field="name"
    )
    schema.add_field(
        field_name="embedding",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        # highlight-next
        external_field="vector"
    )
    
    client.use_database(
        db_name="my_database"
    )
    # create the collection
    client.create_collection(
        collection_name="test_collection",
        schema=schema
    )
    
    index_params = client.prepare_index_params()
    # Add indexes
    index_params.add_index(
        field_name="embedding",
        index_type="AUTOINDEX",
        metric_type="COSINE"
    )
    index_params.add_index(
        field_name="product_name",
        index_type="AUTOINDEX"
    )
    client.create_index(
        db_name="my_database",
        collection_name="test_collection",
        index_params=index_params
    )
    
    job_id = client.refresh_external_collection(
        db_name="my_database",
        collection_name="test_collection"
    )
    while True:
        progress = client.get_refresh_external_collection_progress(job_id=job_id)
        print(f"  {progress.state}: {progress.progress}%")
        if progress.state == "RefreshCompleted":
            elapsed = progress.end_time - progress.start_time
            print(f"  Completed in {elapsed}ms")
            break
        elif progress.state == "RefreshFailed":
            print(f"  Failed: {progress.reason}")
            break
        time.sleep(2)
    ```
