---
title: "MilvusからZilliz Cloudへの移行 | BYOC"
slug: /migrate-from-milvus
sidebar_label: "MilvusからZilliz Cloudへの移行"
beta: FALSE
notebook: FALSE
description: "Milvusは、スケーラブルな類似検索やAIアプリケーションに最適化されたオープンソースのベクトルデータベースです。高いパフォーマンスと使いやすさで知られており、大規模なベクトルデータの管理に広く使用されています。 | BYOC"
type: origin
token: InQ3w8128iPyOikHjXacMF0unAd
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing

---

import Admonition from '@theme/Admonition';


# MilvusからZilliz Cloudへの移行

[Milvus](https://milvus.io/docs)は、スケーラブルな類似検索やAIアプリケーションに最適化されたオープンソースのベクトルデータベースです。高いパフォーマンスと使いやすさで知られており、大規模なベクトルデータの管理に広く使用されています。

Zilliz Cloudは、Milvusのマネージドサービスを提供することで、デプロイとメンテナンスを簡素化し、既存のMilvusデプロイをクラウドに簡単に移行できます。Milvusインスタンスに接続するか、バックアップをアップロードすることで、ベクトルデータをZilliz Cloudに転送できます。

Zilliz Cloudは、Milvusからデータを移行するための2つの主要な方法を提供しています

- [エンドポイント経由](./via-endpoint): MilvusからZilliz Cloudへ一度に1つのデータベースを移行できます。各データベースは順番に個別に移行されるため、各データベースの移行過程を慎重に管理する必要があるシナリオに最適です。



import DocCardList from '@theme/DocCardList';

<DocCardList />