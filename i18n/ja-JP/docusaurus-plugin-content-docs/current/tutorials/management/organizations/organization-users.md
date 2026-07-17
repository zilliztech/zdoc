---
title: "組織ユーザーを管理する | Cloud"
slug: /organization-users
sidebar_label: "組織ユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、組織は通常会社を表します。従業員を組織に招待し、職務に応じてロールを割り当てることができます。これらのロールにより、特定のリソースへのアクセス権限と実行可能な操作が決まります。たとえば、開発者は通常データへのアクセスが必要ですが、請求に関する権限は不要です。 | Cloud"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 組織ユーザーを管理する

Zilliz Cloud では、組織は通常会社を表します。従業員を組織に招待し、職務に応じてロールを割り当てることができます。これらのロールにより、特定のリソースへのアクセス権限と実行可能な操作が決まります。たとえば、開発者は通常データへのアクセスが必要ですが、請求に関する権限は不要です。 

このガイドでは、組織へのユーザー招待、招待の取り消しまたは再送、組織ユーザーのロール変更、組織ユーザーの削除など、組織ユーザーの管理方法を説明します。

## 組織にユーザーを招待する\{#invite-a-user-to-your-organization}

組織にユーザーを招待する際には、組織内のリソースへのアクセス権限と特定の操作を実行する権限を定義するロールを割り当てる必要があります。 

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新しい組織ユーザーに付与したい組織ロールを選択します。 

### Organization Owner\{#organization-owner}

Organization Owner は Zilliz Cloud における最上位ロールであり、組織とそのすべてのリソース（プロジェクト、クラスター、データベース、コレクション）を管理する完全な権限を持ちます。このロールは、組織内の限られた数のユーザーにのみ付与する必要があります。

次の表は、この組織ロールに対応する UI と API の権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>組織内のすべてのプロジェクトを管理</p></li><li><p><a href="./payment-billing">支払いと請求</a>を管理</p></li><li><p><a href="./manage-api-keys">API キー</a>を管理</p></li><li><p><a href="./organization-users">組織ユーザー</a>を管理</p></li><li><p><a href="./metrics-alerts-reference">アラート</a>を管理</p></li><li><p><a href="./view-activities">アクティビティ</a>を表示</p></li><li><p><a href="./organization-settings">組織設定</a>を管理</p></li><li><p><a href="./use-recycle-bin">ごみ箱</a>を使用</p></li><li><p>さらに、<a href="./project-users#project-admin">Project Admin</a> と <a href="./cluster-roles#built-in-cluster-roles">Cluster Admin</a> ロールのすべての権限</p></li></ul></td>
     <td><p><a href="/reference/restful/control-plane-v2">すべてのコントロールプレーン操作</a></p></td>
     <td><p><a href="/reference/restful/data-plane-v2">すべてのデータプレーン操作</a></p></td>
   </tr>
</table>

### Organization Billing Admin\{#organization-billing-admin}

Organization Billing Admin ロールは、組織内の請求を管理する権限を持ちます。このロールには、組織内のその他のデータに対する権限はありません。

次の表は、この組織ロールに対応する UI と API の権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./payment-billing">支払いと請求</a>を管理</p></li><li><p><a href="./manage-api-keys">API キー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/list-invoices-v2">List Invoices</a></p></li><li><p><a href="/reference/restful/describe-invoice-v2">Describe Invoice</a></p></li><li><p><a href="/reference/restful/query-daily-usage-v2">Query Daily Usage</a></p></li></ul></td>
     <td><p>データプレーンの権限はプロジェクトおよびクラスターのロールによって決まります。ただし、Billing Admin にデータプレーン権限は通常必要ありません。</p></td>
   </tr>
</table>

### Organization Role\{#organization-role}

招待されたユーザー向けに組織ロールを作成できます。組織ロールは、組織とそのリソースを表示する権限を持つロールです。このロールに対して、プロジェクトレベルおよびクラスターレベルの権限を編集できます。

![Cb5Yw6EWNhdqD5bjxTRcHHF1nAd](https://zdoc-images.s3.us-west-2.amazonaws.com/Cb5Yw6EWNhdqD5bjxTRcHHF1nAd.png)

#### プロジェクト権限をカスタマイズする\{#customize-project-privileges}

デフォルトでは、招待されたユーザーには **Default Project** に対する **Project Admin** アクセスが付与されます。ただし、**Customize** を選択して、より細かな権限を付与することもできます。

![PXLywcZSyh9Vaib1wUFc0NminUd](https://zdoc-images.s3.us-west-2.amazonaws.com/PXLywcZSyh9Vaib1wUFc0NminUd.png)

- **Cluster Access**

    デフォルトでは、**Include all future clusters** オプションが有効な状態で **All Clusters** へのアクセスが付与されます。**Read-Write***,* のようなロールを割り当てることで、招待されるユーザーのこれらのクラスター全体に対する権限を定義できます。招待が承認されると、ユーザーはプロジェクト内の現在および今後のすべてのクラスターに対して指定された権限を持つようになります。 

    アクセスを制限するには、ドロップダウンから特定のクラスターを選択します。また、**Include all future clusters** オプションを無効にして、新しく作成されるクラスターをアクセス範囲から除外することもできます。

    **+ Cluster Access** をクリックして、さらにクラスターアクセスポリシーを追加します。

- **Volume Access**

    デフォルトでは、**Include all future volumes** オプションが有効な状態で **All Volumes** へのアクセスが付与されます。**Read-Write***,* のようなロールを割り当てることで、招待されるユーザーのこれらのボリューム全体に対する権限を定義できます。招待が承認されると、ユーザーはプロジェクト内の現在および今後のすべてのボリュームに対して指定された権限を持つようになります。 

    アクセスを制限するには、ドロップダウンから特定のボリュームを選択します。また、**Include all future volumes** オプションを無効にして、新しく作成されるボリュームをアクセス範囲から除外することもできます。

    **+ Volume Access** をクリックして、さらにクラスターアクセスポリシーを追加します。

次の表は、このロールに対して組織レベルで招待されたユーザーに付与される UI および API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./manage-api-keys">API キー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべての cloud meta 操作</a></p></li><li><p>クラスター操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">Export Metrics</a></p></li></ul></li><li><p>インポート操作の一部</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">Get Import Job Progress</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">List Import Jobs </a></p></li></ul></li><li><p>バックアップと復元操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべての cloud job 操作</a></p></li></ul></td>
     <td><p>データプレーンの権限は <a href="./project-users#invite-a-user-to-a-project">プロジェクト</a> および <a href="./cluster-roles">クラスター</a> ロールによって決まります</p></td>
   </tr>
</table>

**Organization Member** または **Organization Billing Admin** の場合、招待されたユーザーには **Organization Member** のロールのみ付与できる点に注意してください。

招待されたユーザーにはメールで招待が送信され、組織に参加するには 48 時間以内に承認する必要があります。あるいは、Web コンソールから招待リンクをコピーして招待対象者と共有することもできます。

<Admonition type="info" icon="📘" title="📘 Notes">

1 回につき、同じロールで 1 人以上のユーザーを組織に招待できます。各組織には最大 100 人のユーザーを含めることができます。

</Admonition>

## 招待を取り消す、または再送する\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待すると、Zilliz Cloud はそのユーザーに招待メールを送信します。ユーザーが承認する前であれば、招待を取り消したり再送したりできます。

![NDXHw6PVFhyxntbucxbc9SOFnLg](https://zdoc-images.s3.us-west-2.amazonaws.com/NDXHw6PVFhyxntbucxbc9SOFnLg.png)

## 組織ユーザーのロールを編集する\{#edit-the-role-of-an-organization-user}

ユーザーが招待を承認して組織に参加した後は、必要に応じてそのロールを調整できます。

組織ユーザーのロールを編集するには、**Organization Owner** である必要があります。

![VGxOwarfShUDk1bIoEpc5wf3nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/VGxOwarfShUDk1bIoEpc5wf3nFf.png)

## 組織ユーザーを削除する\{#remove-an-organization-user}

ユーザーが組織に属さなくなった場合は、そのユーザーを削除できます。

組織ユーザーを削除するには、**Organization Owner** である必要があります。

<Admonition type="danger" icon="🚧" title="Notes">

メンバーを削除すると、対応する個人 API キーは直ちに無効化され、アクセスは拒否されます。サービス中断を防ぐため、環境内で使用している個人キーは削除前に必ず置き換えてください。この操作は元に戻せません。

</Admonition>

![C6O0wzlfRhmxQwbt7yccX3VHn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/C6O0wzlfRhmxQwbt7yccX3VHn3g.png)

## 組織を離脱する\{#leave-an-organization}

組織に属さなくなった場合は、そこから離脱することができます。

各組織には少なくとも 1 人の組織所有者が必要です。あなたがその組織の唯一の所有者である場合、離脱することはできません。

<Admonition type="info" icon="📘" title="🚧 Warning">

組織を離脱すると、その組織と関連リソースにはアクセスできなくなります。

</Admonition>

次のいずれかの方法で組織から離脱できます。

- 組織一覧ページで組織を離脱する:

    ![Jdu2wpIYBhNZ5mbdMKOcBB6rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/Jdu2wpIYBhNZ5mbdMKOcBB6rnBg.png)

- 組織に入り、**Organization Members** ページで離脱する:

    ![YQYsw1BYahoLHabbmXdc4V15nA8](https://zdoc-images.s3.us-west-2.amazonaws.com/YQYsw1BYahoLHabbmXdc4V15nA8.png)

