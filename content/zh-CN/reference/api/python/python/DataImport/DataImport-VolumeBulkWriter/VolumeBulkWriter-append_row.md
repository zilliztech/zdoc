---
title: "append_row() | Python"
slug: /python/python/VolumeBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向内部缓冲区追加一行数据。当缓冲区大小超过配置的 chunk 大小后，缓冲区会自动刷新到本地文件，并上传到远程存储卷。 | Python"
type: docx
token: Wlw2dkci9oDVsmx8hkDcf85qndf
sidebar_position: 1
keywords: 
  - 大语言模型
  - 机器学习
  - 检索增强生成
  - 自然语言处理
  - zilliz
  - Zilliz Cloud
  - 云
  - append_row()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# append_row()

此操作会向内部缓冲区追加一行数据。当缓冲区大小超过配置的 chunk 大小后，缓冲区会自动刷新到本地文件，并上传到远程存储卷。

## 请求语法\{#request-syntax}

```python
VolumeBulkWriter.append_row(
    row: Dict[str, Any],
    **kwargs
)
```

**参数：**

- **row**（*Dict[str, Any]*）-

    **[必需]**

    表示单行数据的字典。键必须与 Collection Schema 中定义的字段名称一致，值必须符合对应的字段类型。

**异常：**

- **MilvusException**

    当行数据未通过 Collection Schema 验证时抛出。请查看服务器错误消息以获取确切的失败原因。

## 示例\{#examples}

```python
writer.append_row(
    row={
        "id": 1,
        "vector": [0.1] * 128,
    },
)
```
