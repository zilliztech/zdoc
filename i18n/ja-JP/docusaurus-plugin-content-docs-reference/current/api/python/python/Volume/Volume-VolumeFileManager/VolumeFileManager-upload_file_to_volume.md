---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたソースパスにあるローカルファイルを、指定された managed volume 内のターゲットファイルパスにアップロードします。 | Python"
type: docx
token: Fr3rdPTuXoC0Lzx7urIcwBqWnDb
sidebar_position: 1
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
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

この操作は、指定されたソースパスにあるローカルファイルを、指定された managed volume 内のターゲットファイルパスにアップロードします。

<Admonition type="info" icon="📘" title="注意">

これは managed volume にのみ適用されます。external volume は読み取り専用です。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
upload_file_to_volume(
    source_file_path: str,
    target_volume_path: str
)
```

**パラメーター**

- **source_file_path** (*str*) -

    **[REQUIRED]**

    指定された volume にアップロードするローカルデータファイルへのパス。

- **target_volume_path** (*str*) -

    **[REQUIRED]**

    この操作後に指定された volume 内でのデータファイルのパス。

**戻り値の型**

オブジェクト。

**戻り値**

以下のデータ構造を持つオブジェクト:

```json
{
    "volumeName": "my_volume",
    "path": "path/to/your/data/file/in/the/volume"
}
```

- **volumeName** (*str*) -

    **[REQUIRED]**

    この操作のターゲット volume の名前。

- **path** (*str*) -

    **[REQUIRED]**

    この操作後に指定された volume 内でのデータファイルのパス。

## 例\{#example}

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
