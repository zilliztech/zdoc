---
title: "getServerVersionV2() | Java | v2"
slug: /java/java/v2-Client-getServerVersionV2
sidebar_label: "getServerVersionV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はサーバーのバージョン情報を取得します。バージョン文字列に加えてビルド時刻、Git commit、Go version、deploy mode が必要な場合は `detail(true)` を使用してください。 | Java | v2"
type: docx
token: KrSgdfCaJosFp5xwHIAcV0tAnec
sidebar_position: 6
keywords: 
  - 画像検索
  - LLMs
  - 機械学習
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getServerVersionV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getServerVersionV2()

この操作はサーバーのバージョン情報を取得します。バージョン文字列に加えてビルド時刻、Git commit、Go version、deploy mode が必要な場合は `detail(true)` を使用してください。

```java
public GetServerVersionResp getServerVersionV2(GetServerVersionReq request)
```

## リクエスト構文\{#request-syntax}

```java
getServerVersionV2(GetServerVersionReq.builder()
    .detail(Boolean detail)
    .build());
```

**BUILDER メソッド:**

- `detail(Boolean detail)`

    詳細なサーバービルド情報を取得するかどうかを指定します。デフォルトは `Boolean.FALSE` です。

**戻り値:**

*GetServerVersionResp*

**例外:**

- **MilvusClientException**

    検証に失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外がスローされます。

## 例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

GetServerVersionResp version = client.getServerVersionV2(GetServerVersionReq.builder()
    .detail(true)
    .build());
System.out.println(version.getVersion());
System.out.println(version.getGitCommit());
```

{/* category: Client; action: CREATE; addedSince: v3.0.x */}
