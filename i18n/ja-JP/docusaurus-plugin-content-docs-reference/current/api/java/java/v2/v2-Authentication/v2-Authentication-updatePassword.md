---
title: "updatePassword() | Java | v2"
slug: /java/java/v2-Authentication-updatePassword
sidebar_label: "updatePassword()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ユーザーのパスワードを更新し、ユーザーの説明も更新できます。 | Java | v2"
type: docx
token: AnuCd3jgDojhA8x2kNFcddCynLh
sidebar_position: 20
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - zilliz
  - zilliz cloud
  - cloud
  - updatePassword()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updatePassword()

この操作は、ユーザーのパスワードを更新し、ユーザーの説明も更新できます。

```java
public void updatePassword(UpdatePasswordReq request)
```

## リクエスト構文\{#request-syntax}

```java
client.updatePassword(UpdatePasswordReq.builder()
    .userName(String userName)
    .password(String password)
    .newPassword(String newPassword)
    .resetConnection(Boolean resetConnection)
    .description(String description)
    .build()
);
```

**ビルダーメソッド:**

- `userName(String userName)`

    **[REQUIRED]**

    更新するユーザーの名前です。

- `password(String password)`

    ユーザーの現在のパスワードです。パスワードを変更する場合は、`newPassword` と一緒に指定してください。

- `newPassword(String newPassword)`

    ユーザーの新しいパスワードです。パスワードを変更する場合は、`password` と一緒に指定してください。

- `resetConnection(Boolean resetConnection)`

    パスワードの更新後に現在のクライアント接続をリセットするかどうかを指定します。デフォルトは `false` です。

- `description(String description)`

    ユーザーの新しい説明（省略可能）です。デフォルトは空の文字列です。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.rbac.request.UpdatePasswordReq;

client.updatePassword(UpdatePasswordReq.builder()
    .userName("analyst_user")
    .password("P@ssw0rd!")
    .newPassword("N3wP@ssw0rd!")
    .resetConnection(true)
    .description("Read-only analyst account")
    .build());
```
