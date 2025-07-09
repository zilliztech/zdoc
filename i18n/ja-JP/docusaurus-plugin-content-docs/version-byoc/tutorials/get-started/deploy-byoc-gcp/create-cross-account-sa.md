---
title: "クロスアカウントサービスアカウントを作成する | BYOC"
slug: /create-cross-account-sa
sidebar_label: "クロスアカウントサービスアカウントを作成する"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、プロジェクトデータプレーンをブートストラップするために、Zilliz Cloudのクロスアカウントサービスアカウントを作成および設定する方法について説明します。このサービスアカウントは、Zilliz CloudにVPCリソースを管理するために必要な権限を付与します。 | BYOC"
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
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クロスアカウントサービスアカウントを作成する

このページでは、プロジェクトデータプレーンをブートストラップするために、Zilliz Cloudのクロスアカウントサービスアカウントを作成および設定する方法について説明します。このサービスアカウントは、Zilliz CloudにVPCリソースを管理するために必要な権限を付与します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## 手続き{#procedures}

Google Cloud Platform(GCP)ダッシュボードを使用してEKSロールを作成することができます。また、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをGCP上でブートストラップすることもできます。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。

### ステップ1:カスタムロールを作成する{#step-1-create-custom-roles}

クロスアカウントサービスアカウントを作成する前に、サービスアカウントに割り当てる必要のあるカスタムロールをいくつか作成する必要があります。

#### インスタンスグループマネージャーのカスタムロールを作成する{#create-an-instance-group-manager-custom-role}

インスタンスグループマネージャーのカスタムロールを作成し、上記で作成したサービスアカウントにカスタムロールを割り当てて、サービスアカウントがGKEノードを管理するために必要な最小限の権限を持つようにします。

<Supademo id="cmbgb65fo4klnsn1rfs4be7qd" title=""  />

インスタンスグループマネージャーのカスタムロールを作成する手順は次のとおりです。

1. GCPコンソールで、**IAM&Admin**を見つけてクリックしてください。

1. 左のナビゲーションペインから**役割**を選択してください。

1. 「役割の作成」をクリックしてください。

1. 作成するカスタムロールのタイトルと説明を設定します。

    このデモでは、**Zilliz Cloud Custom Role for GKE Management**を使用できます。

1. **ロールのローンチステージ**を**アルファ**から**一般提供**に変更してください。

1. 「権限を追加」をクリックしてください。このステップで追加する権限は以下の通りです:

    - **計算instanceGroupManagers. get**

    - コンピュートinstanceGroupManagersアップデート

1. 「作成」をクリックしてください。

#### IAMカスタムロールを作成する{#create-an-iam-custom-role}

IAMカスタムロールを作成し、上記で作成したサービスアカウントにカスタムロールを割り当てて、サービスアカウントがIAMポリシーを管理するために必要な最小限の権限を持つようにします。

<Supademo id="cmbri7b73cdexsn1r99xrvvfd" title=""  />

カスタムロールを作成する手順は次のとおりです。

1. GCPコンソールで、**IAM&Admin**を見つけてクリックしてください。

1. 左のナビゲーションペインから**役割**を選択してください。

1. 「役割の作成」をクリックしてください。

1. 作成するカスタムロールのタイトルと説明を設定します。

    このデモでは、**IAMカスタムロール**を使用できます。

1. **ロールのローンチステージ**を**アルファ**から**一般提供**に変更してください。

1. 「権限を追加」をクリックしてください。このステップで追加する権限は以下の通りです:

    - **iam. serviceAccounts.getIamPolicyの**

    - iam. serviceAccounts.setIamPolicyの設定

1. 「作成」をクリックしてください。

### ステップ2:サービスアカウントを作成する{#step-2-create-a-service-account}

このステップでは、VPCリソースを管理するためのZilliz Cloudのサービスアカウントを作成し、サービスアカウントのメールアドレスをZilliz Cloudコンソールに貼り付けます。

<Supademo id="cmc1pq4ikjo9nsn1rzuxbs1p0" title=""  />

サービスアカウントを作成する手順は次のとおりです。

1. GCPコンソールで、**IAM&Admin**を見つけてクリックしてください。

1. 左のナビゲーションペインで**サービスアカウント**を選択してください。

1. 「サービスアカウントの作成」をクリックしてください。

1. 作成するサービスアカウントの適切な名前を設定します。

    このデモでは、`your-org-cross-account-sa`に設定できます。サービスアカウントIDは、サービスアカウント名の最初の18文字です。手動で適切な値に設定できます。

1. 「作成して続行」をクリックしてください。

1. 「権限」セクションで、前の手順で作成したカスタムロールといくつかのGCP管理ロールをサービスアカウントに追加してください。

    次の表に、サービスアカウントに割り当てるロールを示します。

    <table>
       <tr>
         <th><p>役割</p></th>
         <th><p>タイプ</p></th>
         <th><p>コンディション</p></th>
       </tr>
       <tr>
         <td><p><a href="./create-cross-account-sa">インスタンスグループマネージャーのカスタムロール</a></p></td>
         <td><p>カスタム</p></td>
         <td><p>インラインコードプレースホルダー0</p></td>
       </tr>
       <tr>
         <td><p><a href="./create-cross-account-sa">IAMカスタムロール</a></p></td>
         <td><p>カスタム</p></td>
         <td><p>インラインコードプレースホルダー0</p></td>
       </tr>
       <tr>
         <td><p>Kubernetesエンジンの管理</p></td>
         <td><p>GCPマネージド</p></td>
         <td><p>N/A</p></td>
       </tr>
       <tr>
         <td><p>ストレージオブジェクトビューアー</p></td>
         <td><p>GCPマネージド</p></td>
         <td><p>インラインコードプレースホルダー0</p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="ノート">

    <p>上記の式の3つのプレースホルダを実際の値に置き換える必要があります。</p>
    <ul>
    <li>インラインコードプレースホルダー0</li>
    </ul>
    <p>これがGCPプロジェクトIDです。</p>
    <ul>
    <li>インラインコードプレースホルダー0</li>
    </ul>
    <p>これはあなたのBYOCプロジェクトのクラウドリージョンである必要があります。</p>
    <ul>
    <li>インラインコードプレースホルダー0</li>
    </ul>
    <p>これは、Zilliz Cloudがあなたの代わりに作成するGKEクラスターの名前である必要があります。</p>
    <ul>
    <li>インラインコードプレースホルダー0 </li>
    </ul>
    <p>これは前のステップで作成したバケットの名前である必要があります。</p>

    </Admonition>

1. 「保存」をクリックしてください。

#### 他のサービスアカウントへのアクセスを許可する{#grant-access-to-other-service-accounts}

前の手順で作成したクロスアカウントサービスアカウントに、他の複数のサービスアカウントへのアクセスを許可します。

<Supademo id="cmbq9hdfjbatwsn1rv37dqcnr" title=""  />

以下の手順に従って、クロスアカウントサービスアカウントにこれらのサービスアカウントへのアクセスを許可します。

1. GCPコンソールで、**サービスアカウント**を見つけてクリックしてください。

1. リストで次のサービスアカウントを見つけてクリックしてください。

    <table>
       <tr>
         <th></th>
         <th><p>説明する</p></th>
       </tr>
       <tr>
         <td><p>インラインコードプレースホルダー0</p></td>
         <td><p>Compute Engine APIを有効にすると、このサービスアカウントが自動的に作成されます。</p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="ノート">

    <p>GCPプロジェクトには、プロジェクトIDとプロジェクト番号があります。プロジェクトIDは、GCPコンソールでプロジェクトを作成する際に入力した文字列です。プロジェクト番号は、GCPがプロジェクトを作成する際に割り当てる文字列です。</p>
    <p><code>PROJECT_NUMBER</code>を自分のGCPプロジェクト番号に置き換える必要があります。</p>

    </Admonition>

1. 「アクセス権を持つプリンシパル」タブに切り替え、「アクセス権を付与」をクリックしてください。

1. 前の手順で作成したクロスアカウントサービスアカウントを**プリンシパルの追加**>**新しいプリンシパル**に入力してください。

1. 「役割の割り当て」>「役割」で「サービスアカウントユーザー」を選択してください。

#### Zilliz Cloudのサービスアカウントを偽装する{#impersonate-zilliz-clouds-service-account}

Zilliz Cloudコンソールで提供されるZilliz Cloudのサービスアカウントを偽装するためのクロスアカウントサービスアカウントがあります。

<Supademo id="cmbhbv9xj5iuasn1rj0od2qzt" title=""  />

Zilliz Cloudが提供するサービスアカウントを偽装する手順は以下の通りです:

1. Zilliz Cloudコンソールで、Zilliz Cloudが提供するサービスアカウントをコピーしてください。

1. GCPコンソールに移動し、**IAM&Admin**を見つけてクリックしてください。

1. 左のナビゲーションペインで**サービスアカウント**を選択してください。

1. クロスアカウントサービスアカウントをフィルターし、その名前をクリックして詳細を表示します。

1. 「アクセス権を持つプリンシパル」タブに切り替え、「アクセス権を付与」をクリックしてください。

1. Zilliz Cloudコンソールからコピーしたサービスアカウントを**プリンシパルの追加**>**新しいプリンシパル**に貼り付けます。

1. 「役割の割り当て」>「役割」で「サービスアカウントトークン作成者」を選択してください。

1. 「保存」をクリックしてください。

