---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "同時実行、再試行、マルチパートサイズ、パス、進捗コールバックの制御を追加します。 | Python"
type: docx
token: SAR6dnlmmohi30x0x2KcioyXnib
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

同時実行、再試行、マルチパートサイズ、パス、進捗コールバックの制御を追加します。

<Admonition type="info" icon="📘" title="注意">

これは管理対象 volume にのみ適用されます。外部 volume は読み取り専用です。

</Admonition>

## Request Syntax\{#request-syntax}

```python
upload_file_to_volume(
    source_file_path: str,
    target_volume_path: str,
    upload_concurrency: int = 5,
    max_retries: int = 5,
    retry_interval: float = 5.0,
    progress_callback: Callable[[UploadProgress], None] | None = None,
    part_size: int = 0,
) -> dict
```

**PARAMETERS:**

- **source_file_path** (*str*) -<br/>
  **[REQUIRED]**<br/>
  アップロードするローカルファイルまたはディレクトリのパス。

- **target_volume_path** (*str*) -<br/>
  **[REQUIRED]**<br/>
  Zilliz Cloud volume 内の宛先パス。

- **upload_concurrency** (*int*) -<br/>
  Default: `5`<br/>
  同時にアップロードするファイルの最大数。

- **max_retries** (*int*) -<br/>
  Default: `5`<br/>
  各ファイルに対するアップロード試行の最大回数。

- **retry_interval** (*float*) -<br/>
  Default: `5.0`<br/>
  アップロード試行の間の待機時間（秒）。

- **progress_callback** (*Callable[[UploadProgress], None] | None*) -<br/>
  Default: `None`<br/>
  アップロード進捗のスナップショットとともに呼び出されるコールバック。

- **part_size** (*int*) -<br/>
  Default: `0`<br/>
  マルチパートアップロードのパートサイズ（バイト単位）。サイズを自動選択するには `0` を使用します。

**RETURN TYPE:**

*dict*

**RETURNS:**

volumeName、volume_name、およびアップロードされたターゲットパスを含む辞書。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーエラーメッセージを確認してください。

## Examples\{#examples}

この例では、volume へのファイルアップロードの使用方法を示します。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
