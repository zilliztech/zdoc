---
title: "減衰ランカー | BYOC"
slug: /decay-ranker
sidebar_label: "減衰ランカー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "この章では、特定のエンティティの類似度スコアが特定の数値フィールドの値に応じて減少するという考え方に基づいた動的ランク付け方法を使用する減衰ランカーについて説明します。これにより、他のエンティティが目立つようになります。 | BYOC"
type: origin
token: HPP3wBq1xiuGWYk4QfKcZ2PrnHf
sidebar_position: 4
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search result reranking
  - result reranking
  - decay
  - decay ranker
  - decay rankers
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search

---

import Admonition from '@theme/Admonition';


# 減衰ランカー

この章では、特定のエンティティの類似度スコアが特定の数値フィールドの値に応じて減少するという考え方に基づいた動的ランク付け方法を使用する減衰ランカーについて説明します。これにより、他のエンティティが目立つようになります。

Zilliz Cloudは以下の3つの減衰ランカーのタイプをサポートしています：

- [ガウス減衰](./gaussian-decay)

- [指数減衰](./exponential-decay)

- [線形減衰](./linear-decay)

これらの減衰ランカーを使用すると、検索結果のランキングを微調整して、時間、距離、または他の数値的側面に基づいて結果を調整できます。


import DocCardList from '@theme/DocCardList';

<DocCardList />