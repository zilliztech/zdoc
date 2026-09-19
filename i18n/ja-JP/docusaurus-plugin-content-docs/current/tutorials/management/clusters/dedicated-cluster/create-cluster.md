---
title: "クラスターの作成 | Cloud"
slug: /create-cluster
sidebar_label: "クラスターの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Dedicated クラスターは、一貫性があり予測可能なパフォーマンスを必要とする本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、持続的な高スループットとレイテンシーに敏感なアプリケーションに最適です。 | Cloud"
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

Dedicated クラスターは、一貫性があり予測可能なパフォーマンスを必要とする本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、持続的な高スループットとレイテンシーに敏感なアプリケーションに最適です。

<Admonition type="info" title="Notes">

このトピックでは、Dedicated クラスターの作成方法について説明します。Free または Serverless クラスターを作成するには、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。

</Admonition>

## 事前準備\{#prerequisites}

以下を確認してください。

- Zilliz Cloud への登録が完了していること。詳細は、[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- クラスターを作成する organization または project の所有権を持っていること。ロールと権限の詳細については、[アクセス制御の概要](./access-control-overview) を参照してください。

## Dedicated クラスターを作成する\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

次のデモでは、**Dedicated** クラスターを作成する方法を説明します。

<Supademo id="cmhixsdvu030hxj0imafwl2av" title=""  />

Dedicated クラスターでは、次の情報を設定する必要があります。

| **パラメーター** | **説明** |
| --- | --- |
| **クラスター Name** | クラスターに一意の識別子を割り当てます。 |
| **クラスター Description (optional)** | クラスターの説明を入力します。最大 255 文字です。 |
| **クラスター Type** | クラスターのパフォーマンス要件に合ったクラスタータイプを選択します。詳細は、[適切なクラスタータイプを選択する](./cu-types-explained) を参照してください。Tiered-storage クラスターを選択するには、クラスターに少なくとも 8 クエリ CU が必要です。 |
| **Query CU** | クラスターのクエリ CU 数を選択します。個人のメールアドレスで作成された organization の場合、支払い方法が設定されていても、Dedicated クラスターのクエリ CU の最大サイズは 32 です。<br/>Enterprise project でクラスターを作成する場合、オートスケーリングはデフォルトで有効になっています。入力ボックスに値を入力するかスライダーをドラッグして、オートスケーリングのクエリ CU の最小数と最大数を設定できます。オートスケーリングの詳細については、[Auto-scaling](./auto-scaling) を参照してください。 |
| **Backup Policy (optional)** | 作成するクラスターの自動バックアップポリシーを決定します。バックアップポリシーの詳細については、[自動バックアップのスケジュール設定](./schedule-automatic-backups) を参照してください。 |
| **Replica** | クラスターのレプリカ数です。 |

クラスターの作成中は、一度だけ表示されるクラスターの認証情報（ユーザーとパスワード）を保存する必要があります。

クラスターのステータスが「Running」になると、クラスターは正常に作成されています。その後、クラスターのエンドポイントとトークンをコピーし、それらを使用してクラスターに[接続](./connect-to-clusters)できます。

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。ここで `{API_KEY}` は認証に使用する API キーです。詳細は、[Create Dedicated クラスター](/reference/restful/create-dedicated-cluster-v2) を参照してください。

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

上記のコマンドでは、

- `{API_KEY}`: API リクエストの認証に使用する認証情報です。値を自身のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成する project の ID です。project ID を一覧表示するには、[List Projects](/reference/restful/list-projects-v2) 操作を呼び出します。

- `regionId`: クラスターを作成するクラウドリージョンの ID です。利用可能なクラウドリージョンの ID を取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2) 操作を呼び出します。

- `cuType`: クラスターのタイプです。有効な値は、Performance-optimized、Capacity-optimized、Tiered-storage です。

- `cuSize`: クラスターで使用するクエリ CU 数です。値の範囲は 1 ～ 2,048 です。個人のメールアドレスで作成された organization の場合、支払い方法が設定されていても、Dedicated クラスターのクエリ CU の最大サイズは 32 です。

- `description`（optional）: クラスターの説明です。

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

## 暗号化されたクラスターを作成する\{#create-an-encrypted-cluster}

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で利用できます。Google Cloud および Microsoft Azure では利用できません。

</FeatureNote>

暗号化されたクラスターを作成するには、少なくとも 1 つの customer-managed encryption key（CMEK）を Zilliz Cloud に追加する必要があります。詳細は、[Customer-managed Keys for Data Encryption](./cmek) を参照してください。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加すると、次のように暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にして、既存の KMS キーを選択します。作成するクラスターと同じリージョンにある KMS キーのみを選択できます。

1. 概要を確認してから、**Create クラスター** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **Overview** ページでは、上の図に示すように、クラスター名の右側にキーアイコンが表示されます。暗号化されたクラスター内で作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

## FAQ\{#faq}

**クラスターの作成時に Milvus のバージョンを指定できますか？**

いいえ。Zilliz Cloud は、サポート対象の最新の Milvus バージョンでクラスターを自動的にプロビジョニングし、マネージドローリングアップグレードを通じて常に最新の状態に保ちます。特定のバージョンが必要な場合は、[サポートにお問い合わせ](https://support.zilliz.com/hc/en-us/requests/new)のうえ、ユースケースを説明してください。
