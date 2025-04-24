---
title: "クラスタ管理 | BYOC"
slug: /manage-cluster
sidebar_label: "クラスタ管理"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。 | BYOC"
type: origin
token: Py5VwaHKnirdQQkJBxXcmfrunfg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# クラスタ管理

このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。

## クラスタ名の変更{#rename-cluster}

ターゲットクラスタの[**クラスタの詳細**]ページに移動し、以下の手順に従ってクラスタ名を変更します。

<Supademo id="cm9tp57ye0ri911m7ljrn1yg6" title="Zilliz Cloud - Rename Cluster Demo" />

## クラスタを一時停止する{#suspend-cluster}

実行中の専用クラスターについては、CUとストレージの両方に対して請求されます。コストを削減するには、クラスターを一時停止することを検討してください。専用クラスターが一時停止された場合は、ストレージ料金のみが適用されます。

一時停止中は、クラスターに対して他のアクションを実行できないことに注意してください。

専用クラスタは、Webコンソールまたはプログラムから一時停止できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

ターゲットクラスタの[**クラスタの詳細**]ページに移動し、以下の手順に従って専用クラスタをサスペンドします。

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title="Zilliz Cloud - Suspend Cluster Demo" />

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求はリクエストボディを受け取り、専用クラスターを一時停止します。

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
#         "prompt": "Successfully Submitted. The cluster will not incur any computing costs when suspended. You will only be billed for the storage costs during this time."
#     }
# }     
```

上記のコマンドで、

- `{API_KEY}`: APIリクエストを認証するために使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`:サスペンドする専用クラスタのID。

詳細は、クラスタの一時停止を参照してください。

</TabItem>

</Tabs>

## クラスタを再開{#resume-cluster}

無料およびサーバーレスクラスターは、非アクティブ状態が7日間続くと自動的に一時停止され、いつでも再開できます。

一時停止された専用クラスタは、必要に応じて手動で再開することもできます。

再開中は、クラスターに対して他のアクションを実行できないことに注意してください。

Webコンソールまたはプログラムからクラスタを再開できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

ターゲットクラスタの[**クラスタの詳細**]ページに移動し、以下の手順に従ってクラスタを再開します。

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title="Zilliz Cloud - Resume Cluster Demo" />

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求はリクエストボディを受け取り、専用クラスターを一時停止します。

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
#         "prompt": "successfully Submitted. Cluster is being resumed, which is expected to takes several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
#     }
# }     
```

上記のコマンドで、

- `{API_KEY}`: APIリクエストを認証するために使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`:再開するクラスタのID。

詳細については、クラスタの再開を参照してください。

</TabItem>

</Tabs>

## クラスタを削除{#drop-cluster}

クラスタが不要になったら、削除できます。Webコンソールまたはプログラムからクラスタを削除できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

ターゲットクラスタの[**クラスタの詳細**]ページに移動し、以下の手順に従ってクラスタを削除します。

<Supademo id="cm9trwi5n0txr11m7otr902sk" title="Zilliz Cloud - Drop Cluster Demo" />

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求はリクエストボディを受け取り、クラスタを削除します。

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
#         "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period. Kindly note, this recovery feature does not apply to free clusters."
#     }
# }     
```

上記のコマンドで、

- `{API_KEY}`: APIリクエストを認証するために使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`:削除する専用クラスタのID。

詳細は、ドロップクラスタを参照してください。

</TabItem>

</Tabs>