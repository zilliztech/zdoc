---
title: "updateUser() | Java | v2"
slug: /java/java/v2-Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、ユーザーのパスワードを変更せずに、既存ユーザーの説明を更新します。 | Java | v2"
type: docx
token: AAudd8xDRoRfNLx6OpgcsfkpnVb
sidebar_position: 22
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトル DB
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - updateUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updateUser()

この操作では、ユーザーのパスワードを変更せずに、既存ユーザーの説明を更新します。

```java
public void updateUser(UpdateUserReq request)
```

## リクエスト構文\{#request-syntax}

```java
client.updateUser(UpdateUserReq.builder()
    .userName(String userName)
    .description(String description)
    .build()
);
```

**ビルダーメソッド：**

- `userName(String userName)`

    **[必須]**

    更新するユーザーの名前です。

- `description(String description)`

    ユーザーの新しい説明です。説明をクリアするには、空の文字列を使用します。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.rbac.request.UpdateUserReq;

client.updateUser(UpdateUserReq.builder()
    .userName("analyst_user")
    .description("Read-only analyst account")
    .build());
```
