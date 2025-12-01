---
title: "ホーム | Cloud"
slug: /home
sidebar_label: "ホーム"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud Developer Hubのホームページです。 | Cloud"
type: origin
token: KXgEwDH8yifWxukkXXFctMdLnpg
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - 入門
  - デベロッパーハブ
  - ホームページ
  - ホーム
  - NLP
  - ニューラルネットワーク
  - ディープラーニング
  - 知識ベース

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

# Zilliz Cloudドキュメントへようこそ\{#welcome-to-zilliz-cloud-docs}

Zilliz Cloudは完全に管理されたMilvusサービスを提供し、セキュリティを重視しながらベクターサーチアプリケーションのデプロイとスケーリングを簡素化し、複雑なインフラの構築と維持管理の必要性を排除します。[詳細はこちら](./get-started)。

![H1i9wA7f9huNQDbDat4cf813nig](/img/H1i9wA7f9huNQDbDat4cf813nig.png)

</Hero>

<Bars>

プロジェクトの[プラン](./select-zilliz-cloud-service-plans)を選択し、プロジェクト内で異なるデプロイオプションのクラスターを作成します。

- [無料](./create-cluster#create-a-free-cluster)

- [サーバーレス](./create-cluster#create-a-serverless-cluster)

- [専用](./create-cluster#create-a-dedicated-cluster)

 [どちらのデプロイオプションを選べばよいかわからない場合](https://zilliz.com/pricing)

</Bars>

<Stories>

# Zilliz Cloudでデータを操作する\{#work-with-your-data-in-zilliz-cloud}

## 自分のベクターを使用する\{#bring-your-own-vectors}

1. クラスターを作成して接続します。

    クラスターを作成し、[接続](./connect-to-cluster)します。

1. コレクションを作成します。

    コレクションは固定列と可変行を持つ二次元テーブルです。[コレクションを作成](./manage-collections-sdks)してデータを操作します。

1. データをインポートします。

    ローカルファイルまたはオブジェクトストレージバケットから[データをインポート](./data-import)します。

1. ベクター類似検索を実行します。

    [基本的なベクター類似検索](./single-vector-search)により、最も類似した結果を見つけることができます。

## 他のデータインフラから移行する\{#migrate-from-other-data-infra}

1. データソースに接続します。

    Zilliz CloudはPinecone、MongoDB、Qdrant、PostgreSQLなど、さまざまなデータソースをサポートしています。[移行ガイド](./migrations)を参照してください。

1. 移行元と移行先を構成します。

    データソース情報を確認し、移行先を構成します。

1. マッピングを確認します。

    ソースデータとターゲットデータのスキーマ間のマッピングを設定して確認します。

## バックアップとリストア\{#backup-and-restore}

1. クラスターまたはコレクションのバックアップを作成します。

    バックアップはクラスターまたはコレクションの時点コピーです。[手動で](./create-snapshot)バックアップを作成するか、スケジュールされたバックアップのための[バックアップポリシーを設定](./schedule-automatic-backups)できます。また、[バックアップを他のリージョンにコピー](/docs/backup-to-other-regions)して、災害復旧機能を強化することもできます。

1. (任意) バックアップをオブジェクトストレージサービスにエクスポートします。

    作成したバックアップファイルを[AWS S3](./export-backup-files)またはAzure Blob Storageにエクスポートできます。

1. データを復元します。

    予期しないシステム障害またはデータ損失の際には、[データを復元](./restore-from-snapshot)します。

</Stories>

<Cards>

# Zilliz Cloudでさらに進める\{#go-further-with-zilliz-cloud}

- [モニタリングとアラート](./metrics-and-alerts)

    クラスターを監視し、タイムリーにアラートを取得します。

- [アクセス制御](./access-control)

    細かいアクセス制御でデータを保護します。

- [プライベートネットワーキング](./setup-a-private-link)

    クラスターをプライベートネットワークに接続します。

- break

- [請求](./payment-billing)

    前払い不要で、使用した分だけ支払います。

- [統合](./integrate-with-third-parties)

    既存のツールおよびワークフローと統合します。

</Cards>

<Blocks>

# お好みの言語で構築を開始\{#start-building-with-your-preferred-language}

- [Python](/reference/python)

- [Java](/reference/java)

- [Go](/reference/go)

- [Node.js](/reference/nodejs)

- [RESTful API](/reference/restful)

</Blocks>

<Banner bannerText="お探しの情報が見つかりませんか？" bannerLinkText="AIに質問" />
