---
title: "オフライン移行 | Cloud"
slug: /offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
notebook: FALSE
description: "オフライン移行は、ソースクラスタからターゲットクラスタにすべての既存データを転送します。この方法は、同じ組織内および異なる組織間の移行をサポートします。計画されたメンテナンス中や小規模なデータベース移行中など、一時的な書き込み中断が許容されるシナリオに最適です。中断のない書き込み操作が必要な移行については、「ゼロダウンタイム移行」を参照してください。 | Cloud"
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
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss

---

import Admonition from '@theme/Admonition';


# オフライン移行

オフライン移行は、ソースクラスタからターゲットクラスタにすべての既存データを転送します。この方法は、同じ組織内および異なる組織間の移行をサポートします。計画されたメンテナンス中や小規模なデータベース移行中など、一時的な書き込み中断が許容されるシナリオに最適です。中断のない書き込み操作が必要な移行については、「[ゼロダウンタイム移行](./zero-downtime-migration)」を参照してください。

## 考慮事項{#considerations}

表は、異なるプランのクラスター間の移行機能と制約を概説しています。

<table>
   <tr>
     <th rowspan="2"><p><strong>ソース</strong></p></th>
     <th colspan="3"><p><strong>ターゲット</strong></p></th>
   </tr>
   <tr>
     <td><p>フリークラスタ</p></td>
     <td><p>サーバーレスクラスタ</p></td>
     <td><p>専用クラスタ</p></td>
   </tr>
   <tr>
     <td><p>フリークラスタ</p></td>
     <td><p>サポートされていない</p></td>
     <td><p><a href="./manage-cluster">クラスタの管理</a>を参照してください</p></td>
     <td><p><a href="./manage-cluster">クラスタの管理</a>を参照してください</p></td>
   </tr>
   <tr>
     <td><p>サーバーレスクラスタ</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>サポートされてい</p></td>
     <td><p>サポートされてい</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>サポートされていない</p></td>
     <td><p>サポートされてい</p></td>
   </tr>
</table>

## 始める前に{#before-you-start}

- ソースのZilliz Cloudクラスターは、パブリックインターネットからアクセスできます。

- 組織[間移行](./offline-migration#migrate-data-across-organizations)の場合は、パブリックエンドポイント、APIキー、クラスターのユーザー名とパスワードなど、ターゲットのZilliz Cloudクラスターに必要な接続情報があることを確認してください。

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

![cross_cluster_migration_1](/img/cross_cluster_migration_1.png)

## 組織間でデータを移行する{#migrate-data-across-organizations}

組織間でデータを移行するには、別の組織のソースクラスターにアクセスするために必要な接続資格情報(ソースクラスターエンドポイント、APIキー、またはユーザー名とパスワード)を提供する必要があります。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトに移動し、**移行**>**他の組織で**選択してください。

1. 「**データソースに接続**」ステップで、ソースクラスタの接続情報を構成します。次に、「**次**へ」をクリックします。

1. 「**ソースとターゲットを選択**」ステップで、ソースデータベースとクラスター、およびターゲットクラスターの設定を構成します。次に、「**次**へ」をクリックします。

1. 「**スキーマ構成**」ステップでは、

    1. スキーマプレビューでターゲットコレクションとそのフィールド設定を確認します。

    1. （オプション）**詳細設定**で、**ダイナミックフィールド**と**パーティションキー**を設定します。詳細については、「[ダイナミックフィールド](./enable-dynamic-field)と[パーティションキーを使う](./use-partition-key)」を参照してください。

    1. （オプション）「**一般情報**」で、ターゲットコレクションの名前と説明をカスタマイズします。コレクション名は各クラスターで一意である必要があります。名前が既存の名前と重複している場合は、コレクション名を変更します。

1. [**移行**]をクリックします。

![cross_cluster_migration_2](/img/cross_cluster_migration_2.png)

## 移行過程を監視する{#monitor-the-migration-process}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

