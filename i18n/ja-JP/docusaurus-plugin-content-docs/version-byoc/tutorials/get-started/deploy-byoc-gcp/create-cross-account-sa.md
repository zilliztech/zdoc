---
title: "クロスアカウントサービスアカウントの作成 | BYOC"
slug: /create-cross-account-sa
sidebar_label: "クロスアカウントサービスアカウントの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud がプロジェクトデータプレーンをブートストラップするためのクロスアカウントサービスアカウントを作成および構成する方法について説明します。このサービスアカウントにより、Zilliz Cloud は代理で VPC リソースを管理するための必要な権限を付与されます。 | BYOC"
type: origin
token: GeaswUCLVi04xQkLl4vc7cbdnVh
sidebar_position: 3
keywords:
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クロスアカウントサービスアカウントの作成

このページでは、Zilliz Cloud がプロジェクトデータプレーンをブートストラップするためのクロスアカウントサービスアカウントを作成および構成する方法について説明します。このサービスアカウントにより、Zilliz Cloud は代理で VPC リソースを管理するための必要な権限を付与されます。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## 手順\{#procedures}

Google Cloud Platform (GCP) ダッシュボードを使用して EKS ロールを作成できます。別の方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

### ステップ1: カスタムロールを作成\{#step-1-create-custom-roles}

クロスアカウントサービスアカウントを作成する前に、サービスアカウントに割り当てる必要がある複数のカスタムロールを作成する必要があります。

#### インスタンスグループマネージャーカスタムロールを作成\{#create-an-instance-group-manager-custom-role}

インスタンスグループマネージャーカスタムロールを作成し、上記で作成したサービスアカウントにカスタムロールを割り当てることで、サービスアカウントが GKE ノードを管理するために最低限必要な権限を持つようにします。

<Supademo id="cmbgb65fo4klnsn1rfs4be7qd" title=""  />

インスタンスグループマネージャーカスタムロールを作成する手順は以下のとおりです：

1. GCP コンソールで、**IAM & Admin** を検索してクリックします。

1. 左側のナビゲーションペインから **ロール** を選択します。

1. **ロールを作成** をクリックします。

1. 作成するカスタムロールのタイトルと説明を設定します。

    このデモでは、**Zilliz Cloud カスタムロール for GKE Management** を使用できます。

1. **ロール起動ステージ** を **Alpha** から **一般提供** に変更します。

1. **権限を追加** をクリックします。このステップで追加する権限は以下のとおりです：

    - **compute.instanceGroupManagers.get**

    - **compute.instanceGroupManagers.update**

1. **作成** をクリックします。

#### IAM カスタムロールを作成\{#create-an-iam-custom-role}

IAM カスタムロールを作成し、上記で作成したサービスアカウントにカスタムロールを割り当てることで、サービスアカウントが IAM ポリシーを管理するために最低限必要な権限を持つようにします。

<Supademo id="cmbri7b73cdexsn1r99xrvvfd" title=""  />

カスタムロールを作成する手順は以下のとおりです：

1. GCP コンソールで、**IAM & Admin** を検索してクリックします。

1. 左側のナビゲーションペインから **ロール** を選択します。

1. **ロールを作成** をクリックします。

1. 作成するカスタムロールのタイトルと説明を設定します。

    このデモでは、**IAM カスタムロール** を使用できます。

1. **ロール起動ステージ** を **Alpha** から **一般提供** に変更します。

1. **権限を追加** をクリックします。このステップで追加する権限は以下のとおりです：

    - **iam.serviceAccounts.getIamPolicy**

    - **iam.serviceAccounts.setIamPolicy**

1. **作成** をクリックします。

### ステップ2: サービスアカウントを作成\{#step-2-create-a-service-account}

このステップでは、Zilliz Cloud が代理で VPC リソースを管理するためのサービスアカウントを作成し、サービスアカウントのメールアドレスを Zilliz Cloud コンソールに戻します。

<Supademo id="cmc1pq4ikjo9nsn1rzuxbs1p0" title=""  />

サービスアカウントを作成する手順は以下のとおりです：

1. GCP コンソールで、**IAM & Admin** を検索してクリックします。

1. 左側のナビゲーションペインで **サービスアカウント** を選択します。

1. **サービスアカウントを作成** をクリックします。

1. 作成するサービスアカウントに適切な名前を設定します。

    このデモでは、`your-org-cross-account-sa` に設定できます。サービスアカウントIDはサービスアカウント名の最初の18文字です。適切な値に手動で設定できます。

1. **作成して続行** をクリックします。

1. **権限** セクションで、前のステップで作成したカスタムロールと複数の GCP 管理ロールをサービスアカウントに追加します。

    以下の表は、サービスアカウントに割り当てるロールを示しています。

    <table>
       <tr>
         <th><p>ロール</p></th>
         <th><p>タイプ</p></th>
         <th><p>条件</p></th>
       </tr>
       <tr>
         <td><p><a href="./create-cross-account-sa">インスタンスグループマネージャーカスタムロール</a></p></td>
         <td><p>カスタム</p></td>
         <td><p><code>resource.name.extract("projects/&lt;name&gt;").startsWith("PROJECT_ID") &amp;&amp;resource.name.extract("zones/&lt;name&gt;").startsWith("REGION") &amp;&amp;resource.name.extract("instanceGroupManagers/&lt;name&gt;").startsWith("gke-CLUSTER_NAME")</code></p></td>
       </tr>
       <tr>
         <td><p><a href="./create-cross-account-sa">IAM カスタムロール</a></p></td>
         <td><p>カスタム</p></td>
         <td><p><code>api.getAttribute("iam.googleapis.com/modifiedGrantsByRole", []).hasOnly(["roles/iam.workloadIdentityUser"])</code></p></td>
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

    <p>上記の式の3つのプレースホルダーを実際の値に置き換える必要があります：</p>
    <ul>
    <li><code>PROJECT_ID</code></li>
    </ul>
    <p>これはあなたの GCP プロジェクトIDである必要があります。</p>
    <ul>
    <li><code>REGION</code></li>
    </ul>
    <p>これは BYOC プロジェクトのクラウドリージョンである必要があります。</p>
    <ul>
    <li><code>CLUSTER_NAME</code></li>
    </ul>
    <p>これは、Zilliz Cloud が代理で作成する GKE クラスターの名前である必要があります。</p>
    <p>Google Cloud はクラスター名の前にプレフィックス <code>gke-</code> を追加します。したがって、条件に <code>gke-</code> プレフィックスを維持し、<code>CLUSTER_NAME</code> を実際の名前に置き換える必要があります。</p>
    <ul>
    <li><code>YOUR_BUCKET_NAME</code></li>
    </ul>
    <p>これは、前のステップで作成したバケットの名前である必要があります。</p>

    </Admonition>

1. **保存** をクリックします。

#### 他のサービスアカウントへのアクセスを許可\{#grant-access-to-other-service-accounts}

前のステップで作成したクロスアカウントサービスアカウントに、他のいくつかのサービスアカウントへのアクセスを許可します。

<Supademo id="cmbq9hdfjbatwsn1rv37dqcnr" title=""  />

以下の手順に従って、クロスアカウントサービスアカウントにこれらのサービスアカウントへのアクセスを許可します。

1. GCP コンソールで、**サービスアカウント** を検索してクリックします。

1. リスト内の以下のサービスアカウントを検索してクリックします。

    <table>
       <tr>
         <th></th>
         <th><p>説明</p></th>
       </tr>
       <tr>
         <td><p><code>PROJECT_NUMBER-compute@developer.gserviceaccount.com</code></p></td>
         <td><p>これは、Compute Engine API を有効にしたときに自動的に作成されるサービスアカウントです。</p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="Notes">

    <p>GCP プロジェクトには、プロジェクトIDとプロジェクト番号があります：プロジェクトIDは GCP コンソールでプロジェクトを作成したときに入力した文字列であり、プロジェクト番号は GCP がプロジェクト作成時に割り当てた文字列です。</p>
    <p><code>PROJECT_NUMBER</code> を自分の GCP プロジェクト番号に置き換える必要があります。</p>

    </Admonition>

1. **アクセス権のあるプリンシパル** タブに切り替え、**アクセスを許可** をクリックします。

1. **プリンシパルを追加** > **新しいプリンシパル** に前のステップで作成したクロスアカウントサービスアカウントを入力します。

1. **ロールを割り当て** > **ロール** で **サービスアカウントユーザー** を選択します。

#### Zilliz Cloud のサービスアカウントを模倣\{#impersonate-zilliz-clouds-service-account}

Zilliz Cloud コンソールで提供された Zilliz Cloud のサービスアカウントを、クロスアカウントサービスアカウントで模倣させます。

<Supademo id="cmbhbv9xj5iuasn1rj0od2qzt" title=""  />

Zilliz Cloud が提供するサービスアカウントを模倣する手順は以下のとおりです：

1. Zilliz Cloud コンソールで、Zilliz Cloud が提供するサービスアカウントをコピーします。

1. GCP コンソールに移動し、**IAM & Admin** を検索してクリックします。

1. 左側のナビゲーションペインで **サービスアカウント** を選択します。

1. クロスアカウントサービスアカウントをフィルタリングし、その名前をクリックして詳細を表示します。

1. **アクセス権のあるプリンシパル** タブに切り替え、**アクセスを許可** をクリックします。

1. Zilliz Cloud コンソールからコピーしたサービスアカウントを **プリンシパルを追加** > **新しいプリンシパル** に貼り付けます。

1. **ロールを割り当て** > **ロール** で **サービスアカウントトークン作成者** を選択します。

1. **保存** をクリックします。
