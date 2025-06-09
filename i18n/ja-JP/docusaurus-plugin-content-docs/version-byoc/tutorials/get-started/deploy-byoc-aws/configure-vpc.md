---
title: "顧客管理型VPCの設定 | BYOC"
slug: /configure-vpc
sidebar_label: "顧客管理型VPCの設定"
beta: CONTACT SALES
notebook: FALSE
description: "Zilliz CloudBring-Your-Own-Cloud(BYOC)ソリューションを使用すると、独自のVirtual Private Cloud(VPC)内でプロジェクトを設定できます。お客様が管理するVPCでZilliz Cloudプロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。 | BYOC"
type: origin
token: IjE8wzbshiWGLBkjQw5c683En6g
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - aws
  - vpc
  - security group
  - vpc endpoint
  - subnet
  - milvus
  - vector database
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';


# 顧客管理型VPCの設定

Zilliz CloudBring-Your-Own-Cloud(BYOC)ソリューションを使用すると、独自のVirtual Private Cloud(VPC)内でプロジェクトを設定できます。お客様が管理するVPCでZilliz Cloudプロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。

このページでは、これらの要件を満たす顧客管理VPCでZilliz Cloud BYOCプロジェクトをホストするための最小要件を列挙しています。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## VPCの要件{#vpc-requirements}

Zilliz Cloudプロジェクトをホストするには、VPCがこのセクションで列挙された要件を満たす必要があります。BYOCプロジェクトに既存のVPCを使用する場合は、VPCがこれらの要件を満たしていることを確認してください。

### VPCリージョン{#vpc-regions}

以下の表は、Zilliz Cloud BYOCソリューションがサポートするAWSクラウドリージョンを示しています。Zilliz Cloudコンソールでクラウドリージョンが見つからない場合は、support@zilliz.comまでお問い合わせください。

### VPCのIPアドレス範囲{#vpc-ip-address-ranges}

Zilliz Cloudは、VPCのIPv 4 CIDR設定で**/16**ネットマスクを使用し、CIDRブロックからパブリックサブネットと3つのプライベートサブネットを作成することを推奨しています。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、Zilliz CloudはIPv 4 CIDRブロックのみをサポートしています。</p>

</Admonition>

### サブネット{#subnets}

Zilliz Cloudプロジェクトには、1つのパブリックサブネットと3つのプライベートサブネットが必要で、各プライベートサブネットは異なる可用性ゾーンにあります。

パブリックサブネットはNATゲートウェイをホストし、ネットマスクは**/24**です。各プライベートサブネットは**/18**のネットマスクを持ち、EKSクラスター内でアプリケーションロードバランサー(ALB)イングレスルーティングを使用するために`kubernetes.io/role/internal-elb=1`でタグ付けする必要があります。

EKSクラスター内のポッドに対してALBがアプリケーションとHTTPトラフィックをルーティングする方法の詳細については、[この記事](https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html)を参照してください。

### DNSサポート{#dns-support}

VPCにはDNSホスト名とDNS解決が有効になっている必要があります。

### NATゲートウェイ{#nat-gateway}

Zilliz Cloudは、プライベートサブネット内のリソースがインターネットに到達できるように、パブリックサブネットに単一のNATゲートウェイを設定します。ただし、外部サービスはプライベートサブネット内のリソースとの接続を開始できません。

### セキュリティグループ{#security-group}

イングレスルールはポート443を開く必要があります。セキュリティグループの作成の詳細については、[ステップ2:セキュリティグループの作成](./configure-vpc#step-2-create-a-security-group)を参照してください。

### VPCエンドポイント{#vpc-endpoint}

VPCエンドポイントはオプションであり、BYOCクラスターのプライベートエンドポイントを構成する必要がある場合に使用されます。セキュリティグループの作成の詳細については、「[ステップ3:(オプション)VPCエンドポイントを作成](./configure-vpc#step-3-optional-create-a-vpc-endpoint)する」を参照してください。

## 手続き{#procedure}

AWSコンソールを使用してVPCおよび関連リソースを作成できます。代わりに、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをAWS上でブートストラップすることもできます。詳細については、[Bootstrapインフラストラクチャ（Terraform）](./terraform-provider)を参照してください。

### ステップ1: VPCとリソースを作成する{#step-1-create-vpc-and-resources}

AWSコンソールでは、[VPC要件](./configure-vpc#vpc-requirements)に列挙されたVPCおよび関連リソースを作成できます。

1. AWSのVPCダッシュボードに移動してください。

1. 右上隅のリージョンドロップダウンでクラウドリージョンを確認し、Zilliz Cloudプロジェクトのリージョンに変更してください。

1. [**VPCを作成**]ボタンをクリックします。

1. 以下のスナップショットに示すように、**VPC設定**で設定してください。

    ![create-aws-vpc-byoc](/img/create-aws-vpc-byoc.png)

    1. Click**VPC and more**. [**名前タグの自動生成**]で、プロジェクトの名前を入力します。

    1. IPv**4 CIDRブロック**では、ネットマスクが**/16**であることを確認してください。

    1. [**アベイラビリティゾーンの数(AZ)**]で、[**3**]をクリックします。[**AZのカスタマイズ**]を展開して、利用可能なアベイラビリティゾーンを確認できます。

    1. [**パブリックサブネットの数**]で[**3**]をクリックします。これらのサブネットは、このエディターでNATゲートウェイを有効にするために必要です。

    1. [**プライベートサブネットの数**]で[**3**]をクリックします。これらのサブネットは、Zilliz Cloud BYOCプロジェクトに必要です。

    1. [**サブネットCIDRブロック**のカスタマイズ]を展開し、各パブリックサブネットのネットワークマスクが**/24**(**10.0.0.0/24**、**10.0.16.0/24**、**10.0.32.0/24**など)、各プライベートサブネットのネットワークマスクが**/18**(**10.0.64.0/18**、**10.0.128/0/18**、**10.0.192.0/18**など)であることを確認します。

    1. [**NATゲートウェイ**]で、[**In 1 AZ**]をクリックします。

    1. [**DNSオプション**]で、両方のオプションが選択されていることを確認します。

    1. [**追加タグ**]で、[**新しいタグを追加**]をクリックします。**キー**を`ベンダー`に、**値**を`zilliz-byoc`に設定します。

1. [**VPCを作成**]をクリックします。

1. VPCが作成されたら、詳細をスクロールダウンし、[VPCの表示]をクリックし**ます。**

1. [**詳細**]セクションで、VPC IDをコピーし、Zilliz Cloudに貼り付けます。

    ![LWeubuUGZooplBxizOWcXt23nWg](/img/LWeubuUGZooplBxizOWcXt23nWg.png)

1. [**リソースマップ**]セクションで、各プライベートサブネットの末尾にある[外部リンク]アイコンをクリックして、詳細を表示します。

    ![XQ0xbL8XTosG8Mxu18acbYKBnog](/img/XQ0xbL8XTosG8Mxu18acbYKBnog.png)

1. [**サブネット詳細**]ページで、サブネットIDをコピーします。

    ![CtSabmLKXowRHHxO5LlcurMin1c](/img/CtSabmLKXowRHHxO5LlcurMin1c.png)

1. 次に、[**タグの管理**]をクリックします。開くように求められたページで、[**新しいタグ**の追加]をクリックし、新しいタグリストエントリの**キー**を`kubernetes.io/role/internal-elb`に、**値**を`1`に設定します。次に、[**保存**]をクリックします。

    ![Jf3NbDSZxoN6xLxs0VwcU54un4d](/img/Jf3NbDSZxoN6xLxs0VwcU54un4d.png)

### ステップ2:セキュリティグループを作成する{#step-2-create-a-security-group}

VPC内のセキュリティグループは、EC 2インスタンスの仮想ファイアウォールとして機能し、インバウンドおよびアウトバウンドトラフィックを制御することで、AWSリソースを保護します。セキュリティグループは以下のように作成できます:

1. AWSのVPCダッシュボードに移動してください。

1. 左側のナビゲーションウィンドウで**セキュリティ**>**セキュリティグループ**に移動し、右側のウィンドウの右上隅にある**セキュリティグループを作成**をクリックします。

1. [**セキュリティグループ名**]と[**説明**]を設定し、[VPC]ドロップダウンリストから以前に作成したVPCを選択します。

    ![W7XUbYWCooWD29xeZPbcIOXXnqf](/img/W7XUbYWCooWD29xeZPbcIOXXnqf.png)

1. [受信ルール]セクションの[**ルールを追加**]をクリックして、**受信ルール**を作成します。

1. [**Anywhere-IPv 4**]を[**ソース**]で選択するか、[**ソース**]ドロップダウンの右側のテキストボックスにアクセスを許可するCIDRブロックを入力します。

    ![LyYKbIaC2ozgn8xmcxTcchvsnzh](/img/LyYKbIaC2ozgn8xmcxTcchvsnzh.png)

1. レコードを追加し、[**HTTPS**in**Type**]と[**Anywhere-IPv 4**in**Destination**]を選択するか、[**Destination**]ドロップダウンの右側のテキストボックスにアクセスを許可するCIDRブロックを入力します。

    ![QmllbwsRfof1Z3xlNNycyQrCnUh](/img/QmllbwsRfof1Z3xlNNycyQrCnUh.png)

1. [**タグ**]セクションで、次のスクリーンショットに示すようにキーと値のペアを追加します。

    ![WZn4bHu2yo8Xx4x0OTTctw1vnD9](/img/WZn4bHu2yo8Xx4x0OTTctw1vnD9.png)

1. [**セキュリティグループを作成**]をクリックして、セキュリティグループを保存します。

1. セキュリティグループIDをZilliz Cloudにコピーします。

    ![C2Dlb6LGWoSXOixXAntc6yiln9c](/img/C2Dlb6LGWoSXOixXAntc6yiln9c.png)

### ステップ3:（オプション）VPCエンドポイントを作成する{#step-3-optional-create-a-vpc-endpoint}

VPCエンドポイントは、安全なクラスター接続リレーを確保し、Zilliz Cloud REST APIへのプライベートコールを可能にします。AWSマネジメントコンソールでVPCエンドポイントを管理する方法については、[AWS記事Create VPC endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html)を参照するか、以下の手順を使用してください

1. AWSの**VPCダッシュボード**に移動します。

1. 左側のナビゲーションウィンドウで**PrivateLinkとLattice**>**エンドポイント**を探し、右側のウィンドウの右上隅にある**エンドポイントを作成**をクリックします。

1. [**Nameタグ**]を設定するか、空白のままにしてAWSに生成させます。[**タイプ**]で、**NLBとGWLBを使用するエンドポイントサービス**を選択します。

    ![HOVhb8ko8o4eYCx9XW2cRDeKnsf](/img/HOVhb8ko8o4eYCx9XW2cRDeKnsf.png)

1. [**サービス設定**]で、[**サービス名**]にリージョンのZilliz Cloud VPCエンドポイントを入力し、[**サービスを検証**]をクリックします。

    以下の表に現在利用可能なクラウドリージョンが記載されています。もし表に記載されていない場合は、support@zilliz.comまでお問い合わせください。

    <table>
       <tr>
         <th><p>AWSリージョン</p></th>
         <th><p>ロケーション</p></th>
         <th><p>Zilliz Cloud VPCエンドポイント</p></th>
       </tr>
       <tr>
         <td><p>us-west-2ファイル</p></td>
         <td><p>オレゴン州</p></td>
         <td><p><code>com.amazonaws.vpce.usダウンロード-west-2. vpce-svc-03 c 2ea 94 c 80806 41 1</code></p></td>
       </tr>
    </table>

    ![KFB0bZlsmoo61rxiVBrc1ULgnQe](/img/KFB0bZlsmoo61rxiVBrc1ULgnQe.png)

1. [ネットワーク設定]で、[上記で作成したVPC](./configure-vpc#step-1-create-vpc-and-resources)を選択し、[**DNS名を有効**にする]を選択します。

    ![TYiwb6sFZon93vxJ8zIcnZWGnuw](/img/TYiwb6sFZon93vxJ8zIcnZWGnuw.png)

1. [**サブネット**]で、[VPCとともに作成されたプライベートサブネットを](./configure-vpc#step-1-create-vpc-and-resources)選択します。

    ![VB1qbusLFoovhdxCHK9cYCSVnue](/img/VB1qbusLFoovhdxCHK9cYCSVnue.png)

1. [**セキュリティグループ**]で、[上記で作成したセキュリティグループ](./configure-vpc#step-2-create-a-security-group)を選択します。

1. 上記の設定を保存するには、**エンドポイントを作成**をクリックしてください。

1. VPCエンドポイントIDをZilliz Cloudにコピーしてください。

    ![TWn6bVfs6opshdxnvXTcMirandg](/img/TWn6bVfs6opshdxnvXTcMirandg.png)

### ステップ4:（オプション）DNSレコードを設定する{#step-4-set-up-a-dns-record}

オプションで、VPCとZilliz BYOCの間にプライベートリンクを設定して、トラフィックを暗号化することができます。そのためには、ホストゾーンを作成し、VPCに関連付け、ホストゾーンにCNAMEレコードを作成して、Zilliz BYOCドメイン名をVPCエンドポイントに解決する必要があります。

1. Amazon Route 53を使用してホストゾーンを作成します。

    Amazon Route 53はWebベースのDNSサービスです。DNSレコードを追加できるように、ホストされたDNSゾーンを作成してください。

    ![IcwabyCPuo96lvxGkH4c5ZBgnIh](/img/IcwabyCPuo96lvxGkH4c5ZBgnIh.png)

    1. AWSアカウントにログインし、[ホストゾーン](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#)に移動してください。

    1. [**ホストゾーンの作成**]をクリックします。

    1. [**ホストゾーンの構成**]セクションで、次のパラメータを設定します。

        <table>
           <tr>
             <th><p><strong>パラメータ名</strong></p></th>
             <th><p><strong>パラメータの説明</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>Domain name</strong></p></td>
             <td><p><code>byoc.zillizcloud.com</code>を使用します。</p></td>
           </tr>
           <tr>
             <td><p><strong>Description</strong></p></td>
             <td><p>ホストゾーンを区別するために使用される説明。</p></td>
           </tr>
           <tr>
             <td><p><strong>Type</strong></p></td>
             <td><p>[<strong>プライベートホストゾーン</strong>]を選択します。</p></td>
           </tr>
        </table>

    1. ホストゾーンに関連付けるVPCのセクションで、ホストゾーンに関連付けるVPC IDを追加します。

1. ホストゾーンにCNAMEレコードを作成します。

    CNAMEレコードは、エイリアス名を真のまたは正規のドメイン名にマップするDNSレコードの一種です。Zilliz Cloudによって割り当てられたプライベートリンクをVPCエンドポイントのDNS名にマップするエイリアスレコードを作成します。その後、プライベートリンクを使用してクラスターにプライベートにアクセスできます。

    ![UFDqbXyIZoB9pIxMUKwcQnzonjc](/img/UFDqbXyIZoB9pIxMUKwcQnzonjc.png)

    1. 作成したホストゾーンで、[**レコードの作成**]をクリックします。

    1. 現在のプロジェクトが展開されているクラウドリージョンに合わせて**レコード名**を設定してください。

        <table>
           <tr>
             <th><p>AWSリージョン</p></th>
             <th><p>レコード名</p></th>
           </tr>
           <tr>
             <td><p>us-west-2</p></td>
             <td><p><code>zilliz-byoc-us</code></p></td>
           </tr>
           <tr>
             <td><p>eu-central-1</p></td>
             <td><p><code>zilliz-byoc-eu</code></p></td>
           </tr>
        </table>

    1. [**レコードの作成**]ページで、[**エイリアス**]をオンにし、[**トラフィック**]を次のようにルーティングを選択します。

        1. 最初のドロップダウンリストでVPCエンドポイントへのエイリアスを選択してください。

        1. 2番目のドロップダウンリストで雲の地域を選択してください。

        1. 上で作成したエンドポイントの名前を入力します。

    1. [**レコードの作成**]をクリックします。

### ステップ5: VPC情報をZilliz Cloudに提出する{#step-5-submit-vpc-information-to-zilliz-cloud}

上記の手順をAWSで完了したら、Zilliz Cloudに戻り、**ネットワーク設定**でVPC ID、サブネットID、セキュリティグループID、オプションのVPCエンドポイントIDを入力し、「**次**へ」をクリックしてプロジェクトデプロイプロセス全体の概要を表示します。すべてが予想通りに構成されている場合は、「**デプロイ**」をクリックしてプロセスを開始してください。

![NyszbII4woUBt8xkjKhcCWKynPc](/img/NyszbII4woUBt8xkjKhcCWKynPc.png)

