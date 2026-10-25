---
title: "getVolumeUploadResult() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getVolumeUploadResult
sidebar_label: "getVolumeUploadResult()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したボリュームへの更新の結果を取得します。 | Java | v2"
type: docx
token: GoMYdKZRforUT0x23CDcyDKgnFf
sidebar_position: 6
keywords: 
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル検索
  - 音声の類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - getVolumeUploadResult()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getVolumeUploadResult()

この操作は、指定したボリュームへの更新の結果を取得します。

```java
public UploadFilesResult getVolumeUploadResult()
```

**戻り値の型：**

*UploadFilesResult*

**戻り値：**

次のメソッドを持つ UploadFilesResult インスタンスです。

- `getVolumeName()`

    対象ボリュームの名前を返します。

- `setVolumeName()`

    対象ボリュームの名前を設定します。

- `getPath()`

    対象ボリュームにアップロードされたファイルのパスを返します。

- `setPath()`

    対象ボリュームにアップロードされたファイルのパスを設定します。

- `toString()`

    UploadFilesResult インスタンスを文字列化します。

    **UploadFilesResult** オブジェクトには、次のフィールドが含まれます。

**パラメーター：**

- **volumeName** (*String*) -

    ファイルのアップロード先ボリュームの名前です。

- **path** (*String*) -

    ボリューム内のアップロード済みファイルのパスです。

## 例\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
UploadFilesResult result = writer.getVolumeUploadResult();

System.out.println("Target volume: " + result.getVolumeName());
System.out.println("Target paths: " + result.getPath());
```
