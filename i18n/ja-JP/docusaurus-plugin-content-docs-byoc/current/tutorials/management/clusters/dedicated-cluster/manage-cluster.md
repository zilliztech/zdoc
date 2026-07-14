---
title: "クラスターの管理 | BYOC"
slug: /manage-cluster
sidebar_label: "クラスターの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドではクラスターのライフサイクルについて説明し、目的を達成するために Zilliz Cloud コンソールを最大限活用できるようにします。 | BYOC"
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

# クラスターの管理

このガイドではクラスターのライフサイクルについて説明し、目的を達成するために Zilliz Cloud コンソールを最大限活用できるようにします。

Dedicated クラスターでは、次の操作を実行できます。

## 名前の変更\{#rename}

<Procedures>

1. 対象クラスターの **Cluster Details** ページに移動します。

1. **Actions** をクリックし、**Rename** を選択します。

    ![XR4QbJtm1o1My7xPp5ecuwnonAf](https://zdoc-images.s3.us-west-2.amazonaws.com/xr4qbjtm1o1my7xpp5ecuwnonaf.png "XR4QbJtm1o1My7xPp5ecuwnonAf")

1. クラスターの新しい名前を入力し、**Save** をクリックします。

    ![KmiAbYLuRonF7jxvYfsczx2cns8](https://zdoc-images.s3.us-west-2.amazonaws.com/kmiabyluronf7jxvyfsczx2cns8.png "KmiAbYLuRonF7jxvYfsczx2cns8")

</Procedures>

## 説明の編集\{#edit-description}

<Procedures>

1. 対象クラスターの **Cluster Details** ページに移動します。

1. クラスターの説明にカーソルを合わせ、**Edit** **description** アイコンをクリックします。

    ![VVDNbEWIcoEiWrxUtYbcfy5snRg](https://zdoc-images.s3.us-west-2.amazonaws.com/vvdnbewicoeiwrxutybcfy5snrg.png "VVDNbEWIcoEiWrxUtYbcfy5snRg")

1. クラスターの新しい説明を入力し、**Save** をクリックします。

    ![ZfXqb3NGOoEm1gxmJGkcAxU2nke](https://zdoc-images.s3.us-west-2.amazonaws.com/zfxqb3ngooem1gxmjgkcaxu2nke.png "ZfXqb3NGOoEm1gxmJGkcAxU2nke")

</Procedures>

## 一時停止\{#suspend}

クラスターは、Web コンソールまたはプログラムから一時停止できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの **Cluster Details** ページに移動し、以下の手順に従って Dedicated クラスターを一時停止します。

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}` は認証に使用する API キーです。

次の `POST` リクエストは、リクエストボディを受け取り、Dedicated クラスターを一時停止します。

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

- `{API_KEY}`: API リクエストの認証に使用する認証情報です。値を自身のものに置き換えてください。API キーは Platform API（Control Plane）リクエストの認証に使用される点に注意してください。データプレーン接続には、代わりにクラスター認証情報（`username:password`）を使用してください。

- `{CLUSTER_ID}`: 一時停止する Dedicated クラスターの ID です。

詳細については、[Suspend Cluster](/reference/restful/suspend-cluster-v2) を参照してください。

</TabItem>

</Tabs>

一時停止操作が成功すると、ジョブレコードが生成されます。進行状況は [Jobs](./job-center) ページで確認できます。

## 再開\{#resume}

再開中は、クラスターに対して他の操作を実行できない点に注意してください。

クラスターは、Web コンソールまたはプログラムから再開できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの **Cluster Details** ページに移動し、以下の手順に従ってクラスターを再開します。

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

<Admonition type="info" icon="📘" title="注意">

**Resume Cluster** ダイアログボックスで **Resume** をクリックすると、プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば、確認完了後にダイアログボックスは閉じます。十分でない場合は、次のいずれかを実行できます。 

- **Go To Project Resource Settings** をクリックして、プロジェクトのリソース設定を編集する

- **Back to Last Step** をクリックして、クラスター設定を変更する

このプロセス中、ローリングのために追加のリソースが一時的に必要になります。これらのリソースは使用後に解放されます。

</Admonition>

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}` は認証に使用する API キーです。

次の `POST` リクエストは、リクエストボディを受け取り、クラスターを再開します。

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

- `{API_KEY}`: API リクエストの認証に使用する認証情報です。値を自身のものに置き換えてください。API キーは Platform API（Control Plane）リクエストの認証に使用される点に注意してください。データプレーン接続には、代わりにクラスター認証情報（`username:password`）を使用してください。

- `{CLUSTER_ID}`: 再開するクラスターの ID です。

詳細については、[Resume Cluster](/reference/restful/resume-cluster-v2) を参照してください。

</TabItem>

</Tabs>

再開操作が成功すると、ジョブレコードが生成されます。進行状況は [Jobs](./job-center) ページで確認できます。

## 削除\{#drop}

クラスターが不要になった場合は、削除できます。クラスターは、Web コンソールまたはプログラムから削除できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの **Cluster Details** ページに移動し、以下の手順に従ってクラスターを削除します。

<Supademo id="cm9trwi5n0txr11m7otr902sk" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。`{API_KEY}` は認証に使用する API キーです。

次の `DELETE` リクエストは、リクエストボディを受け取り、クラスターを削除します。

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

- `{API_KEY}`: API リクエストの認証に使用する認証情報です。値を自身のものに置き換えてください。API キーは Platform API（Control Plane）リクエストの認証に使用される点に注意してください。データプレーン接続には、代わりにクラスター認証情報（`username:password`）を使用してください。

- `{CLUSTER_ID}`: 削除する Dedicated クラスターの ID です。

詳細については、[Drop Cluster](/reference/restful/drop-cluster-v2) を参照してください。

</TabItem>

</Tabs>

