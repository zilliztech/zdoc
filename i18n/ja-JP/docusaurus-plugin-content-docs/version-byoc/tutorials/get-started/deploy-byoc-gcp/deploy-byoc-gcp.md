---
title: "GCPでBYOCをデプロイする | BYOC"
slug: /deploy-byoc-gcp
sidebar_label: "GCPでBYOCをデプロイする"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz CloudコンソールとカスタムGCP設定を使用して、Google Cloud Platform（GCP）のVirtual Private Cloud（VPC）にフルマネージドBring-Your-Own-Cloud（BYOC）データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: KmYgwHNOFiPQ9sk4bSDcMuIHnjC
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database

---

import Admonition from '@theme/Admonition';


# GCPでBYOCをデプロイする

このページでは、Zilliz CloudコンソールとカスタムGCP設定を使用して、Google Cloud Platform（GCP）のVirtual Private Cloud（VPC）にフルマネージドBring-Your-Own-Cloud（BYOC）データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## 前提条件{#prerequisites}

- あなたはBYOC組織のオーナーでなければなりません。

- [必要なGCP APIサービス](./required-api-services-gcp)を有効にしました。

## 手続き{#procedure}

GCP上でBYOCを展開するには、Zilliz Cloudは、お客様が管理するVPC内のCloud StorageバケットとGKEクラスタにアクセスするための特定の役割を担う必要があります。そのため、Zilliz Cloudは、Cloud Storageバケット、GKEクラスタ、VPCに関する情報と、これらのインフラストラクチャリソースにアクセスするために必要な役割を収集する必要があります。

BYOC組織内で、**プロジェクトの作成とデータプレーンのデプロイ**ボタンをクリックしてデプロイを開始してください。

![Cl50bi7eVoxSoHxk4jrcclh6n5O](/img/Cl50bi7eVoxSoHxk4jrcclh6n5O.png)

### ステップ1:プロジェクトを作成する{#step-1-create-a-project}

このステップでは、Zilliz BYOCプロジェクト名を設定し、クラウドプロバイダーとリージョンを決定し、デプロイの初期プロジェクト体格を決定する必要があります。

![S3a5behpSoDdj5xrphzcjoYdnEe](/img/S3a5behpSoDdj5xrphzcjoYdnEe.png)

1. **Zilliz BYOCプロジェクト名**を設定してください。

1. 「クラウドプロバイダー」と「クラウドリージョン」を選択してください。

1. **GCP Private Service Connect**を有効にするかどうかを決定してください。

    このオプションを有効にすると、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用のプライベートサービス接続エンドポイントを作成する必要があります。

1. **アーキテクチャ**でアプリケーションに合ったアーキテクチャタイプを選択してください。 

    使用するZilliz BYOCイメージのアーキテクチャタイプを決定します。利用可能なオプションはX 86とARMです。

1. **リソース設定**で、あなたはする必要があります

    1. **オートスケーリング**を有効または無効にすると、Zilliz Cloudがプロジェクトのワークロードに基づいて定義された範囲内でEC 2インスタンスの数を自動的に調整し、リソースの効率的な使用を確保できます。

    1. **初期プロジェクトサイズ**を設定します。 

        BYOCプロジェクトでは、検索サービス、その他のデータベースコンポーネント、およびコアサポートサービスは、異なるGoogle Compute Engine（GCE）インスタンスを使用します。これらのサービスやコンポーネントのインスタンスタイプを設定できます。 

        「オートスケーリング」が無効になっている場合は、対応する「カウント」フィールドに各プロジェクトコンポーネントに必要なGCEインスタンスの数を指定してください。

        ![SKYfbLW76oEudZxyng2cT2Xmnsh](/img/SKYfbLW76oEudZxyng2cT2Xmnsh.png)

        「オートスケーリング」が有効になったら、Zilliz Cloudが実際のプロジェクトのワークロードに基づいてGCEインスタンスの数を自動的にスケーリングする範囲を指定する必要があります。これには、対応する「最小」と「最大」のフィールドを設定します。

        ![GjUvb2NGwoenR7xqxvSccaMdnMc](/img/GjUvb2NGwoenR7xqxvSccaMdnMc.png)

        リソース設定を容易にするために、4つの定義済みプロジェクト体格オプションがあります。次の表は、これらのプロジェクト体格オプションとプロジェクトで作成できるクラスターの数、およびこれらのクラスターに含めることができるエンティティの数とのマッピングを示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスタ数</p></th>
             <th colspan="2"><p>エンティティの最大数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimizedCU</p></td>
             <td><p>容量最適化されたCU</p></td>
           </tr>
           <tr>
             <td><p>小さい</p></td>
             <td><p>8～16個のCUを持つ3つのクラスタ</p></td>
             <td><p>10百万-25百万の</p></td>
             <td><p>40ミリオン-80ミリオン</p></td>
           </tr>
           <tr>
             <td><p>ミディアム</p></td>
             <td><p>16から64個のCUを持つ7つのクラスタ</p></td>
             <td><p>25ミリオン-100ミリオン</p></td>
             <td><p>80百万-350百万の</p></td>
           </tr>
           <tr>
             <td><p>大きい</p></td>
             <td><p>64～192 CUの12クラスタ</p></td>
             <td><p>100ミリオン-300ミリオン</p></td>
             <td><p>350ミリオン-10億</p></td>
           </tr>
           <tr>
             <td><p>Xラージ</p></td>
             <td><p>192～576 CUの17クラスタ</p></td>
             <td><p>300ミリオン-900ミリオン</p></td>
             <td><p>10億から30億</p></td>
           </tr>
        </table>

        「初期プロジェクトサイズ」で「カスタム」を選択し、すべてのデータプレーンコンポーネントのGCEインスタンスタイプとカウントを調整することで、設定をカスタマイズすることもできます。お好みのGCEインスタンスタイプがリストされていない場合は、[Zillizサポートに連絡する](https://zilliz.com/contact)を使用して詳細を確認してください。 

1. 資格情報を設定するには、**次へ**をクリックしてください。

### ステップ2:資格情報を設定する{#step-2-set-up-credentials}

**資格情報設定**では、ストレージアクセス、GKEクラスター管理、およびデータプレーン展開のために、ストレージと複数のサービスアカウントを設定する必要があります。

![BbOOboWZAo5eu2xplJWcXyLonph](/img/BbOOboWZAo5eu2xplJWcXyLonph.png)

1. **Google Cloud PlatformプロジェクトID**に、GCPプロジェクトのIDを入力してください。

1. ストレージ設定で、GCPから取得したバケット名とサービスアカウントのメールアドレスを設定してください。 

    Zilliz Cloudは、指定されたバケットをデータプレーンストレージとして使用し、指定されたサービスアカウントを使用してあなたの代わりにアクセスします。

    Bucketの設定やサービスアカウントの作成については、[クラウドストレージバケットとサービスアカウントを作成する](./create-bucket-and-service-account)を参照してください。

1. **GKE設定**で、GKE管理のために**GKEクラスター名**と**サービスアカウントメール**を設定してください。 

    Zilliz Cloudは、指定されたサービスアカウントを使用して、指定された名前のGKEクラスターをデプロイし、データプレーンをGKEクラスターにデプロイします。

    サービスアカウントの作成方法については、[GKEサービスアカウントを作成する](./create-gke-service-account)を参照してください。

1. 「クロスアカウント設定」で、データプレーン展開のために「サービスアカウント名」を設定してください。

    サービスアカウントの準備ができたら、下の読み取り専用テキストボックスに記載されているZilliz BYOCプリンシパルをコピーしてGCPコンソールに貼り付け、Zilliz Cloud BYOCプロジェクトのデータプレーンをデプロイするために必要な権限をZilliz BYOCに付与します。

    クロスアカウントサービスアカウントの作成の詳細については、[クロスアカウントサービスアカウントを作成する](./create-cross-account-sa)を参照してください。

1. ネットワーク設定を構成するには、**次へ**をクリックしてください。

### ステップ3:ネットワーク設定を構成する{#step-3-configure-network-settings}

**ネットワーク設定**で、VPCとサブネット名、オプションのプライベートサービス接続エンドポイントなど、いくつかの種類のリソースを作成してください。

![YVPNbLCjOoCkDTx9TEMcbV9LnPd](/img/YVPNbLCjOoCkDTx9TEMcbV9LnPd.png)

1. 「ネットワーク設定」で、「VPC名」、「サブネット名」、およびオプションの「プライベートサービス接続エンドポイント」を設定してください。

    指定されたVPCでは、Zilliz Cloudが必要です。 

    - 2つのセカンダリサブネットを持つプライマリサブネット、

    - ロードバランサーサブネット、および

    - オプションのPrivate Service Connectエンドポイント。

    上記の「一般設定」で「GCP Private Service Connect」をオンにすると、「Private Service Connect Endpoint」が利用可能になります。 

1. サマリーを表示するには、**次へ**をクリックしてください。

1. **Deployment Summary**で、構成設定を確認してください。

1. すべてが予想通りであれば、**作成**をクリックしてください。

## デプロイの詳細を表示する{#view-deployment-details}

プロジェクトを作成したら、プロジェクトページでステータスを閲覧可能です。

![DS61bOBm9oC0b1xdLT9cuEUsnmh](/img/DS61bOBm9oC0b1xdLT9cuEUsnmh.png)

## 一時停止と再開{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、プロジェクトをサポートするGKEクラスターに関連付けられているすべてのGCEインスタンスが終了します。このアクションは、プロジェクト内の一時停止されたZilliz Cloudクラスターには影響しません。データプレーンが復元されたら再開できます。

![YC2YbM9oyo6IcUxDQ5Bc3AzDnPc](/img/YC2YbM9oyo6IcUxDQ5Bc3AzDnPc.png)

実行中のプロジェクトを一時停止できるのは、プロジェクトにクラスターがない場合、またはすべてのクラスターがすでに一時停止されている場合のみです。

![SVLQbgURIoRqHBx2tWwc5caWnx7](/img/SVLQbgURIoRqHBx2tWwc5caWnx7.png)

プロジェクトカードのステータスタグが「一時停止」と表示されると、プロジェクト内のクラスターを操作することはできません。そのような場合は、「再開」をクリックしてプロジェクトを再開できます。ステータスタグが再び「実行中」に変わったら、プロジェクト内のクラスターを操作し続けることができます。

![EQKqbumOxoT1tVxw1ZRcZahXnDd](/img/EQKqbumOxoT1tVxw1ZRcZahXnDd.png)

## 手続き{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />