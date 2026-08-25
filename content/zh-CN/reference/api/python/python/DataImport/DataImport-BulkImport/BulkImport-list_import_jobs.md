---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此函数用于列出批量导入任务，支持按 Collection 和分页条件进行可选筛选。 | Python"
type: docx
token: N13hd7jVjoA6B1xlgwic2GKRn5f
sidebar_position: 3
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - list_import_jobs()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_import_jobs()

此函数用于列出批量导入任务，支持按 Collection 和分页条件进行可选筛选。

## 请求语法\{#request-syntax}

```python
list_import_jobs(
    url: str,
    collection_name: str = "",
    db_name: str = "",
    cluster_id: str = "",
    project_id: str = "",
    region_id: str = "",
    api_key: str = "",
    page_size: int = 10,
    current_page: int = 1,
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
  默认值：`""`<br/>
  待查询导入任务的 Collection 名称。

- **db_name** (*str*) -<br/>
  默认值：`""`<br/>
  待查询导入任务的 Database 名称。

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

    用于请求身份验证的 Zilliz Cloud API 密钥。

- **page_size** (*int*) -<br/>
  默认值：`10`<br/>
  每页返回的最大导入任务数。

- **current_page** (*int*) -<br/>
  默认值：`1`<br/>
  要返回的页码（从 1 开始）。

- **verify** (*Optional[Union[bool, str]]*) -<br/>
  默认值：`True`<br/>
  TLS 验证设置。设为 `True` 时使用默认信任存储进行验证，也可指定 CA 证书路径。

- **cert** (*Optional[Union[str, tuple]]*) -<br/>
  默认值：`None`<br/>
  客户端证书路径，或用于双向 TLS 认证的证书与私钥对。

- **kwargs** (*Any*) -<br/>
  传递给 HTTP 请求的额外选项。

**返回类型：**

*requests.Response*

**返回值：**

包含匹配导入任务及分页信息的 HTTP 响应。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取具体失败原因。

## 示例\{#examples}

以下示例展示了如何列出 Zilliz Cloud 中的导入任务。

```python
from pymilvus.bulk_writer import list_import_jobs

response = list_import_jobs(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxxx",
    region_id="aws-us-west-2",
)
print(response.json())
```
