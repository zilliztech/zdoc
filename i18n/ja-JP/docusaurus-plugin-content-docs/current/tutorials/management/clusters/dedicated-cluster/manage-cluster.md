---
title: "クラスタの管理 | Cloud"
slug: /manage-cluster
sidebar_label: "クラスタの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、クラスタのライフサイクルについて説明し、目標達成のために Zilliz Cloud コンソールを最大限活用できるようにします。 | Cloud"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クラスタの管理

このガイドでは、クラスタのライフサイクルについて説明し、目標達成のために Zilliz Cloud コンソールを最大限活用できるようにします。

Dedicated クラスタでは、以下の操作を実行できます。

## 名前の変更\{#rename}

<Procedures>

1. 対象のクラスタの **Cluster Details** ページに移動します。

1. **Actions** をクリックし、**Rename** を選択します。

    ![XR4QbJtm1o1My7xPp5ecuwnonAf](https://zdoc-images.s3.us-west-2.amazonaws.com/xr4qbjtm1o1my7xpp5ecuwnonaf.png "XR4QbJtm1o1My7xPp5ecuwnonAf")

1. クラスタの新しい名前を入力し、**Save** をクリックします。

    ![KmiAbYLuRonF7jxvYfsczx2cns8](https://zdoc-images.s3.us-west-2.amazonaws.com/kmiabyluronf7jxvyfsczx2cns8.png "KmiAbYLuRonF7jxvYfsczx2cns8")

</Procedures>

## 説明の編集\{#edit-description}

<Procedures>

1. 対象のクラスタの **Cluster Details** ページに移動します。

1. クラスタの説明にカーソルを合わせ、**Edit** **description** アイコンをクリックします。

    ![VVDNbEWIcoEiWrxUtYbcfy5snRg](https://zdoc-images.s3.us-west-2.amazonaws.com/vvdnbewicoeiwrxutybcfy5snrg.png "VVDNbEWIcoEiWrxUtYbcfy5snRg")

1. クラスタの新しい説明を入力し、**Save** をクリックします。

    ![ZfXqb3NGOoEm1gxmJGkcAxU2nke](https://zdoc-images.s3.us-west-2.amazonaws.com/zfxqb3ngooem1gxmjgkcaxu2nke.png "ZfXqb3NGOoEm1gxmJGkcAxU2nke")

</Procedures>

## 一時停止\{#suspend}

実行中の Dedicated クラスタでは、CU とストレージの両方に対して課金されます。コストを削減するには、クラスタの一時停止を検討してください。Dedicated クラスタが一時停止されている間は、ストレージ料金のみが適用されます。

一時停止中は、クラスタに対して他の操作を実行できない点に注意してください。

クラスタは、Web コンソールまたはプログラムから一時停止できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象のクラスタの **Cluster Details** ページに移動し、以下の手順に従って Dedicated クラスタを一時停止します。

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}` は認証に使用する API キーです。

以下の `POST` リクエストはリクエストボディを受け取り、Dedicated クラスタを一時停止します。

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

上記のコマンドでは、

- `{API_KEY}`: API リクエストの認証に使用する認証情報です。値を自身のものに置き換えてください。

- `{CLUSTER_ID}`: 一時停止する Dedicated クラスタの ID です。

詳細については、[Suspend Cluster](/reference/restful/suspend-cluster-v2) を参照してください。

</TabItem>

</Tabs>

一時停止操作が成功すると、ジョブレコードが生成されます。進行状況は [Jobs](./job-center) ページで確認できます。

## 再開\{#resume}

**一時停止された Dedicated クラスタ** は、必要に応じて手動で再開できます。

再開中は、クラスタに対して他の操作を実行できない点に注意してください。

クラスタは、Web コンソールまたはプログラムから再開できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象のクラスタの **Cluster Details** ページに移動し、以下の手順に従ってクラスタを再開します。

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}` は認証に使用する API キーです。

以下の `POST` リクエストはリクエストボディを受け取り、クラスタを再開します。

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

上記のコマンドでは、

- `{API_KEY}`: API リクエストの認証に使用する認証情報です。値を自身のものに置き換えてください。

- `{CLUSTER_ID}`: 再開するクラスタの ID です。

詳細については、[Resume Cluster](/reference/restful/resume-cluster-v2) を参照してください。

</TabItem>

</Tabs>

再開操作が成功すると、ジョブレコードが生成されます。進行状況は [Jobs](./job-center) ページで確認できます。

## プレビュー機能向けにクラスタをアップグレード\{#upgrade-cluster-for-preview-features}

最新のプレビュー機能を試すには、Dedicated クラスタの互換性のある Milvus バージョンをアップグレードする必要があります。

![upgrade-to-preview-version](https://zdoc-images.s3.us-west-2.amazonaws.com/upgrade-to-preview-version.png "upgrade-to-preview-version")

## グローバルクラスタへの変換\{#convert-to-a-global-cluster}

既存の Dedicated クラスタを [グローバルクラスタ](./global-cluster-explained) に変換する必要がある場合は、以下の手順に従ってください。

<Supademo id="cmm5p53sh3hogdtfhemesjhv0" title=""  />

## 削除\{#drop}

クラスタが不要になった場合は、削除できます。クラスタは、Web コンソールまたはプログラムから削除できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象のクラスタの **Cluster Details** ページに移動し、以下の手順に従ってクラスタを削除します。

<Supademo id="cm9trwi5n0txr11m7otr902sk" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。`{API_KEY}` は認証に使用する API キーです。

以下の `DELETE` リクエストはリクエストボディを受け取り、クラスタを削除します。

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
#         "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period."
#     }
# }     
```

上記のコマンドでは、

- `{API_KEY}`: API リクエストの認証に使用する認証情報です。値を自身のものに置き換えてください。

- `{CLUSTER_ID}`: 削除する Dedicated クラスタの ID です。

詳細については、[Drop Cluster](/reference/restful/drop-cluster-v2) を参照してください。

</TabItem>

</Tabs>

