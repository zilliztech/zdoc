---
title: "dropCollectionField() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "フィールド名またはフィールド ID で既存の collection field を削除します。 | Java | v2"
type: docx
token: PcFWdgr7VoPK74xt1mmcmH8gndf
sidebar_position: 39
keywords: 
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
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

フィールド名またはフィールド ID を使用して、既存の collection field を削除します。

```java
public void dropCollectionField(DropCollectionFieldReq request)
```

## Request Syntax\{#request-syntax}

```java
DropCollectionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .fieldName(fieldName)
    .fieldId(fieldId)
    .build();
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    対象 collection の名前です。

- `databaseName(String databaseName)`

    データベース名です。省略した場合は、現在のデータベースがデフォルトで使用されます。

- `fieldName(String fieldName)`

    削除するフィールドの名前です。

- `fieldId(Long fieldId)`

    ID で識別する場合の、削除対象フィールドの数値 ID です。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

```java
client.dropCollectionField(DropCollectionFieldReq.builder()
    .collectionName("books")
    .fieldName("obsolete_field")
    .build());
```
