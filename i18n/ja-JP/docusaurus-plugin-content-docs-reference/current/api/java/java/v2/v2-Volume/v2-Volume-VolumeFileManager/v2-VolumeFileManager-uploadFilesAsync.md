---
title: "uploadFilesAsync() | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "再試行、同時実行数、マルチパート、進捗レポートを設定して、ファイルまたはディレクトリを Zilliz Cloud volume に非同期でアップロードします。 | Java | v2"
type: docx
token: Op8ydBXyZo2rlZxhgfNcaC3unRg
sidebar_position: 5
keywords: 
  - ANN Search
  - ベクトル埋め込みとは
  - vector database tutorial
  - ベクトルデータベースはどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFilesAsync()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFilesAsync()

再試行、同時実行数、マルチパート、進捗レポートを設定して、ファイルまたはディレクトリを Zilliz Cloud volume に非同期でアップロードします。

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

**BUILDER メソッド:**

- `sourceFilePath(String sourceFilePath)`

    アップロードするローカルのファイルまたはディレクトリ。

- `targetVolumePath(String targetVolumePath)`

    volume 内の宛先ディレクトリ。

- `uploadConcurrency(int uploadConcurrency)`

    同時にアップロードされるファイルの最大数。

- `maxRetries(int maxRetries)`

    各ファイルに対する再試行の最大回数。

- `retryIntervalMillis(long retryIntervalMillis)`

    再試行の間隔（ミリ秒）。

- `progressListener(ProgressListener progressListener)`

    UploadProgress のスナップショットを受け取るコールバック。

- `partSizeBytes(long partSizeBytes)`

    マルチパートアップロードの各パートサイズ（バイト単位）。0 以下の値を指定すると、自動サイズ調整が有効になります。

**戻り値:**

*CompletableFuture&lt;UploadFilesResult&gt;*

対象の volume とアップロードされたパスを識別します。

**例外:**

- **Exception**

    リクエストの検証、転送、またはサーバー実行に失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

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
