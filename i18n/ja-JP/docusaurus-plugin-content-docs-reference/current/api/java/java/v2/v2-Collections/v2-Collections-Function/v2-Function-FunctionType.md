---
title: "FunctionType | Java | v2"
slug: /java/java/v2-Function-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FunctionType インスタンスは、サポートされているサーバーサイド関数タイプの 1 つを表し、名前または数値コードによる変換を提供します。 | Java | v2"
type: docx
token: HShjdZsU3oknh2x1ezkcRqGqn6b
sidebar_position: 2
keywords: 
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# FunctionType

FunctionType インスタンスは、サポートされているサーバーサイド関数タイプの 1 つを表し、名前または数値コードによる変換を提供します。

```java
public enum FunctionType
```

## 定数\{#constants}

### UNKNOWN(0)\{#unknown0}

不明な関数タイプまたはサポートされていない関数タイプを表します。`fromName()` と `fromCode()` は、一致するものが見つからない場合にこの値を返します。

### BM25(1)\{#bm251}

BM25 全文スコアリング関数を表します。

### TEXTEMBEDDING(2)\{#textembedding2}

テキスト埋め込み関数を表します。

### RERANK(3)\{#rerank3}

再ランキング関数を表します。

### MINHASH(4)\{#minhash4}

MinHash 関数を表します。

### MOLFINGERPRINT(5)\{#molfingerprint5}

分子フィンガープリント関数を表します。

**RETURN TYPE:**

*FunctionType*

**RETURNS:**

サーバーサイド関数タイプを表す enum 値です。

**PARAMETERS:**

- **name** (*String*) -

    関数タイプの名前です。たとえば、`Rerank` または `BM25` です。

- **code** (*int*) -

    関数タイプのプロトコル数値コードです。

## 例\{#example}

```java
FunctionType byName = FunctionType.fromName("MinHash");
FunctionType byCode = FunctionType.fromCode(5);

int code = byName.getCode();
String name = byCode.getName();
```
