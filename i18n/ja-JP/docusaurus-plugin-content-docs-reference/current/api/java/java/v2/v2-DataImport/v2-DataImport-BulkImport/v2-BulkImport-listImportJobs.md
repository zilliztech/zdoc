---
title: "listImportJobs() | Java | v2"
slug: /java/java/v2-BulkImport-listImportJobs
sidebar_label: "listImportJobs()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection に関する既存のすべてのインポートジョブを一覧表示します。 | Java | v2"
type: docx
token: CN9sdiCicoERZpx9GhmcLa4Wn7g
sidebar_position: 4
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - milvus とは
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - listImportJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listImportJobs()

この操作は、指定された collection に関する既存のすべてのインポートジョブを一覧表示します。

```java
public static String listImportJobs(String url, BaseListImportJobsRequest request)
```

## リクエスト構文\{#request-syntax}

```java
bulkImport.listImportJobs(
    url,
    request
)
```

**パラメータ:**

- **url** (*String*) -

    Zilliz Cloud の Control Plane API エンドポイント。エンドポイント URL は次の形式である必要があります。

    ```python
    https://api.cloud.zilliz.com
    ```

- **request** (*[BaseListImportRequest](./v2-BulkImport-listImportJobs#baselistimportrequest)*) -  

    **BaseImportRequest** インスタンス。

**戻り値の型:**

*String*

**戻り値:**

指定された collection のインポートジョブ ID の一覧。

## BaseListImportRequest\{#baselistimportrequest}

**BaseListImportRequest** インスタンスは **CloudListImportRequest** で実装されます。

### CloudListImportRequest\{#cloudlistimportrequest}

```java
CloudListImportRequest.builder()
    .apiKey(String apiKey)
    .collectionName(String collectionName)
    .build()
```

**ビルダーメソッド:**

- `apiKey(String apiKey)`

    cluster を操作するための十分な権限を持つ有効な Zilliz Cloud API key。

- `collectionName(String collectionName)`

    この操作の対象 collection の名前。

## 例\{#example}

```java

```

