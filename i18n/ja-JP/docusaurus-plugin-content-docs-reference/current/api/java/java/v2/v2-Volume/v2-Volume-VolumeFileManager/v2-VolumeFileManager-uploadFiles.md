---
title: "uploadFiles() | Java | v2"
slug: /java/java/v2-VolumeFileManager-uploadFiles
sidebar_label: "uploadFiles()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、再試行、並行処理、マルチパート、進捗制御を使用して、ファイルまたはディレクトリを Zilliz Cloud ボリュームに同期的にアップロードします。 | Java | v2"
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

---

import Admonition from '@theme/Admonition';


# uploadFiles()

この操作では、再試行、並行処理、マルチパート、進捗制御を使用して、ファイルまたはディレクトリを Zilliz Cloud ボリュームに同期的にアップロードします。

```java
public UploadFilesResult uploadFiles(UploadFilesRequest request)
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

    アップロードするローカルのファイルまたはディレクトリです。

- `targetVolumePath(String targetVolumePath)`

    ボリューム内の宛先ディレクトリです。

- `uploadConcurrency(int uploadConcurrency)`

    同時にアップロードするファイルの最大数です。

- `maxRetries(int maxRetries)`

    各ファイルの最大再試行回数です。

- `retryIntervalMillis(long retryIntervalMillis)`

    再試行間の遅延時間（ミリ秒）です。

- `progressListener(ProgressListener progressListener)`

    UploadProgress のスナップショットを受け取るコールバックです。

- `partSizeBytes(long partSizeBytes)`

    マルチパートアップロードのパートサイズ（バイト単位）です。0 以下の値を指定すると、自動サイズ調整が有効になります。

**戻り値の型:**

*UploadFilesResult*

**戻り値:**

対象のボリュームとアップロードされたパスを識別する **UploadFilesResult** オブジェクトです。以下のフィールドがあります。

**パラメーター:**

- **volumeName** (*String*) -

    ファイルのアップロード先ボリュームの名前です。

- **path** (*String*) -

    アップロードされたファイルの、ボリューム内でのパスです。

**例外:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
UploadFilesResult result = manager.uploadFiles(UploadFilesRequest.builder()
    .sourceFilePath("./data")
    .targetVolumePath("imports/")
    .uploadConcurrency(5)
    .maxRetries(5)
    .progressListener(progress -> System.out.println(progress.getPercent()))
    .build());
```
