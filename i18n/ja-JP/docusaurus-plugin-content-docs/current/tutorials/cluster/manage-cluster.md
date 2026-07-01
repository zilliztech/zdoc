---
title: "クラスターの管理 | Cloud"
slug: /manage-cluster
sidebar_key: manage-cluster
sidebar_label: "クラスターの管理"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud コンソールを最大限に活用して目標を達成できるよう、クラスターのライフサイクルについて説明します。| Cloud"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
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

稼働中のクラスターに対して、以下の操作を実行できます。

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

実行中の Dedicated クラスターの場合、CU とストレージの両方に対して課金されます。コストを削減するには、クラスターの一時停止を検討してください。Dedicated クラスターが一時停止されている間は、ストレージ料金のみが発生します。

一時停止中は、クラスターに対して他の操作を実行できないことに注意してください。

クラスターは、Web コンソールまたはプログラム経由で一時停止できます。

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

- `{API_KEY}`: API リクエストの認証に使用される資格情報。この値を独自のものに置き換えてください。

- `{CLUSTER_ID}`: 一時停止する Dedicated クラスターの ID。

詳細については、[クラスターの一時停止](/reference/restful/suspend-cluster-v2) を参照してください。

</TabItem>

</Tabs>

一時停止操作が成功すると、ジョブレコードが生成されます。[ジョブ](./job-center) ページで進捗状況を確認できます。

### Resume\{#resume}

Free クラスターは、7 日間非アクティブ状態が続くと自動的に一時停止され、いつでも再開できます。

Serverless クラスターは、一時停止および再開操作をサポートしていません。

一時停止された Dedicated クラスターも、必要に応じて手動で再開できます。

なお、再開中はクラスターに対して他の操作を実行できません。

クラスターは、Web コンソールまたはプログラム経由で再開できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象のクラスターの**クラスターの詳細**ページに移動し、以下の手順に従ってクラスターを再開してください。

<Supademo id="cm9tr2hze0t1j11m7ijth1pr5" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになり、`{API_KEY}` は認証に使用する API キーです。

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

上記のコマンドにおいて、

- `{API_KEY}`: API リクエストの認証に使用される資格情報。この値を独自のものに置き換えてください。

- `{CLUSTER_ID}`: 再開対象のクラスターの ID。

詳細については、[クラスターの再開](/reference/restful/resume-cluster-v2) を参照してください。

</TabItem>

</Tabs>

再開操作が成功すると、ジョブ記録が生成されます。進行状況は [ジョブ](./job-center) ページで確認できます。

### デプロイメントオプションのアップグレード\{#upgrade-deployment-option}

一部の機能は専用クラスターでのみ利用可能です。これらの機能を使用するには、クラスターのデプロイメントオプションをアップグレードすることをお勧めします。

<table>
   <tr>
     <th><p><strong>デプロイメントオプションのアップグレード</strong></p></th>
     <th><p><strong>注意事項</strong></p></th>
   </tr>
   <tr>
     <td><p>Free から Serverless へ</p></td>
     <td><p>Free クラスターが Serverless デプロイメントオプションにアップグレードされます。一度アップグレードされると、ダウングレードすることはできません。</p></td>
   </tr>
   <tr>
     <td><p>Free から Dedicated へ</p></td>
     <td><p>新しい専用クラスターが作成され、既存の Free クラスターからのデータが自動的に移行されます。Free クラスターはそのまま残ります。</p><p>アプリケーションコード内のクラスターエンドポイントを更新することを忘れないでください。</p></td>
   </tr>
   <tr>
     <td><p>Serverless から Dedicated へ</p></td>
     <td><p>新しい専用クラスターが作成され、既存の Serverless クラスターからのデータが自動的に移行されます。Serverless クラスターはそのまま残ります。</p><p>アプリケーションコード内のクラスターエンドポイントを更新することを忘れないでください。</p></td>
   </tr>
</table>

以下のデモでは、Free から Dedicated へのアップグレードを例として、クラスターのデプロイメントオプションをアップグレードする方法を示しています。

<Supademo id="cmfnfgviq0il71d3n2up3lci1?utm_source=link" title=""  />

### プレビュー機能のためのクラスターアップグレード\{#upgrade-cluster-for-preview-features}

最新のプレビュー機能を試すには、専用クラスターの互換性のある Milvus バージョンをアップグレードする必要があります。

![upgrade-to-preview-version](https://zdoc-images.s3.us-west-2.amazonaws.com/upgrade-to-preview-version.png "upgrade-to-preview-version")

### グローバルクラスターへの変換\{#convert-to-a-global-cluster}

既存の専用クラスターを [グローバルクラスター](./global-cluster-explained) に変換する必要がある場合は、以下の手順に従ってください。

<Supademo id="cmm5p53sh3hogdtfhemesjhv0" title=""  />

### 削除\{#drop}

クラスターが不要になった場合、それを削除できます。クラスターは Web コンソールまたはプログラム経由で削除できます。

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

対象クラスターの **クラスターの詳細** ページに移動し、以下の指示に従ってクラスターを削除してください。

<Supademo id="cm9trwi5n0txr11m7otr902sk" title=""  />

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになり、`{API_KEY}` は認証に使用する API キーです。

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
#         "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period. Kindly note, this recovery feature does not apply to free clusters."
#     }
# }     
```

上記のコマンドにおいて、

- `{API_KEY}`: API リクエストの認証に使用される資格情報。この値を独自のものに置き換えてください。

- `{CLUSTER_ID}`: 削除する Dedicated クラスターの ID。

詳細については、[クラスターの削除](/reference/restful/drop-cluster-v2) を参照してください。

</TabItem>

</Tabs>

## オンデマンドクラスターの管理 ｜PUBLIC\{#manage-on-demand-cluster-public}

オンデマンドクラスターに対して以下の操作を実行できます。

### 削除\{#drop}

- **RESTful API 経由**

    ```bash
    curl --request DELETE \
         --url "https://${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json"
    ```

- **ウェブコンソール経由**
