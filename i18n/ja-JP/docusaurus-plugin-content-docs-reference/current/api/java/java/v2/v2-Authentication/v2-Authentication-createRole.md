---
title: "createRole() | Java | v2"
slug: /java/java/v2-Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はロールを作成し、必要に応じてそのロールの説明を保存します。 | Java | v2"
type: docx
token: IzfldHDU4o8dDRx377ecqJmlnSf
sidebar_position: 3
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッド vector 検索
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - クラウド
  - createRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createRole()

この操作はロールを作成し、必要に応じてそのロールの説明を保存します。

```java
public void createRole(CreateRoleReq request)
```

## リクエスト構文\{#request-syntax}

```java
client.createRole(CreateRoleReq.builder()
    .roleName(String roleName)
    .description(String description)
    .build()
);
```

**BUILDER メソッド:**

- `roleName(String roleName)`

    **[必須]**

    作成するロールの名前。

- `description(String description)`

    ロールの任意の説明です。デフォルトは空文字列です。

**戻り値:**

*void*

この操作は値を返しません。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.rbac.request.CreateRoleReq;

client.createRole(CreateRoleReq.builder()
    .roleName("analytics_reader")
    .description("Grants read-only access to analytics collections")
    .build());
```
