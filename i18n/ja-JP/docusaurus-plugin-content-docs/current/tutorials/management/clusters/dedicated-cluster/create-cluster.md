---
title: "クラスターを作成する | Cloud"
slug: /create-cluster
sidebar_label: "クラスターを作成する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Dedicated クラスターは、一貫して予測可能なパフォーマンスを必要とする本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、持続的な高スループットとレイテンシに敏感なアプリケーションに最適です。 | Cloud"
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

# クラスターを作成する

Dedicated クラスターは、一貫して予測可能なパフォーマンスを必要とする本番ワークロード向けに、分離された予約済み環境を提供します。このオプションは、持続的な高スループットとレイテンシに敏感なアプリケーションに最適です。

<Admonition type="info" title="Notes">

このトピックでは、Dedicated クラスターを作成する方法について説明します。Free クラスターまたは Serverless クラスターを作成する場合は、[Free & Serverless クラスター](./free-and-serverless-clusters) を参照してください。

</Admonition>

## 事前準備\{#prerequisites}

以下を確認してください。

- Zilliz Cloud への登録が完了していること。詳細については、[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- クラスターを作成する組織またはプロジェクトの所有権を持っていること。ロールと権限の詳細については、Access Control Explained を参照してください。

## Dedicated クラスターを作成する\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

次のデモでは、**Dedicated** クラスターを作成する方法を示します。

<Supademo id="cmhixsdvu030hxj0imafwl2av" title=""  />

Dedicated クラスターでは、次の情報を設定する必要があります。

| **Parameter** | **Description** |
| --- | --- |
| **クラスター Name** | クラスターの一意の識別子を割り当てます。 |
| **クラスター Description (optional)** | クラスターの説明を 255 文字以内で入力します。 |
| **クラスター Type** | クラスターのパフォーマンス要件に合ったクラスタータイプを選択します。詳細については、[適切なクラスタータイプの選択](./cu-types-explained) を参照してください。 |
| **Query CU** | クラスターの Query CU 数を選択します。個人用メールアドレスで作成された組織では、支払い方法が設定されていても、Dedicated クラスターの最大 Query CU サイズは 32 です。<br/>Enterprise プロジェクトでクラスターを作成する場合、オートスケーリングはデフォルトで有効になっています。入力ボックスに値を入力するかスライダーをドラッグして、オートスケーリングの最小および最大 Query CU 数を設定できます。オートスケーリングの詳細については、[オートスケーリング](./auto-scaling) を参照してください。 |
| **Backup Policy (optional)** | 作成するクラスターの自動バックアップポリシーを決定します。バックアップポリシーの詳細については、[自動バックアップのスケジュール](./schedule-automatic-backups) を参照してください。 |
| **Replica** | クラスターのレプリカ数です。 |

クラスターの作成中に、一度だけ表示されるクラスターの資格情報（ユーザーとパスワード）を保存する必要があります。

クラスターのステータスが「Running」になれば、クラスターの作成は成功したことになります。その後、クラスターのエンドポイントとトークンをコピーし、クラスターに[接続](./connect-to-clusters)するために使用できます。

</TabItem>

<TabItem value="Bash">

リクエストは次の例のようになります。ここで、`{API_KEY}` は認証に使用する API キーです。詳細については、[Create Dedicated クラスター](/reference/restful/create-dedicated-cluster-v2) を参照してください。

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

上記のコマンドでは、次のとおりです。

- `{API_KEY}`: API リクエストの認証に使用する資格情報です。値をご自身の値に置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成するプロジェクトの ID です。プロジェクト ID を一覧表示するには、[List Projects](/reference/restful/list-projects-v2) オペレーションを呼び出します。

- `regionId`: クラスターを作成するクラウドリージョンの ID です。使用可能なクラウドリージョン ID を取得するには、[List Cloud Regions](/reference/restful/list-cloud-regions-v2) オペレーションを呼び出します。

- `cuType`: クラスターのタイプです。有効な値は、Performance-optimized、Capacity-optimized、Tiered-storage です。

- `cuSize`: クラスターに使用する Query CU 数です。値の範囲は 1 から 2,048 です。個人用メールアドレスで作成された組織では、支払い方法が設定されていても、Dedicated クラスターの最大 Query CU サイズは 32 です。

- `description`（オプション）: クラスターの説明です。

出力例は以下の通りです。

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

暗号化されたクラスターを作成するには、少なくとも 1 つのカスタマーマネージド暗号化キー（CMEK）を Zilliz Cloud に追加する必要があります。詳細については、[データ暗号化用のカスタマーマネージドキー](./cmek) を参照してください。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加すると、次の手順で暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。作成するクラスターと同じリージョンにある KMS キーのみを選択できます。

1. 概要を確認し、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    上の図に示すように、暗号化されたクラスターの **Overview** ページでは、クラスター名の右側に鍵のアイコンが表示されます。暗号化されたクラスター内に作成されるすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

## FAQ\{#faq}

**クラスターを作成するときに Milvus のバージョンを指定できますか？**

いいえ。Zilliz Cloud は、サポートされている最新バージョンの Milvus でクラスターを自動的にプロビジョニングし、管理されたローリングアップグレードを通じて最新の状態に保ちます。特定のバージョンが必要な場合は、[サポート](https://support.zilliz.com/hc/en-us/requests/new) に連絡し、ユースケースを説明してください。
