---
title: "クラスターの作成 | Cloud"
slug: /create-cluster
sidebar_key: create-cluster
sidebar_label: "クラスターを作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、さまざまなビジネスニーズに対応するため、複数のサーバークラスター展開オプションを提供しています。"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスター
  - 作成

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クラスターの作成

Zilliz Cloud では、さまざまなビジネスニーズに対応するため、複数のサーバークラスター展開オプションを提供しています。

- **Free**: ストレージ、vCU 消費量、コレクション数に制限があるものの、学習や個人プロジェクトの出発点として利用できます。

- **Serverless**: ワークロードに応じて自動的にスケーリングする共有環境を提供し、リソースのプロビジョニングは不要です。このオプションは、予測困難なトラフィックや急激なトラフィック変動に対して、優れたコスト効率と弾力性を提供します。

- **Dedicated**: 一貫した予測可能なパフォーマンスが求められる本番ワークロード向けに、分離された予約環境を提供します。このオプションは、持続的な高スループットやレイテンシーに敏感なアプリケーションに最適です。

各展開オプションの詳細については、[Zilliz Cloud 料金](https://zilliz.com/pricing) を参照してください。

このトピックでは、クラスターの作成方法について説明します。

## 前提条件\{#prerequisites}

以下を確認してください。

- Zilliz Cloud への登録。手順については、[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- クラスターを作成する組織またはプロジェクトのオーナー権限。ロールと権限の詳細については、[アクセス制御](./access-control) を参照してください。

## Free クラスターの作成\{#create-a-free-cluster}

<Admonition type="info" icon="📘" title="Notes">

<p>各組織で作成できるフリークラスターは 1 つまでです。追加のクラスターが必要な場合は、Serverless または Dedicated を選択してください。</p>

</Admonition>

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**Free** クラスターの作成方法を示しています。

<Supademo id="cmhixdror61dofati1xmaai6j?utm_source=link" title=""  />

クラスターの作成中に、クラスターの認証情報（ユーザー名とパスワード）を保存する必要があります。これは一度だけ表示されます。

クラスターのステータスが "Running" に変わると、クラスターの作成は成功です。その後、クラスターのエンドポイントとトークンをコピーし、それらを使用してクラスターに[接続](./connect-to-cluster)できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになるはずです。ここで `{API_KEY}` は認証に使用する API キーです。

以下の `POST` リクエストはリクエストボディを受け取り、ID が `proj-xxxxxxxxxxxxxxxxxxxxx` のプロジェクトに `cluster-free` という名前のフリークラスターを作成します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createFree" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-free",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_xxxxxxxx",
#         "password": "*************",
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: API リクエストの認証に使用される認証情報です。値を独自のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成したいプロジェクトの ID です。プロジェクト ID を一覧表示するには、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) 操作を呼び出してください。

- `regionId`: クラスターを作成したいクラウドリージョンの ID です。現在、フリークラスターは GCP 上でのみ作成できます。利用可能なクラウドリージョン ID を取得するには、[クラウドリージョンの一覧表示](/reference/restful/list-cloud-regions-v2) 操作を呼び出してください。

詳細については、[フリークラスターの作成](/reference/restful/create-free-cluster-v2) を参照してください。

</TabItem>

</Tabs>

## Serverless クラスターの作成\{#create-a-serverless-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**Serverless** クラスターの作成方法を示しています。

<Supademo id="cmhixpd150ajjvc0i1t95ihdr?utm_source=link" title=""  />

クラスターの作成中に、クラスター認証情報（ユーザーとパスワード）を保存する必要があります。これは一度だけ表示されます。

クラスターのステータスが "Running" に変わると、クラスターが正常に作成されました。その後、クラスターエンドポイントとトークンをコピーして、クラスターへの[接続](./connect-to-cluster)に使用できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになるはずです。ここで `{API_KEY}` は認証に使用する API キーです。

以下の `POST` リクエストはリクエストボディを受け取り、ID が `proj-xxxxxxxxxxxxxxxxxxxxx` のプロジェクトに `cluster-severless` という名前の Serverless クラスターを作成します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createServerless" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-serverless",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_xxxxxxxx",
#         "password": "***********",
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

上記のコマンドでは、

- `{API_KEY}`: API リクエストの認証に使用される認証情報です。値を独自のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成したいプロジェクトの ID です。プロジェクト ID を一覧表示するには、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) 操作を呼び出してください。

- `regionId`: クラスターを作成したいクラウドリージョンの ID です。現在、フリークラスターは GCP 上でのみ作成できます。利用可能なクラウドリージョン ID を取得するには、[クラウドリージョンの一覧表示](/reference/restful/list-cloud-regions-v2) 操作を呼び出してください。

詳細については、[Serverless クラスターの作成](/reference/restful/create-serverless-cluster-v2) を参照してください。

</TabItem>

</Tabs>

## Create a Dedicated cluster\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**Dedicated** クラスターの作成方法を示します。

<Supademo id="cmhixsdvu030hxj0imafwl2av" title=""  />

Dedicated クラスターの以下の情報を設定する必要があります。

<table>
   <tr>
     <th><p><strong>パラメーター</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>クラスター名</strong></p></td>
     <td><p>クラスターの一意の識別子を割り当てます。</p></td>
   </tr>
   <tr>
     <td><p><strong>クラスターの説明（オプション）</strong></p></td>
     <td><p>クラスターの説明を入力します。最大 255 文字です。</p></td>
   </tr>
   <tr>
     <td><p><strong>クラスタータイプ</strong></p></td>
     <td><p>クラスターのパフォーマンス要件に合致するクラスタータイプを選択します。詳細については、<a href="./cu-types-explained">適切なクラスタータイプの選択</a> を参照してください。階層型ストレージクラスターを選択するには、クラスターに少なくとも 8 つのクエリー CU が必要です。</p></td>
   </tr>
   <tr>
     <td><p><strong>クエリー CU</strong></p></td>
     <td><p>クラスターのクエリー CU 数を選択します。個人用メールアドレスで作成された組織では、支払い方法が設定されている場合でも、Dedicated クラスターの最大クエリー CU サイズは 32 です。</p></td>
   </tr>
   <tr>
     <td><p><strong>バックアップポリシー（オプション）</strong></p></td>
     <td><p>作成するクラスターの自動バックアップポリシーを決定します。バックアップポリシーの詳細については、<a href="./schedule-automatic-backups">自動バックアップのスケジュール</a> を参照してください。</p></td>
   </tr>
</table>

クラスターが作成されている間、クラスター認証情報（ユーザーとパスワード）を保存する必要があります。これは一度だけ表示されます。

クラスターステータスが「Running」に変わると、クラスターの作成は成功です。その後、クラスターエンドポイントとトークンをコピーして、[接続](connect-to-cluster) に使用できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになるはずです。ここで `{API_KEY}` は認証に使用される API キーです。詳細については、[Dedicated クラスターの作成](/reference/restful/create-dedicated-cluster-v2) を参照してください。

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

- `{API_KEY}`: API リクエストの認証に使用される認証情報です。値はご自身のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成したいプロジェクトの ID です。プロジェクト ID を一覧表示するには、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) 操作を呼び出してください。

- `regionId`: クラスターを作成したいクラウドリージョンの ID です。利用可能なクラウドリージョン ID を取得するには、[クラウドリージョンの一覧表示](/reference/restful/list-cloud-regions-v2) 操作を呼び出してください。

- `cuType`: クラスターのタイプです。有効な値: パフォーマンス最適化済み、容量最適化済み、および Tiered-storage です。

- `cuSize`: クラスターに使用されるクエリ CU の数です。値の範囲: 1 から 256 まで。個人用メールアドレスで作成された組織では、支払い方法が設定されている場合でも、Dedicated クラスターの最大クエリー CU サイズは 32 です。

- `description`（オプション）: クラスターの説明です。

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

## 暗号化クラスターの作成\{#create-an-encrypted-cluster}

暗号化クラスターを作成するには、Zilliz Cloud に少なくとも 1 つのカスタマー管理型暗号化キー（CMEK）を追加する必要があります。詳細については、[データ暗号化のためのカスタマー管理型キー](./cmek) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

この機能は、**ビジネスクリティカル** プロジェクトの **Dedicated** クラスターでのみ利用可能です。

</Admonition>

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加したら、以下のように暗号化クラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。選択できるのは、作成するクラスターと同じリージョンにある KMS キーのみです。

1. サマリーを確認し、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化クラスターの **Overview** ページでは、上図に示すように、クラスター名の右側にキーアイコンが表示されます。暗号化クラスター内に作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

## FAQ\{#faq}

**クラスター作成時に Milvus のバージョンを指定できますか？**

いいえ。Zilliz Cloud は、サポートされている最新の Milvus バージョンでクラスターを自動的にプロビジョニングし、管理対象のローリングアップグレードを通じて最新の状態を維持します。特定のバージョンが必要な場合は、[サポートにお問い合わせ](https://support.zilliz.com/hc/en-us/requests/new) いただき、ユースケースをご説明ください。
