---
title: "commit() | Python"
slug: /python/python/VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将缓冲的数据持久化到本地文件，并将其上传到 VolumeBulkWriter 实例中配置的远程卷。 | Python"
type: docx
token: FfGddUVeSolWXUxHWLoc8c6JnBd
sidebar_position: 2
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - 云
  - commit()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# commit()

此操作会将缓冲的数据持久化到本地文件，并将其上传到 VolumeBulkWriter 实例中配置的远程卷。

## 请求语法\{#request-syntax}

```python
VolumeBulkWriter.commit(
    **kwargs
)
```

**参数：**

- **_async** (*bool*) -

    异步刷新开关。如果为 True，刷新操作会在后台线程中运行，该方法会立即返回。如果为 False（默认值），该方法会阻塞，直到刷新完成。

- **call_back** (*Callable[[List[str]], List[str]]*) -

    可选的回调函数，在本地文件刷新完成后调用。在 VolumeBulkWriter 中，此回调函数会在内部用于将文件上传到远程卷。

**异常：**

- **MilvusException**

    当刷新或上传操作失败时抛出。请查看服务器错误消息以了解确切的失败原因。

## 示例\{#examples}

```python
writer.commit()
```
