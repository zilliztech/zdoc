---
title: "VolumeManager | Java | v2"
slug: /java/java/v2-Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeManager` インスタンスは、Zilliz Cloud の Volume サービスへの接続を維持します。volume を作成、一覧表示、または削除する前に、`VolumeManager` インスタンスを初期化する必要があります。 | Java | v2"
type: docx
token: QHyGdm4FyoFwCzxDgUUc9yQrnPf
sidebar_position: 4
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeManager
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeManager

`VolumeManager` インスタンスは、Zilliz Cloud の Volume サービスへの接続を維持します。volume を作成、一覧表示、または削除する前に、`VolumeManager` インスタンスを初期化する必要があります。

```java
io.milvus.bulkwriter.VolumeManager
```

<Admonition type="info" icon="📘" title="注意">

volume は、中間ストレージの場所であり、データのマージ、移行、またはインポートなどの後続処理のためにデータを保持できます。詳細については、[Volume](/docs/volume) を参照してください。

</Admonition>

## Constructor\{#constructor}

このコンストラクターは、Zilliz Cloud の Volume サービスへの接続を維持するために設計された新しい `VolumeManager` インスタンスを初期化します。

```java
VolumeManager(
    VolumeManagerParam.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .build();
)
```

**PARAMETERS:**

- **cloudEndpoint** (*str*) -

    **[REQUIRED]**

    Zilliz Cloud エンドポイント。`https:*//*api.cloud.zilliz.com` です。

- **apiKey** (*str*) -

    **[REQUIRED]**

    Zilliz Cloud の Volume サービスで volume を管理するための十分な権限を持つ Zilliz Cloud API key です。Zilliz Cloud API key を取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

**RETURN TYPE:**

`VolumeManager`

**RETURNS:**

`VolumeManager` インスタンス。

## Examples\{#examples}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

