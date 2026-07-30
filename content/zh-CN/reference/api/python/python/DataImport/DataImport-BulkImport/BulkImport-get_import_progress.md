---
title: "get_import_progress() | Python"
slug: /python/python/BulkImport-get_import_progress
sidebar_label: "get_import_progress()"
beta: false
added_since: Inherit
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此函数返回批量导入任务的当前状态，包括云项目数据库中按项目/区域范围限定的任务。 | Python"
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

此函数返回批量导入任务的当前状态，包括云项目数据库中按项目/区域范围限定的任务。

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
    
    project_id: str = "",
    region_id: str = "",
    
    verify: bool | str = True,
    cert: str | tuple | None = None,
    **kwargs,
)
```

**参数：**

- **url** (*str*) -

    **[必填]**

    批量导入 API 的服务器端点。

- **job_id** (*str*) -

    **[必填]**

    `bulk_import()` 返回的导入任务 ID。

- **cluster_id** (*str*) -

    云集群 ID。

- **api_key** (*str*) -

    用于云身份验证的 API 密钥。

- **db_name** (*str*) -

    用于请求路由的数据库名称。

- **project_id** (*str*) -

    有效的 Zilliz Cloud 项目 ID。 

    当你将数据批量导入到按需计算的数据库时适用。

- **region_id** (*str*) -

    有效的 Zilliz Cloud 区域 ID。

    当你将数据批量导入到按需计算的数据库时适用。

- **verify** (*bool | str*) -

    TLS 验证设置。

- **cert** (*str | tuple*) -

    客户端证书路径或 `(cert, key)` 元组。

- **project_id** (*str*) -

    附加的 HTTP 请求选项。

**返回类型：**
*requests.Response*

返回当前导入任务进度的负载。

**异常：**

- **MilvusException**

    当进度查询失败时引发。

## 示例\{#examples}

```python
from pymilvus.bulk_writer import get_import_progress

resp = get_import_progress(
    url="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    project_id="proj-xxx",
    region_id="aws-us-west-2",
    job_id="448996221577371648",
    db_name="book_db",
)

print(resp.json())
```

