---
title: "updateUser() | Java | v2"
slug: /java/java/v2-Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ユーザーパスワードを変更せずに既存のユーザーの説明を更新します。 | Java | v2"
type: docx
token: AAudd8xDRoRfNLx6OpgcsfkpnVb
sidebar_position: 22
keywords: 
  - オープンソースのベクトルデータベース
  - Vector index
  - オープンソースのベクトルデータベース
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - updateUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updateUser()

この操作は、ユーザーパスワードを変更せずに既存のユーザーの説明を更新します。

```java
public void updateUser(UpdateUserReq request)
```

## Request Syntax\{#request-syntax}

```java
client.updateUser(UpdateUserReq.builder()
    .userName(String userName)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `userName(String userName)`

    **[REQUIRED]**

    更新するユーザーの名前。

- `description(String description)`

    ユーザーの新しい説明です。説明をクリアするには空文字列を使用します。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.UpdateUserReq;

client.updateUser(UpdateUserReq.builder()
    .userName("analyst_user")
    .description("Read-only analyst account")
    .build());
```
