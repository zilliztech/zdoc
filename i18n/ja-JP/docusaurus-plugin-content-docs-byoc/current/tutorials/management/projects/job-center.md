---
title: "プロジェクトジョブの管理 | BYOC"
slug: /job-center
sidebar_label: "プロジェクトジョブ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、同一プロジェクト内のすべての履歴および非同期データタスクを一元管理できる直感的な Jobs ページを提供します。 | BYOC"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プロジェクトジョブの管理

Zilliz Cloud は、同一プロジェクト内のすべての履歴および非同期データタスクを一元管理できる直感的な Jobs ページを提供します。

## プロジェクトジョブの確認\{#view-project-jobs}

プロジェクトを選択し、左側のナビゲーションペインで **Jobs** をクリックします。表示されるページでは、実行中または実行済みのすべての非同期ジョブの一覧を確認できます。

以下のジョブ情報が表示されます。

- タイプと説明: ジョブの目的や内容を示します。このページには複数の種類のジョブが表示されます。

    <table>
       <tr>
         <th><p><strong>タイプ</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><a href="./create-backup">バックアップ</a></p></td>
         <td><p>クラスターのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td><p>コレクションまたは指定したコレクションのバックアップファイルを作成する</p></td>
       </tr>
       <tr>
         <td><p>指定したクラウドリージョンにバックアップをコピーする</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-backup-files">復元</a></p></td>
         <td><p>バックアップファイルからクラスターを復元する</p></td>
       </tr>
       <tr>
         <td><p>バックアップファイルからコレクションまたは複数のコレクションを復元する</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">バックアップファイルのエクスポート</a></p></td>
         <td><p>指定したオブジェクトストレージサービスにバックアップファイルをエクスポートする</p></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-migration-prompts">マイグレーション</a></p></td>
         <td><p>クラスターへデータを移行します。</p><ul><li><p>Zilliz Cloud クラスター間マイグレーション:</p><ul><li><p>同一組織内でのクラスター間マイグレーション</p></li><li><p>異なる組織間のクラスターにおけるマイグレーション</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./zilliz-import-prompts">インポート</a></p></td>
         <td><p>コレクションにデータをインポートする</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">コレクションのクローン</a></p></td>
         <td><p>スキーマとデータを含むコレクションの完全なコピーを作成する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-a-collection">サンプルコレクションの作成</a></p></td>
         <td><p>サンプルデータセットを読み込んだコレクションを作成する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#suspend">クラスターの一時停止</a></p></td>
         <td><p>クラスターを手動で一時停止する</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#resume">クラスターの再開</a></p></td>
         <td><p>クラスターを手動で再開する</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">Query CU のスケール</a></p></td>
         <td><p>クラスターの Query CU 数を増減する</p></td>
       </tr>
       <tr>
         <td><p><a href="./plan-cluster-scaling">レプリカのスケール</a></p></td>
         <td><p>クラスターのレプリカ数を増減する</p></td>
       </tr>
    </table>

- ステータス: ジョブの実行状態です。Successful、In Progress、Pending、Failed、Canceled のいずれかが表示されます。

- ID: データジョブの ID です。データジョブに関して問題が発生した場合は、[サポートチケットを作成](http://support.zilliz.com) し、該当するジョブ ID をお知らせください。

- 開始日時と終了日時

- 作成者: データジョブを実行したユーザーです。

## ジョブ詳細の確認\{#view-job-details}

ジョブの詳細を確認するには、**Actions** 列の **...** をクリックして **View Details** を選択します。あるいは、[Describe Job](/reference/restful/describe-job-v2) API を使用してプログラムから詳細を取得することも可能です。

![view_job_details](https://zdoc-images.s3.us-west-2.amazonaws.com/viewjobdetails.png "view_job_details")

## ジョブのキャンセル\{#cancel-job}

現在、ステータスが **Pending** または **In Progress** の以下のジョブのみキャンセルできます。

- バックアップ作成ジョブ（他のクラウドリージョンへのバックアップコピーを除く）

- マイグレーションジョブ（ゼロダウンタイムマイグレーションを除く）

- バックアップファイルエクスポートジョブ

<Admonition type="info" icon="📘" title="📘 Notes">

ジョブをキャンセルするには、**Organization Owner** または **Project Admin** の権限が必要です。

</Admonition>

![cancel_job](https://zdoc-images.s3.us-west-2.amazonaws.com/canceljob.png "cancel_job")

## 失敗したジョブの再試行\{#retry-failed-job}

<Admonition type="info" icon="📘" title="📘 Notes">

現在、再試行が可能なのは失敗したインポートジョブのみです。

失敗したジョブを再試行するには、**Organization Owner** または **Project Admin** の権限が必要です。

</Admonition>

インポートジョブが失敗した場合、ステータスの横にある情報アイコンをクリックすると、失敗の原因を確認できます。

インポートに失敗したファイルを修正後、ジョブを再試行できます。

![retry_failed_job](https://zdoc-images.s3.us-west-2.amazonaws.com/retryfailedjob.png "retry_failed_job")
