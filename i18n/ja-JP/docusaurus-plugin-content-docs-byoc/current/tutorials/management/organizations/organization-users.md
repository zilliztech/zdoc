---
title: "Organization ユーザーを管理する | BYOC"
slug: /organization-users
sidebar_label: "Organization ユーザー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、organization は通常会社を表します。organization に従業員を招待し、その職務に応じてロールを割り当てることができます。これらのロールは、特定のリソースに対するユーザーのアクセス権と、実行可能な操作を決定します。たとえば、開発者は通常データへのアクセスを必要としますが、請求に関する権限は必要ありません。 | BYOC"
type: origin
token: OzLjwMmWliJdEBkz0gPcVZrqnZb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Organization ユーザーを管理する

Zilliz Cloud では、organization は通常会社を表します。organization に従業員を招待し、その職務に応じてロールを割り当てることができます。これらのロールは、特定のリソースに対するユーザーのアクセス権と、実行可能な操作を決定します。たとえば、開発者は通常データへのアクセスを必要としますが、請求に関する権限は必要ありません。 

このガイドでは、organization ユーザーの管理方法について説明します。これには、organization へのユーザー招待、招待の取り消しまたは再送、organization ユーザーのロール変更、organization ユーザーの削除が含まれます。

## ユーザーを organization に招待する\{#invite-a-user-to-your-organization}

ユーザーを organization に招待する際には、organization 内のリソースへのアクセスと特定の操作を実行する権限を定義するロールを割り当てる必要があります。 

ユーザーを招待するには、招待したいユーザーのメールアドレスを入力します。次に、新しい organization ユーザーに付与したい organization ロールを選択します。 

### Organization Owner\{#organization-owner}

Organization Owner は Zilliz Cloud における最上位ロールであり、organization とそのすべてのリソース（project、cluster、database、collection）を管理する完全な権限を持ちます。このロールは、organization 内の限られた数のユーザーにのみ付与する必要があります。

次の表は、この organization ロールに対応する UI および API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>organization 内のすべての project を管理</p></li><li><p><a href="./manage-api-keys">API keys</a> を管理</p></li><li><p><a href="./organization-users">organization ユーザー</a>を管理</p></li><li><p><a href="./metrics-alerts-reference">アラート</a>を管理</p></li><li><p><a href="./view-activities">アクティビティ</a>を表示</p></li><li><p><a href="./organization-settings">organization 設定</a>を管理</p></li><li><p><a href="./use-recycle-bin">recycle bin</a> を使用</p></li><li><p>さらに、<a href="./project-users#project-admin">Project Admin</a> および <a href="./cluster-roles#built-in-cluster-roles">Cluster Admin</a> ロールのすべての権限</p></li></ul></td>
     <td><p><a href="/reference/restful/control-plane-v2">すべての control plane 操作</a></p></td>
     <td><p><a href="/reference/restful/data-plane-v2">すべての data plane 操作</a></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

data-plane RESTful API エンドポイントを呼び出す際は、対象 cluster のコロン区切りのユーザー名とパスワード（`username:password` など）を認証トークンとして使用します。

</Admonition>

### Organization Billing Admin\{#organization-billing-admin}

Organization Billing Admin ロールは、organization の請求を管理する権限を持ちます。このロールには、organization 内のその他のデータに対する権限はありません。

次の表は、この organization ロールに対応する UI および API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./manage-api-keys">API keys</a> を表示</p></li><li><p><a href="./organization-users">organization ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">organization 設定</a>を表示</p></li></ul></td>
     <td><ul><li><a href="/reference/restful/query-daily-usage-v2">日次使用量を照会</a></li></ul></td>
     <td><p>data plan の権限は project ロールおよび cluster ロールによって決まります。ただし、Billing Admin は通常 data plane の権限を必要としません。</p></td>
   </tr>
</table>

### Organization Role\{#organization-role}

招待の受信者向けに organization ロールを作成できます。organization ロールは、organization とそのリソースを表示する権限を持つロールです。このロールについて project レベルおよび cluster レベルの権限を編集できます。

![Cb5Yw6EWNhdqD5bjxTRcHHF1nAd](https://zdoc-images.s3.us-west-2.amazonaws.com/Cb5Yw6EWNhdqD5bjxTRcHHF1nAd.png)

#### project 権限をカスタマイズする\{#customize-project-privileges}

デフォルトでは、招待の受信者には **Default Project** に対する **Project Admin** アクセスが付与されます。ただし、**Customize** を選択して、よりきめ細かな権限を付与できます。

![PW5EwJqDphpZZKbUiaBcxnbUngg](https://zdoc-images.s3.us-west-2.amazonaws.com/PW5EwJqDphpZZKbUiaBcxnbUngg.png)

デフォルトでは、**All Clusters** へのアクセスが付与され、**Include all future clusters** オプションが有効になっています。**Read-Write** などのロールを割り当てて、これらの cluster 全体での招待ユーザーの権限を定義できます。招待が承諾されると、そのユーザーは project 内の現在および将来のすべての cluster に対して指定された権限を持つようになります。 

アクセスを制限するには、ドロップダウンから特定の cluster を選択します。また、**Include all future clusters** オプションを無効にして、新しく作成された cluster をアクセス範囲から除外することもできます。

**+ Cluster Access** をクリックすると、さらに cluster アクセスポリシーを追加できます。

次の表は、このロールについて organization レベルで招待受信者に付与される UI および API 権限を示しています。

<table>
   <tr>
     <th><p><strong>UI 権限</strong></p></th>
     <th><p><strong>Control Plane RESTful API (V2) 権限</strong></p></th>
     <th><p><strong>Data Plane RESTful API (V2) 権限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p><a href="./manage-api-keys">API keys</a> を表示</p></li><li><p><a href="./organization-users">organization ユーザー</a>を招待</p></li><li><p><a href="./organization-settings">organization 設定</a>を表示</p></li></ul></td>
     <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">すべての cloud meta 操作</a></p></li><li><p>cluster 操作の一部</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">Export Metrics</a></p></li></ul></li><li><p>import 操作の一部</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">Get Import Job Progress</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">List Import Jobs </a></p></li></ul></li><li><p>backup & restore 操作の一部</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">すべての cloud job 操作</a></p></li></ul></td>
     <td><p>data plan の権限は <a href="./project-users#invite-a-user-to-a-project">project</a> ロールおよび <a href="./cluster-roles">cluster</a> ロールによって決まります</p></td>
   </tr>
</table>

**Organization Member** または **Organization Billing Admin** の場合、招待受信者に付与できるロールは **Organization Member** のみであることに注意してください。

招待受信者にはメールによる招待が送信され、organization に参加するには 48 時間以内に承諾する必要があります。あるいは、Web コンソールから招待リンクをコピーして、招待相手に共有することもできます。

<Admonition type="info" icon="📘" title="📘 Notes">

1 回ごとに、同じロールで 1 人または複数のユーザーを organization に招待できます。各 organization には最大 100 人のユーザーを含めることができます。

</Admonition>

## 招待を取り消すまたは再送する\{#revoke-or-resend-an-invitation}

ユーザーを organization に招待すると、Zilliz Cloud はそのユーザーに招待メールを送信します。ユーザーが承諾する前であれば、招待を取り消したり再送したりできます。

![NDXHw6PVFhyxntbucxbc9SOFnLg](https://zdoc-images.s3.us-west-2.amazonaws.com/NDXHw6PVFhyxntbucxbc9SOFnLg.png)

## organization ユーザーのロールを編集する\{#edit-the-role-of-an-organization-user}

ユーザーが招待を承諾して organization に参加した後は、必要に応じてそのロールを調整できます。

organization ユーザーのロールを編集するには、**Organization Owner** である必要があります。

![VGxOwarfShUDk1bIoEpc5wf3nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/VGxOwarfShUDk1bIoEpc5wf3nFf.png)

## organization ユーザーを削除する\{#remove-an-organization-user}

ユーザーが organization に属さなくなった場合は、そのユーザーを削除できます。

organization ユーザーを削除するには、**Organization Owner** である必要があります。

<Admonition type="danger" icon="🚧" title="Notes">

メンバーを削除すると、対応する個人用 API key は即座に無効化され、アクセスは拒否されます。サービス中断を防ぐため、環境内で使用されている個人用キーがある場合は、削除前に必ず置き換えてください。この操作は元に戻せません。

</Admonition>

![C6O0wzlfRhmxQwbt7yccX3VHn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/C6O0wzlfRhmxQwbt7yccX3VHn3g.png)

## organization を離脱する\{#leave-an-organization}

organization に属さなくなった場合は、離脱することができます。

各 organization には少なくとも 1 人の organization owner が必要です。あなたがその organization の唯一の owner である場合、離脱することはできません。

<Admonition type="info" icon="📘" title="🚧 Warning">

organization を離脱すると、その organization と関連リソースにはアクセスできなくなります。

</Admonition>

![SeD6w1FHxhgrbHbjSCQc1eZ3nP9](https://zdoc-images.s3.us-west-2.amazonaws.com/SeD6w1FHxhgrbHbjSCQc1eZ3nP9.png)

