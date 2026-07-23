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
sidebar_position: 4
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

    アップロードするローカルファイルまたはディレクトリのフルパス。ディレクトリパスは `/` で終わる必要があります。

- `targetVolumePath(String targetVolumePath)`

    volume 内の宛先ディレクトリ。ルートディレクトリの場合は空のままにし、フォルダの場合は `/` で終わるようにします。

- `uploadConcurrency(int uploadConcurrency)`

    同時にアップロードするファイルの最大数。デフォルトは **5** です。

- `maxRetries(int maxRetries)`

    各ファイルの最大リトライ回数。デフォルトは **5** です。

- `retryIntervalMillis(long retryIntervalMillis)`

    リトライ間隔（ミリ秒）。デフォルトは **5,000** ミリ秒です。

- `progressListener(ProgressListener progressListener)`

    アップロード進捗のスナップショットを受け取る、オプションの `ProgressListener` コールバック。

- `partSizeBytes(long partSizeBytes)`

    マルチパートアップロードの各パートサイズ（バイト単位）。値が **0** 以下の場合、パートサイズは自動的に選択されます。

**RETURNS:**

*CompletableFuture&lt;UploadFilesResult&gt;*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合にスローされます。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

### Java example\{#java-example}

ローカルファイルまたはディレクトリを非同期で volume にアップロードします。

```java
CompletableFuture<UploadFilesResult> future = volumeFileManager.uploadFilesAsync(
    UploadFilesRequest.builder()
        .sourceFilePath("/data/books.json")
        .targetVolumePath("imports/books.json")
        .uploadConcurrency(5)
        .build());
UploadFilesResult result = future.get();
```
