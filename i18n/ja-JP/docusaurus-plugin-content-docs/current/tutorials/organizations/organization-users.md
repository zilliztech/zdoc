---
title: "組織ユーザーの管理 | Cloud"
slug: /organization-users
sidebar_label: "組織ユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、組織は通常会社を表します。従業員を組織に招待し、役割を割り当てることができます。これらの役割は、ユーザーが特定のリソースにアクセスし、特定の操作を実行する権限を決定します。たとえば、開発者は通常、データにアクセスする必要がありますが、請求機能は必要ありません。 | Cloud"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - organizations
  - users
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing

---

import Admonition from '@theme/Admonition';


# 組織ユーザーの管理

Zilliz Cloudでは、組織は通常会社を表します。従業員を組織に招待し、役割を割り当てることができます。これらの役割は、ユーザーが特定のリソースにアクセスし、特定の操作を実行する権限を決定します。たとえば、開発者は通常、データにアクセスする必要がありますが、請求機能は必要ありません。

このガイドでは、組織ユーザーの管理方法について説明します。具体的には、ユーザーを組織に招待する方法、招待の取り消しまたは再送信、組織ユーザーの役割の変更、または組織ユーザーの削除の方法を含みます。

## ユーザーを組織に招待\{#invite-a-user-to-your-organization}

ユーザーを組織に招待する際には、この組織内でリソースへのアクセスと特定操作の実行権限を定義する役割をユーザーに付与する必要があります。

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力してください。次に、新しい組織ユーザーに付与したい組織の役割を選択してください。

### 組織の役割\{#organization-roles}

Zilliz Cloudでは、3つの組織の役割を提供しています。これらの役割は変更または削除することはできません。

- **Organization Owner（組織オーナー）**: 組織オーナーは、Zilliz Cloudの最上位の役割であり、組織とそのすべてのリソース（プロジェクト、クラスター、データベース、コレクション）を管理する完全な権限を持っています。この役割は、組織内で限定的または管理された数のユーザーにのみ付与する必要があります。

    次の表は、この組織の役割に対応するUIおよびAPIの権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーン RESTful API (V2) 権限</strong></p></th>
         <th><p><strong>データプレーン RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>組織内のすべてのプロジェクトを管理</p></li><li><p><a href="./payment-billing">支払いと請求の管理</a></p></li><li><p><a href="./manage-api-keys">APIキーの管理</a></p></li><li><p><a href="./organization-users">組織ユーザーの管理</a></p></li><li><p><a href="./metrics-and-alerts">アラートの管理</a></p></li><li><p><a href="./view-activities">アクティビティの表示</a></p></li><li><p><a href="./organization-settings">組織設定の管理</a></p></li><li><p><a href="./use-recycle-bin">ごみ箱の使用</a></p></li><li><p>さらに、<a href="./project-users#project-roles">プロジェクト管理者</a>および<a href="./cluster-roles#built-in-cluster-roles">クラスタ管理者</a>の役割のすべての権限</p></li></ul></td>
         <td><p><a href="/reference/restful/control-plane-v2">すべてのコントロールプレーン操作</a></p></td>
         <td><p><a href="/reference/restful/data-plane-v2">すべてのデータプレーン操作</a></p></td>
       </tr>
    </table>

- **Organization Billing Admin（組織請求管理者）**: 組織請求管理者は、組織内で請求を管理する権限を持つ役割です。この役割は、組織内の他のデータを操作する権限を持っていません。

    次の表は、この組織の役割に対応するUIおよびAPIの権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーン RESTful API (V2) 権限</strong></p></th>
         <th><p><strong>データプレーン RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p><a href="./payment-billing">支払いと請求の管理</a></p></li><li><p><a href="./manage-api-keys">APIキーの表示</a></p></li><li><p><a href="./organization-users">組織ユーザーの招待</a></p></li><li><p><a href="./organization-settings">組織設定の表示</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/list-invoices-v2">請求書一覧</a></p></li><li><p><a href="/reference/restful/describe-invoice-v2">請求書の説明</a></p></li><li><p><a href="/reference/restful/query-daily-usage-v2">日次使用量の照会</a></p></li></ul></td>
         <td><p>データプレーンの権限はプロジェクトおよびクラスタの役割によって決まります。ただし、請求管理者には通常、データプレーンの権限は必要ありません。</p></td>
       </tr>
    </table>

- **Organization Member（組織メンバー）**: 組織メンバーは、組織とそのリソースを表示する権限を持つ役割です。組織メンバーのプロジェクトおよびクラスタレベルの権限は、このユーザーのプロジェクトおよびクラスタの役割に依存します。

    次の表は、この組織の役割に対応するUIおよびAPIの権限を示しています。

    <table>
       <tr>
         <th><p><strong>UI権限</strong></p></th>
         <th><p><strong>コントロールプレーン RESTful API (V2) 権限</strong></p></th>
         <th><p><strong>データプレーン RESTful API (V2) 権限</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p><a href="./manage-api-keys">APIキーの表示</a></p></li><li><p><a href="./organization-users">組織ユーザーの招待</a></p></li><li><p><a href="./organization-settings">組織設定の表示</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべてのクラウドメタ操作</a></p></li><li><p>一部のクラスタ操作</p><ul><li><p><a href="/reference/restful/list-projects-v2">プロジェクト一覧</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">クラスタ一覧</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">クラスタの説明</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">クラスタメトリクスの照会</a></p></li><li><p><a href="/docs/prometheus-monitoring">メトリクスのエクスポート</a></p></li></ul></li><li><p>一部のインポート操作</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">インポートジョブの進行状況の取得</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">インポートジョブ一覧</a></p></li></ul></li><li><p>一部のバックアップおよび復元操作</p><ul><li><p><a href="/reference/restful/list-backups-v2">バックアップ一覧</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">バックアップの説明</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">バックアップポリシーの取得</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべてのクラウドジョブ操作</a></p></li></ul></td>
         <td><p>データプレーンの権限は<a href="./project-users#project-roles">プロジェクト</a>および<a href="./cluster-roles">クラスタ</a>の役割によって決まります</p></td>
       </tr>
    </table>

**Organization Member（組織メンバー）**または**Organization Billing Admin（組織請求管理者）**である場合、招待されるユーザーに**Organization Member（組織メンバー）**の役割のみを付与できます。

招待されたユーザーにはメールで招待状が送信され、48時間以内に承諾して組織に参加する必要があります。また、Webコンソールから招待リンクをコピーして、招待されたユーザーと共有することもできます。

<Admonition type="info" icon="📘" title="Notes">

<p>一度に1人または複数人のユーザーを同じ役割で組織に招待できます。各組織には最大100人のユーザーを登録できます。</p>

</Admonition>

![invite-user-to-org](/img/invite-user-to-org.png "invite-user-to-org")

## 招待の取り消しまたは再送信\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待すると、Zilliz Cloudが招待メールをユーザーに送信します。ユーザーが招待を承諾する前であれば、招待を取り消すか再送信できます。

![revoke-or-resend-org-invitation](/img/revoke-or-resend-org-invitation.png "revoke-or-resend-org-invitation")

## 組織ユーザーの役割の編集\{#edit-the-role-of-an-organization-user}

ユーザーが招待を承諾して組織に参加すると、必要に応じて役割を調整できます。

組織ユーザーの役割を編集するには、**Organization Owner（組織オーナー）**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png "edit-user-role-or-remove-org-user")

## 組織ユーザーの削除\{#remove-an-organization-user}

ユーザーが組織に属さなくなった場合は、そのユーザーを削除できます。

組織ユーザーを削除するには、**Organization Owner（組織オーナー）**である必要があります。

![edit-user-role-or-remove-org-user](/img/edit-user-role-or-remove-org-user.png "edit-user-role-or-remove-org-user")

## 組織の脱退\{#leave-an-organization}

組織に属さなくなった場合、組織を脱退するオプションがあります。

各組織には少なくとも1人の組織オーナーが必要です。組織の唯一のオーナーである場合、組織を脱退することはできません。

<Admonition type="caution" icon="🚧" title="Warning">

<p>一度組織を脱退すると、組織および関連リソースにアクセスできなくなります。</p>

</Admonition>

組織を脱退するには、以下のいずれかの方法を使用できます：

- 組織一覧ページで組織を脱退：

    ![leave-organization](/img/leave-organization.png "leave-organization")

- 組織に入り、**Organization Members（組織メンバー）**ページで脱退：

    ![leave-organization](/img/leave-organization.png "leave-organization")