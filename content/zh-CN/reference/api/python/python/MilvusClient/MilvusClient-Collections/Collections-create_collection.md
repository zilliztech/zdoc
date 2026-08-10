---
title: "create_collection() | Python | MilvusClient"
slug: /python/python/Collections-create_collection
sidebar_label: "create_collection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作支持通过两种不同方式创建 Collection：快速设置或自定义设置。 | Python | MilvusClient"
type: docx
token: NbYidGUPcokra9xJ6IAcUNLEn9f
sidebar_position: 5
keywords: 
  - 图像相似性搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - create_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_collection()

此操作支持通过两种不同方式创建 Collection：快速设置或自定义设置。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于专用服务集群和按需计算。

- 对于服务集群中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

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

    要创建的 Collection 的名称。

- **dimension** (*int*) -

    用于存储向量嵌入的 Collection 字段维度。

    该值通常由您用于生成向量嵌入的模型决定，并且应为大于 1 的整数。

    此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**，且 Schema 中某个字段的 **dim** 已设置为正整数，则会忽略此参数。

- **primary_field_name** (*str*) -

    此 Collection 中主字段的名称。

    该值默认为 **id**。您也可以根据需要使用其他名称。如果您需要使用自定义 Schema 设置 Collection，请跳过此参数。

    此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**，且 Schema 中某个字段的 **is_primary** 设置为 **True**，则会忽略此参数。

- **id_type** (*[DataType](./Collections-DataType)*) -

    此 Collection 中主字段的数据类型。

    该值默认为 **DataType.INT64**。可选值为 **DataType.INT64** 和 **DataType.VARCHAR**。

    此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **vector_field_name** (*str*) -

    用于存储向量嵌入的 Collection 字段名称。

    该值默认为 **vector**。您也可以根据需要使用其他名称。

    此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **metric_type** (*str*) -

    此 Collection 用于衡量向量嵌入之间相似度的算法。

    该值默认为 **COSINE**。可选值为 **L2**、**IP** 和 **COSINE**。有关这些度量类型的详细信息，请参见 [相似度度量说明](/docs/search-metrics-explained)。

    此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **auto_id** (*bool*) -

    是否在向此 Collection 插入数据时让主字段自动递增。

    该值默认为 **False**。将其设置为 **True** 会使主字段自动递增。在这种情况下，为避免出错，待插入的数据中不应包含主字段。自动生成的 ID 具有固定长度，且不可更改。

    此参数用于 Collection 的快速设置；如果 **schema** 不为 **None**，则会忽略此参数。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

- **schema** (*[CollectionSchema](./MilvusClient-CollectionSchema)* | *None*)

    此 Collection 的 Schema。

    将其设置为 **None** 表示将以快速设置方式创建此 Collection。

    要使用自定义 Schema 设置 Collection，您需要先创建一个 **[CollectionSchema](./MilvusClient-CollectionSchema)** 对象，并在此处引用它。在这种情况下，Zilliz Cloud 会忽略请求中携带的所有其他与 Schema 相关的设置。

- **index_params** (*IndexParams* | *None*)

    为此 Collection 中的向量字段构建索引的参数。要使用自定义 Schema 设置 Collection 并自动将该 Collection 加载到内存中，您需要创建一个 **IndexParams** 对象并在此处引用它。

    您至少应为此 Collection 中的向量字段添加一个索引。如果您希望稍后再设置索引参数，也可以跳过此参数。

- **kwargs** -

    - **enable_dynamic_field** (*bool*) -

        是否使用名为 **&#36;meta** 的保留 JSON 字段，以键值对形式存储未定义字段及其值。

        该值默认为 **True**，表示使用 **&#36;meta** 字段。

        如果 **schema** 不为 **None**，则会忽略此参数。

    - **num_shards** (*int*) -

        创建此 Collection 时要一并创建的分片数量。

        该值默认为 **1**，表示在创建此 Collection 时将一并创建一个分片。

        <Admonition type="info" icon="📘" title="Note">

        什么是分片？
        
                分片是指将写操作分布到不同节点，以最大限度利用 Milvus 集群在数据写入方面的并行计算能力。
        
                默认情况下，一个 Collection 包含一个分片。

        </Admonition>

    - **partition_key_field** (*str*) -

        用作 Partition 键的字段名称。每个 Collection 只能有一个 Partition 键。

        如果 **schema** 不为 **None**，且 Schema 中某个字段的 **is_parition_key** 设置为 **True**，则会忽略此参数。

        <Admonition type="info" icon="📘" title="Note">

        什么是 Partition 键？
        
                为便于面向 Partition 的多租户，您可以将某个字段设置为 Partition 键字段，这样 Zilliz Cloud 会对该字段值进行哈希处理，并相应地将 Entity 分布到指定数量的 Partition 中。
        
                在检索 Entity 时，请确保在布尔表达式中使用 Partition 键字段，以筛选出具有特定字段值的 Entity。
        
                有关详细信息，请参见 [使用 Partition 键](/docs/use-partition-key) 和 [多租户](https://milvus.io/docs/multi_tenancy.md)。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        是否启用 Partition 键隔离，以进一步提升基于 Partition 键进行标量过滤时的搜索性能。有关详细信息，请参见 [使用 Partition 键隔离](/docs/use-partition-key#use-partition-key-isolation)。

    - **num_partitions** (*int*) -

        为 Partition 键功能创建的 Partition 数量。

        该值默认为 **64**，表示在创建此 Collection 时将一并创建 64 个 Partition。此参数在 **partition_key_field** 设置为某个字段名称时适用。

    - **consistency_level** (*int* | *str*)

        目标 Collection 的一致性级别。

        该值默认为 **Bounded**（**2**），可选值包括 **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）和 **Eventually**（**3**）。

        <Admonition type="info" icon="📘" title="Note">

        什么是一致性级别？
        
                在分布式 Database 中，一致性特指这样一种属性：在给定时间写入或读取数据时，确保每个节点或副本看到的数据视图相同。
        
                Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认值为 **Bounded Staleness**。
        
                您可以在执行向量相似性搜索或查询时轻松调整一致性级别，使其最适合您的应用。

        </Admonition>

    - **properties** (*dict*) -

        以键值对形式提供的附加属性。

        - **collection.ttl.seconds** (*int*)

            Collection 级别的生存时间（TTL），单位为秒。

        - **ttl_field** (*str*)

            用作 Entity 级 TTL 过期逻辑时间戳的`TIMESTAMPTZ`字段名称。

        - **mmap.enabled** (*bool*) -

            是否为 Collection 中所有字段的原始数据和索引启用 mmap。

        - **partitionkey.isolation** (bool) -

            是否启用 Partition 键隔离。有关详细信息，请参见 [使用 Partition 键](/docs/use-partition-key)。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **PrimaryKeyException**

    如果主字段的数据类型不是整数或字符串，则会引发此异常。

- **MilvusException**

    在此操作期间发生任何错误时，都会引发此异常。

## 示例\{#examples}

### 设置 Milvus 客户端\{#set-up-a-milvus-client}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)
```

### 创建 Collection\{#create-a-collection}

您可以按如下方式选择快速设置或自定义设置：

- **快速设置**

    快速设置的 Collection 包含两个必需字段：主字段和向量字段。它还允许在动态字段中以键值对形式插入未定义字段及其值。

    ```python
    client.create_collection(
        collection_name="test_collection", 
        dimension=5
    )
    ```

    在上述设置中，

    - 主字段和向量字段使用其默认名称（**id** 和 **vector**）。

    - 度量类型也设置为其默认值（**COSINE**）。

    - 主字段接受整数，并且不会自动递增。

    - 名为 **&#36;meta** 的保留 JSON 字段用于存储未在 Schema 中定义的字段及其值。

    您可以修改主字段和向量字段的名称，并更改度量类型。此外，还可以将主字段设置为自动递增。

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

    在上述代码中，将创建 Collection、构建索引并将其加载到内存中。

- **带索引参数的自定义设置**

    对于自定义设置，请预先创建 Schema 和索引参数。

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

    在上述代码中，将创建 Collection、构建索引并将其加载到内存中。

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

    在上述代码中，也会创建 Collection。但是，如果没有 `index_param`，Collection 中的数据将不会建立索引，也不会加载到内存中。

- **创建外部 Collection**

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
