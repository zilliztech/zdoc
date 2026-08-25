---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此函数用于返回批量导入任务的当前状态。 | Python"
type: docx
token: CNQIdgQvXoux0KxpXHxca8EMnjg
sidebar_position: 2
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - get_import_progress()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_import_progress()

此函数用于返回批量导入任务的当前状态。

## 请求语法\{#request-syntax}

```python
get_import_progress(
    url: str,
    job_id: str,
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    db_name: str = "",
    verify: Optional[Union[bool, str]] = True,
    cert: Optional[Union[str, tuple]] = None,
    **kwargs,
) -> requests.Response
```

**参数：**

- **url** (*str*) -<br/>
  **[必填]**

    Zilliz Cloud API 服务器 Endpoint，即 `https://api.cloud.zilliz.com`。

- **job_id** (*str*) -<br/>
  **[必填]**<br/>
  要查询的导入任务 ID。

- **cluster_id** (*str*) -<br/>
  默认值：`""`<br/>
  目标 Zilliz Cloud 集群的 ID。

- **project_id** (*str*) -<br/>
  默认值：`""`<br/>
  包含目标 Database 的 Zilliz Cloud 项目 ID。

- **region_id** (*str*) -<br/>
  默认值：`""`<br/>
  包含目标 Database 的 Zilliz Cloud 地域 ID。

- **api_key** (*str*) -<br/>
  默认值：`""`

    用于验证请求身份的 Zilliz Cloud API 密钥。

- **db_name** (*str*) -<br/>
  默认值：`""`<br/>
  在 `DB-Name` 请求头中传递的 Database 名称，用于基于角色的访问控制。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  默认值：`True`<br/>
  TLS 验证配置。设置为 `True` 时使用默认信任库进行验证，也可指定 CA 证书路径。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  默认值：`None`<br/>
  客户端证书路径，或用于双向 TLS 认证的证书与私钥对。

- **kwargs** (*Any*) -<br/>
  传递给 HTTP 请求的额外选项。

**返回类型：**

*requests.Response*

**返回值：**

包含批量导入任务当前状态及进度的 HTTP 响应。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 调用失败时抛出。请查看服务器返回的错误信息以了解具体失败原因。

## 示例\{#examples}

以下示例演示如何从 Zilliz Cloud 获取导入进度。

```python
from pymilvus.bulk_writer import get_import_progress

response = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
    job_id="job-123",
)
print(response.json())
```
