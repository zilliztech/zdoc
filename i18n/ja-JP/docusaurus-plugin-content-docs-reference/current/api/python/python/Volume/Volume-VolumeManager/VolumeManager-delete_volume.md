---
title: "delete_volume() | Python"
slug: /python/python/VolumeManager-delete_volume
sidebar_label: "delete_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は volume を削除します。 | Python"
type: docx
token: FbzLd0f5ToAPRdxa8XWcWfUwnwe
sidebar_position: 2
keywords: 
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - クラウド
  - delete_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete_volume()

この操作は volume を削除します。

## リクエスト構文\{#request-syntax}

```python
delete_volume(
    volume_name: str
)
```

**PARAMETERS**

- **volume_name** (*str*) -

    **[REQUIRED]**

    削除する volume の名前。

**RETURN TYPE**

*None*

**RETURNS**

None

## 例\{#example}

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)

volume_manager.delete_volume(
    volume_name="my_volume"
)

print(f"\nVolume my_volume deleted")

# Volume my_volume deleted
```

