---
title: "listVolumes() | Java | v2"
slug: /java/java/v2-VolumeManager-listVolumes
sidebar_label: "listVolumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "Lists volumes with optional project, type, and pagination filters. | Java | v2"
type: docx
token: CWVPd10ixoosYHxkJSScNe8mnoh
sidebar_position: 3
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - listVolumes()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listVolumes()

Lists volumes with optional project, type, and pagination filters.

```java
public ListVolumesResponse listVolumes(ListVolumesRequest request)
```

## Request Syntax\{#request-syntax}

```java
ListVolumesRequest.builder()
    .projectId(projectId)
    .pageSize(pageSize)
    .currentPage(currentPage)
    .type(type)
    .build();
```

**BUILDER METHODS:**

- `projectId(String projectId)`

    The ID of the Zilliz Cloud project.

- `pageSize(Integer pageSize)`

    The number of volumes to return on each page.

- `currentPage(Integer currentPage)`

    The page number to return.

- `type(String type)`

    The optional volume type filter: `MANAGED` or `EXTERNAL`.

**RETURNS:**

*ListVolumesResponse*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    Raised when any error occurs during this operation. Inspect the exception message for the exact failure reason.

## Example\{#example}

Lists volumes with optional project, type, and pagination filters.

```java
ListVolumesResponse response = volumeManager.listVolumes(
    ListVolumesRequest.builder()
        .projectId(PROJECT_ID)
        .type("S3")
        .currentPage(1)
        .pageSize(20)
        .build());
```
