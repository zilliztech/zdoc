---
title: "checkHealth() | Java | v2"
slug: /java/java/v2-Management-checkHealth
sidebar_label: "checkHealth()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在の Milvus インスタンスのヘルスステータスを確認します。 | Java | v2"
type: docx
token: TSuFdRAGiopuefxPbEVczwlCnRg
sidebar_position: 19
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - checkHealth()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# checkHealth()

この操作は、現在の Milvus インスタンスのヘルスステータスを確認します。

```java
public CheckHealthResp checkHealth()
```

## リクエスト構文\{#request-syntax}

```java
CheckHealthResp()
```

**BUILDER METHODS:**

なし

**RETURN TYPE:**

*CheckHealthResp*

**RETURNS:**

現在の Milvus インスタンスに関する詳細なヘルス情報を含む **CheckHealthResp** オブジェクトです。このオブジェクトには、以下のフィールドがあります。

**PARAMETERS:**

- **isHealthy** (*Boolean*) -

    現在の Milvus インスタンスが正常な状態かどうかを示します。

- **reasons** (*List&lt;String&gt;*) -

    サーバーが異常な状態にある場合の、異常の理由です。

- **quotaStates** (*List&lt;String&gt;*) -

    異常な状態の名前です。リストには、"ReadLimited"、"WriteLimited"、"DenyToRead"、"DenyToWrite"、"DenyToDDL" の名前が含まれる場合があります。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作の実行中にエラーが発生した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.response.CheckHealthResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check healthy
CheckHealthResp healthyResp = client.checkHealth();
```
