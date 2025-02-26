---
title: "オフライン移行 | BYOC"
slug: /offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
notebook: FALSE
description: "オフライン移行は、ソースクラスタからターゲットクラスタにすべての既存データを転送します。この方法は、同じ組織内および異なる組織間の移行をサポートします。計画されたメンテナンス中や小規模なデータベース移行中など、一時的な書き込み中断が許容されるシナリオに最適です。中断のない書き込み操作が必要な移行については、「ゼロダウンタイム移行」を参照してください。 | BYOC"
type: origin
token: NR7FwgMcyiRS9Vk7ZVCc9Q5Sn7c
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters
  - offline
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example

---

import Admonition from '@theme/Admonition';


# オフライン移行

オフライン移行は、ソースクラスタからターゲットクラスタにすべての既存データを転送します。この方法は、同じ組織内および異なる組織間の移行をサポートします。計画されたメンテナンス中や小規模なデータベース移行中など、一時的な書き込み中断が許容されるシナリオに最適です。中断のない書き込み操作が必要な移行については、「[ゼロダウンタイム移行](./zero-downtime-migration)」を参照してください。

## 始める前に{#before-you-start}

- ソースのZilliz Cloudクラスターは、パブリックインターネットからアクセスできます。

- 組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、プログラムによってクラスタ間でデータを移行するためのRESTful APIエンドポイントも提供しています。詳細については、「<a href="/reference/restful/migrate-to-existing-cluster-v2">既存クラスタへの移行</a>」と「<a href="/reference/restful/migrate-to-new-dedicated-cluster-v2">新しい専用クラスタへ</a>の移行」を参照してください。</p>

</Admonition>

## 同じ組織内でデータを移行する{#migrate-data-within-the-same-organization}

同じ組織内の新しいクラスターまたは既存のクラスターにデータを移行できます。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトに移動し、**移行**>**現在の組織内**を選択してください。

1. [**移行設定**]ダイアログボックスで、ソースクラスターとデータベース、およびターゲットクラスターを構成し、[**確認**]をクリックします。ターゲットクラスターのプランレベルがソースクラスターのプランレベルよりも低くないことを確認します(例:**専用**クラスターから**Free**または**Serverless**クラスターへの移行はサポートされていません)。クラスタープランの詳細については、「[詳細なプラン比較](./select-zilliz-cloud-service-plans)」を参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>データを移行する際には、新しいターゲットクラスタを作成するか、同じ組織内の既存のクラスタを使用するオプションがあります。ソースクラスタは、現在のプロジェクトで利用可能なクラスタから選択する必要があります。</p>

    </Admonition>

1. [**移行**]をクリックします。

![cross_cluster_migration_1](/byoc/ja-JP/cross_cluster_migration_1.png)

## 移行過程を監視する{#monitor-the-migration-process}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/byoc/ja-JP/verify_collection.png)

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

