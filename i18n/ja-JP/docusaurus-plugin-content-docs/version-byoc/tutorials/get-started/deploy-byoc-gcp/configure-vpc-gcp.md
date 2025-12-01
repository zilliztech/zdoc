---
title: "GCP 上の顧客管理 VPC の構成 | BYOC"
slug: /configure-vpc-gcp
sidebar_label: "GCP 上の顧客管理 VPC の構成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションにより、独自の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。顧客管理 VPC で実行される Zilliz Cloud プロジェクトでは、ネットワーク構成をより制御できるため、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。 | BYOC"
type: origin
token: C94rw7r38ij0eCkvQKBcEFJ1n0e
sidebar_position: 4
keywords:
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# GCP 上の顧客管理 VPC の構成

Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションにより、独自の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。顧客管理 VPC で実行される Zilliz Cloud プロジェクトでは、ネットワーク構成をより制御できるため、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。

このページでは、これらの要件を満たす顧客管理 VPC に Zilliz Cloud BYOC プロジェクトをホストするための最小要件を列挙します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## VPC 要件\{#vpc-requirements}

BYOC プロジェクトをホストするには、VPC がこのセクションで列挙された要件を満たしている必要があります。既存の VPC を BYOC プロジェクトに使用することを検討している場合は、VPC がこれらの要件を満たしていることを確認してください。

**要件**

- [VPC リージョン](./configure-vpc-gcp#vpc-regions)

- [VPC IP アドレス範囲](./configure-vpc-gcp#vpc-ip-address-ranges)

- [サブネット](./configure-vpc-gcp#subnets)

- [Cloud Router および NAT](./configure-vpc-gcp#cloud-router-and-nat)

- [ファイアウォールルール](./configure-vpc-gcp#firewall-rules)

- [Private Service Connect (PSC)](./configure-vpc-gcp#private-service-connect-psc-endpoint)

### VPC リージョン\{#vpc-regions}

以下の表は、Zilliz Cloud BYOC ソリューションがサポートする Google Cloud Platform (GCP) リージョンを示しています。Zilliz Cloud コンソールでクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p>GCP リージョン</p></th>
     <th><p>場所</p></th>
   </tr>
   <tr>
     <td><p>us-west1</p></td>
     <td><p>オレゴン</p></td>
   </tr>
</table>

### VPC IP アドレス範囲\{#vpc-ip-address-ranges}

Zilliz Cloud では、VPC の IPv4 CIDR 設定で **/18** ネットマスクを使用することを推奨します。これにより、CIDR ブロックからパブリックサブネット1つとプライベートサブネット3つを作成できます。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud は現在、IPv4 CIDR ブロックのみをサポートしています。</p>

</Admonition>

### サブネット\{#subnets}

Zilliz Cloud BYOC プロジェクトには、プライマリ IPv4 範囲を持つ1つのプライマリサブネットと、2つのセカンダリ IPv4 範囲に加えて、別個のロードバランシングサブネットが必要です。

### Cloud Router および NAT\{#cloud-router-and-nat}

Google Cloud Router は、VPC と他のネットワーク間の動的ルート交換を可能にするために必要です。また、VPC 上の VM やコンテナポッドが Zilliz Cloud の VPC ネットワークと通信できるように NAT ゲートウェイを追加する必要があります。

### ファイアウォールルール\{#firewall-rules}

2つのイングレスファイアウォールルールを作成する必要があります：1つは Zilliz Cloud が BYOC プロジェクト内のクラスターに対して正常性チェックを実行するため、もう1つは VPC ネットワーク内の VM インスタンスが互いに通信するためです。

### Private Service Connect (PSC) エンドポイント\{#private-service-connect-psc-endpoint}

PSC エンドポイントはオプションであり、BYOC クラスターのプライベートエンドポイントを構成する場合に使用されます。

## 手順\{#procedure}

GCP ダッシュボードで、[VPC 要件](./configure-vpc-gcp#vpc-requirements) で列挙された VPC および関連リソースを作成できます。別の方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

### ステップ1: VPC ネットワークを作成し、プライマリサブネットを追加\{#step-1-create-a-vpc-network-and-add-the-primary-subnet}

このステップでは、VPC ネットワークを作成し、プライマリサブネットを追加します。プライマリサブネットには、コンテナポッドとサービス用のプライマリ IPv4 範囲および2つのセカンダリ IPv4 範囲が含まれます。

<Supademo id="cmbhlqpyr5ovksn1rjtbv93bt" title=""  />

VPC ネットワークを作成し、プライマリサブネットを追加する手順は以下のとおりです：

1. GCP コンソールで、**VPC ネットワーク** を検索してクリックします。

1. **VPC ネットワークを作成** をクリックします。

1. 作成する VPC およびプライマリサブネットの名前を設定します。

    このデモでは、`primary-subnet` に設定できます。または、命名規則に従ってサブネットに名前を付けてください。

1. プライマリサブネットのリージョンを選択します。

    リージョンは Zilliz BYOC プロジェクトと同じである必要があります。

1. プライマリサブネットのプライマリ IPv4 範囲を設定します。

    このデモでは、`10.7.0.0/18` に設定できます。または、計画されたネットワークセグメントを使用します。以降のために名前と IPv4 範囲を覚えておくことを推奨します。

1. コンテナポッド用のセカンダリ IPv4 範囲の名前と IPv4 アドレス範囲を設定します。

    このデモでは、名前を `pod-subnet` に、範囲を `10.7.64.0/18` に設定できます。または、命名規則とネットワーク計画に従ってください。以降のために名前と IPv4 範囲を覚えておくことを推奨します。

1. サービス用のセカンダリ IPv4 範囲を追加するには、**セカンダリ IPv4 範囲を追加** をクリックし、その名前と範囲を設定します。

    このデモでは、名前を `service-subnet` に、範囲を `10.7.128.0/18` に設定できます。または、命名規則とネットワーク計画に従ってください。

1. 残りはデフォルト設定のまま **作成** をクリックします。

### ステップ2: ロードバランシングサブネットを追加\{#step-2-add-the-load-balancing-subnet}

このステップでは、リージョナルアプリケーションロードバランサー用に予約されたプロキシ専用サブネットを追加します。

<Supademo id="cmbhmkul05p81sn1r161bhqiy" title=""  />

このサブネットを追加する手順は以下のとおりです：

1. GCP コンソールで、**VPC ネットワーク** を検索してクリックします。

1. 前のステップで作成した VPC ネットワークをフィルタリングします。

1. その名前をクリックして詳細を表示します。

1. **サブネット** タブに切り替え、**サブネットを追加** をクリックします。

1. 作成するサブネットの名前を設定します。

    このデモでは、`lb-subnet` に設定できます。または、命名規則に従ってサブネットに名前を付けてください。

1. プライマリサブネットのリージョンを選択します。

    リージョンは Zilliz BYOC プロジェクトと同じである必要があります。

1. **目的** の **リージョナルマネージドプロキシ** を選択します。

    このオプションとプロキシ専用サブネットの詳細については、[このドキュメント](https://cloud.google.com/load-balancing/docs/proxy-only-subnets) を参照してください。

1. このサブネットのプライマリ IPv4 範囲を設定します。

    このデモでは、`10.7.192.0/18` に設定できます。または、計画されたネットワークセグメントを使用します。

1. **追加** をクリックします。

### ステップ3: Cloud Router および NAT ゲートウェイを設定\{#step-3-set-up-the-cloud-router-and-nat-gateway}

VPC と Zilliz Cloud の間のトラフィックに対してネットワークアドレス変換を有効にするために、Cloud Router および NAT ゲートウェイを構成します。

<Supademo id="cmbhobhu95slrsn1r9uig4txt" title=""  />

Cloud Router および NAT ゲートウェイを設定する手順は以下のとおりです：

1. GCP コンソールで、**ネットワーク接続** を検索してクリックします。

1. 左側のナビゲーションペインで **Cloud Router** を選択します。

1. **ルータを作成** をクリックします。

1. 作成するルータの名前を設定します。

    このデモでは、`your-org-byoc-router` に設定します。または、命名規則に従ってください。

1. 前のステップで作成した VPC ネットワークを選択します。

    このデモでは、`your-org-byoc-vpc` を選択します。

1. 作成するルータのリージョンを選択します。

    このデモでは、`us-west1 (オレゴン)` を選択します。

1. **作成** をクリックします。

1. **ルータ** リストで一覧されているルータの名前をクリックします。

1. 下にスクロールして **Cloud NAT ゲートウェイを追加** をクリックします。

1. 作成する NAT ゲートウェイの名前を設定します。

    このデモでは、`your-org-byoc-nat` に設定します。または、命名規則に従ってください。

1. **Cloud NAT IP アドレス** で **手動** を選択します。

    以下のように新しい IP アドレスを作成する必要があります：

    1. **IP アドレス 1** のドロップダウンリストから **IP アドレスを作成** を選択します。

    1. 表示されるダイアログボックスで、予約する IP アドレスの名前を設定し、**予約** をクリックします。

        このデモでは、`your-org-byoc-nat-ip` に設定します。または、命名規則に従ってください。

1. NAT ゲートウェイ用に新しい IP アドレスが予約されたら、**作成** をクリックします。

### ステップ4: ファイアウォールルールを追加\{#step-4-add-firewall-rules}

このステップでは、2つのファイアウォールルールを追加します。1つ目のルールは、VPC ネットワーク上で展開された BYOC クラスターに対する正常性チェックを有効にするため、2つ目のルールは、`zilliz-byoc` というターゲットタグを持つすべての VM 間の通信を有効にするためです。

<Supademo id="cmbj0hb9p7c84sn1r5q4o16k0" title=""  />

これらのファイアウォールルールを追加する手順は以下のとおりです：

1. GCP コンソールで、**VPC ネットワーク** を検索してクリックします。

1. 前のステップで作成した VPC ネットワークをフィルタリングします。

1. VPC ネットワークの名前をクリックして詳細を表示します。

1. **ファイアウォール** タブに切り替えます。

1. **ファイアウォールルールを追加** をクリックします。

    - BYOC クラスターに対する正常性チェック用のファイアウォールルール。

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
             <td><p><strong>送信元 IPv4 範囲</strong></p></td>
             <td><p><code>130.211.0.0/22</code>、<code>35.191.0.0/16</code></p></td>
           </tr>
           <tr>
             <td><p><strong>プロトコルおよびポート</strong></p></td>
             <td><p>指定されたプロトコルおよびポート</p></td>
           </tr>
           <tr>
             <td><p><strong>TCP</strong></p></td>
             <td><p><code>19530</code></p></td>
           </tr>
        </table>

    - VPC ネットワーク上のタグ付けされた VM 間のローカルトラフィック用のファイアウォールルール

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
             <td><p><strong>送信元 IPv4 範囲</strong></p></td>
             <td><p><code>10.7.0.0/18</code>（または、<a href="./configure-vpc-gcp#step-1-create-a-vpc-network-and-add-the-primary-subnet">このセクション</a>の手順5を参照して計画されたものを使用してください。）</p></td>
           </tr>
           <tr>
             <td><p><strong>プロトコルおよびポート</strong></p></td>
             <td><p>すべて許可</p></td>
           </tr>
        </table>

### ステップ5: (オプション) PSC エンドポイントを作成\{#step-5-optional-create-a-psc-endpoint}

VPC と Zilliz Cloud の間の通信をインターネットから外すために、PSC エンドポイントを追加します。

<Supademo id="cmbj22gip7cyqsn1r4kes9547" title=""  />

PSC エンドポイントを作成する手順は以下のとおりです：

1. GCP コンソールで、**ネットワークサービス** を検索してクリックします。

1. 左側のナビゲーションペインから **Private Service Connect** を選択します。

1. **エンドポイントに接続** をクリックします。

1. **ターゲット** で **公開サービス** を選択します。

1. Zilliz Cloud が提供するサービスアタッチメント ID を **ターゲットの詳細** に入力します。

    以下の表は、各利用可能なクラウドリージョンに固有のサービスアタッチメント ID を示しています。

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

    表示されるダイアログボックスで、以下のようにします：

    1. **IP アドレスを作成** をクリックします。

    1. IP アドレスの名前を設定します。

    1. **静的 IP アドレス** で **自動的に割り当て** を選択します。

    1. **予約** を作成します。

1. **エンドポイントを追加** をクリックします。
