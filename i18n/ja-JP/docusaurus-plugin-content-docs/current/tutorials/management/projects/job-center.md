---
title: "プロジェクトジョブを管理する | Cloud"
slug: /job-center
sidebar_label: "プロジェクトジョブ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、同じプロジェクト内のすべての履歴データタスクと非同期データタスクを統合した、直感的な Jobs ページを提供します。 | Cloud"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プロジェクトジョブを管理する

Zilliz Cloud は、同じプロジェクト内のすべての履歴データタスクと非同期データタスクを統合した、直感的な Jobs ページを提供します。

## プロジェクトジョブを表示する\{#view-project-jobs}

プロジェクトを選択します。左側のナビゲーションペインで **Jobs** を選択します。表示されたページには、実行中または実行済みのすべての非同期ジョブが一覧表示されます。

以下のジョブ情報が表示されます。

- タイプと説明: ジョブの目的と情報です。このページには、いくつかの種類のジョブがあります。

    <table>
       <tr>
         <th><p><strong>タイプ</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><a href="./create-backup">バックアップ</a></p></td>
         <td><p>クラスターのバックアップファイルを作成します</p></td>
       </tr>
       <tr>
         <td><p>コレクションまたは指定した複数のコレクションのバックアップファイルを作成します</p></td>
       </tr>
       <tr>
         <td><p>バックアップを指定したクラウドリージョンにコピーします</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-backup-files">復元</a></p></td>
         <td><p>バックアップファイルからクラスターを復元します</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルからコレクションまたは複数のコレクションを復元します</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">バックアップファイルのエクスポート</a></p></td>
         <td><p>バックアップファイルを指定したオブジェクトストレージサービスにエクスポートします</p></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-migration-prompts">マイグレーション</a></p></td>
         <td><p>データをクラスターに移行します。</p><ul><li><p>外部データのマイグレーション:</p><ul><li><p>Milvus から</p></li><li><p>Pinecone から</p></li><li><p>Qdrant から</p></li><li><p>Elasticsearch から</p></li><li><p>OpenSearch から</p></li><li><p>PostgreSQL から</p></li><li><p>Tencent Cloud VectorDB から</p></li></ul></li><li><p>Zilliz Cloud のクラスター間マイグレーション:</p><ul><li><p>同一組織内でのクラスター間マイグレーション</p></li><li><p>組織をまたぐクラスター間マイグレーション</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-import-prompts">インポート</a></p></td>
         <td><p>コレクションにデータをインポートします</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">コレクションのクローン</a></p></td>
         <td><p>スキーマとデータの両方を含めて、コレクションの完全なコピーを作成します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">サンプルコレクションの作成</a></p></td>
         <td><p>サンプルデータセットがロードされたコレクションを作成します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#suspend">クラスターの一時停止</a></p></td>
         <td><p>クラスターを手動で一時停止します</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#resume">クラスターの再開</a></p></td>
         <td><p>クラスターを手動で再開します</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">Query CU のスケール</a></p></td>
         <td><p>クラスターのクエリ CU 数を増減します。</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">レプリカのスケール</a></p></td>
         <td><p>クラスターのレプリカ数を増減します。</p></td>
       </tr>
    </table>

- ステータス: ジョブのステータスです。Successful、In Progress、Pending、Failed、Canceled のいずれかになります。

- ID: データジョブの ID です。データジョブに問題が発生した場合は、[サポートチケットを作成](http://support.zilliz.com) し、該当する Job ID をお知らせください。

- 開始時刻と終了時刻

- 作成者: データジョブを開始したユーザーです。

## ジョブの詳細を表示する\{#view-job-details}

ジョブの詳細を表示するには、**Actions** 列の **...** をクリックし、**View Details** を選択します。または、[Describe Job](/reference/restful/describe-job-v2) API を使用して、プログラムから詳細を取得することもできます。

![view_job_details](https://zdoc-images.s3.us-west-2.amazonaws.com/viewjobdetails.png "view_job_details")

## ジョブをキャンセルする\{#cancel-job}

現在、ステータスが **Pending** または **In Progress** である以下の種類のジョブのみキャンセルできます。

- バックアップ作成ジョブ（他のクラウドリージョンへのバックアップのコピーを除く）

- マイグレーションジョブ（ゼロダウンタイムマイグレーションを除く）

- バックアップファイルのエクスポートジョブ

<Admonition type="info" title="Notes">

ジョブをキャンセルするには、**Organization Owner** または **Project Admin** である必要があります。

</Admonition>

![cancel_job](https://zdoc-images.s3.us-west-2.amazonaws.com/canceljob.png "cancel_job")

## 失敗したジョブを再試行する\{#retry-failed-job}

<Admonition type="info" title="Notes">

現在、再試行できるのは失敗したインポートジョブのみです。

失敗したジョブを再試行するには、**Organization Owner** または **Project Admin** である必要があります。

</Admonition>

インポートに失敗したジョブについては、ステータスの横にある情報アイコンをクリックして理由を確認すると、そのジョブが失敗した原因を把握できます。

インポートに失敗したファイルを修正した場合は、そのジョブを再試行できます。

![retry_failed_job](https://zdoc-images.s3.us-west-2.amazonaws.com/retryfailedjob.png "retry_failed_job")
