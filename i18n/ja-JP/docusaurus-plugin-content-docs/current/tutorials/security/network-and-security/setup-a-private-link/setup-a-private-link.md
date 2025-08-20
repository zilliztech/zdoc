---
title: "プライベートエンドポイントを設定する | Cloud"
slug: /setup-a-private-link
sidebar_label: "プライベートエンドポイントを設定する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、プライベートリンクを介してクラスタへのプライベートアクセスを提供します。これは、クラスタのトラフィックがインターネットを経由しないようにする場合に便利です。 | Cloud"
type: origin
token: LIehwcqZFiGZitkmzdrckoP0n8d
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - privatelink
  - private endpoint
  - aws
  - gcp
  - azure
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';


# プライベートエンドポイントを設定する

Zilliz Cloudは、プライベートリンクを介してクラスタへのプライベートアクセスを提供します。これは、クラスタのトラフィックがインターネットを経由しないようにする場合に便利です。

Zilliz Cloud上のクラスタへのプライベートクライアントアクセスを有効にするには、アプリケーションのVPC内の各サブネットにエンドポイントを作成する必要があります。その後、VPC、サブネット、エンドポイントをZilliz Cloudに登録して、プライベートリンクを割り当て、プライベートリンクをエンドポイントにマッピングするDNSレコードを設定できるようにします。

次の図は、その動作を示しています。

![XUG2wLW0vhuX4kbAggzctrnknie](/img/XUG2wLW0vhuX4kbAggzctrnknie.png)

このガイドでは、クラスターのプライベートエンドポイントの設定方法について説明します。

import DocCardList from '@theme/DocCardList';

<DocCardList />