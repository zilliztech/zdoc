---
title: "プロジェクトジョブの管理 | Cloud"
slug: /job-center
sidebar_label: "プロジェクトジョブ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、同じプロジェクト内のすべての履歴的および非同期データタスクを統合する直感的なジョブページを提供します。 | Cloud"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 3
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - プロジェクトジョブ
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing

---

import Admonition from '@theme/Admonition';


# プロジェクトジョブの管理

Zilliz Cloudは、同じプロジェクト内のすべての履歴的および非同期データタスクを統合する直感的なジョブページを提供します。

## プロジェクトジョブの表示\{#view-project-jobs}

プロジェクトを選択します。左側のナビゲーションペインで、**ジョブ**を選択してください。表示されるページには、実行中または実行済みのすべての非同期ジョブのリストが表示されます。

以下のジョブ情報が表示されます：

- 種類と説明：ジョブの目的と情報。このページには特定の種類のジョブがあります。

    <table>
       <tr>
         <th><p><strong>種類</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><a href="./create-snapshot">バックアップ</a></p></td>
         <td><p>クラスターのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td><p>コレクションまたは指定されたコレクションのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td><p>バックアップを指定されたクラウドリージョンにコピーする</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-snapshot">復元</a></p></td>
         <td><p>バックアップファイルからクラスターを復元する</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルからコレクションまたは複数のコレクションを復元する</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">バックアップファイルのエクスポート</a></p></td>
         <td><p>バックアップファイルを指定されたオブジェクトストレージサービスにエクスポートする</p></td>
       </tr>
       <tr>
         <td><p><a href="./migrations">移行</a></p></td>
         <td><p>クラスターにデータを移行する。</p><ul><li><p>外部データ移行：</p><ul><li><p>Milvusから</p></li><li><p>Pineconeから</p></li><li><p>Qdrantから</p></li><li><p>Elasticsearchから</p></li><li><p>OpenSearchから</p></li><li><p>PostgreSQLから</p></li><li><p>Tencent Cloud VectorDBから</p></li></ul></li><li><p>Zilliz Cloud クロスクラスタ移行：</p><ul><li><p>同じ組織内でのクロスクラスタ移行</p></li><li><p>組織をまたがるクラスタ間移行</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./data-import">インポート</a></p></td>
         <td><p>コレクションにデータをインポートする</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-collection">コレクションのクローン作成</a></p></td>
         <td><p>スキーマとデータの両方を含むコレクションの完全コピーを作成する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-collection">サンプルコレクションの作成</a></p></td>
         <td><p>サンプルデータセットをロードしたコレクションを作成する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#suspend-cluster">クラスターの一時停止</a></p></td>
         <td><p>クラスターを手動で一時停止する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#resume-cluster">クラスターの再開</a></p></td>
         <td><p>クラスターを手動で再開する</p></td>
       </tr>
       <tr>
         <td><p><a href="./scale-cluster">クエリCUのスケーリング</a></p></td>
         <td><p>クラスターのクエリCU数を増減させる。</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-replica">レプリカのスケーリング</a></p></td>
         <td><p>クラスターのレプリカ数を増減させる。</p></td>
       </tr>
    </table>

- ステータス：ジョブステータス。成功、進行中、保留、失敗、キャンセルのいずれかになります。

- ID：データジョブのID。データジョブに関する問題が発生した場合は、[サポートチケットを作成](http://support.zilliz.com)し、関連するジョブIDを提供してください。

- 開始時刻 & 終了時刻

- 作成者：データジョブを開始したユーザー。

## ジョブの詳細を表示\{#view-job-details}

ジョブの詳細を表示するには、**アクション**列の**...**をクリックし、**詳細を表示**を選択します。または、[ジョブの詳細取得](/reference/restful/describe-job-v2)APIを使用してプログラムで詳細を取得することもできます。

![view_job_details](/img/view_job_details.png "view_job_details")

## ジョブのキャンセル\{#cancel-job}

現在、以下の状態の以下の種類のジョブのみをキャンセルできます：**保留**または**進行中**。

- バックアップ作成ジョブ（他のクラウドリージョンへのコピーバックアップを除く）

- 移行ジョブ（ダウンタイムゼロ移行を除く）

- バックアップファイルのエクスポートジョブ

<Admonition type="info" icon="📘" title="ノート">

<p>ジョブをキャンセルするには、<strong>組織オーナー</strong>または<strong>プロジェクト管理者</strong>である必要があります。</p>

</Admonition>

![cancel_job](/img/cancel_job.png "cancel_job")

## 失敗したジョブの再試行\{#retry-failed-job}

<Admonition type="info" icon="📘" title="ノート">

<p>現在、失敗したインポートジョブのみ再試行できます。</p>
<p>失敗したジョブを再試行するには、<strong>組織オーナー</strong>または<strong>プロジェクト管理者</strong>である必要があります。</p>

</Admonition>

失敗したインポートジョブについては、そのステータスの横にある情報アイコンをクリックして、このジョブが失敗した理由を確認できます。

インポートに失敗したファイルに対して調整を行った場合は、ジョブを再試行できます。

![retry_failed_job](/img/retry_failed_job.png "retry_failed_job")