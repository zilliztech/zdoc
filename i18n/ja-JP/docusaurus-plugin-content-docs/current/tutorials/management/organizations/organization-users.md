---
title: "組織ユーザーの管理 | Cloud"
slug: /organization-users
sidebar_label: "組織ユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、組織は通常、会社を表します。組織に従業員を招待し、職務に応じてロールを割り当てることができます。これらのロールによって、特定のリソースへのアクセス権限や実行できる操作が決まります。たとえば、開発者は通常データへのアクセスは必要ですが、請求に関する権限は必要ありません。 | Cloud"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 組織ユーザーの管理

Zilliz Cloud では、組織は通常、会社を表します。組織に従業員を招待し、職務に応じてロールを割り当てることができます。これらのロールによって、ユーザーが特定のリソースにアクセスできるかどうか、および実行できる操作が決まります。たとえば、開発者は通常データへのアクセスは必要ですが、請求に関する権限は必要ありません。 

このガイドでは、組織ユーザーの管理方法について説明します。これには、組織へのユーザー招待、招待の取り消しまたは再送、組織ユーザーのロール変更、組織ユーザーの削除が含まれます。

## 組織にユーザーを招待する\{#invite-a-user-to-your-organization}

組織にユーザーを招待する際には、組織内のリソースへのアクセス権限と特定の操作を実行する権限を定義するロールを割り当てる必要があります。 

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新しい組織ユーザーに付与したい組織ロールを選択します。 

### Organization Owner\{#organization-owner}

Organization Owner は Zilliz Cloud における最上位のロールであり、組織とそのすべてのリソース（プロジェクト、クラスター、データベース、コレクション）を管理する完全な権限を持ちます。このロールは、組織内の限られた人数のユーザーにのみ付与する必要があります。

次の表は、この組織ロールに対応する UI および API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>組織内のすべてのプロジェクトを管理</p></li><li><p><a href="./payment-billing">支払いと請求</a>を管理</p></li><li><p><a href="./manage-api-keys">API キー</a>を管理</p></li><li><p><a href="./organization-users">組織ユーザー</a>を管理</p></li><li><p><a href="./metrics-alerts-reference">アラート</a>を管理</p></li><li><p><a href="./view-activities">アクティビティ</a>を表示</p></li><li><p><a href="./organization-settings">組織設定</a>を管理</p></li><li><p><a href="./use-recycle-bin">ごみ箱</a>を使用</p></li><li><p>さらに、<a href="./project-users#project-admin">Project Admin</a> および <a href="./cluster-roles#built-in-cluster-roles">Cluster Admin</a> ロールのすべての権限</p></li></ul></td>
     <td><p><a href="/reference/restful/control-plane-v2">すべての control plane 操作</a></p></td>
     <td><p><a href="/reference/restful/data-plane-v2">すべての data plane 操作</a></p></td>
   </tr>
</table>

### Organization Billing Admin\{#organization-billing-admin}

Organization Billing Admin ロールは、組織の請求を管理する権限を持ちます。このロールには、組織内のその他のデータに対する権限はありません。

次の表は、この組織ロールに対応する UI および API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./payment-billing">支払いと請求</a>を管理</p></li><li><p><a href="./manage-api-keys">API キー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/list-invoices-v2">List Invoices</a></p></li><li><p><a href="/reference/restful/describe-invoice-v2">Describe Invoice</a></p></li><li><p><a href="/reference/restful/query-daily-usage-v2">Query Daily Usage</a></p></li></ul></td>
     <td><p>data plane の権限はプロジェクトおよびクラスターのロールによって決まります。ただし、Billing Admin は通常 data plane 権限を必要としません。</p></td>
   </tr>
</table>

### Organization Role\{#organization-role}

招待の受信者向けに組織ロールを作成できます。組織ロールは、組織とそのリソースを表示する権限を持つロールです。このロールに対して、プロジェクトレベルおよびクラスターレベルの権限を編集できます。

![Cb5Yw6EWNhdqD5bjxTRcHHF1nAd](https://zdoc-images.s3.us-west-2.amazonaws.com/Cb5Yw6EWNhdqD5bjxTRcHHF1nAd.png)

#### プロジェクト権限をカスタマイズする\{#customize-project-privileges}

デフォルトでは、招待の受信者には **Default Project** への **Project Admin** アクセスが付与されます。ただし、**Customize** を選択して、より細かい権限を付与することもできます。

![PXLywcZSyh9Vaib1wUFc0NminUd](https://zdoc-images.s3.us-west-2.amazonaws.com/PXLywcZSyh9Vaib1wUFc0NminUd.png)

- **Cluster Access**

    デフォルトでは、**Include all future clusters** オプションが有効な状態で **All Clusters** へのアクセスが付与されます。**Read-Write***,* などのロールを割り当てて、招待されたユーザーのこれらのクラスター全体に対する権限を定義できます。招待が承認されると、そのユーザーはプロジェクト内の現在および今後のすべてのクラスターに対して指定された権限を持つようになります。 

    アクセスを制限するには、ドロップダウンから特定のクラスターを選択します。新しく作成されたクラスターをアクセス範囲から除外するには、**Include all future clusters** オプションを無効にすることもできます。

    **+ Cluster Access** をクリックすると、クラスターアクセスポリシーをさらに追加できます。

- **Volume Access**

    デフォルトでは、**Include all future volumes** オプションが有効な状態で **All Volumes** へのアクセスが付与されます。**Read-Write***,* などのロールを割り当てて、招待されたユーザーのこれらのボリューム全体に対する権限を定義できます。招待が承認されると、そのユーザーはプロジェクト内の現在および今後のすべてのボリュームに対して指定された権限を持つようになります。 

    アクセスを制限するには、ドロップダウンから特定のボリュームを選択します。新しく作成されたボリュームをアクセス範囲から除外するには、**Include all future volumes** オプションを無効にすることもできます。

    **+ Volume Access** をクリックすると、クラスターアクセスポリシーをさらに追加できます。

次の表は、このロールについて組織レベルで招待されたユーザーに付与される UI および API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./manage-api-keys">API キー</a>を表示</p></li><li><p><a href="./organization-users">組織ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">組織設定</a>を表示</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべての cloud meta 操作</a></p></li><li><p>クラスター操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">Export Metrics</a></p></li></ul></li><li><p>import 操作の一部</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">Get Import Job Progress</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">List Import Jobs </a></p></li></ul></li><li><p>backup & restore 操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべての cloud job 操作</a></p></li></ul></td>
     <td><p>data plane の権限は <a href="./project-users#invite-a-user-to-a-project">プロジェクト</a> および <a href="./cluster-roles">クラスター</a> ロールによって決まります</p></td>
   </tr>
</table>

**Organization Member** または **Organization Billing Admin** の場合、招待の受信者に付与できるのは **Organization Member** ロールのみである点に注意してください。

招待の受信者にはメールで招待が送信され、組織に参加するには 48 時間以内に承諾する必要があります。あるいは、Web コンソールから招待リンクをコピーして招待先に共有することもできます。

<Admonition type="info" icon="📘" title="📘 Notes">

一度に、同じロールで 1 人または複数のユーザーを組織に招待できます。各組織には最大 100 人のユーザーを追加できます。

</Admonition>

## 招待を取り消す、または再送する\{#revoke-or-resend-an-invitation}

組織への参加をユーザーに招待すると、Zilliz Cloud はそのユーザーに招待メールを送信します。ユーザーが承諾する前であれば、招待を取り消したり再送したりできます。

![NDXHw6PVFhyxntbucxbc9SOFnLg](https://zdoc-images.s3.us-west-2.amazonaws.com/NDXHw6PVFhyxntbucxbc9SOFnLg.png)

## 組織ユーザーのロールを編集する\{#edit-the-role-of-an-organization-user}

ユーザーが招待を承諾して組織に参加した後は、必要に応じてそのロールを調整できます。

組織ユーザーのロールを編集するには、**Organization Owner** である必要があります。

![VGxOwarfShUDk1bIoEpc5wf3nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/VGxOwarfShUDk1bIoEpc5wf3nFf.png)

## 組織ユーザーを削除する\{#remove-an-organization-user}

ユーザーが組織に所属しなくなった場合は、そのユーザーを削除できます。

組織ユーザーを削除するには、**Organization Owner** である必要があります。

<Admonition type="danger" icon="🚧" title="Notes">

メンバーを削除すると、対応する個人用 API キーは直ちに失効し、アクセスは拒否されます。サービスの中断を防ぐため、削除前にご利用の環境で使用されている個人用キーが置き換えられていることを確認してください。この操作は元に戻せません。

</Admonition>

![C6O0wzlfRhmxQwbt7yccX3VHn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/C6O0wzlfRhmxQwbt7yccX3VHn3g.png)

## 組織から退出する\{#leave-an-organization}

組織に所属しなくなった場合は、そこから退出することができます。

各組織には少なくとも 1 人の組織所有者が必要です。あなたがその組織の唯一の所有者である場合は、退出できません。

<Admonition type="info" icon="📘" title="🚧 Warning">

組織から退出すると、その組織と関連リソースにはアクセスできなくなります。

</Admonition>

組織から退出する方法は、次のいずれかです。

- 組織一覧ページで組織を退出する:

    ![Jdu2wpIYBhNZ5mbdMKOcBB6rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/Jdu2wpIYBhNZ5mbdMKOcBB6rnBg.png)

- 組織に入り、**Organization Members** ページで退出する:

    ![YQYsw1BYahoLHabbmXdc4V15nA8](https://zdoc-images.s3.us-west-2.amazonaws.com/YQYsw1BYahoLHabbmXdc4V15nA8.png)

