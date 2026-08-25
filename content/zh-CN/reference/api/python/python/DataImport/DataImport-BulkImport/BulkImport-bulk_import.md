---
title: "bulk_import() | Python"
slug: /python/python/BulkImport-bulk_import
sidebar_label: "bulk_import()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此函数用于向开源 Milvus 或 Zilliz Cloud 提交批量导入任务。 | Python"
type: docx
token: HVwRdVSbAo2jUexpxmdczdqPnzh
sidebar_position: 1
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
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

此函数用于向开源 Milvus 或 Zilliz Cloud 提交批量导入任务。

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
  **[必填]**

    Zilliz Cloud API 服务器 Endpoint，即 `https://api.cloud.zilliz.com`。

- **collection_name** (*str*) -<br/>
  **[必填]**<br/>
  目标 Collection 的名称。

- **db_name** (*str*) -<br/>
  默认值：`""`<br/>
  目标 Database 的名称。

- **object_url** (*str*) -<br/>
  默认值：`""`<br/>
  已弃用的对象存储 URL。对于新的 Zilliz Cloud 集成，请使用 `object_urls`。

- **object_urls** (*Optional[List[List[str]]]*) -<br/>
  默认值：`None`<br/>
  包含导入数据的对象存储 URL。每个嵌套列表对应一个对象或文件夹。

- **cluster_id** (*str*) -<br/>
  默认值：`""`<br/>
  目标 Zilliz Cloud 集群的 ID。

- **project_id** (*str*) -<br/>
  默认值：`""`<br/>
  包含目标项目 Database 的 Zilliz Cloud 项目 ID。

- **region_id** (*str*) -<br/>
  默认值：`""`<br/>
  包含目标项目 Database 的 Zilliz Cloud 地域 ID。

- **api_key** (*str*) -<br/>
  默认值：`""`

    用于验证请求身份的 Zilliz Cloud API 密钥。

- **access_key** (*str*) -<br/>
  默认值：`""`<br/>
  Zilliz Cloud 所使用的对象存储凭据中的访问密钥。

- **secret_key** (*str*) -<br/>
  默认值：`""`<br/>
  Zilliz Cloud 所使用的对象存储凭据中的私有密钥。

- **token** (*str*) -<br/>
  默认值：`""`<br/>
  Zilliz Cloud 所使用的临时对象存储凭据的会话令牌。

- **volume_name** (*str*) -<br/>
  默认值：`""`<br/>
  包含导入数据的 Zilliz Cloud 卷名称。

- **data_paths** (*Optional[List[List[str]]]*) -<br/>
  默认值：`None`<br/>
  Zilliz Cloud 卷中包含导入数据的路径。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  默认值：`True`<br/>
  TLS 验证设置。设为 `True` 可使用默认信任库进行验证，也可指定 CA 证书路径。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  默认值：`None`<br/>
  客户端证书路径，或用于双向 TLS 认证的证书与私钥对。

- **kwargs** (*Any*) -<br/>
  传递给 HTTP 请求的额外选项。

**返回类型：**

*requests.Response*

**返回值：**

批量导入 Endpoint 返回的 HTTP 响应。请查看 JSON 载荷以获取已提交任务的标识符。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 调用失败时抛出。请检查服务器错误信息以了解具体的失败原因。

## 示例\{#examples}

以下示例演示如何将对象存储中的数据提交至 Zilliz Cloud。

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
