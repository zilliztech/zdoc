---
title: "MilvusからZilliz Cloudへの移行 | Cloud"
slug: /via-endpoint
sidebar_label: "Via Endpoint"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Milvusベクターデータベースを使用したいユーザーがインフラストラクチャを自分で管理する必要がないように、ミルヴスを完全に管理されたクラウドホスティングソリューションとして提供しています。スムーズな移行を可能にするために、MilvusからZilliz Cloudへデータを移行することができます。これらの方法で-データベースエンドポイントを介してソースMilvusに接続するか、直接バックアップファイルをアップロードします。 | Cloud"
type: origin
token: PlX3wo82Di6oWVkg2ercRWCUnvV
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - endpoint
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search

---

import Admonition from '@theme/Admonition';


# MilvusからZilliz Cloudへの移行

Zilliz Cloudは、Milvusベクターデータベースを使用したいユーザーがインフラストラクチャを自分で管理する必要がないように、[ミルヴス](https://milvus.io/)を完全に管理されたクラウドホスティングソリューションとして提供しています。スムーズな移行を可能にするために、MilvusからZilliz Cloudへデータを移行することができます。これらの方法で-データベースエンドポイントを介してソースMilvusに接続するか、直接バックアップファイルをアップロードします。

このトピックでは、データベースエンドポイントを介してMilvusから移行する方法について説明します。バックアップファイルのアップロード方法については、[バックアップファイルを使用する](./via-backup-files)を参照してください。

## 前提条件{#prerequisites}

MilvusからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください。

### Milvusの要件{#milvus-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>バージョンの互換性</p></td>
     <td><p>Milvus2.3.6以降</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースMilvusインスタンスは、パブリックインターネットからアクセスできる必要があります</p></td>
   </tr>
   <tr>
     <td><p>認証クレデンシャル</p></td>
     <td><p>認証が有効な場合のユーザー名とパスワード(<a href="https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access">ユーザーアクセスの認証</a>を参照)</p></td>
   </tr>
</table>

### Zilliz Cloudの要件{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ユーザーの役割</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスタ容量</p></td>
     <td><p>十分なストレージとコンピューティングリソース(<a href="https://zilliz.com/pricing#calculator">CUの計算機</a>を使用してCU体格を推定)</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用する場合は、許可リストに<a href="./zilliz-cloud-ips">Zilliz CloudのIPアドレス</a>を追加してください。</p></td>
   </tr>
</table>

## スタートする{#getting-started}

以下のデモでは、エンドポイントを介してMilvusから移行を開始する方法を説明します。

<supademo id="cmbkiuxw98p13sn1rc65tt6b0" title="Zilliz Cloud - Migrate from Milvus via Endpoint"></supademo>

## 移行過程を監視する{#monitor-the-migration-process}

「移行」をクリックすると、移行ジョブが生成されます。[仕事](./job-center)ページで移行の進捗状況を確認できます。ジョブの状態が「進行中」から「成功」に切り替わると、移行は完了します。

![RGsvb7oFpo7uzbxjSSFc6owNn0c](/img/RGsvb7oFpo7uzbxjSSFc6owNn0c.png)

## ポストマイグレーション{#post-migration}

移行ジョブが完了したら、次の点に注意してください。

- インデックスの作成:移行過程で、移行されたコレクションの[AUTOINDEX](./autoindex-explained)が自動的に作成されます。

- 手動ロードが必要です:自動インデックス化されているにもかかわらず、移行されたコレクションはすぐに検索またはクエリ操作に利用できません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、[ロード&リリース](./load-release-collections)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>コレクションがロードされたら、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[仕事](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. エラーログにアクセスするには、**アクション**列の**詳細を表示**をクリックしてください。

