---
title: "list_import_jobs() | Python"
slug: /python/python/BulkImport-list_import_jobs
sidebar_label: "list_import_jobs()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此函数列出批量导入任务，并支持可选的 collection 和分页过滤；对于 project 数据库，还包括 project/region 过滤。 | Python"
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

此函数列出批量导入任务，并支持可选的 collection 和分页过滤；对于 project 数据库，还包括 project/region 过滤。

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

    用于批量导入 API 的服务器端点。

- **collection_name** (*str*) -

    可选的 collection 过滤条件。

- **db_name** (*str*) -

    可选的数据库过滤条件。

- **cluster_id** (*str*) -

    Cloud cluster ID。

- **api_key** (*str*) -

    用于云认证的 API key。

- **page_size** (*int*) -

    每页返回的任务数量。

- **current_page** (*int*) -

    要查询的页码。

- **project_id** (*str*) -

    有效的 Zilliz Cloud project ID。 

    当你向按需计算数据库执行批量导入时适用。

- **region_id** (*str*) -

    有效的 Zilliz Cloud region ID。

    当你向按需计算数据库执行批量导入时适用。

- **verify** (*bool | str*) -

    TLS 验证设置。

- **cert** (*str | tuple*) -

    客户端证书路径或 `(cert, key)` 元组。

- **project_id** (*str*) -

    额外的 HTTP 请求选项。

**返回类型：**
*requests.Response*

返回分页后的导入任务列表。

包含分页导入任务摘要的 HTTP 响应。

**异常：**

- **MilvusException**

    在列出任务失败时引发。

## 示例\{#examples}

```python
from pymilvus.bulk_writer import list_import_jobs

resp = list_import_jobs(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    collection_name="book_catalog",
    page_size=20,
    current_page=1,
)

print(resp.json())
```

