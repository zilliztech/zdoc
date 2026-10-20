---
title: "dropCollectionField() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、フィールド名またはフィールド ID によって、既存のコレクションのフィールドを削除します。 | Java | v2"
type: docx
token: PcFWdgr7VoPK74xt1mmcmH8gndf
sidebar_position: 41
keywords: 
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル検索
  - 音声の類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionField()

この操作は、フィールド名またはフィールド ID によって、既存のコレクションのフィールドを削除します。

```java
public void dropCollectionField(DropCollectionFieldReq request)
```

## リクエスト構文\{#request-syntax}

```java
DropCollectionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .fieldName(fieldName)
    .fieldId(fieldId)
    .build();
```

**BUILDER メソッド:**

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースがデフォルトで使用されます。

- `fieldName(String fieldName)`

    削除するフィールドの名前です。

- `fieldId(Long fieldId)`

    ID で識別する場合の、削除対象フィールドの数値 ID です。

**例外:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバーでの実行が失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
client.dropCollectionField(DropCollectionFieldReq.builder()
    .collectionName("books")
    .fieldName("obsolete_field")
    .build());
```
