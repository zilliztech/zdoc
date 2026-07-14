---
title: "alterRole() | Java | v2"
slug: /java/java/v2-Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は既存のロールの説明を更新します。 | Java | v2"
type: docx
token: Ufpqdh2gaossHmxZ4CacIO0Hnyc
sidebar_position: 21
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - alterRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterRole()

この操作は既存のロールの説明を更新します。

```java
public void alterRole(AlterRoleReq request)
```

## Request Syntax\{#request-syntax}

```java
client.alterRole(AlterRoleReq.builder()
    .roleName(String roleName)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    **[REQUIRED]**

    更新するロールの名前。

- `description(String description)`

    ロールの新しい説明です。説明をクリアするには空文字列を使用します。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.AlterRoleReq;

client.alterRole(AlterRoleReq.builder()
    .roleName("analytics_reader")
    .description("Grants read-only access to analytics collections")
    .build());
```
