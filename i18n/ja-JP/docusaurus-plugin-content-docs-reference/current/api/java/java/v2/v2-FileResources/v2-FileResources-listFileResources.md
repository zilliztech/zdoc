---
title: "listFileResources() | Java | v2"
slug: /java/java/v2-FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "現在のデータベース内でアップロード済みのすべてのファイルリソースを一覧表示します。 | Java | v2"
type: docx
token: JbG0d6GAdoOpkixsVUpcE0YMnPd
sidebar_position: 2
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - listFileResources()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listFileResources()

現在のデータベース内でアップロード済みのすべてのファイルリソースを一覧表示します。

```java
public ListFileResourcesResp listFileResources(ListFileResourcesReq request)
```

## リクエスト構文\{#request-syntax}

```java
listFileResources(ListFileResourcesReq.builder().build());
```

このリクエストはパラメータを取りません。

**戻り値:**

*ListFileResourcesResp*

レスポンスは `getResources()` を介してアクセス可能な `List<FileResourceInfo>` をラップしています。各 `FileResourceInfo` エントリには以下が含まれます。

- `name` (*String*) - リソースの一意な名前。

- `path` (*String*) - アップロードされた元のローカルパス。

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

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
