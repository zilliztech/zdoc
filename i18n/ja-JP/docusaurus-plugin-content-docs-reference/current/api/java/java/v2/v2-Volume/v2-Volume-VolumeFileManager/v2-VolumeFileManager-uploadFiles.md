---
title: "uploadFiles() | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFiles
sidebar_label: "uploadFiles()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "ファイルまたはディレクトリを、リトライ、並行処理、マルチパート、進捗制御付きで Zilliz Cloud volume に同期アップロードします。 | Java | v2"
type: docx
token: FiyGdmoSHoDbrPxhSdncsMWbnhc
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFiles()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFiles()

ファイルまたはディレクトリを、リトライ、並行処理、マルチパート、進捗制御付きで Zilliz Cloud volume に同期アップロードします。

```java
public UploadFilesResult uploadFiles(UploadFilesRequest request)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `sourceFilePath(String sourceFilePath)`

    アップロードするローカルのファイルまたはディレクトリです。

- `targetVolumePath(String targetVolumePath)`

    volume 内の宛先ディレクトリです。

- `uploadConcurrency(int uploadConcurrency)`

    同時にアップロードするファイルの最大数です。

- `maxRetries(int maxRetries)`

    各ファイルの最大リトライ回数です。

- `retryIntervalMillis(long retryIntervalMillis)`

    リトライ試行間の待機時間（ミリ秒）です。

- `progressListener(ProgressListener progressListener)`

    UploadProgress のスナップショットを受け取るコールバックです。

- `partSizeBytes(long partSizeBytes)`

    マルチパートアップロードのパートサイズ（バイト単位）です。0 以下の値を指定すると自動サイズ調整が有効になります。

**RETURNS:**

*UploadFilesResult*

対象の volume とアップロードされたパスを識別します。

**EXCEPTIONS:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバー実行に失敗した場合に発生します。正確な失敗理由は例外メッセージを確認してください。

## Example\{#example}

```java
UploadFilesResult result = manager.uploadFiles(UploadFilesRequest.builder()
    .sourceFilePath("./data")
    .targetVolumePath("imports/")
    .uploadConcurrency(5)
    .maxRetries(5)
    .progressListener(progress -> System.out.println(progress.getPercent()))
    .build());
```
