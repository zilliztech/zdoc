---
title: "VolumeFileManager | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager
sidebar_label: "VolumeFileManager"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "`VolumeFileManager` インスタンスは、Zilliz Cloud のボリュームサービス上にある特定のボリュームへの接続を維持します。データファイルをボリュームにアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。 | Java | v2"
type: docx
token: DK7ZdxRCyoepyxx0odzcH66xnu3
sidebar_position: 2
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
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

`VolumeFileManager` インスタンスは、Zilliz Cloud のボリュームサービス上にある特定のボリュームへの接続を維持します。データファイルをボリュームにアップロードする前に、`VolumeFileManager` インスタンスを初期化する必要があります。

```java
io.milvus.bulkwriter.VolumeFileManager
```

## コンストラクター\{#constructor}

このコンストラクターは、Zilliz Cloud のボリュームサービス上にある特定のボリュームへの接続を維持するために設計された、新しい `VolumeFileManager` インスタンスを初期化します。

```java
VolumeFileManager(
    VolumeFileManager.newBuilder()
        .withCloudEndpoint(String cloudEndpoint)
        .withApiKey(String apiKey)
        .withVolumeName(String volumeName)
        .build();
)
```

**パラメーター:**

- **cloudEndpoint** (*str*) -

    **[必須]**

    Zilliz Cloud のエンドポイント（`https://api.cloud.zilliz.com`）です。

- **apiKey** (*str*) -

    **[必須]**

    Zilliz Cloud の Control Plane でボリュームを管理するための十分な権限を持つ Zilliz Cloud API キーです。Zilliz Cloud API キーを取得するには、[API Keys](/docs/manage-api-keys) の手順に従ってください。

- **volumeName** (*str*) -

    **[必須]**

    この操作の対象ボリュームの名前です。

**戻り値の型:**

*VolumeFileManager*

**戻り値:**

対象ボリュームの接続設定を保持する `VolumeFileManager` インスタンスで、以下のフィールドを持ちます。

**パラメーター:**

- **cloudEndpoint** (*String*) -

    ボリュームを申請し、一時ストレージ認証情報を更新するために使用される Zilliz Cloud エンドポイントです。

- **apiKey** (*String*) -

    ボリュームアクセスを認証するために使用される Zilliz Cloud API キーです。

- **volumeName** (*String*) -

    対象の Zilliz Cloud ボリュームの名前です。

- **connectType** (*ConnectType*) -

    ボリュームへのアクセスに使用される接続戦略です。値のデフォルトは `ConnectType.AUTO` です。

## 例\{#examples}

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
