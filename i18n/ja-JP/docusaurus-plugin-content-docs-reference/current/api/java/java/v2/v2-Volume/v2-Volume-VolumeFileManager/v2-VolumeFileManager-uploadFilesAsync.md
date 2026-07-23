---
title: "uploadFilesAsync | Java | v2"
slug: /java/java/v2-Volume-VolumeFileManager/v2-VolumeFileManager-uploadFilesAsync
sidebar_label: "uploadFilesAsync"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "ローカルファイルまたはディレクトリを非同期で volume にアップロードします。 | Java | v2"
type: docx
token: K8JSdXyEJoN8XKxDWebc8TfPnge
sidebar_position: 5
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - uploadFilesAsync
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# uploadFilesAsync()

ローカルファイルまたはディレクトリを非同期で volume にアップロードします。

```java
public CompletableFuture<UploadFilesResult> uploadFilesAsync(UploadFilesRequest request)
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

    アップロードするローカルファイルまたはディレクトリのフルパスです。ディレクトリパスは `/` で終わる必要があります。

- `targetVolumePath(String targetVolumePath)`

    volume 内の宛先ディレクトリです。ルートディレクトリの場合は空のままにし、フォルダの場合は `/` で終わるようにします。

- `uploadConcurrency(int uploadConcurrency)`

    同時にアップロードされるファイルの最大数です。デフォルトは **5** です。

- `maxRetries(int maxRetries)`

    各ファイルの最大リトライ回数です。デフォルトは **5** です。

- `retryIntervalMillis(long retryIntervalMillis)`

    リトライ間の間隔（ミリ秒単位）です。デフォルトは **5,000** ミリ秒です。

- `progressListener(ProgressListener progressListener)`

    `UploadProgress` スナップショットを受け取るオプションの `UploadFilesRequest.ProgressListener` コールバックです。

    - `UploadProgress` -

        `UploadFilesRequest.ProgressListener.onProgress(...)` に渡されるスナップショットです。

        - `getUploadedBytes()` -

            すべてのファイルにわたってアップロードされたバイト数を返します。

        - `getTotalBytes()` -

            アップロード対象として予定されている合計バイト数を返します。

        - `getCompletedFiles()` -

            正常にアップロードされたファイル数を返します。

        - `getTotalFiles()` -

            アップロード対象として予定されている合計ファイル数を返します。

        - `getCurrentFile()` -

            現在アップロード中のファイルのパスを返します。

        - `getCurrentFileUploadedBytes()` -

            現在のファイルでアップロード済みのバイト数を返します。

        - `getCurrentFileTotalBytes()` -

            現在のファイルの合計バイト数を返します。

        - `getPercent()` -

            アップロード全体の進捗率を返します。

- `partSizeBytes(long partSizeBytes)`

    マルチパートアップロードの各パートサイズ（バイト単位）です。**0** 以下の値を指定すると、パートサイズは自動的に選択されます。

**RETURNS:**

*CompletableFuture&lt;UploadFilesResult&gt;*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に送出されます。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

ローカルファイルまたはディレクトリを非同期で volume にアップロードします。

```java
CompletableFuture<UploadFilesResult> future = volumeFileManager.uploadFilesAsync(
    UploadFilesRequest.builder()
        .sourceFilePath("/data/books.json")
        .targetVolumePath("imports/books.json")
        .uploadConcurrency(5)
        .progressListener(progress ->
            System.out.printf("Uploaded %.2f%% (%d/%d bytes)%n",
                progress.getPercent(),
                progress.getUploadedBytes(),
                progress.getTotalBytes()))
        .build());
UploadFilesResult result = future.get();
```
