---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此函数为开源 Milvus 或 Zilliz Cloud 提交批量导入任务，包括对项目数据库的 project/region 路由。 | Python"
type: docx
token: HVwRdVSbAo2jUexpxmdczdqPnzh
sidebar_position: 1
keywords: 
  - 什么是向量嵌入
  - 向量数据库教程
  - 向量数据库如何工作
  - 向量数据库对比
  - zilliz
  - zilliz cloud
  - cloud
  - bulk_import()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# bulk_import()

此函数为开源 Milvus 或 Zilliz Cloud 提交批量导入任务，包括对项目数据库的 project/region 路由。

## 请求语法\{#request-syntax}

```python
bulk_import(
    url: str,
    collection_name: str,
    db_name: str = "",
    files: list[list[str]] | None = None,
    object_url: str = "",
    object_urls: list[list[str]] | None = None,
    cluster_id: str = "",
    api_key: str = "",
    access_key: str = "",
    secret_key: str = "",
    token: str = "",
    volume_name: str = "",
    data_paths: list[list[str]] | None = None,
    
    project_id: str = "",
    region_id: str = "",
    
    verify: bool | str = True,
    cert: str | tuple | None = None,
    **kwargs,
)
```

**参数：**

- **url** (*str*) -

    **[必需]**

    用于 Milvus 或 Zilliz Cloud 批量导入 API 的服务器端点。

- **collection_name** (*str*) -

    **[必需]**

    目标 collection 名称。

- **db_name** (*str*) -

    目标数据库名称。

- **files** (*list[list[str]]*) -

    用于导入的本地文件分组。

- **object_url** (*str*) -

    用于云端导入的对象存储 URL。

- **object_urls** (*list[list[str]]*) -

    用于云端导入的对象存储 URL 分组。

- **cluster_id** (*str*) -

    用于导入任务的云集群 ID。

- **access_key** (*str*) -

    对象存储访问密钥。

- **secret_key** (*str*) -

    对象存储密钥。

- **token** (*str*) -

    用于访问对象存储的临时会话令牌。

- **volume_name** (*str*) -

    基于卷导入时使用的卷名称。

- **data_paths** (*list[list[str]]*) -

    数据文件相对于卷的路径。

- **project_id** (*str*) -

    有效的 Zilliz Cloud 项目 ID。 

    当你向按需计算的数据库执行批量导入时适用。

- **region_id** (*str*) -

    有效的 Zilliz Cloud 区域 ID。

    当你向按需计算的数据库执行批量导入时适用。

- **verify** (*bool | str*) -

    TLS 验证设置。

- **cert** (*str | tuple*) -

    客户端证书路径或 `(cert, key)` 元组。

- **kwargs** (*dict*) -

    可选字段，例如 `partition_name` 和 `options`。

**返回类型：**
*requests.Response*

返回导入任务创建响应。

包含已创建导入任务元数据的 HTTP 响应。

**异常：**

- **MilvusException**

    当请求提交失败或服务器拒绝该任务时引发。

## 示例\{#examples}

```python
from pymilvus.bulk_writer import bulk_import

resp = bulk_import(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    collection_name="book_catalog",
    files=[
        ["s3://demo-bucket/books/part-0001.parquet"],
        ["s3://demo-bucket/books/part-0002.parquet"],
    ],
    access_key="AKIA...",
    secret_key="SECRET...",
)

print(resp.json())
```

<include  target="milvus">

```python
from pymilvus.bulk_writer import bulk_import

resp = bulk_import(
    url="https://YOUR_CLUSTER_ENDPOINT",
    api_key="username:password", # replace this with your actual credentials
    collection_name="book_catalog",
    files=[
        ["s3://demo-bucket/books/part-0001.parquet"],
        ["s3://demo-bucket/books/part-0002.parquet"],
    ],
    access_key="AKIA...",
    secret_key="SECRET...",
)

print(resp.json())
```

</include>
