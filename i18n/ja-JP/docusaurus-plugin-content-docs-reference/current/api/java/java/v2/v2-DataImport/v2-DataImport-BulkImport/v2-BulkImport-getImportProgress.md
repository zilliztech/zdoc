---
title: "getImportProgress() | Java | v2"
slug: /java/java/v2-BulkImport-getImportProgress
sidebar_label: "getImportProgress()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された bulk-import ジョブの進行状況を取得します。 | Java | v2"
type: docx
token: EjnFdC5EfoIkoExSBOxcEC2hnbg
sidebar_position: 3
keywords: 
  - Deep Learning
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - getImportProgress()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getImportProgress()

この操作は、指定された bulk-import ジョブの進行状況を取得します。

```java
public static String getImportProgress(String url, BaseDescribeImportRequest request)
```

## リクエスト構文\{#request-syntax}

```java
bulkImport.getImportProgress(
    url,
    request
)
```

**パラメーター:**

- **url** (*String*) -

    Zilliz Cloud の Control Plane API エンドポイント。エンドポイント URL は次の形式である必要があります。

    ```python
    https://api.cloud.zilliz.com
    ```

- **request** (*[BaseDescribeImportRequest](./v2-BulkImport-getImportProgress#basedescribeimportrequest)*) -  

    **BaseImportRequest** インスタンス。

**戻り値の型:**

*String*

**戻り値:**

指定された import ジョブの進行状況。

## BaseDescribeImportRequest\{#basedescribeimportrequest}

**BaseDescribeImportRequest** インスタンスは **CloudDescribeImportRequest** で実装されています。

### CloudDescribeImportRequest\{#clouddescribeimportrequest}

```java
CloudDescribeImportRequest.builder()
    .apiKey(String apiKey)
    .jobId(String jobId)
    .build()
```

**ビルダーメソッド:**

- `apiKey(String apiKey)`

    クラスターを操作するための十分な権限を持つ、有効な Zilliz Cloud API キー。

- `jobId(String jobId)`

    既存の import ジョブの ID。

## 例\{#example}

```java

```

