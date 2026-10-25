---
title: "upload_file_to_volume() | Python"
slug: /python/python/VolumeFileManager-upload_file_to_volume
sidebar_label: "upload_file_to_volume()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、指定したソースパスにあるローカルファイルを、指定したマネージドボリューム内のターゲットファイルパスにアップロードします。 | Python"
type: docx
token: MDzcdn1cIoX5Xtx3vo9cjSeLnT4
sidebar_position: 1
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - upload_file_to_volume()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# upload_file_to_volume()

この操作では、指定したソースパスにあるローカルファイルを、指定したマネージドボリューム内のターゲットファイルパスにアップロードします。

<Admonition type="info" title="Notes">

これはマネージドボリュームにのみ適用されます。外部ボリュームは読み取り専用です。

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
    upload_policy: UploadPolicy = UploadPolicy.SKIP_IF_SAME_SIZE,
    temporary_directory: str | None = None
)
```

**パラメーター：**

- **source_file_path** (*str*) -

    **[必須]**

    指定したボリュームにアップロードするローカルデータファイルのパスです。

- **target_volume_path** (*str*) -

    **[必須]**

    この操作後における、指定したボリューム内のデータファイルのパスです。

- **upload_concurrency** (*int*) -

    並列でアップロードするファイルの最大数です。デフォルトは 5 です。

- **max_retries** (*int*) -

    失敗後にファイルごとに追加で試行できる最大回数です。デフォルトは 5 です。

- **retry_interval** (*float*) -

    再試行の間隔（秒）です。デフォルトは 5.0 です。

- **progress_callback** (*Callable[[UploadProgress], None] | None*) -

    アップロード中に、スロットリングされたアップロード進捗のスナップショットを受け取るコールバックです。

- **part_size** (*int*) -

    アップロードされる各パートのサイズ（バイト単位）です。デフォルトは 0 で、SDK が決定します。

- **upload_policy** (*UploadPolicy*) -

    既存のリモートファイルをスキップできるかどうかを決定するポリシーです。デフォルトは UploadPolicy.SKIP_IF_SAME_SIZE です。

- **temporary_directory** (*str | None*) -

    一時的なアップロード状態を保存するディレクトリです。デフォルトは None で、SDK が選択します。

**戻り値の型：**

*dict*

**戻り値：**

対象ボリューム名と、ボリューム内でのアップロード済みファイルの最終パスを含む辞書です。

**パラメーター：**

- **volumeName** (*str*) -

    この操作の対象ボリュームの名前です。

- **path** (*str*) -

    この操作後における、指定したボリューム内のデータファイルのパスです。

**例外：**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus.bulk_writer import VolumeFileManager

manager = VolumeFileManager(
    bucket_name="my-bucket",
)
progress = manager.upload_file_to_volume(
    local_path="./data.parquet",
    volume_path="import/data.parquet",
)
print(progress.uploaded_bytes)
```
