---
title: "createVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-createVolume
sidebar_label: "createVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "指定されたストレージ統合とパスを使用するボリュームを作成します。 | Java | v2"
type: docx
token: ZQwMd6bo5otETvxWWHDcUpTMn8g
sidebar_position: 1
keywords: 
  - 管理されたベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - cloud
  - createVolume()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createVolume()

指定されたストレージ統合とパスを使用するボリュームを作成します。

```java
public void createVolume(CreateVolumeRequest request)
```

## Request Syntax\{#request-syntax}

```java
CreateVolumeRequest.builder()
    .projectId(projectId)
    .regionId(regionId)
    .volumeName(volumeName)
    .type(type)
    .storageIntegrationId(storageIntegrationId)
    .path(path)
    .build();
```

**BUILDER METHODS:**

- `projectId(String projectId)`

    Zilliz Cloud プロジェクトの ID。

- `regionId(String regionId)`

    クラウドリージョンの ID。

- `volumeName(String volumeName)`

    ボリュームの名前。

- `type(String type)`

    ボリュームのタイプ: `MANAGED` または `EXTERNAL`。デフォルトは `MANAGED` です。

- `storageIntegrationId(String storageIntegrationId)`

    外部ボリュームで使用されるストレージ統合の ID。

- `path(String path)`

    外部ボリュームのストレージパス。設定する場合、パスは `/` で終わる必要があります。それ以外の場合は、ストレージ統合のルートが使用されます。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

指定されたストレージ統合とパスを使用するボリュームを作成します。

```java
volumeManager.createVolume(CreateVolumeRequest.builder()
    .projectId(PROJECT_ID)
    .regionId(REGION_ID)
    .volumeName("bulk-data")
    .type("S3")
    .storageIntegrationId(STORAGE_INTEGRATION_ID)
    .path("s3://bucket/prefix")
    .build());
```
