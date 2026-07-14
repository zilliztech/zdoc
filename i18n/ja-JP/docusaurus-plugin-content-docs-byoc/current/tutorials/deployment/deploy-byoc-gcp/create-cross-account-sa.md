---
title: "クロスアカウントサービスアカウントを作成する | BYOC"
slug: /create-cross-account-sa
sidebar_label: "クロスアカウントサービスアカウントを作成する"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud がプロジェクトのデータプレーンをブートストラップするためのクロスアカウントサービスアカウントを作成および設定する方法について説明します。このサービスアカウントは、Zilliz Cloud に代行で VPC リソースを管理するために必要な権限を付与します。 | BYOC"
type: origin
token: GeaswUCLVi04xQkLl4vc7cbdnVh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クロスアカウントサービスアカウントを作成する

このページでは、Zilliz Cloud がプロジェクトのデータプレーンをブートストラップするためのクロスアカウントサービスアカウントを作成および設定する方法について説明します。このサービスアカウントは、Zilliz Cloud に代行で VPC リソースを管理するために必要な権限を付与します。

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## Procedures\{#procedures}

Google Cloud Platform (GCP) ダッシュボードを使用して EKS ロールを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト向けインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### Step 1: custom role を作成する\{#step-1-create-custom-roles}

クロスアカウントサービスアカウントを作成する前に、サービスアカウントに割り当てる必要がある複数の custom role を作成する必要があります。

#### instance group manager custom role を作成する\{#create-an-instance-group-manager-custom-role}

instance group manager custom role を作成し、その custom role を上で作成したサービスアカウントに割り当てることで、サービスアカウントが GKE ノードを管理するために必要な最小限の権限を持つようにします。

<Supademo id="cmbgb65fo4klnsn1rfs4be7qd" title=""  />

instance group manager custom role を作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **IAM & Admin** を探してクリックします。

1. 左側のナビゲーションペインで **Roles** を選択します。

1. **Create role** をクリックします。

1. 作成する custom role の title と description を設定します。

    このデモでは、**Zilliz Cloud Custom Role for GKE Management** を使用できます。

1. **Role launch stage** を **Alpha** から **General Availability** に変更します。

1. **Add permissions** をクリックします。この手順で追加する権限は次のとおりです。

    - **compute.instanceGroupManagers.get**

    - **compute.instanceGroupManagers.update**

1. **Create** をクリックします。

</Procedures>

#### IAM custom role を作成する\{#create-an-iam-custom-role}

IAM custom role を作成し、その custom role を上で作成したサービスアカウントに割り当てることで、サービスアカウントが IAM ポリシーを管理するために必要な最小限の権限を持つようにします。

<Supademo id="cmbri7b73cdexsn1r99xrvvfd" title=""  />

custom role を作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **IAM & Admin** を探してクリックします。

1. 左側のナビゲーションペインで **Roles** を選択します。

1. **Create role** をクリックします。

1. 作成する custom role の title と description を設定します。

    このデモでは、**IAM custom role** を使用できます。

1. **Role launch stage** を **Alpha** から **General Availability** に変更します。

1. **Add permissions** をクリックします。この手順で追加する権限は次のとおりです。

    - **iam.serviceAccounts.getIamPolicy**

    - **iam.serviceAccounts.setIamPolicy**

1. **Create** をクリックします。

</Procedures>

### Step 2: サービスアカウントを作成する\{#step-2-create-a-service-account}

この手順では、Zilliz Cloud が代行で VPC リソースを管理するためのサービスアカウントを作成し、そのサービスアカウントのメールアドレスを Zilliz Cloud コンソールに貼り戻します。

<Supademo id="cmc1pq4ikjo9nsn1rzuxbs1p0" title=""  />

サービスアカウントを作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **IAM & Admin** を探してクリックします。

1. 左側のナビゲーションペインで **Service Accounts** を選択します。

1. **Create service account** をクリックします。

1. 作成するサービスアカウントに適切な名前を設定します。

    このデモでは、`your-org-cross-account-sa` に設定できます。サービスアカウント ID は、サービスアカウント名の先頭 18 文字です。適切な値に手動で設定できます。

1. **Create and continue** をクリックします。

1. **Permissions** セクションで、前の手順で作成した custom role と、いくつかの GCP 管理ロールをサービスアカウントに追加します。

    次の表に、サービスアカウントに割り当てるロールを示します。

    | Role | Type | Condition |
    | --- | --- | --- |
    | [Instance group manager custom role](./create-cross-account-sa) | Custom | `resource.name.extract("projects/<name>").startsWith("PROJECT_ID") &&resource.name.extract("zones/<name>").startsWith("REGION") &&resource.name.extract("instanceGroupManagers/<name>").startsWith("gke-CLUSTER_NAME")` |
    | [IAM custom role](./create-cross-account-sa) | Custom | `api.getAttribute("iam.googleapis.com/modifiedGrantsByRole", []).hasOnly(["roles/iam.workloadIdentityUser"])` |
    | Kubernetes Engine Admin | GCP-managed | N/A |
    | Storage Object Viewer | GCP-managed | `resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")` |

    <Admonition type="info" icon="📘" title="注意">

    上記の式内にある 3 つのプレースホルダーを実際の値に置き換える必要があります。
    
    - `PROJECT_ID`
    
        これは GCP project ID です。
    
    - `REGION`
    
        これは BYOC プロジェクトの cloud region です。
    
    - `CLUSTER_NAME`
    
        これは、Zilliz Cloud が代行で作成する GKE cluster の名前です。 
    
        Google Cloud は cluster 名の前に `gke-` というプレフィックスを追加する点に注意してください。したがって、条件内では `gke-` プレフィックスをそのまま保持し、`CLUSTER_NAME` のみを実際の名前に置き換えてください。
    
    - `YOUR_BUCKET_NAME` 
    
        これは前の手順で作成した bucket の名前です。

    </Admonition>

1. **Save** をクリックします。

</Procedures>

#### 他のサービスアカウントへのアクセスを付与する\{#grant-access-to-other-service-accounts}

前の手順で作成したクロスアカウントサービスアカウントに、他のいくつかのサービスアカウントへのアクセス権を付与します。

<Supademo id="cmbq9hdfjbatwsn1rv37dqcnr" title=""  />

以下の手順に従って、これらのサービスアカウントへのアクセス権をクロスアカウントサービスアカウントに付与してください。

<Procedures>

1. GCP コンソールで **Service Account** を探してクリックします。

1. リスト内で次のサービスアカウントを見つけてクリックします。

    |  | Description |
    | --- | --- |
    | `PROJECT_NUMBER-compute@developer.gserviceaccount.com` | このサービスアカウントは、Compute Engine API を有効にすると自動的に作成されます。 |

    <Admonition type="info" icon="📘" title="注意">

    GCP project には project ID と project number があります。project ID は GCP コンソールで project を作成するときに入力した文字列であり、project number は作成時に GCP が project に割り当てる文字列です。
    
    `PROJECT_NUMBER` はご自身の GCP project number に置き換える必要があります。

    </Admonition>

1. **Principals with access** タブに切り替え、**Grant access** をクリックします。

1. **Add principals** > **New principals** に、前の手順で作成したクロスアカウントサービスアカウントを入力します。

1. **Assign roles** > **Role** で **Service Account User** を選択します。

</Procedures>

#### Zilliz Cloud のサービスアカウントを impersonate する\{#impersonate-zilliz-clouds-service-account}

前の手順で作成したクロスアカウントサービスアカウントが、Zilliz Cloud コンソールで提供される Zilliz Cloud のサービスアカウントを impersonate できるようにします。

<Supademo id="cmbhbv9xj5iuasn1rj0od2qzt" title=""  />

Zilliz Cloud が提供するサービスアカウントを impersonate する手順は次のとおりです。

<Procedures>

1. Zilliz Cloud コンソールで、Zilliz Cloud が提供するサービスアカウントをコピーします。

1. GCP コンソールに移動し、**IAM & Admin** を探してクリックします。

1. 左側のナビゲーションペインで **Service Accounts** を選択します。

1. クロスアカウントサービスアカウントを絞り込み、その名前をクリックして詳細を表示します。

1. **Principals with access** タブに切り替え、**Grant access** をクリックします。

1. Zilliz Cloud コンソールからコピーしたサービスアカウントを **Add principals** > **New principals** に貼り付けます。

1. **Assign roles** > **Role** で **Service Account Token Creator** を選択します。

1. **Save** をクリックします。

</Procedures>
