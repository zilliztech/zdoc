---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "添加了 projectid/regionid 路由和项目数据库导入行为。 | Python"
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

添加 `project_id/region_id` 路由和项目数据库导入行为。

## 请求语法\{#request-syntax}

```python
bulk_import(
    url: str,
    collection_name: str,
    db_name: str = "",
    object_url: str = "",
    object_urls: Optional[List[List[str]]] = None,
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    access_key: str = "",
    secret_key: str = "",
    token: str = "",
    volume_name: str = "",
    data_paths: Optional[List[List[str]]] = None,
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**参数：**

- **url** (*str*) -<br/>
  **[必需]**

    Zilliz Cloud API 服务器端点，即 `https://api.cloud.zilliz.com`。

- **collection_name** (*str*) -<br/>
  **[必需]**<br/>
  目标 collection 的名称。

- **db_name** (*str*) -<br/>
  默认值：`""`<br/>
  目标数据库的名称。

- **object_url** (*str*) -<br/>
  默认值：`""`<br/>
  已弃用的对象存储 URL。对于新的 Zilliz Cloud 集成，请使用 `object_urls`。

- **object_urls** (*Optional[List[List[str]]]*) -<br/>
  默认值：`None`<br/>
  包含导入数据的对象存储 URL。每个嵌套列表标识一个对象或文件夹。

- **cluster_id** (*str*) -<br/>
  默认值：`""`<br/>
  目标 Zilliz Cloud 集群的 ID。

- **project_id** (*str*) -<br/>
  默认值：`""`<br/>
  包含目标项目数据库的 Zilliz Cloud 项目的 ID。

- **region_id** (*str*) -<br/>
  默认值：`""`<br/>
  包含目标项目数据库的 Zilliz Cloud 区域的 ID。

- **api_key** (*str*) -<br/>
  默认值：`""`

    用于验证请求的 Zilliz Cloud API 密钥。

- **access_key** (*str*) -<br/>
  默认值：`""`<br/>
  Zilliz Cloud 使用的对象存储凭证的访问密钥。

- **secret_key** (*str*) -<br/>
  默认值：`""`<br/>
  Zilliz Cloud 使用的对象存储凭证的密钥。

- **token** (*str*) -<br/>
  默认值：`""`<br/>
  Zilliz Cloud 使用的临时对象存储凭证的会话令牌。

- **volume_name** (*str*) -<br/>
  默认值：`""`<br/>
  包含导入数据的 Zilliz Cloud volume 名称。

- **data_paths** (*Optional[List[List[str]]]*) -<br/>
  默认值：`None`<br/>
  Zilliz Cloud volume 中包含导入数据的路径。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  默认值：`True`<br/>
  TLS 验证设置。使用 `True` 表示使用默认信任存储进行验证，或者提供 CA 证书路径。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  默认值：`None`<br/>
  客户端证书路径，或用于双向 TLS 的证书和私钥对。

- **kwargs** (*Any*) -<br/>
  转发给 HTTP 请求的其他选项。

**返回类型：**

*requests.Response*

**返回值：**

由批量导入端点返回的 HTTP 响应。请检查 JSON 负载以获取已提交作业的标识符。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以了解确切的失败详情。

## 示例\{#examples}

以下示例将对象存储中的数据提交到 Zilliz Cloud。

```python
from pymilvus.bulk_writer import bulk_import

response = bulk_import(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
    collection_name="book_chunks",
    object_urls=[["s3://bucket/books/part-0001.parquet"]],
)
print(response.json())
```
