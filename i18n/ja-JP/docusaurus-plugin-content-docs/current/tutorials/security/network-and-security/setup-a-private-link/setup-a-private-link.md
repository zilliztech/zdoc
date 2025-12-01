---
title: "プライベートエンドポイントを設定 | Cloud"
slug: /setup-a-private-link
sidebar_label: "プライベートエンドポイントを設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、プライベートリンクを通じてクラスターへのプライベートアクセスを提供します。クラスタートラフィックをインターネット経由にしたくない場合に便利です。 | Cloud"
type: origin
token: O5W3wHvmbiVSoLkzKgHcvB9XnUb
sidebar_position: 2
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - プライベートリンク
  - privatelink
  - プライベートエンドポイント
  - aws
  - gcp
  - azure
  - Pineconeベクターデータベース
  - 音声検索
  - 意味検索とは
  - 埋め込みモデル

---

import Admonition from '@theme/Admonition';


# プライベートエンドポイントを設定

Zilliz Cloudは、プライベートリンクを通じてクラスターへのプライベートアクセスを提供します。クラスタートラフィックをインターネット経由にしたくない場合に便利です。

Zilliz Cloudのクラスターへのプライベートクライアントアクセスを有効にするには、アプリケーションのVPC内の各サブネットにエンドポイントを作成する必要があります。その後、VPC、サブネット、およびエンドポイントをZilliz Cloudに登録して、プライベートリンクを割り当てて、プライベートリンクをエンドポイントにマッピングするDNSレコードを設定できるようにします。

以下の図はその動作方法を示しています。

![BkbRwb8YhhqePCbZn2Kc8lWknNc](/img/BkbRwb8YhhqePCbZn2Kc8lWknNc.png)

このガイドでは、クラスターのプライベートエンドポイントを設定する手順を説明します。

import DocCardList from '@theme/DocCardList';

<DocCardList />