---
title: "listVolumes() | Java | v2"
slug: /java/java/v2-VolumeManager-listVolumes
sidebar_label: "listVolumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "オプションの project、type、ページネーションフィルターを使用して volume を一覧表示します。 | Java | v2"
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

オプションの project、type、ページネーションフィルターを使用して volume を一覧表示します。

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

    Zilliz Cloud project の ID。

- `pageSize(Integer pageSize)`

    各ページで返される volume の数。

- `currentPage(Integer currentPage)`

    返されるページ番号。

- `type(String type)`

    オプションの volume type フィルター: `MANAGED` または `EXTERNAL`。

**RETURNS:**

*ListVolumesResponse*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

### Java example\{#java-example}

オプションの project、type、ページネーションフィルターを使用して volume を一覧表示します。

```java
ListVolumesResponse response = volumeManager.listVolumes(
    ListVolumesRequest.builder()
        .projectId(PROJECT_ID)
        .type("S3")
        .currentPage(1)
        .pageSize(20)
        .build());
```
