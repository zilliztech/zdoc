---
title: "removeFileResource() | Java | v2"
slug: /java/java/v2-FileResources-removeFileResource
sidebar_label: "removeFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、以前にアップロードしたファイルリソースを名前で削除します。アクティブな関数またはアナライザーからまだ参照されているリソースを削除すると、エラーで失敗します。 | Java | v2"
type: docx
token: I5yTdfJXNoHDICxSwWXcNjwxnoc
sidebar_position: 3
keywords: 
  - 密ベクトル
  - 階層型ナビゲーション可能なスモールワールド
  - 密埋め込み
  - Faiss ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - removeFileResource()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# removeFileResource()

この操作は、以前にアップロードしたファイルリソースを名前で削除します。アクティブな関数またはアナライザーからまだ参照されているリソースを削除すると、エラーで失敗します。

```java
public void removeFileResource(RemoveFileResourceReq request)
```

## リクエスト構文\{#request-syntax}

```java
removeFileResource(RemoveFileResourceReq.builder()
    .name(String name)
    .build()
);
```

**BUILDER メソッド:**

- `name(String name)` -

    **[必須]**

    削除するファイルリソースの名前です。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.utility.request.RemoveFileResourceReq;

client.removeFileResource(RemoveFileResourceReq.builder()
    .name("stopwords")
    .build());
```
