---
title: "クラスターの管理 | BYOC"
slug: /manage-cluster
sidebar_label: "クラスターの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドは、クラスターのライフサイクルについて説明し、Zilliz Cloudコンソールを最大限に活用して目標を達成できるようにします。 | BYOC"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 管理
  - 知識ベース
  - 自然言語処理
  - AIチャットボット
  - コサイン距離

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# クラスターの管理

このガイドは、クラスターのライフサイクルについて説明し、Zilliz Cloudコンソールを最大限に活用して目標を達成できるようにします。

## クラスター名の変更\{#rename-cluster}

ターゲットクラスターの**クラスターデータils**ページに移動し、以下の手順に従ってクラスター名を変更します。

<Supademo id="cm9tp57ye0ri911m7ljrn1yg6" title=""  />

## クラスターの停止\{#suspend-cluster}

クラスターの停止はウェブコンソールまたはプログラム経由で行えます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

ターゲットクラスターの**クラスターデータils**ページに移動し、以下の手順に従ってDedicatedクラスターを停止します。

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title=""  />

</TabItem>

<TabItem value="Bash">

以下の例のように、`{API_KEY}`は認証に使用されるAPIキーです。

以下の `POST` リクエストはリクエストボディを受け取り、Dedicatedクラスターを停止します。

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
#         "prompt": "正常に送信されました。クラスターが停止している間は、コンピューティングコストは発生しません。この期間中はストレージコストのみが課金されます。"
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`: 停止するDedicatedクラスターのID。

詳細については、[Suspend Cluster](/reference/restful/suspend-cluster-v2)を参照してください。

</TabItem>

</Tabs>

停止操作が成功すると、ジョブレコードが生成されます。進行状況は[Jobs](./job-center)ページで確認できます。

## クラスターの再開\{#resume-cluster}

再開中はクラスター上で他の操作を行うことができませんのでご注意ください。

クラスターの再開はウェブコンソールまたはプログラム経由で行えます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

ターゲットクラスターの**クラスターデータils**ページに移動し、以下の手順に従ってクラスターを再開します。

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

<Admonition type="info" icon="📘" title="Notes">

<p><strong>再開</strong>を<strong>クラスター再開</strong>ダイアログボックスでクリックする際、プロジェクトのリソースクォータを確認するように求められます。リソースが十分であれば、チェックが完了した後にダイアログボックスは消えます。そうでない場合は、以下が可能です。</p>
<ul>
<li><p><strong>Go To Project Resource Settings</strong>をクリックしてプロジェクトのリソース設定を編集するか、または</p></li>
<li><p><strong>Back to Last Step</strong>をクリックしてクラスタ設定を変更します。</p></li>
</ul>
<p>プロセス中、ローリングには追加リソースが必要になります。これらのリソースは使用後に解放されます。</p>

</Admonition>

</TabItem>

<TabItem value="Bash">

以下の例のように、`{API_KEY}`は認証に使用されるAPIキーです。

以下の `POST` リクエストはリクエストボディを受け取り、クラスターを再開します。

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
#         "prompt": "正常に送信されました。クラスターは再開中で、数分かかる見込みです。DescribeCluster APIを使用して、クラスターの作成進行状況とステータスに関するデータにアクセスできます。クラスターのステータスがRUNNINGになると、SDKを使用してベクトルデータベースにアクセスできます。"
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`: 再開するクラスターのID。

詳細については、[Resume Cluster](/reference/restful/resume-cluster-v2)を参照してください。

</TabItem>

</Tabs>

再開操作が成功すると、ジョブレコードが生成されます。進行状況は[Jobs](./job-center)ページで確認できます。

## クラスターの削除\{#drop-cluster}

クラスターが不要になったときに削除できます。クラスターの削除はウェブコンソールまたはプログラム経由で行えます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

ターゲットクラスターの**クラスターデータils**ページに移動し、以下の手順に従ってクラスターを削除します。

<Supademo id="cm9trwi5n0txr11m7otr902sk" title=""  />

</TabItem>

<TabItem value="Bash">

以下の例のように、`{API_KEY}`は認証に使用されるAPIキーです。

以下の `DELETE` リクエストはリクエストボディを受け取り、クラスターを削除します。

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
#         "prompt": "クラスターが削除されました。この操作がエラーであると判断した場合は、30日間の期間内にごみ箱から削除されたクラスターを復元するオプションがあります。この回復機能は無料クラスターには適用されません。"
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`: 削除するDedicatedクラスターのID。

詳細については、[Drop Cluster](/reference/restful/drop-cluster-v2)を参照してください。

</TabItem>

</Tabs>