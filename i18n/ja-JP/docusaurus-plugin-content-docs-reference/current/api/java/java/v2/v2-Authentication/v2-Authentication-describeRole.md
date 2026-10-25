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

    説明するロールの名前です。

- `dbName(String dbName)`

    ロールが適用されるデータベースの名前です。省略した場合は、現在のデータベースがデフォルトになります。

**戻り値の型:**

*DescribeRoleResp*

**戻り値:**

**DescribeRoleResp** オブジェクトには、以下のフィールドが含まれます。

**パラメーター:**

- **roleName** (*String*) -

    ロールの名前です。

- **grantInfos** (*List&lt;GrantInfo&gt;*) -

    ロールに付与された権限のリストです。各権限は、以下のフィールドを含む **GrantInfo** オブジェクトです。

    - **objectType** (*String*) -

        権限が適用されるオブジェクトの種類です。

    - **objectName** (*String*) -

        権限が適用されるオブジェクトの名前です。

    - **roleName** (*String*) -

        権限が付与されるロールの名前です。

    - **grantor** (*String*) -

        権限を付与したユーザーの名前です。

    - **privilege** (*String*) -

        付与された権限です。

    - **dbName** (*String*) -

        権限が付与されるデータベースの名前です。

- **description** (*String*) -

    ロールの説明です。

**例外:**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.rbac.request.DescribeRoleReq;
import io.milvus.v2.service.rbac.response.DescribeRoleResp;

DescribeRoleResp resp = client.describeRole(DescribeRoleReq.builder()
    .roleName("analytics_reader")
    .build());
System.out.println(resp.getDescription());
```
