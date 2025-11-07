---
title: "組織ユーザーを管理 | Cloud"
slug: /organization-users
sidebar_label: "組織ユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、組織は通常会社を表します。組織に従業員を招待し、彼らの職務機能に応じてロールを割り当てることができます。これらのロールは、ユーザーが特定のリソースにアクセスし、実行できる操作を決定します。たとえば、開発者は通常データへのアクセスが必要ですが、請求特権は必要ない場合があります。 | Cloud"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 組織
  - ユーザー
  - rag llm アーキテクチャ
  - プライベートllm
  - nn検索
  - llm評価

---

import Admonition from '@theme/Admonition';


# 組織ユーザーを管理

Zilliz Cloudでは、組織は通常会社を表します。組織に従業員を招待し、彼らの職務機能に応じてロールを割り当てることができます。これらのロールは、ユーザーが特定のリソースにアクセスし、実行できる操作を決定します。たとえば、開発者は通常データへのアクセスが必要ですが、請求特権は必要ない場合があります。

このガイドでは、組織ユーザーを管理する方法を説明します。具体的には、組織にユーザーを招待する方法、招待を取り消すまたは再送信する方法、組織ユーザーのロールを変更する方法、または組織ユーザーを削除する方法を含みます。

## 組織にユーザーを招待\{#invite-a-user-to-your-organization}

ユーザーを組織に招待する際、ユーザーにロールを付与する必要があります。このロールは、リソースへのアクセスと、この組織内で実行できる操作権限を定義します。

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新規組織ユーザーに付与したい組織ロールを選択します。

### 組織ロール\{#organization-roles}

Zilliz Cloudは3つの組織ロールを提供します。これらのロールは変更または削除できません。

- **組織オーナー**: 組織オーナーは、Zilliz Cloudのトップレベルロールで、組織とそのすべてのリソース（プロジェクト、クラスター、データベース、コレクション）を管理するための完全な特権を持っています。このロールは、組織内の限定された少数のユーザーにのみ付与されるべきです。

    次の表は、この組織ロールに対応するUIおよびAPI特権をリストしています。

    <table>
       <tr>
         <th><p><strong>UI特権</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API（V2）特権</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）特権</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>組織内のすべてのプロジェクトを管理</p></li><li><p><a href="./payment-billing">支払いおよび請求</a>を管理</p></li><li><p><a href="./manage-api-keys">APIキー</a>を管理</p></li><li><p><a href="./organization-users">組織ユーザー</a>を管理</p></li><li><p><a href="./metrics-and-alerts">アラート</a>を管理</p></li><li><p><a href="./view-activities">アクティビティ</a>を表示</p></li><li><p><a href="./organization-settings">組織設定</a>を管理</p></li><li><p><a href="./use-recycle-bin">ごみ箱</a>を使用</p></li><li><p><a href="./project-users#project-roles">プロジェクト管理者</a>および<a href="./cluster-roles#built-in-cluster-roles">クラスタ管理者</a>ロールのすべての特権を含む</p></li></ul></td>
         <td><p><a href="/reference/restful/control-plane-v2">すべてのコントロールプレーン操作</a></p></td>
         <td><p><a href="/reference/restful/data-plane-v2">すべてのデータプレーン操作</a></p></td>
       </tr>
    </table>

- **組織請求管理者**: 組織請求管理者は、組織内の請求を管理する特権を持つロールです。このロールは、組織内の他のデータへの特権を持っていません。

    次の表は、この組織ロールに対応するUIおよびAPI特権をリストしています。

    <table>
       <tr>
         <th><p><strong>UI特権</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API（V2）特権</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）特権</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p><a href="./payment-billing">支払いおよび請求</a>を管理</p></li><li><p><a href="./manage-api-keys">APIキー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/list-invoices-v2">請求書を一覧表示</a></p></li><li><p><a href="/reference/restful/describe-invoice-v2">請求書を説明</a></p></li><li><p><a href="/reference/restful/query-daily-usage-v2">日次使用量を照会</a></p></li></ul></td>
         <td><p>データプレーン特権はプロジェクトとクラスターロールによって決定されます。ただし、請求管理者は通常データプレーン特権を必要としません。</p></td>
       </tr>
    </table>

- **組織メンバー**: 組織メンバーは、組織とそのリソースを表示する特権を持つロールです。組織メンバーのプロジェクトおよびクラスターレベルの特権は、このユーザーのプロジェクトおよびクラスターロールに依存します。

    次の表は、この組織ロールに対応するUIおよびAPI特権をリストしています。

    <table>
       <tr>
         <th><p><strong>UI特権</strong></p></th>
         <th><p><strong>コントロールプレーンRESTful API（V2）特権</strong></p></th>
         <th><p><strong>データプレーンRESTful API（V2）特権</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p><a href="./manage-api-keys">APIキー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>一部のクラスターオペレーション</p><ul><li><p><a href="/reference/restful/list-projects-v2">プロジェクトを一覧表示</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">クラスターを一覧表示</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスターを説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クラスターメトリクスを照会</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスをエクスポート</a></p></li></ul></li><li><p>一部のインポート操作</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">インポートジョプログレスを取得</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">インポートジョブを一覧表示</a></p></li></ul></li><li><p>一部のバックアップおよびリストア操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">バックアップを一覧表示</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップを説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーを取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><p>データプレーン特権は<a href="./project-users#project-roles">プロジェクト</a>および<a href="./cluster-roles">クラスター</a>ロールによって決定されます</p></td>
       </tr>
    </table>

**組織メンバー**または**組織請求管理者**である場合、招待者に割り当てられるのは**組織メンバー**ロールのみであることにご注意ください。

招待された人はメールで招待を受け取り、48時間以内に承諾して組織に参加する必要があります。または、ウェブコンソールから招待リンクをコピーして招待者と共有することもできます。

<Admonition type="info" icon="📘" title="注意">

<p>一度に1人または複数のユーザーを同じロールで組織に招待できます。各組織には最大100人のユーザーを登録できます。</p>

</Admonition>

![invite-user-to-org](/img/invite-user-to-org.png)

## 招待を取り消すまたは再送信\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待した後、Zilliz Cloudはユーザーに招待メールを送信します。ユーザーが招待を承諾する前であれば、招待を取り消すまたは再送信できます。

![revoke-or-resend-org-invitation](/img/revoke-or-resend-org-invitation.png)

## 組織ユーザーのロールを編集\{#edit-the-role-of-an-organization-user}

ユーザーが招待を承諾して組織に参加した後、必要に応じてロールを調整できます。

組織ユーザーのロールを編集するには、**組織オーナー**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

## 組織ユーザーを削除\{#remove-an-organization-user}

ユーザーが組織に属さなくなった場合、ユーザーを削除できます。

組織ユーザーを削除するには、**組織オーナー**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png)

## 組織から退出\{#leave-an-organization}

組織に所属しなくなった場合、組織から退出するオプションがあります。

各組織には少なくとも1人の組織オーナーが必要です。組織の唯一のオーナーである場合、退出することはできません。

<Admonition type="caution" icon="🚧" title="警告">

<p>一度組織を退出すると、組織および関連リソースにアクセスできなくなります。</p>

</Admonition>

以下のいずれかの方法で組織から退出できます：

- 組織一覧ページで組織を退出：

    ![leave-organization](/img/leave-organization.png)

- 組織に参加し、**組織メンバー**ページで退出：

    ![leave-organization](/img/leave-organization.png)
