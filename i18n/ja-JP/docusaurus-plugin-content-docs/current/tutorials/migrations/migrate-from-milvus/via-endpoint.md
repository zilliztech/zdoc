---
title: "エンドポイント経由でMilvusからZilliz Cloudに移行 | Cloud"
slug: /via-endpoint
sidebar_label: "エンドポイント経由"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、インフラストラクチャ管理を自分で行う必要なくMilvusベクターデータベースを使用したいユーザーのために、完全に管理されたクラウドホスト型ソリューションとしてMilvusを提供します。このトピックでは、データベースエンドポイントを介してMilvusから移行する方法について説明します。 | Cloud"
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
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# MilvusからZilliz Cloudへの移行（エンドポイント経由）

Zilliz Cloudは[Milvus](https://milvus.io/)を完全に管理されたクラウドホスト型ソリューションとして提供し、インフラストラクチャ管理を自分で行う必要なくMilvusベクターデータベースを使用したいユーザーをサポートしています。このトピックでは、データベースエンドポイント経由でMilvusから移行する方法を説明します。

## 前提条件\{#prerequisites}

MilvusからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください：

### Milvusの要件\{#milvus-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>バージョン互換性</p></td>
     <td><p>Milvus 2.3.6以上</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースMilvusインスタンスがパプリックインターネットからアクセス可能であること</p></td>
   </tr>
   <tr>
     <td><p>認証情報</p></td>
     <td><p>認証が有効の場合、ユーザー名とパスワードが必要です（<a href="https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access">ユーザーアクセス認証</a>を参照）</p></td>
   </tr>
</table>

### Zilliz Cloudの要件\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ユーザーロール</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスターキャパシティ</p></td>
     <td><p>十分なストレージおよびコンピュートリソース（<a href="https://zilliz.com/pricing#calculator">CU計算機</a>を使用してCUサイズを推定してください）</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用している場合は、ネットワーク許可リストに<a href="./zilliz-cloud-ips">Zilliz Cloud IP</a>を追加してください</p></td>
   </tr>
</table>

## はじめに\{#getting-started}

以下のデモでは、エンドポイント経由でMilvusから移行を開始する方法を説明します：

<Supademo id="cmbkiuxw98p13sn1rc65tt6b0" title="Zilliz Cloud - エンドポイント経由でMilvusから移行" />

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p>ソースコレクションですでに全文検索が有効になっている場合、移行後もZilliz Cloudはその機能設定をターゲットコレクションに保持します。これらの継承された設定は変更できません。</p></li>
<li><p>移行中に他のVARCHARフィールドに対して全文検索を有効にすることもできます。詳細については、<a href="./full-text-search">全文検索</a>を参照してください。</p></li>
</ul>

</Admonition>

## 移行プロセスの監視\{#monitor-the-migration-process}

**移行**をクリックすると、移行ジョブが生成されます。移行の進行状況は[ジョブ](./job-center)ページで確認できます。ジョブステータスが**進行中**から**成功**に変わると、移行が完了します。

![RGsvb7oFpo7uzbxjSSFc6owNn0c](/img/RGsvb7oFpo7uzbxjSSFc6owNn0c.png)

## 移行後\{#post-migration}

移行ジョブが完了した後、以下の点に注意してください：

- **インデックス作成**: 移行プロセスでは、移行されたコレクションに対して[AUTOINDEX](./autoindex-explained)が自動的に作成されます。

- **手動でのロードが必要**: 自動インデックス作成にもかかわらず、移行されたコレクションは検索またはクエリ操作に対してすぐに使用可能にはなりません。検索およびクエリ機能を有効にするには、Zilliz Cloudでコレクションを手動でロードする必要があります。詳細については、[ロードとリリース](./load-release-collections)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>コレクションがロードされたら、ターゲットクラスターのコレクション数およびエンティティ数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

## 移行ジョブをキャンセル\{#cancel-migration-job}

移行プロセスで問題が発生した場合、以下の手順に従ってトラブルシューティングおよび移行を再開できます：

1. [ジョブ](./job-center)ページで、失敗した移行ジョブを特定してキャンセルします。

1. **アクション**列の**詳細を表示**をクリックしてエラーログにアクセスします。

