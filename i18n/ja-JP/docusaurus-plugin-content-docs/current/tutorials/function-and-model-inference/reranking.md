---
title: "リランク関数 | Cloud"
slug: /reranking
sidebar_key: reranking
sidebar_label: "リランク関数"
beta: FALSE
notebook: FALSE
description: "ハイブリッド検索は、複数の ANN 検索を同時に実行することで、より精度の高い検索結果を実現します。複数の検索により複数の結果セットが返されるため、これらを統合して並べ替え、単一の結果セットとして返すためのリランク戦略が必要です。このガイドでは、Zilliz Cloud でサポートされているリランク戦略を紹介し、適切なリランク戦略を選択するためのヒントを提供します。 | Cloud"
type: origin
token: M4IYwThFKiatBkk0Cp3c9p4QnZc
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - 検索結果のリランキング
  - 結果のリランキング

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# リランク関数

ハイブリッド検索は、複数の ANN 検索を同時に実行することで、より精度の高い検索結果を実現します。複数の検索により複数の結果セットが得られますが、それらを統合・並べ替えて単一の結果セットとして返すためには、リランキング戦略が必要です。本ガイドでは、Zilliz Cloud でサポートされているリランキング戦略を紹介し、適切なリランキング戦略を選択するためのヒントを提供します。

