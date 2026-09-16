---
title: "VolumeManager | Python"
slug: /python/python/Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeManager` インスタンスは、Zilliz Cloud の Volume サービスへの接続を維持します。ボリュームを作成、一覧表示、または削除する前に、`VolumeManager` インスタンスを初期化する必要があります。 | Python"
type: docx
token: G5c6dxWkno5FRAxeDMycR6AVntf
sidebar_position: 5
keywords: 
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - 非構造化データとは
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

`VolumeManager` インスタンスは、Zilliz Cloud の Volume サービスへの接続を維持します。ボリュームを作成、一覧表示、または削除する前に、`VolumeManager` インスタンスを初期化する必要があります。

```python
class pymilvus.bulk_writer.volume_manager import VolumeManager
```

<Admonition type="info" title="Notes">

ボリュームは、データのマージ、移行、インポートなどのさらなる処理のためにデータを保持できる中間ストレージです。詳細については、Managed Volumes と External Volumes を参照してください。

</Admonition>

## コンストラクター\{#constructor}

このコンストラクターは、Zilliz Cloud の Volume サービスへの接続を維持するために設計された新しい `VolumeManager` インスタンスを初期化します。

```python
VolumeManager(
    cloud_endpoint: str,
    api_key: str
)
```

**パラメーター:**

- **cloud_endpoint** (*str*) -

    **[必須]**

    Zilliz Cloud エンドポイント（`https:<em>//</em>api.cloud.zilliz.com`）です。

- **api_key** (*str*) -

    **[必須]**

    Zilliz Cloud の Volume サービスでボリュームを管理するための十分な権限を持つ Zilliz Cloud API キーです。Zilliz Cloud API キーを取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

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
