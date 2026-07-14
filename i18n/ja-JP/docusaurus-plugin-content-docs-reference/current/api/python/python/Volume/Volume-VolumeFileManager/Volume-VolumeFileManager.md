---
title: "VolumeFileManager | Python"
slug: /python/python/Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeFileManager` インスタンスは、特定の Zilliz Cloud マネージドボリュームへの接続を維持します。ボリュームにデータファイルをアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。 | Python"
type: docx
token: IbWgdAwWOoTa1exF2LicP9henJJ
sidebar_position: 2
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
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

`VolumeFileManager` インスタンスは、特定の Zilliz Cloud マネージドボリュームへの接続を維持します。ボリュームにデータファイルをアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。

```python
class pymilvus.bulk_writer.volume_file_manager import VolumeFileManager
```

<Admonition type="info" icon="📘" title="注意">

このメソッドは、Zilliz Cloud 上のマネージドボリュームにファイルをアップロードします。外部ボリュームにはファイルをアップロードしません。外部ボリュームは、外部オブジェクトストレージ内のデータへの読み取り専用参照です。詳細については、[Volume](/docs/volume) を参照してください。

</Admonition>

## コンストラクタ\{#constructor}

このコンストラクタは、特定の Zilliz Cloud ボリュームへの接続を維持するための新しい `VolumeFileManager` インスタンスを初期化します。

```python
VolumeFileManager(
    cloud_endpoint: str,
    api_key: str,
    volume_name: str
)
```

**パラメータ:**

- **cloud_endpoint** (*str*) -

    **[必須]**

    Zilliz Cloud エンドポイントです。`https://api.cloud.zilliz.com` です。

- **api_key** (*str*) -

    **[必須]**

    Zilliz Cloud の Volume サービスでボリュームを管理するための十分な権限を持つ、Zilliz Cloud API キーです。Zilliz Cloud API キーを取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

- **volume_name** (*str*) -

    **[必須]**

    この操作の対象ボリュームの名前です。

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

