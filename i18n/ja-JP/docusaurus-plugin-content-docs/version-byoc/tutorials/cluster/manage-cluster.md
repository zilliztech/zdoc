---
title: "クラスターの管理 | BYOC"
slug: /manage-cluster
sidebar_key: manage-cluster
sidebar_label: "クラスターを管理"
beta: FALSE
notebook: FALSE
description: "このガイドでは、クラスターのライフサイクルについて説明し、Zilliz Cloud コンソールを最大限に活用して目標を達成する方法を紹介します。 | BYOC"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスター
  - 管理

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クラスターの管理

このガイドでは、クラスターのライフサイクルについて説明し、Zilliz Cloud コンソールを最大限に活用して目標を達成する方法を示します。

Dedicated クラスターに対して、以下の操作を実行できます。

## 名前の変更\{#rename}

<Procedures>

1. 対象クラスターの **クラスターの詳細** ページに移動します。

1. **Actions** をクリックし、**Rename** を選択します。

    ![XR4QbJtm1o1My7xPp5ecuwnonAf](https://zdoc-images.s3.us-west-2.amazonaws.com/xr4qbjtm1o1my7xpp5ecuwnonaf.png "XR4QbJtm1o1My7xPp5ecuwnonAf")

1. クラスターの新しい名前を入力し、**Save** をクリックします。

    ![KmiAbYLuRonF7jxvYfsczx2cns8](https://zdoc-images.s3.us-west-2.amazonaws.com/kmiabyluronf7jxvyfsczx2cns8.png "KmiAbYLuRonF7jxvYfsczx2cns8")

</Procedures>

## 説明の編集\{#edit-description}

<Procedures>

1. 対象クラスターの **クラスターの詳細** ページに移動します。

1. クラスターの説明にマウスを合わせ、**Edit** **description** アイコンをクリックします。

    ![VVDNbEWIcoEiWrxUtYbcfy5snRg](https://zdoc-images.s3.us-west-2.amazonaws.com/vvdnbewicoeiwrxutybcfy5snrg.png "VVDNbEWIcoEiWrxUtYbcfy5snRg")

1. クラスターの新しい説明を入力し、**Save** をクリックします。

    ![ZfXqb3NGOoEm1gxmJGkcAxU2nke](https://zdoc-images.s3.us-west-2.amazonaws.com/zfxqb3ngooem1gxmjgkcaxu2nke.png "ZfXqb3NGOoEm1gxmJGkcAxU2nke")

</Procedures>

## 一時停止\{#suspend}

Web コンソールまたはプログラム経由でクラスターを一時停止できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象のクラスターの**クラスターの詳細**ページに移動し、以下の手順に従って Dedicated クラスターを一時停止します。

<Supademo id="cm9tqgxt30snl11m7twwj7xia" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。ここで、`{API_KEY}` は認証に使用する API キーです。

以下の `POST` リクエストはリクエストボディを受け取り、Dedicated クラスターを一時停止します。

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

- `{API_KEY}`: API リクエストの認証に使用される認証情報です。値はご自身のものに置き換えてください。API キーは Platform API（コントロールプレーン）リクエストの認証に使用されることに注意してください。データプランへの接続には、代わりにクラスター認証情報（`username:password`）を使用してください。

- `{CLUSTER_ID}`: 一時停止する Dedicated クラスターの ID です。

詳細については、[クラスターの一時停止](/reference/restful/suspend-cluster-v2) を参照してください。

</TabItem>

</Tabs>

一時停止操作が成功すると、ジョブレコードが生成されます。進捗状況は [ジョブ](./job-center) ページで確認できます。

## 再開\{#resume}

再開中は、クラスターに対して他のアクションを実行できないことに注意してください。

クラスターの再開は、Web コンソールまたはプログラムで行うことができます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの **クラスターの詳細** ページに移動し、以下の手順に従ってクラスターを再開してください。

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

<Admonition type="info" icon="📘" title="Notes">

**クラスターの再開** ダイアログボックスで **再開** をクリックすると、プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば、確認が完了後にダイアログボックスが消えます。そうでない場合は、

- **プロジェクトのリソース設定に移動** をクリックしてプロジェクトのリソース設定を編集するか、

- **前のステップに戻る** をクリックしてクラスター設定を変更してください。

このプロセス中、ローリングに追加のリソースが必要になります。これらのリソースは使用後に解放されます。

</Admonition>

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになるはずです。ここで `{API_KEY}` は認証に使用する API キーです。

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
#         "prompt": "successfully Submitted. Cluster is being resumed, which is expected to takes several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
#     }
# }     
```

上記のコマンドでは、

- `{API_KEY}`: API リクエストの認証に使用される認証情報です。値はご自身のものに置き換えてください。API キーは Platform API（コントロールプレーン）リクエストの認証に使用されることに注意してください。データプランへの接続には、代わりにクラスター認証情報（`username:password`）を使用してください。

- `{CLUSTER_ID}`: 再開するクラスターの ID です。

詳細については、[クラスターの再開](/reference/restful/resume-cluster-v2) を参照してください。

</TabItem>

</Tabs>

再開操作が成功すると、ジョブレコードが生成されます。進捗状況は [ジョブ](./job-center) ページで確認できます。

### グローバルクラスターへの変換\{#convert-to-a-global-cluster}

既存の専用クラスターを [グローバルクラスター](./global-cluster-explained) に変換する必要がある場合は、以下の手順に従ってください。

<Supademo id="cmm5p53sh3hogdtfhemesjhv0" title=""  />

## 削除\{#drop}

クラスターが不要になった場合、削除することができます。クラスターは Web コンソールまたはプログラムで削除できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの **クラスターの詳細** ページに移動し、以下の手順に従ってクラスターを削除してください。

<Supademo id="cm9trwi5n0txr11m7otr902sk" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになるはずです。ここで `{API_KEY}` は認証に使用する API キーです。

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
#         "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period."
#     }
# }     
```

上記のコマンドでは、

- `{API_KEY}`: APIリクエストの認証に使用されるクレデンシャルです。値はご自身のものに置き換えてください。APIキーはPlatform API（コントロールプレーン）リクエストの認証に使用されることに注意してください。データプランへの接続には、代わりにクラスタークレデンシャル（`username:password`）を使用してください。

- `{CLUSTER_ID}`: 削除するDedicatedクラスターのIDです。

詳細については、[クラスターの削除](/reference/restful/drop-cluster-v2) を参照してください。

</TabItem>

</Tabs>
