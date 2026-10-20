---
title: "getFunctions() | Java | v2"
slug: /java/java/v2-FunctionScore-getFunctions
sidebar_label: "getFunctions()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、この FunctionScore オブジェクトで定義された関数のリストを返します。 | Java | v2"
type: docx
token: RsqKdZaMnoHbaRxYr1fcqRbRnth
sidebar_position: 3
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - zilliz
  - zilliz cloud
  - クラウド
  - getFunctions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFunctions()

この操作は、この FunctionScore オブジェクトで定義された関数のリストを返します。

```java
public List<CreateCollectionReq.Function> getFunctions()
```

**戻り値の型:**

*List&lt;CreateCollectionReq.Function&gt;*

**戻り値:**

この FunctionScore オブジェクトで定義された関数の **List&lt;CreateCollectionReq.Function&gt;** です。

**パラメーター:**

- **functions** (*List&lt;CreateCollectionReq.Function&gt;*) -

    この FunctionScore オブジェクトで定義された関数です。各関数は **CreateCollectionReq.Function** オブジェクトです。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .addFunction(func)
    .build();
List<CreateCollectionReq.Function> functions = score.getFunctions();
```
