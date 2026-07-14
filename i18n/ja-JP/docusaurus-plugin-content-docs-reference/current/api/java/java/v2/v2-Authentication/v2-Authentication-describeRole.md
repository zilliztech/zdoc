---
title: "describeRole() | Java | v2"
slug: /java/java/v2-Authentication-describeRole
sidebar_label: "describeRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ロールに付与された権限とロールの説明を返します。 | Java | v2"
type: docx
token: ZmeDd4zoPo7EynxnyGOckvzvnsh
sidebar_position: 5
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - クラウド
  - describeRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeRole()

この操作は、ロールに付与された権限とロールの説明を返します。

```java
public DescribeRoleResp describeRole(DescribeRoleReq request)
```

## リクエスト構文\{#request-syntax}

```java
DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName(String roleName)
    .build()
);
```

**BUILDER メソッド:**

- `roleName(String roleName)`

    **[必須]**

    説明対象のロールの名前。

**戻り値:**

*DescribeRoleResp*

レスポンスには `roleName`、`grantInfos`、`description` が含まれます。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeRoleReq;
import io.milvus.v2.service.rbac.response.DescribeRoleResp;

DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName("analytics_reader")
    .build());
System.out.println(resp.getDescription());
```
