---
title: "create_schema() | Python | MilvusClient"
slug: /python/python/Collections-create_schema
sidebar_label: "create_schema()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作创建 Collection Schema。 | Python | MilvusClient"
type: docx
token: Er8vdVepxoqhPFxVyZUcxSHMnqe
sidebar_position: 6
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量 db
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - create_schema()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_schema()

此操作创建 Collection Schema。

<Admonition type="info" title="Note">

这是一个类方法。您应按如下方式调用此方法：MilvusClient.create_schema()。

</Admonition>

<Admonition type="info" title="Note">

这是一个类方法。您应按如下方式调用此方法：MilvusClient.create_schema()。

</Admonition>

<Admonition type="info" title="Note">

这是一个类方法。您应按如下方式调用此方法：MilvusClient.create_schema()。

</Admonition>

<Admonition type="info" title="Note">

这是一个类方法。您应按如下方式调用此方法：MilvusClient.create_schema()。

</Admonition>

## 请求语法\{#request-syntax}

```python
MilvusClient.create_schema(**kwargs) -> CollectionSchema
```

<Admonition type="info" title="Notes">

这是一个类方法。您应按如下方式调用此方法：`MilvusClient.create_schema()`。

</Admonition>

**参数：**

- **kwargs**（*Any*）-

    一个选项：auto_id（bool）：是否允许主字段自动递增。将其设置为 True 会使主字段自动递增。在这种情况下，主字段不应包含在待插入的数据中，以避免出错。enable_dynamic_field（bool）：如果插入目标 Collection 的数据包含 Collection Schema 中未定义的字段，是否允许 Milvus 将未定义字段的值保存在动态字段中。将其设置为 True 时，Milvus 会创建一个名为 &#36;meta 的字段，用于存储插入数据中的任何未定义字段及其值。如果插入目标 Collection 的数据包含 Collection Schema 中未定义的字段，这些字段将作为键值对保存在名为 &#36;meta 的保留动态字段中。primary_field（str）：主字段的名称。partition_key_field（str）：用作 Partition 键的字段名称。设置此项会让 Milvus 管理当前 Collection 中的所有 Partition。此参数不适用于 Milvus Lite。有关 Milvus Lite 限制的详细信息，请参见 Run Milvus Lite。一旦某个字段被指定为 Partition 键，Milvus 会根据每个插入 Entity 的 Partition 键值计算哈希，并据此将 Entity 保存在目标 Collection 的 Partition 中。这在基于特定键实现数据分离时特别有用，例如面向 Partition 的多租户。

- **external_source**（*str*）-

    外部源 URI，类似于 AWS S3 对象路径。

- **external_spec**（*str*）-

    外部源规范，是一组次级参数：format（str）：目标源数据文件的格式。可选值为 parquet、vortex、lance-table 和 iceberg-table。snapshot_id（str）：Iceberg 表的 ID。仅当 format 为 iceberg-table 时适用。extfs（string）：以字符串化 JSON 结构表示的外部文件系统设置。可选选项如下：access_key_id（string）：对象存储服务的访问密钥 ID。access_key_val（string）：对象存储服务的访问密钥值。cloud_provider（string）：对象存储服务的云提供商。region（string）：对象存储服务的区域。use_iam（string）：是否使用 AWS IAM 进行存储桶访问身份验证。可选值为 "true" 或 "false"。iam_endpoint（string）：AWS IAM STS Endpoint。use_ssl（string）：是否使用 SSL 访问对象存储桶。可选值为 "true" 或 "false"。use_virtual_host（string）：是否使用虚拟主机方式进行存储桶访问。详情请参见这篇文章。storage_type（string）：存储类型。可选值为 remote。role_arn（string）：从存储桶所有者处获取的 AWS IAM Role ARN。external_id（string）：从存储桶所有者处获取的外部 ID。load_frequency（string）：Milvus 检索临时身份验证凭据的间隔，单位为秒。

- **external_source**（*str*）-

    外部源 URI，应为指向可访问外部卷的 `volume://` URI。例如，`volume://<volume-name>/path/to/folder/`。

- **external_spec**（*str*）-

    外部源规范，是一组次级参数：

    - **format**（*str*）-

        目标源数据文件的格式。

        可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id**（*str*）-

        Iceberg 表的 ID。仅当 `format` 为 `iceberg-table` 时适用。

**返回类型：**

*CollectionSchema*

**返回值：**

一个 CollectionSchema 对象。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，都会引发此异常。此操作期间发生任何错误时，都会引发此异常。

## 示例\{#examples}

- 托管 Collection 的 Schema

```python
from pymilvus import MilvusClient, DataType
    
    # 1. Create a schema
    schema = MilvusClient.create_schema(
        auto_id=False,
        enable_dynamic_field=False,
    )
    
    # 2. Add fields to schema
    schema.add_field(
        field_name="my_id",
        datatype=DataType.INT64,
        is_primary=True,
    )
    
    # {
    #     'auto_id': False, 
    #     'description': '', 
    #     'fields': [
    #         {
    #             'name': 'my_id', 
    #             'description': '', 
    #             'type': <DataType.INT64: 5>, 
    #             'is_primary': True, 
    #             'auto_id': False
    #         }
    #     ]
    # }
    
    schema.add_field(
        field_name="my_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=5,
    )
    
    # {
    #     'auto_id': False, 
    #     'description': '', 
    #     'fields': [
    #         {
    #             'name': 'my_id', 
    #             'description': '', 
    #             'type': <DataType.INT64: 5>, 
    #             'is_primary': True, 
    #             'auto_id': False
    #         }, 
    #         {
    #             'name': 'my_vector', 
    #             'description': '', 
    #             'type': <DataType.FLOAT_VECTOR: 101>, 
    #             'params': {
    #                 'dim': 5
    #             }
    #         }        
    #     ]
    # }
```

- 外部 Collection 的 Schema

```python
schema = MilvusClient.create_schema(
        external_source='s3://my_bucket/path/to/a/folder/',
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
```
