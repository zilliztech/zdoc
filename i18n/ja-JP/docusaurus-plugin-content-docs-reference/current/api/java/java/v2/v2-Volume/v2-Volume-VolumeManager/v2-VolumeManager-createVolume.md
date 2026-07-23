---
title: "createVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-createVolume
sidebar_label: "createVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "指定されたストレージ統合とパスを使用する volume を作成します。 | Java | v2"
type: docx
token: ZQwMd6bo5otETvxWWHDcUpTMn8g
sidebar_position: 1
keywords: 
  - マネージド vector データベース
  - Pinecone vector データベース
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

指定されたストレージ統合とパスを使用する volume を作成します。

```java
public void createVolume(CreateVolumeRequest request)
```

## リクエスト構文\{#request-syntax}

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

**BUILDER メソッド:**

- `projectId(String projectId)`

    Zilliz Cloud project の ID。

- `regionId(String regionId)`

    クラウドリージョンの ID。

- `volumeName(String volumeName)`

    volume の名前。

- `type(String type)`

    volume のタイプ: `MANAGED` または `EXTERNAL`。デフォルトは `MANAGED` です。

- `storageIntegrationId(String storageIntegrationId)`

    外部 volume で使用されるストレージ統合の ID。

- `path(String path)`

    外部 volume のストレージパス。設定されている場合、パスは `/` で終わる必要があります。未設定の場合は、ストレージ統合のルートが使用されます。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合にスローされます。正確な失敗理由は例外メッセージを確認してください。

## 例\{#example}

### Java の例\{#java-example}

指定されたストレージ統合とパスを使用する volume を作成します。

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
