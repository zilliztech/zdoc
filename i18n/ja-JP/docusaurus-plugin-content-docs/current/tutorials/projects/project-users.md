---
title: "プロジェクトユーザーの管理 | Cloud"
slug: /project-users
sidebar_label: "プロジェクトユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、ユーザーをプロジェクトに招待し、その職務機能に基づいて役割を割り当てることができます。これらの役割は、ユーザーのプロジェクトへのアクセスと実行可能な操作を決定します。 | Cloud"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - プロジェクトユーザー
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db

---

import Admonition from '@theme/Admonition';


# プロジェクトユーザーの管理

Zilliz Cloudでは、ユーザーをプロジェクトに招待し、その職務機能に基づいて役割を割り当てることができます。これらの役割は、ユーザーのプロジェクトへのアクセスと実行可能な操作を決定します。

このトピックでは、プロジェクトユーザーを管理する方法について説明します。

## プロジェクトへのユーザー招待\{#invite-a-user-to-a-project}

プロジェクトにユーザーを招待するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

プロジェクトにユーザーを招待する際には、このプロジェクト内で特定の操作を実行する権限を定義する役割をユーザーに付与する必要があります。

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新規プロジェクトユーザーに付与したいプロジェクト役割を選択します。

### プロジェクト役割\{#project-roles}

Zilliz Cloudは3つのプロジェクト役割を提供します。これらの役割は変更または削除できません。

- **プロジェクト管理者**: プロジェクト管理者役割は、プロジェクトとそのすべてのリソース（クラスター、データベース、コレクション）を管理するための完全な権限を持っています。

    次の表は、各プロジェクト役割の対応するUIおよびAPI権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API（V2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>を管理</p></li><li><p>プロジェクト内の<a href="./volume-explained">ボリューム</a>を管理</p></li><li><p><a href="./collection">コレクション</a>と<a href="./manage-indexes">インデックス</a>を管理</p></li><li><p><a href="./project-users">プロジェクトユーザー</a>を管理</p></li><li><p><a href="./network-and-security">IPアクセスリストとプライベートリンク</a>を管理</p></li><li><p><a href="./manage-project-alerts">プロジェクトアラート</a>を管理</p></li><li><p><a href="./backup-and-restore">バックアップ</a>を管理</p></li><li><p>データ<a href="./migrations">移行</a>を管理</p></li><li><p><a href="./job-center">プロジェクトジョブ</a>を管理</p></li><li><p>統合を管理</p></li><li><p><a href="./cluster-roles#built-in-cluster-roles">クラスター管理者</a>権限をすべて含む</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p><a href="/reference/restful/cluster-operations-v2">すべてのクラスタ操作</a></p></li><li><p><a href="/reference/restful/volume-operations-v2">すべてのボリューム操作</a></p></li><li><p><a href="/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p><a href="/reference/restful/backup-and-restore-v2">すべてのバックアップおよび復元操作</a></p></li><li><p><a href="/reference/restful/cloud-migration-v2">すべてのクラウド移行操作</a></p></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li><li><p><a href="/reference/restful/role-operations-v2">すべての役割操作</a></p></li><li><p><a href="/reference/restful/user-operations-v2">すべてのユーザ操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクト読み書き**: プロジェクト読み書き役割は、プロジェクトを表示し、そのリソース（クラスター、データベース、コレクション）を管理する権限を持っています。

    次の表は、各プロジェクト役割の対応するUIおよびAPI権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API（V2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>を表示できますが、作成および管理はできません</p></li><li><p>プロジェクト内の<a href="./volume-explained">ボリューム</a>を表示できますが、作成および管理はできません</p></li><li><p>ボリュームからファイル/フォルダを削除</p></li><li><p><a href="./collection">コレクション</a>と<a href="./manage-indexes">インデックス</a>を管理</p></li><li><p><a href="null">バックアップ</a>を表示できますが、バックアップファイルの作成や復元はできません</p></li><li><p><a href="./job-center">プロジェクトジョブ</a>を表示できますが、ジョブのキャンセルや失敗したジョブの再試行はできません</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>一部のクラスタ操作</p><ul><li><p><a href="/reference/restful/list-projects-v2">プロジェクトのリスト</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">クラスターのリスト</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスターの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クラスターメトリクスの照会</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスのエクスポート</a></p></li></ul></li><li><p>一部のボリューム操作</p><ul><li><a href="/reference/restful/list-volumes-v2">ボリュームのリスト</a></li></ul></li><li><p><a href="/reference/restful/import-operations-v2">すべてのインポート操作</a></p></li><li><p>一部のバックアップおよび復元操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">バックアップのリスト</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーの取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">すべてのコレクション操作</a></p></li><li><p><a href="/reference/restful/index-operations-v2">すべてのインデックス操作</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">すべてのパーティション操作</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">すべてのベクトル操作</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">すべてのエイリアス操作</a></p></li></ul></td>
       </tr>
    </table>

- **プロジェクト読み取り専用**: プロジェクト読み取り専用役割は、プロジェクトとそのリソース（クラスター、データベース、コレクション）を表示する権限を持っています。

    次の表は、各プロジェクト役割の対応するUIおよびAPI権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API（V2）権限</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>プロジェクト内の<a href="./cluster">クラスター</a>を表示できますが、作成および管理はできません</p></li><li><p>プロジェクト内の<a href="./volume-explained">ボリューム</a>を表示できますが、作成および管理はできません</p></li><li><p><a href="./collection">コレクション</a>と<a href="./manage-indexes">インデックス</a>を表示のみ</p></li><li><p><a href="null">バックアップ</a>を表示できますが、バックアップファイルの作成や復元はできません</p></li><li><p><a href="./job-center">プロジェクトジョブ</a>を表示できますが、ジョブのキャンセルや失敗したジョブの再試行はできません</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>一部のクラスタ操作</p><ul><li><p><a href="/reference/restful/list-projects-v2">プロジェクトのリスト</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">クラスターのリスト</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスターの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クラスターメトリクスの照会</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスのエクスポート</a></p></li></ul></li><li><p>一部のボリューム操作</p><ul><li><a href="/reference/restful/list-volumes-v2">ボリュームのリスト</a></li></ul></li><li><p>一部のインポート操作</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">インポートジョブの進行状況の取得</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">インポートジョブのリスト</a></p></li></ul></li><li><p>一部のバックアップおよび復元操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">バックアップのリスト</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーの取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><ul><li><p>一部のコレクション操作</p><ul><li><p><a href="/reference/restful/describe-collection-v2">コレクションの説明</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">コレクションロード状態の取得</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">コレクション統計の取得</a></p></li><li><p><a href="/reference/restful/has-collection-v2">コレクションの有無</a></p></li><li><p><a href="/reference/restful/list-collections-v2">コレクションのリスト</a></p></li></ul></li><li><p>一部のインデックス操作</p><ul><li><p><a href="/reference/restful/describe-index-v2">インデックスの説明</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">インデックスのリスト</a></p></li></ul></li><li><p>一部のパーティション操作</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">パーティション統計の取得</a></p></li><li><p><a href="/reference/restful/has-partition-v2">パーティションの有無</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">パーティションのリスト</a></p></li></ul></li><li><p>一部のエイリアス操作</p><ul><li><p><a href="/reference/restful/describe-alias-v2">エイリアスの説明</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">エイリアスのリスト</a></p></li></ul></li></ul></td>
       </tr>
    </table>

招待されたユーザーはメールで招待を受け取り、48時間以内に承諾してプロジェクトに参加する必要があります。また、ウェブコンソールから招待リンクをコピーして招待されたユーザーと共有することもできます。

ユーザーがプロジェクトに参加すると、このユーザーは自動的にプロジェクトが所属する組織の組織メンバーになります。

<Admonition type="info" icon="📘" title="ノート">

<p>一度に同じ役割を持つ1人または複数のユーザーをプロジェクトに招待できます。</p>

</Admonition>

![invite-user-to-project](/img/invite-user-to-project.png "invite-user-to-project")

## 招待の取り消しまたは再送\{#revoke-or-resend-an-invitation}

既存の組織メンバーを同じ組織内のプロジェクトに招待する場合、別途招待を受けずにプロジェクトに自動的にアクセスできます。ただし、既に所属していない組織内のプロジェクトに誰かを招待する場合、指定されたプロジェクトへのアクセスを許可する組織への招待を受け取ります。

招待を取り消すまたは再送するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>ユーザーが招待を受け入れる前に招待を取り消すまたは再送できます。</p>

</Admonition>

![revoke-or-cancel-invitation-to-project](/img/revoke-or-cancel-invitation-to-project.png "revoke-or-cancel-invitation-to-project")

## 協力者役割の編集または協力者の削除\{#edit-a-collaborators-role-or-remove-a-collaborator}

ユーザーが招待を受け入れると、そのユーザーはプロジェクトの協力者になります。

協力者の役割を編集またはプロジェクト協力者を削除するには、**組織オーナー**または**プロジェクト管理者**である必要があります。

![edit-user-role-or-remove-project-user](/img/edit-user-role-or-remove-project-user.png "edit-user-role-or-remove-project-user")

## プロジェクトを退出\{#leave-a-project}

プロジェクトから協力者を削除する他に、プロジェクトを退出して自分自身を削除することもできます。

プロジェクトの唯一の管理者である場合、プロジェクトには常に少なくとも1人のプロジェクト管理者が存在する必要があるため、退出することはできません。

<Admonition type="caution" icon="🚧" title="警告">

<p>一度プロジェクトを退出すると、プロジェクトと関連リソースへのアクセス権は取り消されます。</p>

</Admonition>

![leave-project](/img/leave-project.png "leave-project")