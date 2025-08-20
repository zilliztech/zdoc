---
title: "MilvusからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-milvus
sidebar_label: "MilvusからZilliz Cloudへの移行"
beta: FALSE
notebook: FALSE
description: "Milvusは、スケーラブルな類似検索やAIアプリケーションに最適化されたオープンソースのベクトルデータベースです。高いパフォーマンスと使いやすさで知られており、大規模なベクトルデータの管理に広く使用されています。 | Cloud"
type: origin
token: InQ3w8128iPyOikHjXacMF0unAd
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';


# MilvusからZilliz Cloudへの移行

[Milvus](https://milvus.io/docs)は、スケーラブルな類似検索やAIアプリケーションに最適化されたオープンソースのベクトルデータベースです。高いパフォーマンスと使いやすさで知られており、大規模なベクトルデータの管理に広く使用されています。

Zilliz Cloudは、Milvusのマネージドサービスを提供することで、デプロイとメンテナンスを簡素化し、既存のMilvusデプロイをクラウドに簡単に移行できます。Milvusインスタンスに接続するか、バックアップをアップロードすることで、ベクトルデータをZilliz Cloudに転送できます。

Zilliz Cloudは、Milvusからデータを移行するための2つの主要な方法を提供しています

- [エンドポイント経由](./via-endpoint): MilvusからZilliz Cloudへ一度に1つのデータベースを移行できます。各データベースは順番に個別に移行されるため、各データベースの移行過程を慎重に管理する必要があるシナリオに最適です。

- [バックアップファイルを介](./via-backup-files)して:複数のデータベースを同時に移行することをサポートし、大規模な移行をより迅速かつ効率的に行うことができます。



import DocCardList from '@theme/DocCardList';

<DocCardList />