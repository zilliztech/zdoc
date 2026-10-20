---
title: "VolumeManager | Java | v2"
slug: /java/java/v2-Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeManager` インスタンスは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームを作成、一覧表示、または削除する前に、`VolumeManager` インスタンスを初期化する必要があります。 | Java | v2"
type: docx
token: QHyGdm4FyoFwCzxDgUUc9yQrnPf
sidebar_position: 4
keywords: 
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密埋め込み
  - Faiss ベクトルデータベース
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

`VolumeManager` インスタンスは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームを作成、一覧表示、または削除する前に、`VolumeManager` インスタンスを初期化する必要があります。

```java
io.milvus.bulkwriter.VolumeManager
```

## コンストラクター\{#constructor}

このコンストラクターは、Zilliz Cloud のボリュームサービスへの接続を維持するように設計された新しい `VolumeManager` インスタンスを初期化します。

```java
VolumeManager(
    VolumeManagerParam.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .build();
)
```

**パラメーター:**

- **cloudEndpoint** (*str*) -

    **[必須]**

    Zilliz Cloud エンドポイント（`https://api.cloud.zilliz.com`）です。

- **apiKey** (*str*) -

    **[必須]**

    Zilliz Cloud のボリュームサービスでボリュームを管理するための十分な権限を持つ Zilliz Cloud API キーです。Zilliz Cloud API キーを取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

**戻り値の型:**

*VolumeManager*

**戻り値:**

Zilliz Cloud のボリュームサービスへの接続設定を保持する `VolumeManager` インスタンスです。このインスタンスには、以下のフィールドがあります。

**パラメーター:**

- **cloudEndpoint** (*String*) -

    ボリュームサービスへのアクセスに使用される Zilliz Cloud エンドポイントです。

- **apiKey** (*String*) -

    ボリュームのライフサイクル操作を認証するために使用される Zilliz Cloud API キーです。

## 例\{#examples}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```
