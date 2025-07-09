---
title: "ホーム | Cloud"
slug: /home
sidebar_label: "ホーム"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud Developer Hubのホームページです。 | Cloud"
type: origin
token: KXgEwDH8yifWxukkXXFctMdLnpg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - get started
  - developer hub
  - home page
  - home
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

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

# Zilliz Cloudドキュメントへようこそ!{#welcome-to-zilliz-cloud-docs}

Zilliz Cloudは、セキュリティを考慮したベクトル検索アプリケーションの展開とスケーリングを簡素化し、複雑なインフラストラクチャの構築と維持を不要にする、完全に管理されたMilvusサービスを提供します。[もっと学ぶ](./get-started)。

![H1i9wA7f9huNQDbDat4cf813nig](/img/H1i9wA7f9huNQDbDat4cf813nig.png)

</Hero>

<Bars>

次のプランでクラスターを作成できます。

- [フリー](./create-cluster#set-up-a-free-cluster)

- [サーバーレス](./create-cluster#set-up-a-serverless-cluster)

- [専用の](./create-cluster#create-alessinclude-targetsaasgreater-dedicatedlessincludegreater-cluster)

- [BYOC](/docs/byoc/byoc-intro)

[あなたにとって正しい計画が何かわからないですか?](./select-zilliz-cloud-service-plans)

</Bars>

<Stories>

# Zilliz Cloudでデータを操作する{#work-with-your-data-in-zilliz-cloud}

## あなた自身のベクトルを持参してください{#bring-your-own-vectors}

1. クラスタを作成して接続します。

    [クラスタを作成する](./create-cluster)に必要なコンピューティングリソースとストレージリソースを入力し、[接続する](./connect-to-cluster)を入力してください。

1. コレクションを作成します。

    コレクションは、固定列と可変行を持つ2次元テーブルです。データを操作するには、[コレクションを作成する](./manage-collections-sdks)を使用してください。

1. データのインポート。

    ローカルファイルまたはオブジェクトストレージバケットからの[データのインポート](./data-import)。

1. ベクトル類似性検索を行います。

    [基本ベクトル類似検索](./single-vector-search)は、最も類似した結果を見つけるのに役立ちます。

## 他のデータインフラからの移行{#migrate-from-other-data-infra}

1. データソースに接続します。

    Zilliz Cloudは、Pinecone、MongoDB、Qdrant、Postgre SQLなど、さまざまなデータソースをサポートしています。[マイグレーション ](./migrations) [g](./migrations) [uides](./migrations)を参照してください。

1. 移行元と移行先を設定します。

    データソース情報を確認し、移行ターゲットを構成してください。

1. マッピングのレビュー。

    ソースデータとターゲットデータのスキーマ間のマッピングを設定して確認してください。

## バックアップと復元{#backup-and-restore}

1. クラスターまたはコレクションのバックアップを作成します。

    バックアップとは、クラスタまたはコレクションの時点のコピーです。バックアップは[手動で](./create-snapshot)または[自動的に](./schedule-automatic-backups)で作成できます。

1. (オプション)バックアップをオブジェクトストレージサービスにエクスポートします。

    作成した_PLACEHOLDER_0をAWS S 3またはAzure Blob Storageにリンクできます。

1. データを復元する。

    予期しないシステム障害やデータ損失が発生した場合の[データを復元する](./restore-from-snapshot)。

</Stories>

<Cards>

# Zilliz Cloudでさらに進む{#go-further-with-zilliz-cloud}

- [モニタリングとアラート](./metrics-and-alerts)

    クラスターを監視し、時間通りにアラートを受け取ります。

- [アクセス制御](./access-control)

    きめ細かなアクセス制御でデータを保護しましょう。

- [プライベートネットワーキング](./setup-a-private-link)

    クラスタをプライベートネットワークに接続します。

- 壊れる

- [ビリング](./payment-billing)

    使用した分だけ支払い、前払い費用はありません。

- [インテグレーション](./integrate-with-third-parties)

    既存のツールやワークフローと統合します。

</Cards>

<Blocks>

# お好みの言語でビルドを開始{#start-building-with-your-preferred-language}

- [パイソン](/reference/python)

- [Java](/reference/java)

- [行く](/reference/go)

- [Node. jsの](/reference/nodejs)

- [RESTful API](/reference/restful)

</Blocks>

<banner bannertext="Can&#39;t find what you&#39;re looking for?" bannerlinktext="Try Ask AI"></banner>

