---
title: "getParams() | Java | v2"
slug: /java/java/v2-FunctionScore-getParams
sidebar_label: "getParams()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、この FunctionScore オブジェクトのパラメーターマップを返します。 | Java | v2"
type: docx
token: DUJsdflImor0joxV14ecSwpnnDb
sidebar_position: 4
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - ベクトルデータベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - getParams()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getParams()

この操作は、この FunctionScore オブジェクトのパラメーターマップを返します。

```java
public Map<String, String> getParams()
```

**戻り値の型:**

*Map&lt;String, String&gt;*

**戻り値:**

この FunctionScore オブジェクトのパラメーターの **Map&lt;String, String&gt;** です。

**パラメーター:**

- **params** (*Map&lt;String, String&gt;*) -

    この FunctionScore オブジェクトのパラメーターであり、`search` API が検索結果のスコアを再ランク付けまたは変更する際に使用されます。

**例外:**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
FunctionScore score = FunctionScore.builder()
    .params(Map.of("weight", "0.8"))
    .build();
Map<String, String> params = score.getParams();
```
