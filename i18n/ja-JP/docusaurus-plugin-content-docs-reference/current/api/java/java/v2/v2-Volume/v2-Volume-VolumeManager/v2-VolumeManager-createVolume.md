---
title: "createVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-createVolume
sidebar_label: "createVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "指定された storage integration とパスに基づく volume を作成します。 | Java | v2"
type: docx
token: ZQwMd6bo5otETvxWWHDcUpTMn8g
sidebar_position: 1
keywords: 
  - マネージド vector database
  - Pinecone vector database
  - Audio search
  - semantic search とは
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

指定された storage integration とパスに基づく volume を作成します。

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

    Zilliz Cloud project の ID。

- `regionId(String regionId)`

    cloud region の ID。

- `volumeName(String volumeName)`

    volume の名前。

- `type(String type)`

    volume のタイプ: `MANAGED` または `EXTERNAL`。デフォルトは `MANAGED` です。

- `storageIntegrationId(String storageIntegrationId)`

    external volume で使用される storage integration の ID。

- `path(String path)`

    external volume の storage path。設定する場合、パスは `/` で終わる必要があります。それ以外の場合は storage integration のルートが使用されます。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

指定された storage integration とパスに基づく volume を作成します。

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
