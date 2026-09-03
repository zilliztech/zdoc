---
title: "VolumeFileManager | Python"
slug: /python/python/Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeFileManager` インスタンスは、特定の Zilliz Cloud 管理ボリュームへの接続を維持します。ボリュームにデータファイルをアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。 | Python"
type: docx
token: IbWgdAwWOoTa1exF2LicP9henJJ
sidebar_position: 2
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeFileManager
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeFileManager

`VolumeFileManager` インスタンスは、特定の Zilliz Cloud 管理ボリュームへの接続を維持します。ボリュームにデータファイルをアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。

```python
class pymilvus.bulk_writer.volume_file_manager import VolumeFileManager
```

<Admonition type="info" icon="📘" title="Notes">

このメソッドは、Zilliz Cloud 上の管理ボリュームにファイルをアップロードします。外部オブジェクトストレージ内のデータへの読み取り専用参照である外部ボリュームにはファイルをアップロードしません。詳細については、Managed Volumes and External Volumes を参照してください。

</Admonition>

## コンストラクタ\{#constructor}

このコンストラクタは、特定の Zilliz Cloud ボリュームへの接続を維持するために設計された新しい `VolumeFileManager` インスタンスを初期化します。

```python
VolumeFileManager(
    cloud_endpoint: str,
    api_key: str,
    volume_name: str
)
```

**パラメーター:**

- **cloud_endpoint** (*str*) -

    **[必須]**

    `https://api.cloud.zilliz.com` である Zilliz Cloud エンドポイント。

- **api_key** (*str*) -

    **[必須]**

    Zilliz Cloud のボリュームサービスでボリュームを管理するのに十分な権限を持つ Zilliz Cloud API キー。Zilliz Cloud API キーを取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

- **volume_name** (*str*) -

    **[必須]**

    この操作の対象ボリュームの名前。

**戻り値の型:**

`VolumeFileManager`

**戻り値:**

`VolumeFileManager` インスタンス。

## 例\{#examples}

```python
from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager

volume_file_manager = VolumeFileManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY",
    volume_name="my_volume"
)
```

