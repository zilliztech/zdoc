---
title: "VolumeFileManager | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeFileManager` インスタンスは、Zilliz Cloud の Volume サービス上の特定の volume への接続を維持します。volume にデータファイルをアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。 | Java | v2"
type: docx
token: DK7ZdxRCyoepyxx0odzcH66xnu3
sidebar_position: 2
keywords: 
  - オープンソース vector db
  - vector database の例
  - rag vector database
  - vector db とは
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeFileManager
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeFileManager

`VolumeFileManager` インスタンスは、Zilliz Cloud の Volume サービス上の特定の volume への接続を維持します。volume にデータファイルをアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。

```java
io.milvus.bulkwriter.VolumeFileManager
```

<Admonition type="info" icon="📘" title="注意">

volume は、データのマージ、移行、インポートなど、後続の処理のためにデータを保持できる中間ストレージです。詳細については、[Volume](/docs/volume) を参照してください。

</Admonition>

## Constructor\{#constructor}

このコンストラクタは、Zilliz Cloud の Volume サービス上の特定の volume への接続を維持するための、新しい `VolumeFileManager` インスタンスを初期化します。

```java
VolumeFileManager(
    VolumeFileManager.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .withVolumeName(String volumeName)
        .build();
)
```

**PARAMETERS:**

- **cloudEndpoint** (*str*) -

    **[REQUIRED]**

    `https://api.cloud.zilliz.com` である Zilliz Cloud エンドポイント。

- **apiKey** (*str*) -

    **[REQUIRED]**

    Zilliz Cloud の Control Plane 上で volume を管理するための十分な権限を持つ、あなたの Zilliz Cloud API key。Zilliz Cloud API key を取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

- **volumeName** (*str*) -

    **[REQUIRED]**

    この操作の対象 volume の名前。

**RETURN TYPE:**

`VolumeFileManager`

**RETURNS:**

`VolumeFileManager` インスタンス。

## Examples\{#examples}

```java
import io.milvus.bulkwriter.VolumeFileManager;
import io.milvus.bulkwriter.VolumeFileManagerParam;

VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withVolumeName("my_volume")
    .build();

VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
```

