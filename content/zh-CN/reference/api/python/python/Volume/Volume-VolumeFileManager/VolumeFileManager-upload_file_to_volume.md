---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将指定源路径处的本地文件上传到指定托管 volume 中的目标文件路径。 | Python"
type: docx
token: Fr3rdPTuXoC0Lzx7urIcwBqWnDb
sidebar_position: 1
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - upload_file_to_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

此操作将指定源路径处的本地文件上传到指定托管 volume 中的目标文件路径。

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于托管 volume。外部 volume 为只读。

</Admonition>

## 请求语法\{#request-syntax}

```python
upload_file_to_volume(
    source_file_path: str,
    target_volume_path: str
)
```

**参数**

- **source_file_path** (*str*) -

    **[必填]**

    要上传到指定 volume 的本地数据文件路径。

- **target_volume_path** (*str*) -

    **[必填]**

    此操作完成后，指定 volume 中数据文件的路径。

**返回类型**

一个对象。

**返回值**

一个具有以下数据结构的对象：

```json
{
    "volumeName": "my_volume",
    "path": "path/to/your/data/file/in/the/volume"
}
```

- **volumeName** (*str*) -

    **[必填]**

    此操作的目标 volume 名称。

- **path** (*str*) -

    **[必填]**

    此操作完成后，指定 volume 中数据文件的路径。

## 示例\{#example}

```python
from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager

volume_file_manager = VolumeFileManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    volume_name="my_volume"
)

result = volume_file_manager.upload_file_to_volume(
    source_file_path="/path/to/your/local/data/file", 
    target_volume_path="data/"
)

print(f"\nuploadFileToVolume results\n: {result}")

# target_volume_path results: 
# 
# {
#     "volumeName": "my_volume",
#     "path": "data/"
# }
```
