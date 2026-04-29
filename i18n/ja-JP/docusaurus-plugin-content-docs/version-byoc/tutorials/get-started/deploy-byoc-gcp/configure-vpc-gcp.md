---
title: "GCP でカスタマー管理型 VPC を構成する | BYOC"
slug: /configure-vpc-gcp
sidebar_key: configure-vpc-gcp
sidebar_label: "GCP でカスタマー管理型 VPC を構成する"
beta: CONTACT SALES
notebook: FALSE
description: "Zilliz Cloud の Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、独自の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。カスタマー管理型 VPC 内で Zilliz Cloud プロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織に求められる特定のクラウドセキュリティおよびガバナンス基準を満たすことが可能になります。| BYOC"
type: origin
token: C94rw7r38ij0eCkvQKBcEFJ1n0e
sidebar_position: 4
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

# GCP でカスタマー管理型 VPC を構成する

Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、独自の Virtual プライベート Cloud (VPC) 内にプロジェクトを設定できます。カスタマー管理型 VPC で実行される Zilliz Cloud プロジェクトにより、ネットワーク構成をより細かく制御できるようになり、組織に求められる特定のクラウドセキュリティおよびガバナンス基準を満たすことが可能になります。

このページでは、これらの要件を満たすカスタマー管理型 VPC で Zilliz Cloud BYOC プロジェクトをホストするために必要な最小要件を一覧表示します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般 Availability</strong>で利用可能です。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a> までお問い合わせください。</p>

</Admonition>

## VPC の要件\{#vpc-requirements}

Zilliz Cloud プロジェクトをホストするには、VPC がこのセクションに記載された要件を満たしている必要があります。既存の VPC を BYOC プロジェクトで使用したい場合は、VPC がこれらの要件を満たしていることを確認してください。

**要件**

- [VPC リージョン](./configure-vpc-gcp#vpc-regions)

- [VPC IP アドレス範囲](./configure-vpc-gcp#vpc-ip-address-ranges)

- [サブネット](./configure-vpc-gcp#subnets)

- [Cloud Router と NAT](./configure-vpc-gcp#cloud-router-and-nat)

- [ファイアウォールルール](./configure-vpc-gcp#firewall-rules)

- [プライベート Service Connect (PSC)](./configure-vpc-gcp#private-service-connect-psc-endpoint)

### VPC リージョン\{#vpc-regions}

以下の表は、Zilliz Cloud BYOC ソリューションがサポートする Google Cloud Platform (GCP) リージョンの一覧です。Zilliz Cloud コンソールにお使いのクラウドリージョンが表示されない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p>GCP リージョン</p></th>
     <th><p>ロケーション</p></th>
   </tr>
   <tr>
     <td><p>us-west1</p></td>
     <td><p>Oregon</p></td>
   </tr>
</table>

### VPC IP アドレス範囲\{#vpc-ip-address-ranges}

Zilliz Cloud では、VPC の IPv4 CIDR 設定に **/18** ネットマスクを使用することを推奨しています。これにより、CIDR ブロックから 1 つのパブリックサブネットと 3 つのプライベートサブネットを作成できます。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud は現在、IPv4 CIDR ブロックのみをサポートしています。</p>

</Admonition>

### サブネット\{#subnets}

Zilliz Cloud BYOC プロジェクトには、プライマリ IPv4 範囲と 2 つのセカンダリ IPv4 範囲を持つ 1 つのプライマリサブネット、および別途ロードバランシング用サブネットが必要です。

### Cloud Router と NAT\{#cloud-router-and-nat}

Google Cloud Router は、VPC と他のネットワーク間の動的ルート交換を可能にするために必要です。また、VPC 上の VM やコンテナポッドが Zilliz Cloud の VPC ネットワークと通信できるように、NAT ゲートウェイを追加する必要があります。

### ファイアウォールルール\{#firewall-rules}

2 つのイングレスファイアウォールルールを作成する必要があります。1 つは、BYOC プロジェクト内のクラスターに対して Zilliz Cloud がヘルスチェックを実行するためのもので、もう 1 つは、VPC ネットワーク内の VM インスタンス同士が通信するためのものです。

### プライベート Service Connect (PSC) エンドポイント\{#private-service-connect-psc-endpoint}

PSC エンドポイントはオプションであり、BYOC クラスター向けにプライベートエンドポイントを構成する際に使用されます。

## 手順\{#procedure}

GCP ダッシュボードでは、[VPC の要件](./configure-vpc-gcp#vpc-requirements) に記載された VPC および関連リソースを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用のインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: VPC ネットワークを作成し、プライマリサブネットを追加する\{#step-1-create-a-vpc-network-and-add-the-primary-subnet}

このステップでは、VPC ネットワークを作成し、プライマリサブネットを追加します。プライマリサブネットには、コンテナポッドおよびサービス用のプライマリ IPv4 アドレス範囲と 2 つのセカンダリ IPv4 アドレス範囲が含まれます。

<Supademo id="cmbhlqpyr5ovksn1rjtbv93bt" title=""  />

VPC ネットワークを作成し、プライマリサブネットを追加する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**VPC ネットワーク** を見つけてクリックします。

1. **VPC ネットワークを作成** をクリックします。

1. 作成する VPC およびプライマリサブネットの名前を設定します。

    このデモでは、`primary-subnet` に設定するか、命名規則に従ってサブネットに名前を付けます。

1. プライマリサブネットのリージョンを選択します。

    リージョンは、Zilliz BYOC プロジェクトと同じである必要があります。

1. プライマリサブネットのプライマリ IPv4 範囲を設定します。

    このデモでは、`10.7.0.0/18` に設定するか、計画されたネットワークセグメントを使用します。後で参照できるよう、名前と IPv4 範囲を覚えておくことをお勧めします。

1. コンテナポッド用のセカンダリ IPv4 範囲の名前と IPv4 アドレス範囲を設定します。

    このデモでは、名前を `pod-subnet`、範囲を `10.7.64.0/18` に設定するか、命名規則とネットワーク計画に従います。後で参照できるよう、名前と IPv4 範囲を覚えておくことをお勧めします。

1. **セカンダリ IPv4 範囲を追加** をクリックしてサービス用のセカンダリ IPv4 範囲を追加し、その名前と範囲を設定します。

    このデモでは、名前を `service-subnet`、範囲を `10.7.128.0/18` に設定するか、命名規則とネットワーク計画に従います。

1. その他はデフォルト設定のままにし、**作成** をクリックします。

</Procedures>

### ステップ 2: ロードバランシング用サブネットを追加する\{#step-2-add-the-load-balancing-subnet}

このステップでは、リージョナル Application Load Balancer 用に予約されたプロキシ専用サブネットを追加します。

<Supademo id="cmbhmkul05p81sn1r161bhqiy" title=""  />

このサブネットを追加する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**VPC ネットワーク** を見つけてクリックします。

1. 前のステップで作成した VPC ネットワークをフィルタリングします。

1. 名前をクリックして詳細を表示します。

1. **サブネット** タブに切り替え、**サブネットを追加** をクリックします。

1. 作成するサブネットの名前を設定します。

    このデモでは、`lb-subnet` に設定するか、命名規則に従ってサブネットに名前を付けます。

1. プライマリサブネットのリージョンを選択します。

    リージョンは、Zilliz BYOC プロジェクトと同じである必要があります。

1. **目的** で **Regional Managed プロキシ** を選択します。

    このオプションとプロキシ専用サブネットの詳細については、[このドキュメント](https://cloud.google.com/load-balancing/docs/proxy-only-subnets) を参照してください。

1. このサブネットのプライマリ IPv4 範囲を設定します。

    このデモでは、`10.7.192.0/18` に設定するか、計画されたネットワークセグメントを使用します。

1. **追加** をクリックします。

</Procedures>

### ステップ 3: Cloud Router と NAT ゲートウェイを設定する\{#step-3-set-up-the-cloud-router-and-nat-gateway}

このステップでは、VPC と Zilliz Cloud の VPC 間のトラフィックに対してネットワークアドレス変換を有効にするため、Cloud Router と NAT ゲートウェイを構成します。

<Supademo id="cmbhobhu95slrsn1r9uig4txt" title=""  />

Cloud Router と NAT ゲートウェイを設定する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**ネットワーク接続** を見つけてクリックします。

1. 左側のナビゲーションペインで **Cloud Router** を選択します。

1. **ルーターを作成** をクリックします。

1. 作成するルーターの名前を設定します。

    このデモでは `your-org-byoc-router` に設定するか、命名規則に従います。

1. 前のステップで作成した VPC ネットワークを選択します。

    このデモでは、`your-org-byoc-vpc` を選択します。

1. 作成するルーターのリージョンを選択します。

    このデモでは、`us-west1 (Oregon)` を選択します。

1. **作成** をクリックします。

1. **ルーター** リストに表示されているルーターの名前をクリックします。

1. 下にスクロールし、**Cloud NAT ゲートウェイを追加** をクリックします。

1. 作成する NAT ゲートウェイの名前を設定します。

    このデモでは `your-org-byoc-nat` に設定するか、命名規則に従います。

1. **Cloud NAT IP アドレス** で **マニュアル** を選択します。

    以下のように新しい IP アドレスを作成する必要があります。

    1. **IP アドレス 1** のドロップダウンリストから **IP アドレスを作成** を選択します。

    1. 表示されたダイアログボックスで、予約する IP アドレスの名前を設定し、**予約** をクリックします。

        このデモでは `your-org-byoc-nat-ip` に設定するか、命名規則に従います。

1. NAT ゲートウェイ用に新しい IP アドレスが予約されたら、**作成** をクリックします。

</Procedures>

### ステップ 4: ファイアウォールルールを追加する\{#step-4-add-firewall-rules}

このステップでは、2 つのファイアウォールルールを追加します。最初のルールは、VPC ネットワーク上にデプロイされた BYOC クラスターに対するヘルスチェックを有効にするためのもので、2 番目のルールは、ターゲットタグ `zilliz-byoc` を持つすべての VM 間の通信を有効にするためのものです。

<Supademo id="cmbj0hb9p7c84sn1r5q4o16k0" title=""  />

これらのファイアウォールルールを追加する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**VPC ネットワーク** を見つけてクリックします。

1. 前のステップで作成した VPC ネットワークをフィルタリングします。

1. VPC ネットワークの名前をクリックして詳細を表示します。

1. **ファイアウォール** タブに切り替えます。

1. **ファイアウォールルールを追加** をクリックします。

    - BYOC クラスターに対するヘルスチェック用のファイアウォールルール

        <table>
           <tr>
             <th><p><strong>名前</strong></p></th>
             <th><p>ingress-rule-for-health-checks</p></th>
           </tr>
           <tr>
             <td><p><strong>ターゲット</strong></p></td>
             <td><p>ネットワーク内のすべてのインスタンス</p></td>
           </tr>
           <tr>
             <td><p><strong>ソース IPv4 範囲</strong></p></td>
             <td><p><code>130.211.0.0/22</code>, <code>35.191.0.0/16</code></p></td>
           </tr>
           <tr>
             <td><p><strong>プロトコルとポート</strong></p></td>
             <td><p>指定されたプロトコルとポート</p></td>
           </tr>
           <tr>
             <td><p><strong>TCP</strong></p></td>
             <td><p><code>19530</code></p></td>
           </tr>
        </table>

    - VPC ネットワーク上のタグ付き VM 間のローカルトラフィック用のファイアウォールルール

        <table>
           <tr>
             <th><p><strong>名前</strong></p></th>
             <th><p>ingress-rule-for-local-traffic</p></th>
           </tr>
           <tr>
             <td><p><strong>ターゲット</strong></p></td>
             <td><p>指定されたターゲットタグ</p></td>
           </tr>
           <tr>
             <td><p><strong>ターゲットタグ</strong></p></td>
             <td><p><code>zilliz-byoc</code></p></td>
           </tr>
           <tr>
             <td><p><strong>ソース IPv4 範囲</strong></p></td>
             <td><p><code>10.7.0.0/18</code> (または、<a href="./configure-vpc-gcp#step-1-create-a-vpc-network-and-add-the-primary-subnet">このセクション</a> のステップ 5 を参照して計画したものを使用)</p></td>
           </tr>
           <tr>
             <td><p><strong>プロトコルとポート</strong></p></td>
             <td><p>すべて許可</p></td>
           </tr>
        </table>

</Procedures>

### ステップ 5: (オプション) PSC エンドポイントを作成する\{#step-5-optional-create-a-psc-endpoint}

このステップでは、VPC と Zilliz Cloud 間の通信をインターネット経由ではなく行うために、PSC エンドポイントを追加します。

<Supademo id="cmbj22gip7cyqsn1r4kes9547" title=""  />

PSC エンドポイントを作成する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**ネットワークサービス** を見つけてクリックします。

1. 左側のナビゲーションペインから **プライベート Service Connect** を選択します。

1. **エンドポイントに接続** をクリックします。

1. **ターゲット** で **公開済みサービス** を選択します。

1. Zilliz Cloud が提供するサービスアタッチメント ID を **ターゲットの詳細** に入力します。

    以下の表は、利用可能な各クラウドリージョン固有のサービスアタッチメント ID を示しています。

    <table>
       <tr>
         <th><p>リージョン</p></th>
         <th><p>サービスアタッチメント ID</p></th>
       </tr>
       <tr>
         <td><p>us-west1</p></td>
         <td><p><code>projects/vdc-prod/regions/us-west1/serviceAttachments/zilliz-byoc-psc-service</code></p></td>
       </tr>
    </table>

1. エンドポイントサービスの名前を設定します。

1. 前のステップで作成した VPC ネットワークとそのプライマリサブネットを選択します。

1. エンドポイントに IP アドレスを割り当てます。

    表示されたダイアログボックスで、以下のように操作します。

    1. **IP アドレスを作成** をクリックします。

    1. IP アドレスの名前を設定します。

    1. **静的 IP アドレス** で **自動割り当て** を選択します。

    1. **予約** を作成します。

1. **エンドポイントを追加** をクリックします。

</Procedures>