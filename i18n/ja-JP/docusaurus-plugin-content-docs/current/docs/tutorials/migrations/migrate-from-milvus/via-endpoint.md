---
title: "MilvusからZilliz Cloudへの移行 | Cloud"
slug: /via-endpoint
sidebar_label: "MilvusからZilliz Cloudへの移行"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、インフラストラクチャを自分で管理する必要がなく、Milvusベクトルデータベースを使用したいユーザー向けに、完全に管理されたクラウドホストソリューションとしてMilvusを提供しています。スムーズな移行を可能にするために、データベースエンドポイントを介してソースMilvusに接続するか、バックアップファイルを直接アップロードすることができます。 | Cloud"
type: origin
token: YRFowK2X8i7Tm8k5X8kcJDgBnGf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - endpoint
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison

---

import Admonition from '@theme/Admonition';


# MilvusからZilliz Cloudへの移行

Zilliz Cloudは、インフラストラクチャを自分で管理する必要がなく、[Milvus](https://milvus.io/)ベクトルデータベースを使用したいユーザー向けに、完全に管理されたクラウドホストソリューションとしてMilvusを提供しています。スムーズな移行を可能にするために、データベースエンドポイントを介してソースMilvusに接続するか、バックアップファイルを直接アップロードすることができます。

このトピックでは、Milvusからデータベースエンドポイントを介して移行する方法について説明します。バックアップファイルのアップロード方法については、「Via Backup Files」を参照してください。

## 考慮事項{#}

- 各移行タスクは単一のソースMilvusデータベースに制限されます。複数のソースデータベースにデータがある場合は、それぞれに別々の移行ジョブを設定できます。

- 移行の過程で、Zilliz CloudはソースのMilvusコレクションから正確なコレクションスキーマを複製します。移行中にスキーマを変更することはできません。

## 始める前に{#}

- ソースのMilvusインスタンスはバージョン2.3.6以降を実行しており、パブリックインターネットからアクセスできます。

- ネットワーク環境で許可リストが設定されている場合は、Zilliz CloudのIPアドレスが追加されていることを確認してください。詳細については、Zilliz Cloud IPsを参照してください。

- 移行元のMilvusで認証が有効になっている場合は、必要な接続認証情報を取得していることを確認してください。詳細については、[ユーザーアクセス認証](https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access)を参照してください。

- 組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## データベースエンドポイントを介してMilvusから移行する{#milvus}

1つのMilvusデータベースから1つ以上のコレクションを同時に移行できます。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトに移動し、**Migrations**>**Milvus**>**Via Endpoint**を選択してください。

1. [**Database Endpoint**]フィールドの[**Connect to Data Source**]ステップで、ソースMilvusのサーバーアドレスを入力します。ソースMilvusの[認証](https://milvus.io/docs/authenticate.md)が有効になっている場合は、アクセス資格情報として**ユーザー名**と**パスワード**を入力します。次に、[**次**へ]をクリックします。

1. 「**ソースとターゲットを選択**」ステップで、ソースのMilvusとターゲットのZilliz Cloudクラスタの設定を行います。次に、「**次**へ」をクリックしてください。

1. 「**スキーマ構成**」ステップでは、

    1. スキーマプレビューでターゲットコレクションとそのフィールド設定を確認します。

    1. [**詳細設定**]で、ソースコレクションの設定を継承し、変更できない**ダイナミックフィールド**と**パーティションキー**の設定を確認します。詳細については、「Dynamic FieldとUse Partition Key」を参照してください。

    1. [**ターゲットコレクション名**と**説明**]で、ターゲットコレクション名と説明をカスタマイズします。コレクション名は、各クラスターで一意である必要があります。名前が既存の名前と重複する場合は、コレクション名を変更します。

1. [**移行**]をクリックします。

![migrate_from_milvus_via_endpoint_1](/img/ja-JP/migrate_from_milvus_via_endpoint_1.png)

## 移行過程を監視する{#}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](null)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/ja-JP/verify_collection.png)

## 移行ジョブをキャンセル{#}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](null)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

