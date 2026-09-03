---
title: "VolumeManager | Python"
slug: /python/python/Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeManager` インスタンスは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームの作成、一覧表示、または削除を行う前に、`VolumeManager` インスタンスを初期化する必要があります。 | Python"
type: docx
token: G5c6dxWkno5FRAxeDMycR6AVntf
sidebar_position: 5
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeManager
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# VolumeManager

`VolumeManager` インスタンスは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームの作成、一覧表示、または削除を行う前に、`VolumeManager` インスタンスを初期化する必要があります。

```python
class pymilvus.bulk_writer.volume_manager import VolumeManager
```

<Admonition type="info" icon="📘" title="Notes">

ボリュームは、データのマージ、移行、インポートなどの追加処理のためにデータを保持できる中間ストレージスポットです。詳細については、Managed Volumes and External Volumes を参照してください。

</Admonition>

## コンストラクタ\{#constructor}

このコンストラクタは、Zilliz Cloud のボリュームサービスへの接続を維持するために設計された新しい `VolumeManager` インスタンスを初期化します。

```python
VolumeManager(
    cloud_endpoint: str,
    api_key: str
)
```

**パラメーター:**

- **cloud_endpoint** (*str*) -

    **[必須]**

    `https://api.cloud.zilliz.com` である Zilliz Cloud エンドポイント。

- **api_key** (*str*) -

    **[必須]**

    Zilliz Cloud のボリュームサービスでボリュームを管理するのに十分な権限を持つ Zilliz Cloud API キー。Zilliz Cloud API キーを取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

**戻り値の型:**

`VolumeManager`

**戻り値:**

`VolumeManager` インスタンス。

## 例\{#examples}

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

