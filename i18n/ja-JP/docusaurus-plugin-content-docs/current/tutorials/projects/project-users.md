---
title: "プロジェクトのユーザーを管理する | Cloud"
slug: /project-users
sidebar_label: "プロジェクトのユーザーを管理する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、ユーザーをプロジェクトに招待し、彼らの職務に基づいて役割を割り当てることができます。これらの役割は、ユーザーがプロジェクトにアクセスし、実行できる操作を決定します。 | Cloud"
type: origin
token: ELwKwLNkJi8nD6kiRgOcvi8Mnxb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - project users
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database

---

import Admonition from '@theme/Admonition';


# プロジェクトのユーザーを管理する

Zilliz Cloudでは、ユーザーをプロジェクトに招待し、彼らの職務に基づいて役割を割り当てることができます。これらの役割は、ユーザーがプロジェクトにアクセスし、実行できる操作を決定します。

このトピックでは、プロジェクトユーザーを管理する方法について説明します。

## ユーザーをプロジェクトに招待する{#invite-a-user-to-a-project}

ユーザーをプロジェクトに招待するには、**組織所有者**または**プロジェクト管理者**である必要があります。

プロジェクトにユーザーを招待する場合、このプロジェクト内で特定の操作を実行する権限を定義する役割をユーザーに付与する必要があります。

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力してください。そして、新しいプロジェクトユーザーに付与したいプロジェクトの役割を選択してください。

### プロジェクトの役割{#project-roles}

Zilliz Cloudには3つのプロジェクトロールがあります。これらのロールは変更または削除できません。

- **プロジェクト管理者**:プロジェクト管理者の役割には、プロジェクトとそのすべてのリソース(クラスター、データベース、コレクション)を管理するための完全な権限があります。

    次の表に、各プロジェクトロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API（V 2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>と<a href="./pipelines">パイプライン</a>を管理する</p></li><li><p>管理<a href="./collection">コレクション</a>&amp;<a href="./manage-indexes">インデックス</a></p></li><li><p>プロジェクト<a href="./project-users">ユーザーの管理</a></p></li><li><p>管理<a href="./network-and-security">IPアクセスリストとプライベートリンク</a></p></li><li><p>プロジェクト<a href="./manage-project-alerts">アラートの管理</a></p></li><li><p>バックアップ<a href="./backup-and-restore">の管理</a></p></li><li><p>データ<a href="./migrations">移行の管理</a></p></li><li><p>管理<a href="./job-center">プロジェクトジョブ</a></p></li><li><p>インテグレーションの管理</p></li><li><p>すべての<a href="./cluster-users">クラスタ管理者</a>権限をプラス</p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p><a href="/ja-JP/reference/restful/cluster-operations-v2">すべてのクラスタ操作</a></p></li><li><p><a href="/ja-JP/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p><a href="/ja-JP/reference/restful/backup-and-restore-v2">すべてのバックアップと復元操作</a></p></li><li><p><a href="/ja-JP/reference/restful/cloud-migration-v2">すべてのクラウド移行操作</a></p></li><li><p><a href="/ja-JP/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/collection-operations-v2">すべての収集操作</a></p></li><li><p><a href="/ja-JP/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/ja-JP/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/ja-JP/reference/restful/vector-operations-v2">すべてのベクトル演算</a></p></li><li><p><a href="/ja-JP/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/ja-JP/reference/restful/role-operations-v2">すべてのロール操作</a></p></li><li><p><a href="/ja-JP/reference/restful/user-operations-v2">すべてのユーザー操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクトの読み書き**:プロジェクトの読み書きの役割には、プロジェクトを表示し、そのリソース(クラスター、データベース、コレクション)を管理する権限があります。

    次の表に、各プロジェクトロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API（V 2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>と<a href="./pipelines">パイプライン</a>を表示し、作成および管理することはできません。</p></li><li><p>管理<a href="./collection">コレクション</a>&amp;<a href="./manage-indexes">インデックス</a></p></li><li><p>バックアップを<a href="./view-snapshot-details">表示</a>しますが、バックアップファイルから作成または復元することはできません</p></li><li><p>プロジェクトの<a href="./job-center">ジョブ</a>を表示しますが、ジョブをキャンセルしたり、失敗したジョブを再試行することはできません</p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスタ操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/list-projects-v2">リストプロジェクト</a></p></li><li><p><a href="/ja-JP/reference/restful/list-clusters-v2">リストクラスタ</a></p></li><li><p><a href="/ja-JP/reference/restful/describe-cluster-v2">クラスタの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/query-cluster-metrics-v2">クエリクラスタのメトリクス</a></p></li><li><p><a href="./prometheus-monitoring">メトリックのエクスポート</a></p></li></ul></li><li><p><a href="/ja-JP/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p>バックアップと復元の操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/list-backups-v2">リストバックアップ</a></p></li><li><p><a href="/ja-JP/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/get-backup-policy-v2">バックアップポリシーを取得</a></p></li></ul></li><li><p><a href="/ja-JP/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/collection-operations-v2">すべての収集操作</a></p></li><li><p><a href="/ja-JP/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/ja-JP/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/ja-JP/reference/restful/vector-operations-v2">すべてのベクトル演算</a></p></li><li><p><a href="/ja-JP/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクト読み取り専用**:プロジェクト読み取り専用ロールには、プロジェクトとそのリソース(クラスター、データベース、コレクション)を表示する権限があります。

    次の表に、各プロジェクトロールの対応するUIおよびAPI権限を示します。

    <table>
       <tr>
         <th><p><strong>UIの権限</strong></p></th>
         <th><p><strong>コントロールプレーンのRESTful API（V 2）権限</strong></p></th>
         <th><p><strong>データプレーンのRESTful API（V 2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>と<a href="./pipelines">パイプライン</a>を表示し、作成および管理することはできません。</p></li><li><p>ビュー<a href="./collection">コレクション</a>&amp;<a href="./manage-indexes">インデックス</a>のみ</p></li><li><p>バックアップを<a href="./job-center">表示</a>しますが、バックアップファイルから作成または復元することはできません</p></li><li><p>プロジェクトの<a href="./job-center">ジョブ</a>を表示しますが、ジョブをキャンセルしたり、失敗したジョブを再試行することはできません</p></li></ul></td>
         <td><ul><li><p><a href="/ja-JP/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>クラスタ操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/list-projects-v2">リストプロジェクト</a></p></li><li><p><a href="/ja-JP/reference/restful/list-clusters-v2">リストクラスタ</a></p></li><li><p><a href="/ja-JP/reference/restful/describe-cluster-v2">クラスタの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/query-cluster-metrics-v2">クエリクラスタのメトリクス</a></p></li><li><p><a href="./prometheus-monitoring">メトリックのエクスポート</a></p></li></ul></li><li><p>インポート業務の一部</p><ul><li><p><a href="/ja-JP/reference/restful/get-import-job-progress-v2">仕事の進捗をインポートする</a></p></li><li><p><a href="/ja-JP/reference/restful/list-import-jobs-v2">インポートジョブ一覧</a></p></li></ul></li><li><p>バックアップと復元の操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/list-backups-v2">リストバックアップ</a></p></li><li><p><a href="/ja-JP/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/get-backup-policy-v2">バックアップポリシーを取得</a></p></li></ul></li><li><p><a href="/ja-JP/reference/restful/cloud-job-v2">クラウドジョブのすべての操作</a></p></li></ul></td>
         <td><ul><li><p>一部の収集業務</p><ul><li><p><a href="/ja-JP/reference/restful/describe-collection-v2">コレクションを説明する</a></p></li><li><p><a href="/ja-JP/reference/restful/get-collection-load-state-v2">コレクションの負荷状態を取得する</a></p></li><li><p><a href="/ja-JP/reference/restful/get-collection-stats-v2">コレクションの統計を取得する</a></p></li><li><p><a href="/ja-JP/reference/restful/has-collection-v2">HASコレクション</a></p></li><li><p><a href="/ja-JP/reference/restful/list-collections-v2">リストコレクション</a></p></li></ul></li><li><p>インデックス操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/describe-index-v2">インデックスの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/list-indexes-v2">リストインデックス</a></p></li></ul></li><li><p>パーティション操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/get-partition-statistics-v2">パーティションの統計情報を取得する</a></p></li><li><p><a href="/ja-JP/reference/restful/has-partition-v2">パーティションがあります</a></p></li><li><p><a href="/ja-JP/reference/restful/list-partitions-v2">リストパーティション</a></p></li></ul></li><li><p>エイリアス操作の一部</p><ul><li><p><a href="/ja-JP/reference/restful/describe-alias-v2">エイリアスの説明</a></p></li><li><p><a href="/ja-JP/reference/restful/list-aliases-v2">リストエイリアス</a></p></li></ul></li></ul></td>
       </tr>
    </table>

招待された人たちは、プロジェクトに参加するために48時間以内に受け入れる必要がある招待状をメールで受け取ります。

ユーザーがプロジェクトに参加すると、そのユーザーはプロジェクトが所属する組織のメンバーに自動的になります。

<Admonition type="info" icon="📘" title="ノート">

<p>毎回、同じ役割を持つ1人以上のユーザーをプロジェクトに招待できます。</p>

</Admonition>

![invite-user-to-project](/img/invite-user-to-project.png)

## 招待を取り消すか再送信する{#revoke-or-resend-an-invitation}

同じ組織内のプロジェクトに既存の組織メンバーを招待すると、個別の招待状を受け取ることなく自動的にプロジェクトにアクセスできます。ただし、既に所属していない組織内のプロジェクトに誰かを招待すると、その人は組織に参加する招待状を受け取り、指定されたプロジェクトにもアクセスできます。

招待を取り消すまたは再送信するには、**Organizationオーナー**または**プロジェクト管理者**である必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>ユーザーが承諾する前に招待を取り消したり、再送信したりすることができます。</p>

</Admonition>

![revoke-or-cancel-invitation-to-project](/img/revoke-or-cancel-invitation-to-project.png)

## コラボレーターの役割を編集するか、コラボレーターを削除する{#edit-a-collaborators-role-or-remove-a-collaborator}

ユーザーが招待を受け入れると、ユーザーはプロジェクトの共同作業者になります。

コラボレーターの役割を編集したり、プロジェクトコラボレーターを削除するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

![edit-user-role-or-remove-project-user](/img/edit-user-role-or-remove-project-user.png)

## プロジェクトを終了する{#leave-a-project}

プロジェクトからコラボレーターを削除することに加えて、そのコラボレーターを離れることで自分自身を削除することもできます。

プロジェクトの唯一の管理者である場合、各プロジェクトには常に少なくとも1人のプロジェクト管理者が必要であるため、そのプロジェクトを離れることはできません。

<Admonition type="caution" icon="🚧" title="警告">

<p>プロジェクトを終了すると、プロジェクトと関連リソースへのアクセスが取り消されます。</p>

</Admonition>

![leave-project](/img/leave-project.png)

