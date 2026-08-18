---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたソースパスにあるローカルファイルを、指定されたマネージドボリューム内のターゲットファイルパスにアップロードします。| Python"
type: docx
token: SAR6dnlmmohi30x0x2KcioyXnib
sidebar_position: 1
keywords: 
  - 画像類似度検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似度検索
  - zilliz
  - zilliz cloud
  - クラウド
  - upload_file_to_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

この操作は、指定されたソースパスにあるローカルファイルを、指定されたマネージドボリューム内のターゲットファイルパスにアップロードします。

<Admonition type="info" icon="📘" title="Notes">

この操作はマネージドボリュームにのみ適用されます。外部ボリュームは読み取り専用です。

</Admonition>

## リクエスト構文\{#request-syntax}

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

**パラメーター:**

- **source_file_path** (*str*) -<br/>
  **[必須]**<br/>
  アップロードするローカルファイルまたはディレクトリのパス。

- **target_volume_path** (*str*) -<br/>
  **[必須]**<br/>
  Zilliz Cloudボリューム内の宛先パス。

- **upload_concurrency** (*int*) -<br/>
  デフォルト: `5`<br/>
  同時にアップロードするファイルの最大数。

- **max_retries** (*int*) -<br/>
  デフォルト: `5`<br/>
  各ファイルのアップロード試行の最大回数。

- **retry_interval** (*float*) -<br/>
  デフォルト: `5.0`<br/>
  アップロード試行間の遅延（秒単位）。

- **progress_callback** (*Callable[[UploadProgress], None] | None*) -<br/>
  デフォルト: `None`<br/>
  アップロードの進捗スナップショットとともに呼び出されるコールバック。

- **part_size** (*int*) -<br/>
  デフォルト: `0`<br/>
  マルチパートアップロードのパートサイズ（バイト単位）。`0` を使用すると、サイズが自動的に選択されます。

**戻り値の型:**

*dict*

**戻り値:**

volumeName、volume_name、およびアップロードされたターゲットパスを含む辞書。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

この例では、ファイルをボリュームにアップロードする方法を示しています。

```python
from pymilvus.bulk_writer import VolumeFileManager, VolumeManager

manager = VolumeManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY")
manager.create_volume(project_id="proj-xxxx", region_id="aws-us-west-2", volume_name="book-volume", volume_type="EXTERNAL")
manager.describe_volume("book-volume")
manager.list_volumes(project_id="proj-xxxx", volume_type="EXTERNAL")

file_manager = VolumeFileManager(cloud_endpoint="https://api.cloud.zilliz.com", api_key="YOUR_API_KEY", volume_name="book-volume")
file_manager.upload_file_to_volume(source_file_path="./data/books.parquet", target_volume_path="datasets/books/books.parquet", upload_concurrency=4)
```
