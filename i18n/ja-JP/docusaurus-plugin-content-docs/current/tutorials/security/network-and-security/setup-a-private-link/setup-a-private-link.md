---
title: "プライベートエンドポイントの設定 | Cloud"
slug: /setup-a-private-link
sidebar_key: setup-a-private-link
sidebar_label: "プライベートエンドポイントの設定"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、プライベートリンクを介してクラスターへのプライベートアクセスを提供します。これは、クラスターのトラフィックをインターネット経由で送信したくない場合に役立ちます。 | Cloud"
type: origin
token: O5W3wHvmbiVSoLkzKgHcvB9XnUb
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - プライベートリンク
  - privatelink
  - プライベートエンドポイント
  - aws
  - gcp
  - azure

---

import Admonition from '@theme/Admonition';


# プライベートエンドポイントの設定

Zilliz Cloud は、プライベートリンクを介してクラスターへのプライベートアクセスを提供します。これは、クラスターのトラフィックをインターネット経由で流したくない場合に役立ちます。

Zilliz Cloud 上のクラスターへのプライベートクライアントアクセスを有効にするには、アプリケーションの VPC 内の各サブネットにエンドポイントを作成する必要があります。次に、VPC、サブネット、およびエンドポイントを Zilliz Cloud に登録し、プライベートリンクを割り当ててもらい、そのプライベートリンクをエンドポイントにマッピングする DNS レコードを設定します。

以下の図は、その仕組みを示しています。

![BkbRwb8YhhqePCbZn2Kc8lWknNc](https://zdoc-images.s3.us-west-2.amazonaws.com/BkbRwb8YhhqePCbZn2Kc8lWknNc.png)

このガイドでは、クラスターのプライベートエンドポイントを設定する方法について説明します。

import DocCardList from '@theme/DocCardList';

<DocCardList />