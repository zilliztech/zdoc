---
title: "クラスターの作成 | Cloud"
slug: /create-cluster
sidebar_key: create-cluster
sidebar_label: "クラスターの作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、多様なビジネスニーズに対応するため、さまざまなサービングクラスターのデプロイオプションを提供します。| Cloud"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - 作成

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クラスターの作成

Zilliz Cloud は、さまざまなビジネスニーズに対応するために、多様なサービングクラスターデプロイメントオプションを提供しています。

- **Free**: ストレージ、vCU 消費量、およびコレクション数に制限がありますが、学習や個人プロジェクトの起点として利用できます。

- **Serverless**: ワークロードに合わせて自動的にスケールする共有環境を提供します。リソースのプロビジョニングは不要です。このオプションは、予測不能または急増するトラフィックに対して優れたコスト効率と弾力性を実現します。

- **Dedicated**: 一貫性と予測可能性の高いパフォーマンスを必要とする本番ワークロード向けに、分離された専用環境を提供します。このオプションは、持続的な高スループットおよびレイテンシに敏感なアプリケーションに最適です。

各デプロイメントオプションの詳細については、[Zilliz Cloud の料金](https://zilliz.com/pricing) をご覧ください。

本トピックでは、クラスターの作成方法について説明します。

## 前提条件\{#prerequisites}

以下の事項を確認してください：

- Zilliz Cloud に登録済みであること。手順については、[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- クラスターを構築する組織またはプロジェクトの オーナー 権限を有していること。ロールと権限の詳細については、[アクセス制御](./access-control) を参照してください。

## フリークラスターの作成\{#create-a-free-cluster}

<Admonition type="info" icon="📘" title="Notes">

<p>各組織で保有できるフリークラスターは 1 つのみです。追加のクラスターが必要な場合は、Serverless または Dedicated を選択してください。</p>

</Admonition>

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**Free** クラスターを作成する方法を示します。

<Supademo id="cmhixdror61dofati1xmaai6j?utm_source=link" title=""  />

クラスターの作成中は、一度だけ表示されるクラスターの認証情報（ユーザー名とパスワード）を保存する必要があります。

クラスターのステータスが「Running」になると、クラスターが正常に作成されたことを意味します。その後、クラスターのエンドポイントとトークンをコピーし、それらを使用してクラスターに [接続](./connect-to-cluster) できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようになります。ここで、`{API_KEY}` は認証に使用する API キーです。

以下の `POST` リクエストは、リクエストボディを受け取り、ID が `proj-xxxxxxxxxxxxxxxxxxxxx` のプロジェクト内に `cluster-free` という名前のフリークラスターを作成します。

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

上記のコマンドにおいて、

- `{API_KEY}`: APIリクエストを認証するための資格情報です。この値を自身のAPIキーに置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成したいプロジェクトのIDです。プロジェクトIDの一覧を取得するには、[List プロジェクト](/reference/restful/list-projects-v2) 操作を呼び出してください。

- `regionId`: クラスターを作成したいクラウドリージョンのIDです。現在、フリークラスターはGCP上でのみ作成可能です。利用可能なクラウドリージョンIDを取得するには、[List クラウドリージョンs](/reference/restful/list-cloud-regions-v2) 操作を呼び出してください。

詳細については、[Create Free Cluster](/reference/restful/create-free-cluster-v2) を参照してください。

</TabItem>

</Tabs>

## Create a Serverless cluster\{#create-a-serverless-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**Serverless** クラスターの作成方法を示します。

<Supademo id="cmhixpd150ajjvc0i1t95ihdr?utm_source=link" title=""  />

クラスター作成中は、一度しか表示されないクラスターの認証情報（ユーザー名とパスワード）を必ず保存してください。

クラスターのステータスが「Running」になった時点で、クラスターの作成は成功です。その後、クラスターエンドポイントとトークンをコピーし、それらを使ってクラスターに [接続](./connect-to-cluster) できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のように記述します。ここで `{API_KEY}` は認証に使用するあなたのAPIキーです。

以下の `POST` リクエストはリクエストボディを受け取り、IDが `proj-xxxxxxxxxxxxxxxxxxxxx` のプロジェクト内に `cluster-severless` という名前のサーバーレスクラスターを作成します。

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

上記のコマンドにおいて、

- `{API_KEY}`: API リクエストを認証するために使用される認証情報です。この値を自分のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前です。

- `projectId`: クラスターを作成したいプロジェクトの ID です。プロジェクト ID の一覧を取得するには、[プロジェクト の一覧表示](/reference/restful/list-projects-v2) 操作を呼び出してください。

- `regionId`: クラスターを作成したいクラウドリージョンの ID です。現在、フリークラスターは GCP 上でのみ作成可能です。利用可能なクラウドリージョン ID を取得するには、[クラウドリージョンs の一覧表示](/reference/restful/list-cloud-regions-v2) 操作を呼び出してください。

詳細については、[サーバーレスクラスターの作成](/reference/restful/create-serverless-cluster-v2) を参照してください。

</TabItem>

</Tabs>

## Dedicated クラスターの作成\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

以下のデモでは、**Dedicated** クラスターを作成する方法を示します。

<Supademo id="cmhixsdvu030hxj0imafwl2av?utm_source=link" title=""  />

Dedicated クラスターの以下の情報を設定する必要があります。

- **クラスター名**: クラスターの一意な識別子を割り当てます。

- **クラスター設定**:

    - **クラスタータイプ**: クラスターのパフォーマンス要件に合ったクラスタータイプを選択します。詳細については、[適切なクラスタータイプの選択](./cu-types-explained) を参照してください。Tiered-storage クラスターを選択する場合、クラスターには少なくとも 8 つのクエリ CU が必要です。

    - **クエリ CU**: クラスターのクエリ CU 数を選択します。

- （オプション）**バックアップポリシー**: 作成するクラスターのバックアップ頻度を決定します。有効にすると、Zilliz Cloud はクラスター作成直後に即座にバックアップを作成します。その後のバックアップは指定されたスケジュールに従って実行されます。

クラスター作成中は、一度しか表示されないクラスターの認証情報（ユーザー名とパスワード）を保存する必要があります。

クラスターのステータスが「Running」になったら、クラスターの作成は成功です。その後、クラスターエンドポイントとトークンをコピーして、クラスターに[接続](./connect-to-cluster)できます。

</TabItem>

<TabItem value="Bash">

リクエストは以下の例のようにする必要があります。ここで `{API_KEY}` は認証に使用する API キーです。

以下の `POST` リクエストはリクエストボディを受け取り、1 つのクエリ [CU](./cu-types-explained) を持つ `cluster-02` という名前の Dedicated なパフォーマンス最適化済みクラスターを作成します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createDedicated" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "Cluster-02",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "plan": "Standard",
        "cuType": "Performance-optimized",
        "cuSize": 1
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_admin",
#         "password": "****************",
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

上記のコマンドにおいて、

- `{API_KEY}`: API リクエストの認証に使用される資格情報。この値をご自身のものに置き換えてください。

- `clusterName`: 作成するクラスターの名前。

- `projectId`: クラスターを作成するプロジェクトの ID。プロジェクト ID を一覧表示するには、[プロジェクトの一覧表示](/reference/restful/list-projects-v2) 操作を呼び出します。

- `regionId`: クラスターを作成するクラウドリージョンの ID。利用可能なクラウドリージョン ID を取得するには、[クラウドリージョンの一覧表示](/reference/restful/list-cloud-regions-v2) 操作を呼び出します。

- `cuType`: クラスターのタイプ。有効な値：パフォーマンス最適化済み、容量最適化済み、および Tiered-storage。

- `cuSize`: クラスターに使用されるクエリ CU の数。値の範囲：1 から 256。

詳細については、[専用クラスターの作成](/reference/restful/create-dedicated-cluster-v2) を参照してください。

</TabItem>

</Tabs>

## 暗号化されたクラスターの作成\{#create-an-encrypted-cluster}

暗号化されたクラスターを作成するには、少なくとも 1 つの顧客管理暗号化キー (CMEK) を Zilliz Cloud に追加する必要があります。詳細については、[データ暗号化用の顧客管理キー](./cmek) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>専用</strong> クラスターでのみ利用可能です。</p>

</Admonition>

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加したら、以下の手順で暗号化されたクラスターを作成できます。

<Procedures>

1. **デプロイオプションの選択** セクションで **専用** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **CMEK による保存時の暗号化** を有効にし、既存の KMS キーを選択します。選択できるのは、作成するクラスターと同じリージョンにある KMS キーのみです。

1. 概要を確認し、**クラスターの作成** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **概要** ページには、上図に示すようにクラスター名の右側にキーのアイコンが表示されます。暗号化されたクラスター内で作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

## よくある質問\{#faq}

**クラスター作成時に Milvus のバージョンを指定できますか？**

いいえ。Zilliz Cloud は、サポートされている最新の Milvus バージョンでクラスターを自動的にプロビジョニングし、管理されたローリングアップグレードを通じて最新の状態に保ちます。特定のバージョンが必要な場合は、[サポートにお問い合わせ](https://support.zilliz.com/hc/en-us/requests/new) いただき、ユースケースについて説明してください。