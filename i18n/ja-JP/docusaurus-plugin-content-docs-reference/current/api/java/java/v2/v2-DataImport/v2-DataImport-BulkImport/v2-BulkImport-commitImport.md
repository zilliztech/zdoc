---
title: "commitImport() | Java | v2"
slug: /java/java/v2-BulkImport-commitImport
sidebar_label: "commitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、準備済みの一括インポートジョブをコミットします。 | Java | v2"
type: docx
token: DFyndL57goJMr0xAcMEcVq5Lnhh
sidebar_position: 6
keywords: 
  - NLP
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - zilliz
  - zilliz cloud
  - クラウド
  - commitImport()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# commitImport()

この操作は、準備済みの一括インポートジョブをコミットします。

```java
public static String commitImport(String url, BaseDescribeImportRequest request)
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

Zilliz Cloud では `CloudDescribeImportRequest` を使用します。`clusterId` を設定するか、プロジェクトデータベースデプロイメントでは `projectId` と `regionId` の両方を設定します。

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

    コミットするインポートジョブの識別子です。

**戻り値の型:**

*String*

**戻り値:**

インポートエンドポイントから返される JSON レスポンス本文です。

**パラメーター:**

- **response** (*String*) -

    commit-import 呼び出しの JSON レスポンス本文です。

**例外:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

Zilliz Cloud に対する commitImport() の例を示します。

```java
String response = BulkImportUtils.commitImport(CLOUD_URL,
    CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(JOB_ID)
        .build());
```
