---
title: "MilvusからZilliz Cloudへの移行 | BYOC"
slug: /migrate-from-milvus
sidebar_label: "Migrate from Milvus"
beta: FALSE
notebook: FALSE
description: "ミルヴスは、スケーラブルな類似検索やAIアプリケーションに最適化されたオープンソースのベクトルデータベースです。高いパフォーマンスと使いやすさで知られており、大規模なベクトルデータの管理に広く利用されています。 | BYOC"
type: origin
token: TDkbwhwMyi7bPykZAoUc5PFfnIb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source

---

import Admonition from '@theme/Admonition';


# MilvusからZilliz Cloudへの移行

[ミルヴス](https://milvus.io/docs)は、スケーラブルな類似検索やAIアプリケーションに最適化されたオープンソースのベクトルデータベースです。高いパフォーマンスと使いやすさで知られており、大規模なベクトルデータの管理に広く利用されています。

Zilliz Cloudは、Milvusのマネージドサービスを提供することで、デプロイとメンテナンスを簡素化し、既存のMilvusデプロイをクラウドに簡単に移行できます。Milvusインスタンスに接続するか、バックアップをアップロードすることで、ベクトルデータをZilliz Cloudに転送できます。

Zilliz Cloudは、Milvusからデータを移行するための2つの主要な方法を提供しています

- [エンドポイント経由](./via-endpoint):一度に1つのデータベースをMilvusからZilliz Cloudに移行できます。各データベースは順番に個別に移行されるため、各データベースの移行過程を注意深く管理する必要があるシナリオに最適です。

- [バックアップファイルを使用する](./via-backup-files):複数のデータベースを同時に移行することをサポートし、大規模な移行をより迅速かつ効率的に行うことができます。

</include>



import DocCardList from '@theme/DocCardList';

<DocCardList />