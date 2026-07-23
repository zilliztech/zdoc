---
title: "createVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-createVolume
sidebar_label: "createVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "Creates a volume backed by the specified storage integration and path. | Java | v2"
type: docx
token: ZQwMd6bo5otETvxWWHDcUpTMn8g
sidebar_position: 1
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
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

Creates a volume backed by the specified storage integration and path.

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

    The ID of the Zilliz Cloud project.

- `regionId(String regionId)`

    The ID of the cloud region.

- `volumeName(String volumeName)`

    The name of the volume.

- `type(String type)`

    The volume type: `MANAGED` or `EXTERNAL`. The default is `MANAGED`.

- `storageIntegrationId(String storageIntegrationId)`

    The ID of the storage integration used by an external volume.

- `path(String path)`

    The storage path for an external volume. If set, the path must end with `/`; otherwise the storage integration root is used.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    Raised when any error occurs during this operation. Inspect the exception message for the exact failure reason.

## Example\{#example}

Creates a volume backed by the specified storage integration and path.

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
