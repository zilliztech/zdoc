---
title: "getVolumeUploadResult() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getVolumeUploadResult
sidebar_label: "getVolumeUploadResult()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された volume への更新結果を取得します。 | Java | v2"
type: docx
token: GoMYdKZRforUT0x23CDcyDKgnFf
sidebar_position: 6
keywords: 
  - 動画重複排除
  - 動画類似性検索
  - Vector 取得
  - 音声類似性検索
  - zilliz
  - zilliz cloud
  - cloud
  - getVolumeUploadResult()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getVolumeUploadResult()

この操作は、指定された volume への更新結果を取得します。

```java
public UploadFilesResult getVolumeUploadResult()
```

**パラメーター:**

*なし*

**戻り値の型:**

*UploadFilesResult*

**戻り値:**

以下のメソッドを持つ `UploadFilesResult` インスタンスです。

- `getVolumeName()`

    対象 volume の名前を返します。

- `setVolumeName()`

    対象 volume の名前を設定します。

- `getPath()`

    対象 volume にアップロードされたファイルのパスを返します。

- `setPath()`

    対象 volume にアップロードされたファイルのパスを設定します。

- `toString()`

    `UploadFilesResult` インスタンスを文字列化します。

## Example\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
UploadFilesResult result = writer.getVolumeUploadResult();

System.out.println("Target volume: " + result.getVolumeName());
System.out.println("Target paths: " + result.getPath());
```

