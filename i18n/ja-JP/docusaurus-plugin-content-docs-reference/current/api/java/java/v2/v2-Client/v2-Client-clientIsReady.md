---
title: "clientIsReady() | Java | v2"
slug: /java/java/v2-Client-clientIsReady
sidebar_label: "clientIsReady()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、サーバーへのクライアント接続の準備ができているかどうかを確認します。 | Java | v2"
type: docx
token: I1sMd0t6qoNuIWx3mjecEfjwnyc
sidebar_position: 3
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - clientIsReady()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# clientIsReady()

この操作は、サーバーへのクライアント接続の準備ができているかどうかを確認します。

```java
public boolean clientIsReady()
```

**戻り値:**

*boolean*

クライアントが接続され、準備ができている場合は **true**、そうでない場合は **false** を返します。

## 例\{#example}

```java
boolean ready = client.clientIsReady();
System.out.println("Client ready: " + ready);
```
