---
title: "abortImport() | Java | v2"
slug: /java/java/v2-BulkImport-abortImport
sidebar_label: "abortImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の一括インポートジョブを中止します。 | Java | v2"
type: docx
token: RayydoBX1oNrb0xAiOtciVyen9c
sidebar_position: 5
keywords: 
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - abortImport()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# abortImport()

この操作は、既存の一括インポートジョブを中止します。

```java
public static String abortImport(String url, BaseDescribeImportRequest request)
```

## リクエスト構文\{#request-syntax}

```java
CloudDescribeImportRequest.builder()
    .apiKey(apiKey)
    .clusterId(clusterId)
    .projectId(projectId)
    .regionId(regionId)
    .jobId(jobId)
    .build();
```

### CloudDescribeImportRequest\{#clouddescribeimportrequest}

Zilliz Cloud では `CloudDescribeImportRequest` を使用します。`clusterId` を設定するか、プロジェクトデータベースデプロイメントの場合は `projectId` と `regionId` の両方を設定します。

**ビルダーメソッド:**

- `apiKey(String apiKey)`

    認証情報です。Milvus の場合は `userName:password` を、Zilliz Cloud の場合は API キーを使用します。

- `clusterId(String clusterId)`

    Zilliz Cloud クラスターデプロイメントのクラスター ID です。

- `projectId(String projectId)`

    Zilliz Cloud プロジェクトデータベースデプロイメントのプロジェクト ID です。

- `regionId(String regionId)`

    Zilliz Cloud プロジェクトデータベースデプロイメントのリージョン ID です。

- `jobId(String jobId)`

    中止するインポートジョブの識別子です。

**戻り値の型:**

*String*

**戻り値:**

インポートエンドポイントから返される JSON レスポンス本文です。

**パラメーター:**

- **response** (*String*) -

    abort-import 呼び出しの JSON レスポンス本文です。

**例外:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

Zilliz Cloud に対して abortImport() を実行する例を示します。

```java
String response = BulkImportUtils.abortImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
