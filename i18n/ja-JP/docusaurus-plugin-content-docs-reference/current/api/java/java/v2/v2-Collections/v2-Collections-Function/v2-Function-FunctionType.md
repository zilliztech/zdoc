---
title: "FunctionType | Java | v2"
slug: /java/java/v2-Function-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "サポートされているサーバーサイド関数タイプを表し、名前または数値コードによる変換を提供します。 | Java | v2"
type: docx
token: HShjdZsU3oknh2x1ezkcRqGqn6b
sidebar_position: 4
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

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionType

サポートされているサーバーサイド関数タイプを表し、名前または数値コードによる変換を提供します。

```java
public enum FunctionType
```

## Constants\{#constants}

### UNKNOWN(0)\{#unknown0}

不明または未サポートの関数タイプを表します。`fromName()` と `fromCode()` は、一致するものが見つからない場合にこの値を返します。

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

**RETURNS:**

*FunctionType*

サーバーサイド関数タイプを記述する enum 値。

## Example\{#example}

```java
FunctionType byName = FunctionType.fromName("MinHash");
FunctionType byCode = FunctionType.fromCode(5);

int code = byName.getCode();
String name = byCode.getName();
```
