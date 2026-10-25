---
title: "uploadFilesAsync() | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、再試行、同時実行数、マルチパート、進捗レポートを設定して、ファイルまたはディレクトリを Zilliz Cloud ボリュームに非同期でアップロードします。 | Java | v2"
type: docx
token: Op8ydBXyZo2rlZxhgfNcaC3unRg
sidebar_position: 1
keywords: 
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースはどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFilesAsync()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# uploadFilesAsync()

この操作では、再試行、同時実行数、マルチパート、進捗レポートを設定して、ファイルまたはディレクトリを Zilliz Cloud ボリュームに非同期でアップロードします。

```java
public CompletableFuture<UploadFilesResult> uploadFilesAsync(UploadFilesRequest request)
```

## リクエスト構文\{#request-syntax}

```java
UploadFilesRequest.builder()
    .sourceFilePath(sourceFilePath)
    .targetVolumePath(targetVolumePath)
    .uploadConcurrency(uploadConcurrency)
    .maxRetries(maxRetries)
    .retryIntervalMillis(retryIntervalMillis)
    .progressListener(progressListener)
    .partSizeBytes(partSizeBytes)
    .build();
```

**ビルダーメソッド：**

- `sourceFilePath(String sourceFilePath)`

    アップロード対象のローカルファイルまたはディレクトリです。

- `targetVolumePath(String targetVolumePath)`

    ボリューム内の宛先ディレクトリです。

- `uploadConcurrency(int uploadConcurrency)`

    同時にアップロードするファイルの最大数です。

- `maxRetries(int maxRetries)`

    各ファイルの最大再試行回数です。

- `retryIntervalMillis(long retryIntervalMillis)`

    再試行の間隔（ミリ秒）です。

- `progressListener(ProgressListener progressListener)`

    UploadProgress のスナップショットを受け取るコールバックです。

- `partSizeBytes(long partSizeBytes)`

    マルチパートアップロードのパートサイズ（バイト単位）です。0 以下の値を指定すると、自動サイズ調整が有効になります。

**戻り値の型：**

*CompletableFuture&lt;UploadFilesResult&gt;*

**戻り値：**

すべてのファイルがアップロードされると、対象のボリュームとアップロードされたパスを識別する **UploadFilesResult** で完了する **CompletableFuture** です。以下のフィールドを持ちます。

**パラメーター：**

- **volumeName** (*String*) -

    ファイルのアップロード先であるボリュームの名前です。

- **path** (*String*) -

    ボリューム内のアップロード済みファイルのパスです。

**例外：**

- **Exception**

    リクエストの検証、トランスポート、またはサーバー実行に失敗した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
CompletableFuture<UploadFilesResult> future = manager.uploadFilesAsync(UploadFilesRequest.builder()
    .sourceFilePath("./data")
    .targetVolumePath("imports/")
    .uploadConcurrency(5)
    .maxRetries(5)
    .progressListener(progress -> System.out.println(progress.getPercent()))
    .build());
```
