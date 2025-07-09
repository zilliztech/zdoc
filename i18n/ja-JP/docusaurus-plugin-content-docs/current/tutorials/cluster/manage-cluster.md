---
title: "クラスタ管理 | Cloud"
slug: /manage-cluster
sidebar_label: "クラスタ管理"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。 | Cloud"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - knn
  - Image Search
  - LLMs
  - Machine Learning

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クラスタ管理

このガイドでは、Zilliz Cloudコンソールを最大限に活用して目標を達成するためのクラスタのライフサイクルについて説明します。

## クラスタ名の変更{#rename-cluster}

ターゲットクラスターの**クラスターの詳細**ページに移動し、以下の手順に従ってクラスターの名前を変更してください。

<Supademo id="cm9tp57ye0ri911m7ljrn1yg6" title=""  />

## クラスタを一時停止する{#suspend-cluster}

</exclude>

## クラスタを一時停止する{#suspend-cluster}

</include>

実行中の専用クラスターについては、CUとストレージの両方に対して請求されます。コストを削減するには、クラスターを一時停止することを検討してください。専用クラスターが一時停止された場合は、ストレージ料金のみが適用されます。

一時停止中は、クラスターで他のアクションを実行できないことに注意してください。

専用クラスタは、Webコンソールまたはプログラムで一時停止できます。

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

ターゲットクラスターの**クラスターの詳細**ページに移動し、以下の手順に従って専用クラスターを一時停止してください。

<supademo id="cm9tqgxt30snl11m7twwj7xia" title="Zilliz Cloud - Suspend Cluster Demo"></supademo>

</TabItem>

<tabitem value="Bash"></tabitem>

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求は、リクエストボディを受け取り、専用クラスターを一時停止します。

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

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`:サスペンドする専用クラスターのID。

詳細については、[クラスタの一時停止](/reference/restful/suspend-cluster-v2)を参照してください。

</TabItem>

</Tabs>

## クラスタを再開{#resume-cluster}

無料およびサーバーレスクラスターは、非アクティブ状態が7日間続くと自動的に一時停止され、いつでも再開できます。

一時停止された専用クラスタは、必要に応じて手動で再開することもできます。

再開中は、クラスターで他のアクションを実行できないことに注意してください。

Webコンソールまたはプログラムからクラスタを再開できます。

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

ターゲットクラスターの**クラスターの詳細**ページに移動し、以下の手順に従ってクラスターを再開してください。

<supademo id="cm9tr2hze0t1j11m7ijth1pr5" title="Zilliz Cloud - Resume Cluster Demo"></supademo>

</TabItem>

<tabitem value="Bash"></tabitem>

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`POST`要求は、リクエストボディを受け取り、クラスターを再開します。

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

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`:再開するクラスタのID。

詳細については、[クラスタの再開](/reference/restful/resume-cluster-v2)を参照してください。

</TabItem>

</Tabs>

## アップグレードプラン{#upgrade-plan}

より高度な機能を使用するには、クラスタープランをアップグレードすることをお勧めします。 

<table>
   <tr>
     <th><p><strong>プランのアップグレード</strong></p></th>
     <th><p><strong>ノート</strong></p></th>
   </tr>
   <tr>
     <td><p>無料からサーバーレスへ</p></td>
     <td><p>無料クラスタはサーバーレスプランにアップグレードされます。クラスタがアップグレードされると、プランをダウングレードすることはできません。</p></td>
   </tr>
   <tr>
     <td><p>無料から専用まで</p></td>
     <td><p>新しい専用クラスタが作成され、既存の無料クラスタからのデータが自動的に移行されます。無料クラスタはそのまま残ります。</p><p>アプリケーションコードでクラスターエンドポイントを更新することを忘れないでください。</p></td>
   </tr>
   <tr>
     <td><p>サーバーレスから専用へ</p></td>
     <td><p>新しい専用クラスタが作成され、既存のServerlessクラスタからのデータが自動的に移行されます。Serverlessクラスタはそのまま残ります。</p><p>アプリケーションコードでクラスターエンドポイントを更新することを忘れないでください。</p></td>
   </tr>
   <tr>
     <td><p>専用(Standard)から専用(Enterprise)へ</p></td>
     <td><p>Dedicated(Standard)クラスタがDedicated(Enterprise)プランにアップグレードされます。クラスタがアップグレードされると、プランをダウングレードすることはできません。</p></td>
   </tr>
</table>

次のデモでは、例としてFreeからDedicated(Enterprise)へのアップグレードを使用して、クラスタープランをアップグレードする方法を示します。

<Supademo id="cm9tscqvw0urd11m76ey8cx2p" title=""  />

## クラスタをアップグレードしてプレビュー機能を利用する{#upgrade-cluster-for-preview-features}

最新のプレビュー機能を試すには、専用クラスターの互換性のあるMilvusバージョンをアップグレードする必要があります。

![upgrade-to-preview-version](/img/upgrade-to-preview-version.png)

</exclude>

## クラスタを削除{#drop-cluster}

クラスタが不要になったら、削除できます。Webコンソールまたはプログラムからクラスタを削除できます。

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"curl","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

ターゲットクラスターの**クラスターの詳細**ページに移動し、以下の手順に従ってクラスターをドロップしてください。

<supademo id="cm9trwi5n0txr11m7otr902sk" title="Zilliz Cloud - Drop Cluster Demo"></supademo>

</TabItem>

<tabitem value="Bash"></tabitem>

リクエストは次の例のようになります。`{API_KEY}`は認証に使用するAPIキーです。

次の`DELETE`要求は、リクエストボディを受け取り、クラスターを削除します。

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

- `{API_KEY}`: APIリクエストの認証に使用される資格情報。値を自分のものに置き換えてください。

- `{CLUSTER_ID}`:削除する専用クラスタのID。

詳細については、[ドロップクラスタ](/reference/restful/drop-cluster-v2)を参照してください。

</TabItem>

</Tabs>

