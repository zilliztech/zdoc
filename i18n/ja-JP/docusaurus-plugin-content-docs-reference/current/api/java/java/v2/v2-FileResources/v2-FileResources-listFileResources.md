---
title: "listFileResources() | Java | v2"
slug: /java/java/v2-FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のデータベースにあるアップロード済みのファイルリソースをすべて一覧表示します。 | Java | v2"
type: docx
token: JbG0d6GAdoOpkixsVUpcE0YMnPd
sidebar_position: 2
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - cloud
  - listFileResources()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listFileResources()

この操作は、現在のデータベースにあるアップロード済みのファイルリソースをすべて一覧表示します。

```java
public ListFileResourcesResp listFileResources(ListFileResourcesReq request)
```

## リクエスト構文\{#request-syntax}

```java
listFileResources(ListFileResourcesReq.builder().build());
```

このリクエストにはパラメーターはありません。

**戻り値の型：**

*ListFileResourcesResp*

**戻り値：**

登録済みのファイルリソースを含む **ListFileResourcesResp** オブジェクトです。

**パラメーター：**

- **resources** (*List&lt;FileResourceInfo&gt;*) -

    現在のデータベースに登録されているファイルリソースです。`getResources()` でアクセスできます。各 **FileResourceInfo** エントリには、次のフィールドが含まれます。

    - **name** (*String*) -

        リソースの一意の名前です。

    - **path** (*String*) -

        アップロードされた元のローカルパスです。

**例外：**

- **MilvusClientException**

    この例外は、この操作中にエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.utility.request.ListFileResourcesReq;
import io.milvus.v2.service.utility.response.ListFileResourcesResp;
import io.milvus.v2.service.utility.response.FileResourceInfo;

ListFileResourcesResp resp = client.listFileResources(
    ListFileResourcesReq.builder().build()
);
for (FileResourceInfo res : resp.getResources()) {
    System.out.println(res.getName() + " → " + res.getPath());
}
```
