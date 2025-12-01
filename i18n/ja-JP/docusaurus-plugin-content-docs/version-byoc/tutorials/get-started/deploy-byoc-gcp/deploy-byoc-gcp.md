---
title: "GCP に BYOC を展開 | BYOC"
slug: /deploy-byoc-gcp
sidebar_label: "GCP に BYOC を展開"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム GCP 構成を使用して、Google Cloud Platform (GCP) Virtual Private Cloud (VPC) に完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。 | BYOC"
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
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search

---

import Admonition from '@theme/Admonition';


# GCP に BYOC を展開

このページでは、Zilliz Cloud コンソールとカスタム GCP 構成を使用して、Google Cloud Platform (GCP) Virtual Private Cloud (VPC) に完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p></li>
<li><p>このガイドでは、AWS コンソールで必要なリソースをステップバイステップで作成する方法を示しています。インフラストラクチャをプロビジョニングするために Terraform スクリプトを使用する場合は、<a href="./terraform-provider">Terraform プロバイダー</a>を参照してください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

- BYOC 組織の所有者でなければなりません。

- [必要な GCP API サービス](./required-api-services-gcp) を有効にしています。

## 手順\{#procedure}

GCP に BYOC を展開するには、Zilliz Cloud が代理で Cloud Storage バケットと顧客管理 VPC 内の GKE クラスターにアクセスするために特定のロールを想定する必要があります。したがって、Zilliz Cloud は Cloud Storage バケット、GKE クラスター、VPC の情報およびこれらのインフラストラクチャリソースにアクセスするために必要なロールを収集する必要があります。

BYOC 組織内で **プロジェクトを作成してデータプレーンを展開** ボタンをクリックして展開を開始します。

![Cl50bi7eVoxSoHxk4jrcclh6n5O](/img/Cl50bi7eVoxSoHxk4jrcclh6n5O.png)

### ステップ1: プロジェクトを作成\{#step-1-create-a-project}

このステップでは、Zilliz BYOC プロジェクト名を設定し、クラウドプロバイダーとリージョン、および展開の初期プロジェクトサイズを決定します。

![A8VVbPbJgobXzzxEdumcpxJ4nMg](/img/A8VVbPbJgobXzzxEdumcpxJ4nMg.png)

1. **Zilliz BYOC プロジェクト名** を設定します。

1. **クラウドプロバイダー** および **クラウドリージョン** を選択します。

1. **GCP プライベートサービスコネクト** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用にプライベートサービスコネクトエンドポイントを作成する必要があります。

1. **アーキテクチャ** で、アプリケーションに一致するアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** および **ARM** です。

1.  **リソース設定** では、

    1. **自動スケーリング** を有効または無効にして、Zilliz Cloud がプロジェクトワークロードに基づいて定義された範囲内で EC2 インスタンスの数を自動的に調整できるようにします。

    1. **初期プロジェクトサイズ** を構成します。

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なる Google Compute Engine (GCE) インスタンスを使用します。これらのサービスおよびコンポーネントのインスタンスタイプを設定できます。

        **自動スケーリング** が無効になっている場合は、対応する **数** フィールドに各プロジェクトコンポーネントに必要な GCE インスタンスの数を指定するだけです。

        ![CxACbbwtYo2dMNxG33qcMIyinBe](/img/CxACbbwtYo2dMNxG33qcMIyinBe.png)

        **自動スケーピング** が有効になると、実際のプロジェクトワークロードに基づいて GCE インスタンスの数を自動的にスケーリングするために、対応する **最小** および **最大** フィールドを設定して Zilliz Cloud が使用する範囲を指定する必要があります。

        ![QzCHbFIFRoyCUex6u8vcoEZMn6f](/img/QzCHbFIFRoyCUex6u8vcoEZMn6f.png)

        リソース設定を容易にするために、4つの事前定義されたプロジェクトサイズオプションがあります。以下の表は、これらのプロジェクトサイズオプションとプロジェクトで作成できるクラスターの数、およびこれらのクラスターが含むことができるエンティティ数との対応を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="2"><p>最大エンティティ数 (百万)</p></th>
           </tr>
           <tr>
             <td><p>パフォーマンス最適化 CU</p></td>
             <td><p>容量最適化 CU</p></td>
           </tr>
           <tr>
             <td><p>小</p></td>
             <td><p>8〜16 CU の 3 クラスター</p></td>
             <td><p>1000万 - 2500万</p></td>
             <td><p>4000万 - 8000万</p></td>
           </tr>
           <tr>
             <td><p>中</p></td>
             <td><p>16〜64 CU の 7 クラスター</p></td>
             <td><p>2500万 - 1億</p></td>
             <td><p>8000万 - 3.5億</p></td>
           </tr>
           <tr>
             <td><p>大</p></td>
             <td><p>64〜192 CU の 12 クラスター</p></td>
             <td><p>1億 - 3億</p></td>
             <td><p>3.5億 - 10億</p></td>
           </tr>
           <tr>
             <td><p>特大</p></td>
             <td><p>192〜576 CU の 17 クラスター</p></td>
             <td><p>3億 - 9億</p></td>
             <td><p>10億 - 30億</p></td>
           </tr>
        </table>

        **初期プロジェクトサイズ** で **カスタム** を選択し、すべてのデータプレーンコンポーネントの GCE インスタンスタイプおよび数を調整することで、設定をカスタマイズすることもできます。お好みの GCE インスタンスタイプがリストにない場合は、追加の支援のために[Zilliz サポート](https://zilliz.com/contact)までお問い合わせください。

1. **次へ** をクリックして認証情報を設定します。

### ステップ2: 認証情報を設定\{#step-2-set-up-credentials}

**認証設定** では、ストレージとストレージアクセス、GKE クラスターマネジメント、およびデータプレーン展開用の複数のサービスアカウントを設定する必要があります。

![BbOOboWZAo5eu2xplJWcXyLonph](/img/BbOOboWZAo5eu2xplJWcXyLonph.png)

1. **Google Cloud Platform プロジェクト ID** で、GCP プロジェクトの ID を入力します。

1. **ストレージ設定** で、GCP から取得した **バケット名** および **サービスアカウントメール** を設定します。

    Zilliz Cloud は、指定したバケットをデータプレーンストレージとして使用し、指定したサービスアカウントを使用して代理でアクセスします。

    バケットの設定とサービスアカウントの作成の詳細については、[Cloud Storage バケットとサービスアカウントの作成](./create-bucket-and-service-account)を参照してください。

1. **GKE 設定** で、GKE マネジメント用の **GKE クラスター名** および **サービスアカウントメール** を設定します。

    Zilliz Cloud は、指定したサービスアカウントを使用して指定した名前の GKE クラスターを代理で展開し、GKE クラスターにデータプレーンを展開します。

    サービスアカウントの作成の詳細については、[GKE サービスアカウントの作成](./create-gke-service-account)を参照してください。

1. **クロスアカウント設定** で、データプレーン展開用の **サービスアカウント名** を設定します。

    サービスアカウントの準備ができたら、下記の読み取り専用テキストボックスに表示されている Zilliz BYOC プリンシパルをコピーして、GCP コンソールに貼り付けて、Zilliz Cloud BYOC プロジェクトのデータプレーンを展開するための必要な権限を Zilliz BYOC に付与します。

    クロスアカウントサービスアカウントの作成の詳細については、[クロスアカウントサービスアカウントの作成](./create-cross-account-sa)を参照してください。

1. **次へ** をクリックしてネットワーク設定を構成します。

### ステップ3: ネットワーク設定を構成\{#step-3-configure-network-settings}

**ネットワーク設定** では、VPC とサブネット名、およびオプションのプライベートサービスコネクトエンドポイントなど、複数のタイプのリソースを作成します。

![YVPNbLCjOoCkDTx9TEMcbV9LnPd](/img/YVPNbLCjOoCkDTx9TEMcbV9LnPd.png)

1. **ネットワーク設定** で、**VPC 名**、**サブネット名**、およびオプションの **プライベートサービスコネクトエンドポイント** を設定します。

    指定した VPC で Zilliz Cloud には以下のものが必要です。

    - 2つのセカンダリサブネットを持つプライマリサブネット、

    - ロードバランサーサブネット、および

    - オプションのプライベートサービスコネクトエンドポイント。

    **プライベートサービスコネクトエンドポイント** は、上記の **全般設定** で **GCP プライベートサービスコネクト** をオンにした場合にのみ利用可能であることに注意してください。

1. **次へ** をクリックして要約を表示します。

1. **展開要約** で、構成設定を確認します。

1. すべてが期待通りであれば、**作成** をクリックします。

## 展開の詳細を表示\{#view-deployment-details}

プロジェクトを作成した後、プロジェクトページでそのステータスを表示できます。

![BE13bnOpGo9ZAVxTx3acX2J8nEe](/img/BE13bnOpGo9ZAVxTx3acX2J8nEe.png)

## 一時停止 & 再開\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、プロジェクトをサポートする GKE クラスターに関連付けられたすべての GCE インスタンスが終了します。この操作は、プロジェクト内の一時停止された Zilliz Cloud クラスターには影響せず、データプレーンが復元されれば再開できます。

![YC2YbM9oyo6IcUxDQ5Bc3AzDnPc](/img/YC2YbM9oyo6IcUxDQ5Bc3AzDnPc.png)

プロジェクトが実行中の場合、プロジェクト内にクラスターが存在しないか、すべてのクラスターがすでに一時停止している場合にのみプロジェクトを一時停止できます。

![SVLQbgURIoRqHBx2tWwc5caWnx7](/img/SVLQbgURIoRqHBx2tWwc5caWnx7.png)

プロジェクトカードのステータスタグが **一時停止中** と表示されると、プロジェクト内のクラスターを操作できなくなります。その場合は、**再開** をクリックしてプロジェクトを再開できます。ステータスタグが再び **実行中** に変わるまで、プロジェクト内のクラスターを操作し続けることができます。

![EQKqbumOxoT1tVxw1ZRcZahXnDd](/img/EQKqbumOxoT1tVxw1ZRcZahXnDd.png)

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />