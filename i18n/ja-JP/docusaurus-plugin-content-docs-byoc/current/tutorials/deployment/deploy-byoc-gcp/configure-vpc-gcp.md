---
title: "GCP 上でカスタマー管理 VPC を設定する | BYOC"
slug: /configure-vpc-gcp
sidebar_label: "GCP 上でカスタマー管理 VPC を設定する"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、ご自身の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。カスタマー管理 VPC 上で実行される Zilliz Cloud プロジェクトにより、ネットワーク構成をより細かく制御でき、組織で必要とされる特定のクラウドセキュリティおよびガバナンス標準を満たせます。 | BYOC"
type: origin
token: C94rw7r38ij0eCkvQKBcEFJ1n0e
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# GCP 上でカスタマー管理 VPC を設定する

Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、ご自身の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。カスタマー管理 VPC 上で実行される Zilliz Cloud プロジェクトにより、ネットワーク構成をより細かく制御でき、組織で必要とされる特定のクラウドセキュリティおよびガバナンス標準を満たせます。 

このページでは、これらの要件を満たすカスタマー管理 VPC で Zilliz Cloud BYOC プロジェクトをホストするための最小要件を列挙します。 

<Admonition type="info" icon="📘" title="Notes">

Zilliz BYOC は現在 **General Availability** として利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## VPC の要件\{#vpc-requirements}

Zilliz Cloud プロジェクトをホストするには、このセクションに列挙された要件を VPC が満たしている必要があります。BYOC プロジェクトで既存の VPC を使用したい場合は、その VPC がこれらの要件を満たしていることを確認してください。 

**要件**

- [VPC リージョン](./configure-vpc-gcp#vpc-regions)

- [VPC IP アドレス範囲](./configure-vpc-gcp#vpc-ip-address-ranges)

- [Subnets](./configure-vpc-gcp#subnets)

- [Cloud Router と NAT](./configure-vpc-gcp#cloud-router-and-nat)

- [Firewall Rules](./configure-vpc-gcp#firewall-rules)

- [Private Service Connect (PSC)](./configure-vpc-gcp#private-service-connect-psc-endpoint)

### VPC リージョン\{#vpc-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする Google Cloud Platform (GCP) リージョンを示しています。Zilliz Cloud コンソールにご利用のクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>us-west1</p></td>
     <td><p>米国オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>米国バージニア</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>米国アイオワ</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
</table>

### VPC IP アドレス範囲\{#vpc-ip-address-ranges}

Zilliz Cloud は、VPC の IPv4 CIDR 設定で **/18** のネットマスクを使用することを推奨しています。これにより、CIDR ブロックから 1 つのパブリック subnet と 3 つのプライベート subnets を作成できます。

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud は現在、IPv4 CIDR ブロックのみをサポートしています。

</Admonition>

### Subnets\{#subnets}

Zilliz Cloud BYOC プロジェクトには、primary IPv4 範囲と 2 つの secondary IPv4 範囲を持つ 1 つの primary subnet と、これとは別に load balancing subnet が必要です。

### Cloud Router と NAT\{#cloud-router-and-nat}

Google Cloud Router は、VPC と他のネットワーク間で動的ルート交換を可能にするために必要です。また、VPC 上の VM およびコンテナ pod が Zilliz Cloud の VPC ネットワークと通信できるようにするために、NAT ゲートウェイも追加する必要があります。

### Firewall Rules\{#firewall-rules}

2 つの ingress firewall rule を作成する必要があります。1 つは Zilliz Cloud が BYOC プロジェクト内の cluster に対してヘルスチェックを実行するためのもので、もう 1 つは VPC ネットワーク内の VM インスタンス同士が相互通信するためのものです。

### Private Service Connect (PSC) endpoint\{#private-service-connect-psc-endpoint}

PSC endpoint はオプションであり、BYOC cluster 用の private endpoint を設定する際に使用されます。 

## 手順\{#procedure}

GCP ダッシュボードでは、[VPC の要件](./configure-vpc-gcp#vpc-requirements) に列挙されている VPC と関連リソースを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト向けインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: VPC ネットワークを作成し、primary subnet を追加する\{#step-1-create-a-vpc-network-and-add-the-primary-subnet}

このステップでは、VPC ネットワークを作成し、primary subnet を追加します。primary subnet には、コンテナ pod とサービス用の 1 つの primary IPv4 アドレス範囲と 2 つの secondary IPv4 アドレス範囲が含まれます。

<Supademo id="cmbhlqpyr5ovksn1rjtbv93bt" title=""  />

VPC ネットワークを作成して primary subnet を追加する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **VPC network** を見つけてクリックします。

1. **Create VPC network** をクリックします。

1. 作成する VPC と primary subnet の名前を設定します。

    このデモでは、`primary-subnet` に設定するか、命名規則に従って subnet に名前を付けます。

1. primary subnet のリージョンを選択します。

    リージョンは Zilliz BYOC プロジェクトと同じである必要があります。

1. primary subnet の primary IPv4 範囲を設定します。

    このデモでは、`10.7.0.0/18` に設定するか、計画済みのネットワークセグメントを使用できます。後で参照できるよう、名前と IPv4 範囲を覚えておくことをお勧めします。

1. コンテナ pod 用 secondary IPv4 範囲の名前と IPv4 アドレス範囲を設定します。

    このデモでは、名前を `pod-subnet`、範囲を `10.7.64.0/18` に設定するか、命名規則とネットワーク計画に従って設定できます。後で参照できるよう、名前と IPv4 範囲を覚えておくことをお勧めします。

1. **Add a Secondary IPv4 range** をクリックして、サービス用の secondary IPv4 範囲を追加し、その名前と範囲を設定します。

    このデモでは、名前を `service-subnet`、範囲を `10.7.128.0/18` に設定するか、命名規則とネットワーク計画に従って設定できます。

1. 残りはデフォルト設定のままにして、**Create** をクリックします。

</Procedures>

### ステップ 2: load-balancing subnet を追加する\{#step-2-add-the-load-balancing-subnet}

このステップでは、リージョナル Application Load Balancer 用に予約された proxy-only subnet を追加します。

<Supademo id="cmbhmkul05p81sn1r161bhqiy" title=""  />

この subnet を追加する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **VPC network** を見つけてクリックします。

1. 前のステップで作成した VPC ネットワークを絞り込みます。

1. その名前をクリックして詳細を表示します。

1. **Subnets** タブに切り替え、**Add subnet** をクリックします。

1. 作成する subnet の名前を設定します。

    このデモでは、`lb-subnet` に設定するか、命名規則に従って subnet に名前を付けます。

1. primary subnet のリージョンを選択します。

    リージョンは Zilliz BYOC プロジェクトと同じである必要があります。

1. **Purpose** で **Regional Managed Proxy** を選択します。

    このオプションと proxy-only subnets の詳細については、[このドキュメント](https://cloud.google.com/load-balancing/docs/proxy-only-subnets) を参照してください。

1. この subnet の primary IPv4 範囲を設定します。

    このデモでは、`10.7.192.0/18` に設定するか、計画済みのネットワークセグメントを使用できます。

1. **Add** をクリックします。

</Procedures>

### ステップ 3: Cloud Router と NAT gateway を設定する\{#step-3-set-up-the-cloud-router-and-nat-gateway}

VPC と Zilliz Cloud の間のトラフィックに対してネットワークアドレス変換を有効にするために、Cloud Router と NAT gateway を設定します。

<Supademo id="cmbhobhu95slrsn1r9uig4txt" title=""  />

Cloud Router と NAT gateway を設定する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **Network Connectivity** を見つけてクリックします。

1. 左側のナビゲーションペインで **Cloud Router** を選択します。

1. **Create router** をクリックします。

1. 作成する router の名前を設定します。

    このデモでは `your-org-byoc-router` に設定するか、命名規則に従います。

1. 前のステップで作成した VPC ネットワークを選択します。

    このデモでは、`your-org-byoc-vpc` を選択します。

1. 作成する router のリージョンを選択します。

    このデモでは、`us-west1 (Oregon)` を選択します。

1. **Create** をクリックします。

1. **Routers** リストに表示されている router の名前をクリックします。

1. 下にスクロールして **Add Cloud NAT gateway** をクリックします。

1. 作成する NAT gateway の名前を設定します。

    このデモでは `your-org-byoc-nat` に設定するか、命名規則に従います。

1. **Cloud NAT IP address** で **Manual** を選択します。

    次のように新しい IP アドレスを作成する必要があります。

    1. **IP address 1** のドロップダウンリストから **Create IP address** を選択します。

    1. 表示されたダイアログボックスで、予約する IP アドレスの名前を設定し、**Reserve** をクリックします。

        このデモでは `your-org-byoc-nat-ip` に設定するか、命名規則に従います。

1. NAT gateway 用に新しい IP アドレスが予約されたら、**Create** をクリックします。

</Procedures>

### ステップ 4: firewall rules を追加する\{#step-4-add-firewall-rules}

このステップでは 2 つの firewall rule を追加します。1 つ目の rule は、VPC ネットワーク上にデプロイされた BYOC cluster に対するヘルスチェックを有効にするためのもので、2 つ目は、ターゲットタグ `zilliz-byoc` を持つすべての VM 間の通信を有効にするためのものです。

<Supademo id="cmbj0hb9p7c84sn1r5q4o16k0" title=""  />

これらの firewall rule を追加する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **VPC network** を見つけてクリックします。

1. 前のステップで作成した VPC ネットワークを絞り込みます。

1. VPC ネットワークの名前をクリックして詳細を表示します。

1. **Firewalls** タブに切り替えます。

1. **Add Firewall rule** をクリックします。

    - BYOC cluster に対するヘルスチェック用の firewall rule

        | **Name** | ingress-rule-for-health-checks |
        | --- | --- |
        | **Targets** | All instances in the network |
        | **Source IPv4 ranges** | `130.211.0.0/22`, `35.191.0.0/16` |
        | **Protocols and ports** | Specified protocols and ports |
        | **TCP** | `19530` |

    - VPC ネットワーク上のタグ付き VM 間ローカルトラフィック用の firewall rule

        | **Name** | ingress-rule-for-local-traffic |
        | --- | --- |
        | **Targets** | Specified target tags |
        | **Target tags** | `zilliz-byoc` |
        | **Source IPv4 ranges** | `10.7.0.0/18` （または [このセクション](./configure-vpc-gcp#step-1-create-a-vpc-network-and-add-the-primary-subnet) のステップ 5 を参照して、計画済みのものを使用してください。） |
        | **Protocols and ports** | Allow all |

</Procedures>

### ステップ 5: （オプション）PSC endpoint を作成する\{#step-5-optional-create-a-psc-endpoint}

このステップでは、VPC と Zilliz Cloud 間の通信がインターネットを経由しないように PSC endpoint を追加します。

<Supademo id="cmbj22gip7cyqsn1r4kes9547" title=""  />

PSC endpoint を作成する手順は次のとおりです。

<Procedures>

1. GCP コンソールで **Network Services** を見つけてクリックします。

1. 左側のナビゲーションペインから **Private Service Connect** を選択します。

1. **Connect Endpoint** をクリックします。

1. **Target** で **Published service** を選択します。

1. Zilliz Cloud が提供する service attachment ID を **Target details** に入力します。

    次の表は、利用可能な各クラウドリージョンに対応する service attachment ID を示しています。

    | Region | Service Attachment ID |
    | --- | --- |
    | us-west1 | `projects/vdc-prod/regions/us-west1/serviceAttachments/zilliz-byoc-psc-service` |

1. endpoint service の名前を設定します。

1. 前のステップで作成した VPC ネットワークとその primary subnet を選択します。

1. endpoint に IP アドレスを割り当てます。

    表示されたダイアログボックスで、次のように操作します。

    1. **Create IP address** をクリックします。

    1. IP アドレスの名前を設定します。

    1. **Static IP address** で **Assign automatically** を選択します。

    1. **Reserve** を作成します。

1. **Add endpoint** をクリックします。

</Procedures>
