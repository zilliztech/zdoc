---
title: "クロスアカウントサービスアカウントの作成 | BYOC"
slug: /create-cross-account-sa
sidebar_key: create-cross-account-sa
sidebar_label: "クロスアカウントサービスアカウントの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloud がプロジェクトのデータプレーンをブートストラップできるように、クロスアカウントサービスアカウントを作成および設定する方法について説明します。このサービスアカウントは、Zilliz Cloud に代わって VPC リソースを管理するために必要な権限を付与します。| BYOC"
type: origin
token: GeaswUCLVi04xQkLl4vc7cbdnVh
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - 権限
  - 最小権限
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クロスアカウントサービスアカウントの作成

このページでは、Zilliz Cloud がプロジェクトのデータプレーンをブートストラップできるように、クロスアカウントサービスアカウントを作成し構成する方法について説明します。このサービスアカウントは、Zilliz Cloud に対して VPC リソースを代行して管理するための必要な権限を付与します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>中です。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud の営業担当者</a>にお問い合わせください。</p>

</Admonition>

## 手順\{#procedures}

Google Cloud Platform (GCP) ダッシュボードを使用して EKS ロールを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用のインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: カスタムロールの作成\{#step-1-create-custom-roles}

クロスアカウントサービスアカウントを作成する前に、サービスアカウントに割り当てる必要があるいくつかのカスタムロールを作成する必要があります。

#### インスタンスグループマネージャーのカスタムロールの作成\{#create-an-instance-group-manager-custom-role}

インスタンスグループマネージャーのカスタムロールを作成し、上記で作成したサービスアカウントにこのカスタムロールを割り当てます。これにより、サービスアカウントは GKE ノードを管理するために必要な最小限の権限を持ちます。

<Supademo id="cmbgb65fo4klnsn1rfs4be7qd" title=""  />

インスタンスグループマネージャーのカスタムロールを作成する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**IAM と管理** を見つけてクリックします。

1. 左側のナビゲーションペインから**ロール**を選択します。

1. **ロールの作成**をクリックします。

1. 作成するカスタムロールのタイトルと説明を設定します。

    このデモでは、**Zilliz Cloud Custom ロール for GKE Management** を使用できます。

1. **ロールの起動段階**を**アルファ**から**一般提供**に変更します。

1. **権限の追加**をクリックします。このステップで追加する権限は以下の通りです。

    - **compute.instanceGroupManagers.get**

    - **compute.instanceGroupManagers.update**

1. **作成**をクリックします。

</Procedures>

#### IAM カスタムロールの作成\{#create-an-iam-custom-role}

IAM カスタムロールを作成し、上記で作成したサービスアカウントにこのカスタムロールを割り当てます。これにより、サービスアカウントは IAM ポリシーを管理するために必要な最小限の権限を持ちます。

<Supademo id="cmbri7b73cdexsn1r99xrvvfd" title=""  />

カスタムロールを作成する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**IAM と管理** を見つけてクリックします。

1. 左側のナビゲーションペインから**ロール**を選択します。

1. **ロールの作成**をクリックします。

1. 作成するカスタムロールのタイトルと説明を設定します。

    このデモでは、**IAM カスタムロール**を使用できます。

1. **ロールの起動段階**を**アルファ**から**一般提供**に変更します。

1. **権限の追加**をクリックします。このステップで追加する権限は以下の通りです。

    - **iam.serviceアカウントs.getIamPolicy**

    - **iam.serviceアカウントs.setIamPolicy**

1. **作成**をクリックします。

</Procedures>

### ステップ 2: サービスアカウントの作成\{#step-2-create-a-service-account}

このステップでは、Zilliz Cloud が代わりに VPC リソースを管理するためのサービスアカウントを作成し、そのサービスアカウントのメールアドレスを Zilliz Cloud コンソールに貼り付けます。

<Supademo id="cmc1pq4ikjo9nsn1rzuxbs1p0" title=""  />

サービスアカウントを作成する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**IAM と管理** を見つけてクリックします。

1. 左側のナビゲーションペインで**サービスアカウント**を選択します。

1. **サービスアカウントの作成**をクリックします。

1. 作成するサービスアカウントに適切な名前を設定します。

    このデモでは、`your-org-cross-account-sa` に設定できます。サービスアカウント ID はサービスアカウント名の最初の 18 文字です。適切な値を手動で設定できます。

1. **作成して続行**をクリックします。

1. **権限**セクションで、前のステップで作成したカスタムロールと、いくつかの GCP 管理ロールをサービスアカウントに追加します。

    以下の表は、サービスアカウントに割り当てるロールの一覧です。

    <table>
       <tr>
         <th><p>ロール</p></th>
         <th><p>タイプ</p></th>
         <th><p>条件</p></th>
       </tr>
       <tr>
         <td><p><a href="./create-cross-account-sa">インスタンスグループマネージャーのカスタムロール</a></p></td>
         <td><p>カスタム</p></td>
         <td><p><code>resource.name.extract("projects/&lt;name&gt;").startsWith("PROJECT_ID") &&resource.name.extract("zones/&lt;name&gt;").startsWith("REGION") &&resource.name.extract("instanceGroupManagers/&lt;name&gt;").startsWith("gke-CLUSTER_NAME")</code></p></td>
       </tr>
       <tr>
         <td><p><a href="./create-cross-account-sa">IAM カスタムロール</a></p></td>
         <td><p>カスタム</p></td>
         <td><p><code>api.getAttribute("iam.googleapis.com/modifiedGrantsByロール", []).hasOnly(["roles/iam.workloadIdentityUser"])</code></p></td>
       </tr>
       <tr>
         <td><p>Kubernetes Engine Admin</p></td>
         <td><p>GCP 管理</p></td>
         <td><p>N/A</p></td>
       </tr>
       <tr>
         <td><p>Storage Object Viewer</p></td>
         <td><p>GCP 管理</p></td>
         <td><p><code>resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")</code></p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="Notes">

    <p>上記の式にある 3 つのプレースホルダーを実際の値に置き換える必要があります。</p>
    <ul>
    <li><code>PROJECT_ID</code></li>
    </ul>
    <p>これはあなたの GCP プロジェクト ID である必要があります。</p>
    <ul>
    <li><code>REGION</code></li>
    </ul>
    <p>これはあなたの BYOC プロジェクトのクラウドリージョンである必要があります。</p>
    <ul>
    <li><code>CLUSTER_NAME</code></li>
    </ul>
    <p>これは Zilliz Cloud が代わりに作成する GKE クラスターの名前である必要があります。</p>
    <p>Google Cloud はクラスター名の前に <code>gke-</code> というプレフィックスを追加することに注意してください。したがって、条件には <code>gke-</code> プレフィックスを残したまま、<code>CLUSTER_NAME</code> の部分のみを実際の名前に置き換えてください。</p>
    <ul>
    <li><code>YOUR_BUCKET_NAME</code> </li>
    </ul>
    <p>これは前のステップで作成したバケットの名前である必要があります。</p>

    </Admonition>

1. **保存**をクリックします。

</Procedures>

#### 他のサービスアカウントへのアクセス権の付与\{#grant-access-to-other-service-accounts}

前のステップで作成したクロスアカウントサービスアカウントに、他のいくつかのサービスアカウントへのアクセス権を付与します。

以下の手順に従って、クロスアカウントサービスアカウントにこれらのサービスアカウントへのアクセス権を付与します。

<Supademo id="cmbq9hdfjbatwsn1rv37dqcnr" title=""  />

<Procedures>

1. GCP コンソールで、**サービスアカウント** を見つけてクリックします。

1. リストから以下のサービスアカウントを見つけてクリックします。

    <table>
       <tr>
         <th></th>
         <th><p>説明</p></th>
       </tr>
       <tr>
         <td><p><code>PROJECT_NUMBER-compute@developer.gserviceaccount.com</code></p></td>
         <td><p>このサービスアカウントは、Compute Engine API を有効にしたときに自動的に作成されます。</p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="Notes">

    <p>GCP プロジェクトにはプロジェクト ID とプロジェクト番号があります。プロジェクト ID は GCP コンソールでプロジェクトを作成する際に入力した文字列であり、プロジェクト番号はプロジェクト作成時に GCP によって割り当てられる文字列です。</p>
    <p><code>PROJECT_NUMBER</code> をご自身の GCP プロジェクト番号に置き換える必要があります。</p>

    </Admonition>

1. **アクセス権を持つプリンシパル**タブに切り替え、**アクセス権の付与**をクリックします。

1. **プリンシパルの追加** > **新しいプリンシパル**に、前のステップで作成したクロスアカウントサービスアカウントを入力します。

1. **ロールの割り当て** > **ロール**で**サービスアカウントユーザー**を選択します。

</Procedures>

#### Zilliz Cloud のサービスアカウントのなりすまし\{#impersonate-zilliz-clouds-service-account}

クロスアカウントサービスアカウントに、Zilliz Cloud コンソールで提供される Zilliz Cloud のサービスアカウントになりすます権限を付与します。

Zilliz Cloud が提供するサービスアカウントになりすます手順は以下の通りです。

<Supademo id="cmbhbv9xj5iuasn1rj0od2qzt" title=""  />

<Procedures>

1. Zilliz Cloud コンソールで、Zilliz Cloud が提供するサービスアカウントをコピーします。

1. GCP コンソールに移動し、**IAM と管理** を見つけてクリックします。

1. 左側のナビゲーションペインで**サービスアカウント**を選択します。

1. クロスアカウントサービスアカウントをフィルター処理し、その名前をクリックして詳細を表示します。

1. **アクセス権を持つプリンシパル**タブに切り替え、**アクセス権の付与**をクリックします。

1. Zilliz Cloud コンソールからコピーしたサービスアカウントを**プリンシパルの追加** > **新しいプリンシパル**に貼り付けます。

1. **ロールの割り当て** > **ロール**で**サービスアカウントトークン作成者**を選択します。

1. **保存**をクリックします。

</Procedures>