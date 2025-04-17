---
title: "ホーム | Cloud"
slug: /home
sidebar_label: "ホーム"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud Developer Hubのホームページです。 | Cloud"
type: origin
token: Yv5Iw1UMni5EzvkvZvMcvSgSnLO
sidebar_position: 0
keywords: 
  - zilliz
  - vector database
  - get started
  - developer hub
  - home page
  - home
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work

hide_title: true
hide_table_of_contents: true
---

import Admonition from '@theme/Admonition';

import Hero from '@site/src/components/Hero';
import Bars from '@site/src/components/Bars';
import Blocks from '@site/src/components/Blocks';
import Cards from '@site/src/components/Cards';
import Stories from '@site/src/components/Stories';
import Banner from '@site/src/components/Banner';



<Hero>

# Zilliz Cloud ドキュメントへようこそ!{#welcome-to-zilliz-cloud-docs}

Zilliz Cloudは、完全に管理されたMilvusサービスを提供し、セキュリティを考慮したベクトル検索アプリケーションの展開とスケーリングを簡素化し、複雑なインフラストラクチャの構築と維持を不要にします。[詳しくはこちらをご覧ください](./get-started)。

![XduOwp2luhJnskb9lBgcXOFXned](/img/XduOwp2luhJnskb9lBgcXOFXned.png)

</Hero>

<Bars>

次のプランでクラスターを作成できます。

- [Free](./free-trials)

- [Serverless](./select-zilliz-cloud-service-plans)

- [Dedicated](./select-zilliz-cloud-service-plans)

- [BYOC](/ja-JP/docs/byoc/byoc-intro)

あなたにとって正しい計画が何かわからないですか?

</Bars>

<Stories>

# Zilliz Cloud でデータを操作する{#work-with-your-data-in-zilliz-cloud}

## 自身のベクトルを持参して{#bring-your-own-vectors}

1. クラスタを作成して接続します。

    必要なコンピューティングリソースとストレージリソースを使用して[クラスターを作成し](./create-cluster)、それに[接続して](./connect-to-cluster)ください。

1. コレクションを作成します。

    コレクションは、固定列と可変行を持つ2次元テーブルです。データを操作するために[コレクションを作成し](./manage-collections-sdks)てください。

1. データのインポート。

    ローカルファイルまたはオブジェクトストレージバケットから[データをインポートし](./data-import)ます。

1. ベクトル類似検索を行います。

    [基本的なベクトル類似検索](./single-vector-search)は、最も類似した結果を見つけるのに役立ちます。

## 他のデータインフラからの移行{#migrate-from-other-data-infra}

1. データソースに接続します。

    Zilliz Cloudは、Pinecone、MongoDB、Qdrant、Postgre SQLなど、さまざまなデータソースをサポートしています。[移行ガイド](./migrations)を参照してください。

1. 移行元と移行先を設定します。

    データソース情報を確認し、移行ターゲットを構成してください。

1. レビューマッピング。

    ソースデータとターゲットデータのスキーマ間のマッピングを設定して確認してください。

## バックアップと復元{#backup-restore}

1. クラスターまたはコレクションのバックアップを作成します。

    バックアップは、クラスタまたはコレクションのポイントオブタイムコピーです。バックアップは[手動](./create-snapshot)または[自動](./schedule-automatic-backups)で作成できます。

1. (オプション)バックアップをオブジェクトストレージサービスにエクスポートします。

    作成したバックアップファイルは、AWS S 3またはAzure Blob Storageに[エクスポート](./export-backup-files)できます。

1. データを復元する。

    予期せぬシステム障害やデータ損失が発生した場合に[データを復元](./restore-from-snapshot)します。

</Stories>

<Cards>

# Zilliz Cloudでさらに進む{#go-further-with-zilliz-cloud}

- [Monitoring & Alerts](./metrics-and-alerts)

    クラスターを監視し、時間通りにアラートを受け取ります。

- [Access Control](./access-control)

    きめ細かなアクセス制御でデータを保護しましょう。

- [Private Networking](./setup-a-private-link)

    クラスタをプライベートネットワークに接続します。

- break

- [Billing](./payment-billing)

    使用した分だけ支払い、前払い費用はかかりません。

- [Integrations](https://zilliz.com/learn/milvus-notebooks)

    既存のツールやワークフローと統合します。

</Cards>

<Blocks>

# お好みの言語でビルドを開始{#start-building-with-your-preferred-language}

- [Python](/reference/python)

- [Java](/reference/java)

- [Go](/reference/go)

- [Node.js](/reference/nodejs)

- [RESTful API](/reference/restful)

</Blocks>

<Banner bannerText="お探しのものが見つかりませんか?" bannerLinkText="Ask AIを試して" />

