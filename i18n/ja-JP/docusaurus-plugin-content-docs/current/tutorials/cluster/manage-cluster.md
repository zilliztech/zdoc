---
title: "クラスターを管理 | Cloud"
slug: /manage-cluster
sidebar_label: "クラスターを管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドではクラスターのライフサイクルについて説明し、Zilliz Cloudコンソールを最大限に活用して目標を達成できるようにします。 | Cloud"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - クラスター
  - 管理
  - Zillizベクターデータベース
  - Zillizデータベース
  - 非構造化データ
  - ベクターデータベース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# クラスターを管理

このガイドではクラスターのライフサイクルについて説明し、Zilliz Cloudコンソールを最大限に活用して目標を達成できるようにします。

## クラスター名を変更\{#rename-cluster}

対象クラスターの**クラスター詳細**ページに移動し、以下の手順に従ってクラスター名を変更します。

<Supademo id="cm9tp57ye0ri911m7ljrn1yg6" title=""  />

## クラスターを一時停止\{#suspend-cluster}

稼働中の専用クラスターでは、CUとストレージの両方に対して課金されます。コストを削減するには、クラスターを一時停止することを検討してください。専用クラスターが一時停止されている間は、ストレージ料金のみが適用されます。

一時停止中はクラスターに対して他の操作を実行できないことにご注意ください。

Webコンソールまたはプログラムで専用クラスターを一時停止できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの**クラスター詳細**ページに移動し、以下の手順に従って専用クラスターを一時停止します。

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

以下の`POST`リクエストはリクエストボディを受け取り、専用クラスターを一時停止します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/suspend" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "正常に送信されました。クラスターは一時停止中にコンピューティングコストを発生させません。この期間中はストレージコストのみが課金されます。"
#     }
# }     
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストを認証するために使用されるクレデンシャル。値を独自のものに置き換えてください。

- `{CLUSTER_ID}`: 一時停止する専用クラスターのID。

詳細については、[クラスターを一時停止](/reference/restful/suspend-cluster-v2)を参照してください。

</TabItem>

</Tabs>

一時停止操作が成功すると、ジョブレコードが生成されます。[ジョブ](./job-center)ページで進行状況を確認できます。

## クラスターを再開\{#resume-cluster}

無料クラスターは7日間非アクティブな状態が続くと自動的に一時停止され、必要に応じていつでも再開できます。

サーバーレスクラスターは一時停止および再開操作をサポートしていません。

一時停止された専用クラスターも、必要に応じて手動で再開できます。

再開中はクラスターに対して他の操作を実行できないことにご注意ください。

Webコンソールまたはプログラムでクラスターを再開できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの**クラスター詳細**ページに移動し、以下の手順に従ってクラスターを再開します。

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

以下の`POST`リクエストはリクエストボディを受け取り、クラスターを再開します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/resume" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "正常に送信されました。クラスターは再開中であり、これには数分かかる予定です。DescribeCluster APIを使用して、クラスター作成の進行状況とステータスに関するデータにアクセスできます。クラスターのステータスがRUNNINGになると、SDKを使用してベクターデータベースにアクセスできます。"
#     }
# }     
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストを認証するために使用されるクレデンシャル。値を独自のものに置き換えてください。

- `{CLUSTER_ID}`: 再開するクラスターのID。

詳細については、[クラスターを再開](/reference/restful/resume-cluster-v2)を参照してください。

</TabItem>

</Tabs>

再開操作が成功すると、ジョブレコードが生成されます。[ジョブ](./job-center)ページで進行状況を確認できます。

## デプロイメントオプションをアップグレード\{#upgrade-deployment-option}

一部の機能は専用クラスターでのみ利用可能であり、これらの機能を使用するにはクラスターデプロイメントオプションをアップグレードすることをお勧めします。

<table>
   <tr>
     <th><p><strong>デプロイメントオプションアップグレード</strong></p></th>
     <th><p><strong>注意</strong></p></th>
   </tr>
   <tr>
     <td><p>無料からサーバーレス</p></td>
     <td><p>無料クラスターはサーバーレスデプロイメントオプションにアップグレードされます。クラスターがアップグレードされると、ダウングレードはできません。</p></td>
   </tr>
   <tr>
     <td><p>無料から専用</p></td>
     <td><p>新しい専用クラスターが作成され、既存の無料クラスターからのデータが自動的に移行されます。無料クラスターはそのまま残ります。</p><p>アプリケーションコードのクラスターエンドポイントを更新することを忘れないでください。</p></td>
   </tr>
   <tr>
     <td><p>サーバーレスから専用</p></td>
     <td><p>新しい専用クラスターが作成され、既存のサーバーレスクラスターからのデータが自動的に移行されます。サーバーレスクラスターはそのまま残ります。</p><p>アプリケーションコードのクラスターエンドポイントを更新することを忘れないでください。</p></td>
   </tr>
</table>

以下のデモでは、無料から専用へのアップグレードを例にクラスターのデプロイメントオプションをアップグレードする方法を示しています。

<Supademo id="cmfnfgviq0il71d3n2up3lci1?utm_source=link" title=""  />

## プレビューフーズのためのクラスターをアップグレード\{#upgrade-cluster-for-preview-features}

最新のプレビューフーズを試すには、専用クラスターの互換性のあるMilvusバージョンをアップグレードする必要があります。

![upgrade-to-preview-version](/img/upgrade-to-preview-version.png)

## クラスターを削除\{#drop-cluster}

クラスターが不要になったら、削除できます。Webコンソールまたはプログラムでクラスターを削除できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの**クラスター詳細**ページに移動し、以下の手順に従ってクラスターを削除します。

<Supademo id="cm9trwi5n0txr11m7otr902sk" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

以下の`DELETE`リクエストはリクエストボディを受け取り、クラスターを削除します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/${CLUSTER_ID}/drop" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "クラスターが削除されました。この操作を誤りと考える場合は、30日間の期間内にごみ箱から削除されたクラスターを復元するオプションがあります。ただし、この復元機能は無料クラスターには適用されません。"
#     }
# }     
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストを認証するために使用されるクレデンシャル。値を独自のものに置き換えてください。

- `{CLUSTER_ID}`: 削除する専用クラスターのID。

詳細については、[クラスターを削除](/reference/restful/drop-cluster-v2)を参照してください。

</TabItem>

</Tabs>
