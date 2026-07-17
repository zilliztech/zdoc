---
title: "クラスターの作成 | Cloud"
slug: /create-cluster
sidebar_label: "クラスターの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Dedicated cluster は、一貫性があり予測可能なパフォーマンスを求める本番ワークロード向けに、分離された専用環境を提供します。このオプションは、継続的な高スループットや低レイテンシが重視されるアプリケーションに最適です。 | Cloud"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クラスターの作成

Dedicated cluster は、一貫性があり予測可能なパフォーマンスを求める本番ワークロード向けに、分離された専用環境を提供します。このオプションは、継続的な高スループットや低レイテンシが重視されるアプリケーションに最適です。

<Admonition type="info" icon="📘" title="注意">

このトピックでは Dedicated cluster を作成する方法について説明します。Free または Serverless cluster を作成するには、[Free & Serverless Clusters](./free-and-serverless-clusters) を参照してください。

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。

- Zilliz Cloud に登録済みであること。[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- cluster を作成する organization または project の所有者であること。ロールと権限の詳細については、[Access Control Explained](./access-control-overview) を参照してください。

## Dedicated cluster を作成する\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**Dedicated** cluster を作成する方法を示します。

<Supademo id="cmhixsdvu030hxj0imafwl2av" title=""  />

Dedicated cluster では、以下の情報を設定する必要があります。

| **Parameter** | **Description** |
| --- | --- |
| **Cluster Name** | cluster の一意な識別子を設定します。 |
| **Cluster Description (optional)** | cluster の説明を 255 文字以内で入力します。 |
| **Cluster Type** | cluster のパフォーマンス要件に合った cluster タイプを選択します。詳細は [適切な Cluster Type を選択する](./cu-types-explained) を参照してください。Tiered-storage cluster を選択するには、cluster に少なくとも 8 query CUs が必要です。 |
| **Query CU** | cluster の query CUs 数を選択します。個人用メールアドレスで作成された organization の場合、支払い方法が設定されていても Dedicated cluster の最大 query CU サイズは 32 です。 |
| **Backup Policy (optional)** | 作成する cluster の自動バックアップポリシーを決定します。バックアップポリシーの詳細については、[自動バックアップをスケジュールする](./schedule-automatic-backups) を参照してください。 |

cluster の作成中に、cluster の認証情報（ユーザー名とパスワード）を保存する必要があります。これらは一度しか表示されません。 

cluster のステータスが "Running" になれば、cluster は正常に作成されています。その後、cluster endpoint と token をコピーして、それらを使って cluster に[接続](./connect-to-clusters)できます。

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。ここで `{API_KEY}` は認証に使用する API key です。詳細は、[Create Dedicated Cluster](/reference/restful/create-dedicated-cluster-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/createDedicated" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "clusterName": "Cluster-05",
    "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "plan": "Standard",
    "cuType": "Performance-optimized",
    "cuSize": 1,
    "description": "A cluster for vector search workloads."
}'
```

上記のコマンドでは、次を指定します。

- `{API_KEY}`: API リクエストの認証に使用される認証情報です。値を自身のものに置き換えてください。

- `clusterName`: 作成する cluster の名前です。

- `projectId`: cluster を作成する project の ID です。project ID を一覧表示するには、[List Projects](/reference/restful/list-projects-v2) オペレーションを呼び出します。

- `regionId`: cluster を作成する cloud region の ID です。利用可能な cloud region ID を取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2) オペレーションを呼び出します。

- `cuType`: cluster のタイプです。有効な値は Performance-optimized、Capacity-optimized、Tiered-storage です。

- `cuSize`: cluster で使用する query CUs の数です。値の範囲は 1 ～ 2,048 です。個人用メールアドレスで作成された organization の場合、支払い方法が設定されていても Dedicated cluster の最大 query CU サイズは 32 です。

- `description` (optional): cluster の説明です。

以下は出力例です。

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "username": "db_admin",
        "password": "****************",
        "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
    }
}
```

</TabItem>

</Tabs>

## 暗号化された cluster を作成する\{#create-an-encrypted-cluster}

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

暗号化された cluster を作成するには、少なくとも customer-managed encryption key (CMEK) を Zilliz Cloud に追加する必要があります。詳細は、[データ暗号化のための Customer-managed Keys](./cmek) を参照してください。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS key を追加したら、次のように暗号化された cluster を作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. cluster の cloud provider と region を選択します。

1. **Encryption at Rest with CMEK** を有効にして、既存の KMS key を選択します。作成する cluster と同じ region にある KMS key のみ選択できます。

1. 概要を確認し、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化された cluster の **Overview** ページでは、上の図のように cluster 名の右側に鍵アイコンが表示されます。暗号化された cluster で作成されたすべての collection は、デフォルトで暗号化されます。

</Procedures>

## FAQ\{#faq}

**cluster 作成時に Milvus のバージョンを指定できますか？**

いいえ。Zilliz Cloud は、最新のサポート対象 Milvus バージョンで cluster を自動的にプロビジョニングし、管理されたローリングアップグレードによって最新状態を維持します。特定のバージョンが必要な場合は、[サポートにお問い合わせ](https://support.zilliz.com/hc/en-us/requests/new)いただき、ユースケースを説明してください。
