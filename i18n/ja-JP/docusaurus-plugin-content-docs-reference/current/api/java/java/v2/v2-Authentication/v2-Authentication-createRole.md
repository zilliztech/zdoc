---
title: "createRole() | Java | v2"
slug: /java/java/v2-Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、ロールを作成し、必要に応じてそのロールの説明を保存します。 | Java | v2"
type: docx
token: IzfldHDU4o8dDRx377ecqJmlnSf
sidebar_position: 3
keywords: 
  - 質問応答システム
  - LLM-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - createRole()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createRole()

この操作では、ロールを作成し、必要に応じてそのロールの説明を保存します。

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

**ビルダーメソッド：**

- `roleName(String roleName)`

    **[必須]**

    作成するロールの名前です。

- `description(String description)`

    ロールの説明です。この項目は任意で、デフォルトは空の文字列です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.rbac.request.CreateRoleReq;

client.createRole(CreateRoleReq.builder()
    .roleName("analytics_reader")
    .description("Grants read-only access to analytics collections")
    .build());
```
