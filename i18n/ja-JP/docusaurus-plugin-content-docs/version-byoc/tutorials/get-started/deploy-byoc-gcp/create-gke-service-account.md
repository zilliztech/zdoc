---
title: "GKEサービスアカウントを作成する | BYOC"
slug: /create-gke-service-account
sidebar_label: "GKEサービスアカウントを作成する"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz CloudプロジェクトにGoogle Kubernetes Engine（GKE）クラスターをデプロイするために、Zilliz Cloudのサービスアカウントを作成して設定する方法について説明します。 | BYOC"
type: origin
token: JkXDwmB2QijMfvkLoWEclz9Nnbe
sidebar_position: 2
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# GKEサービスアカウントを作成する

このページでは、Zilliz CloudプロジェクトにGoogle Kubernetes Engine（GKE）クラスターをデプロイするために、Zilliz Cloudのサービスアカウントを作成して設定する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## 手続き{#procedure}

Google Cloud Platform(GCP)ダッシュボードを使用してEKSロールを作成することができます。また、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをGCP上でブートストラップすることもできます。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。

<Supademo id="cmc1oadayjm7fsn1rqyu2h33u" title=""  />

サービスアカウントを作成する手順は次のとおりです。

1. GCPコンソールで、**IAM&Admin**を見つけてクリックしてください。

1. 左のナビゲーションペインで**サービスアカウント**を選択してください。

1. 「サービスアカウントの作成」をクリックしてください。

1. 作成するサービスアカウントの適切な名前を設定します。

    このデモでは、`your-org-gke-node-sa`に設定できます。サービスアカウントIDは、サービスアカウント名の最初の18文字である必要があります。手動で適切な値に設定できます。

1. 「作成して続行」をクリックしてください。

1. 「権限」セクションで、「役割の選択」ドロップダウンリストから「Kubernetes Engineのデフォルトノードサービスアカウント」を選択してください。

1. 「IAM条件を追加」をクリックし、条件のタイトルを設定し、条件式を「条件エディタ」に入力してください。条件は以下の通りです:

    ```json
    resource.name.startsWith("projects/PROJECT_ID/locations/REGION/clusters/CLUSTER_NAME")
    ```

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

    </Admonition>

1. 「保存」をクリックしてください。

1. 設定された権限を付与するために、再度Cilck**Save**を実行してください。

