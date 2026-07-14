---
title: "GKE サービスアカウントの作成 | BYOC"
slug: /create-gke-service-account
sidebar_label: "GKE サービスアカウントの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プロジェクト用の Google Kubernetes Engine (GKE) クラスターを Zilliz Cloud がデプロイできるようにするためのサービスアカウントの作成と設定方法について説明します。 | BYOC"
type: origin
token: JkXDwmB2QijMfvkLoWEclz9Nnbe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# GKE サービスアカウントの作成

このページでは、Zilliz Cloud プロジェクト用の Google Kubernetes Engine (GKE) クラスターを Zilliz Cloud がデプロイできるようにするためのサービスアカウントの作成と設定方法について説明します。

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法と実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## 手順\{#procedure}

Google Cloud Platform (GCP) ダッシュボードを使用して EKS ロールを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト向けインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

<Supademo id="cmc1oadayjm7fsn1rqyu2h33u" title=""  />

サービスアカウントを作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **IAM & Admin** を見つけてクリックします。

1. 左側のナビゲーションペインで **Service Accounts** を選択します。

1. **Create service account** をクリックします。

1. 作成するサービスアカウントに適切な名前を設定します。

    このデモでは、`your-org-gke-node-sa` に設定できます。サービスアカウント ID はサービスアカウント名の先頭 18 文字にする必要があります。適切な値に手動で設定できます。

1. **Create and continue** をクリックします。

1. **Permissions** セクションで、**Select a role** ドロップダウンリストから **Kubernetes Engine Default Node Service Account** を選択します。

1. **Add IAM condition** をクリックし、条件タイトルを設定して、**Condition editor** に条件式を入力します。条件は次のとおりです。

    ```json
    resource.name.startsWith("projects/PROJECT_ID/locations/REGION/clusters/CLUSTER_NAME")
    ```

    <Admonition type="info" icon="📘" title="注意">

    上記の式にある 3 つのプレースホルダーは実際の値に置き換える必要があります。
    
    - `PROJECT_ID`
    
        これは GCP プロジェクト ID です。
    
    - `REGION`
    
        これは BYOC プロジェクトのクラウドリージョンです。
    
    - `CLUSTER_NAME`
    
        これは Zilliz Cloud がお客様に代わって作成する GKE クラスターの名前です。

    </Admonition>

1. **Save** をクリックします。

1. 設定した権限を付与するために、もう一度 **Save** をクリックします。

</Procedures>
