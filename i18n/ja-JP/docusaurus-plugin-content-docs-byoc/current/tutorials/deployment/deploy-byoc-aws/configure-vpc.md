---
title: "AWS でカスタマー管理 VPC を設定する | BYOC"
slug: /configure-vpc
sidebar_label: "AWS でカスタマー管理 VPC を設定する"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、お客様自身の Virtual Private Cloud (VPC) 内にプロジェクトをセットアップできます。Zilliz Cloud プロジェクトをカスタマー管理 VPC で実行することで、ネットワーク設定をより細かく制御でき、組織で求められる特定のクラウドセキュリティおよびガバナンス標準を満たせるようになります。 | BYOC"
type: origin
token: U3mEwtr42i7GJsk25nzcc4KonUc
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS でカスタマー管理 VPC を設定する

Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、お客様自身の Virtual Private Cloud (VPC) 内にプロジェクトをセットアップできます。Zilliz Cloud プロジェクトをカスタマー管理 VPC で実行することで、ネットワーク設定をより細かく制御でき、組織で求められる特定のクラウドセキュリティおよびガバナンス標準を満たせるようになります。 

このページでは、これらの要件を満たすカスタマー管理 VPC で Zilliz Cloud BYOC プロジェクトをホストするための最小要件を示します。 

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## VPC 要件\{#vpc-requirements}

Zilliz Cloud プロジェクトをホストするには、このセクションに記載された要件を VPC が満たしている必要があります。BYOC プロジェクトに既存の VPC を使用したい場合は、その VPC がこれらの要件を満たしていることを確認してください。 

**要件**

- [VPC リージョン](./configure-vpc#vpc-regions)

- [VPC IP アドレス範囲](./configure-vpc#vpc-ip-address-ranges)

- [サブネット](./configure-vpc#subnets)

- [DNS サポート](./configure-vpc#dns-support)

- [NAT gateway](./configure-vpc#nat-gateway)

- [セキュリティグループ](./configure-vpc#security-group)

- [VPC endpoint](./configure-vpc#vpc-endpoint)

### VPC リージョン\{#vpc-regions}

以下の表は、Zilliz Cloud BYOC ソリューションがサポートする AWS クラウドリージョンを示しています。Zilliz Cloud コンソールにお使いのクラウドリージョンが表示されない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>北米</p></td>
     <td><p>us-west-2</p></td>
     <td><p>米国オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>米国バージニア北部</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>米国オハイオ</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ（中部）</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>アジア</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>日本、東京</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>韓国、ソウル</p></td>
   </tr>
   <tr>
     <td><p>ap-east-1</p></td>
     <td><p>香港</p></td>
   </tr>
   <tr>
     <td><p>オセアニア</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>オーストラリア、シドニー</p></td>
   </tr>
</table>

### VPC IP アドレス範囲\{#vpc-ip-address-ranges}

Zilliz Cloud では、VPC の IPv4 CIDR 設定で **/16** のネットマスクを使用することを推奨しています。これにより、CIDR ブロックから 1 つのパブリックサブネットと 3 つのプライベートサブネットを作成できます。

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud は現在、IPv4 CIDR ブロックのみをサポートしています。

</Admonition>

### サブネット\{#subnets}

Zilliz Cloud プロジェクトには、1 つのパブリックサブネットと 3 つのプライベートサブネットが必要で、各プライベートサブネットは異なるアベイラビリティゾーンに配置されている必要があります。 

パブリックサブネットは NAT gateway をホストし、ネットマスクは **/24** です。各プライベートサブネットのネットマスクは **/18** で、EKS cluster 内で Application Load Balancer (ALB) Ingress ルーティングを使用できるようにするため、`kubernetes.io/role/internal-elb=1` のタグを付ける必要があります。 

ALB が EKS cluster 内の pod に対してアプリケーションおよび HTTP トラフィックをどのようにルーティングするかの詳細については、[この記事](https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html)を参照してください。

### DNS サポート\{#dns-support}

VPC では、DNS ホスト名と DNS 解決を有効にする必要があります。

### NAT gateway\{#nat-gateway}

Zilliz Cloud は、プライベートサブネット内のリソースがインターネットに到達できるように、パブリックサブネット内に 1 つの NAT gateway を設定します。ただし、外部サービスからプライベートサブネット内のリソースへの接続を開始することはできません。

### セキュリティグループ\{#security-group}

インバウンドルールではポート 443 を開放する必要があります。セキュリティグループの作成方法の詳細については、[ステップ 2: セキュリティグループを作成する](./configure-vpc#step-2-create-a-security-group) を参照してください。

### VPC endpoint\{#vpc-endpoint}

VPC endpoint はオプションであり、BYOC cluster 用のプライベートエンドポイントを設定する必要がある場合に使用されます。作成方法の詳細については、[ステップ 3: （オプション）VPC endpoint を作成する](./configure-vpc#step-3-optional-create-a-vpc-endpoint) を参照してください。

## 手順\{#procedure}

AWS コンソールを使用して VPC および関連リソースを作成できます。代替手段として、Zilliz Cloud が提供する Terraform スクリプトを使用し、AWS 上の Zilliz Cloud プロジェクト向けインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: VPC とリソースを作成する\{#step-1-create-vpc-and-resources}

AWS コンソールでは、[VPC 要件](./configure-vpc#vpc-requirements) に記載されている VPC および関連リソースを作成できます。

<Procedures>

1. AWS の VPC ダッシュボードに移動します。

1. 右上隅のリージョンドロップダウンでクラウドリージョンを確認します。Zilliz Cloud プロジェクトと同じリージョンに変更してください。

1. **Create VPC** ボタンをクリックします。

1. **VPC settings** で、以下のスナップショットのように設定します。

    ![create-aws-vpc-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/create-aws-vpc-byoc.png "create-aws-vpc-byoc")

    1. **VPC and more** をクリックします。**Name tag auto-generation** に、プロジェクト名を入力します。

    1. **IPv4 CIDR block** で、ネットマスクが **/16** であることを確認します。

    1. **Number of Availability Zones (AZ)** で **3** をクリックします。**Customize AZs** を展開すると、利用可能なアベイラビリティゾーンを確認できます。

    1. **Number of public subnets** で **3** をクリックします。これらのサブネットは、このエディタで NAT gateway を有効にするために必要です。

    1. **Number of private subnets** で **3** をクリックします。これらのサブネットは、Zilliz Cloud BYOC プロジェクトに必要です。

    1. **Customize subnets CIDR blocks** を展開し、各パブリックサブネットのネットワークマスクが **/24**（例: **10.0.0.0/24**、**10.0.16.0/24**、**10.0.32.0/24**）であり、各プライベートサブネットのネットワークマスクが **/18**（例: **10.0.64.0/18**、**10.0.128。0/18**、**10.0.192.0/18**）であることを確認します。

    1. **NAT gateways** で **In 1 AZ** をクリックします。

    1. **DNS options** で、両方のオプションが選択されていることを確認します。

    1. **Additional tags** で **Add new tag** をクリックします。**Key** を `Vendor`、**Value** を `zilliz-byoc` に設定します。

1. **Create VPC** をクリックします。

1. VPC が作成されたら、詳細を下にスクロールし、**View VPC.** をクリックします。

1. **Details** セクションで VPC ID をコピーし、Zilliz Cloud に貼り付けます。

    ![Rkj2bzxw0ocgLzxE63AcJ0VEnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rkj2bzxw0ocglzxe63acj0venhe.png "Rkj2bzxw0ocgLzxE63AcJ0VEnHe")

1. **Resource map** セクションで、各プライベートサブネットの末尾にある外部リンクアイコンをクリックして、その詳細を表示します。

    ![VecQbx7epoBqABx8vKOcaIS7nDd](https://zdoc-images.s3.us-west-2.amazonaws.com/vecqbx7epobqabx8vkocais7ndd.png "VecQbx7epoBqABx8vKOcaIS7nDd")

1. **Subnet Details** ページで、サブネット ID をコピーします。 

    ![GPimbEY2Aoz5UtxUCxkcqrAYnjc](https://zdoc-images.s3.us-west-2.amazonaws.com/gpimbey2aoz5utxucxkcqraynjc.png "GPimbEY2Aoz5UtxUCxkcqrAYnjc")

1. 次に **Manage tags** をクリックします。表示されたページで **Add new tag** をクリックし、新しいタグリストエントリの **Key** を `kubernetes.io/role/internal-elb`、**Value** を `1` に設定します。その後、**Save** をクリックします。

    ![HZdBb4d4QoLEUzxrkxpcqro4nTe](https://zdoc-images.s3.us-west-2.amazonaws.com/hzdbb4d4qoleuzxrkxpcqro4nte.png "HZdBb4d4QoLEUzxrkxpcqro4nTe")

</Procedures>

### ステップ 2: セキュリティグループを作成する\{#step-2-create-a-security-group}

VPC 内のセキュリティグループは、インバウンドおよびアウトバウンドトラフィックを制御することで AWS リソースを保護し、EC2 インスタンスの仮想ファイアウォールとして機能します。セキュリティグループは次のように作成できます。

<Procedures>

1. AWS の VPC ダッシュボードに移動します。

1. 左側のナビゲーションペインで **Security** > **Security groups** を見つけ、右ペイン右上の **Create security group** をクリックします。

1. **Security group name** と **Description** を設定し、VPC ドロップダウンリストから先ほど作成した VPC を選択します。

    ![W6n9b4BRVoVi8PxgrLUcajOtnSc](https://zdoc-images.s3.us-west-2.amazonaws.com/w6n9b4brvovi8pxgrlucajotnsc.png "W6n9b4BRVoVi8PxgrLUcajOtnSc")

1. **Inbound rules** セクションで **Add rule** をクリックし、インバウンドルールを作成します。

1. **Source** で **Anywhere-IPv4** を選択するか、**Source** ドロップダウン右側のテキストボックスにアクセスを許可する CIDR ブロックを入力します。

    ![Z6SObL7FYofXBuxk46WcuRsbnLb](https://zdoc-images.s3.us-west-2.amazonaws.com/z6sobl7fyofxbuxk46wcursbnlb.png "Z6SObL7FYofXBuxk46WcuRsbnLb")

1. レコードを追加し、**Type** で **HTTPS** を、**Destination** で **Anywhere-IPv4** を選択するか、**Destination** ドロップダウン右側のテキストボックスにアクセスを許可する CIDR ブロックを入力します。

    ![N0B8bIiXdobTjUxp1AVc76Xcnsc](https://zdoc-images.s3.us-west-2.amazonaws.com/n0b8biixdobtjuxp1avc76xcnsc.png "N0B8bIiXdobTjUxp1AVc76Xcnsc")

1. **Tags** セクションで、以下のスクリーンショットのようにキーと値のペアを追加します。

    ![FlaPbHes2oLjZ8xO1X9cppYTnyc](https://zdoc-images.s3.us-west-2.amazonaws.com/flapbhes2oljz8xo1x9cppytnyc.png "FlaPbHes2oLjZ8xO1X9cppYTnyc")

1. **Create security group** をクリックしてセキュリティグループを保存します。

1. セキュリティグループ ID をコピーして Zilliz Cloud に戻します。

    ![KMuWbhLTVoiyCjx1HXjcGERunZd](https://zdoc-images.s3.us-west-2.amazonaws.com/kmuwbhltvoiycjx1hxjcgerunzd.png "KMuWbhLTVoiyCjx1HXjcGERunZd")

</Procedures>

### ステップ 3: （オプション）VPC endpoint を作成する\{#step-3-optional-create-a-vpc-endpoint}

VPC endpoint は、安全な cluster 接続リレーを確保し、Zilliz Cloud REST API へのプライベートコールを可能にします。AWS Management Console を使用して VPC endpoint を管理する方法については、AWS Management Console の [AWS article Create VPC endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html) を参照するか、次の手順を使用してください。

<Admonition type="info" icon="📘" title="注意">

このセクションで作成する VPC endpoint は、AWS PrivateLink のセットアップに使用されます。VPC endpoint の準備ができたら、hosted zone を作成し、いくつかの DNS レコードを追加する必要があります。詳細については、[Set up a PrivateLink (AWS)](./setup-a-private-link-aws) を参照してください。

</Admonition>

<Procedures>

1. AWS の **VPC dashboard** に移動します。

1. 左側のナビゲーションペインで **PrivateLink and Lattice** > **Endpoints** を見つけ、右ペイン右上の **Create endpoint** をクリックします。

1. **Name tag** を設定するか、空白のままにして AWS に自動生成させます。**Type** では **Endpoint services that use NLBs and GWLBs** を選択します。

    ![GRIrbg4sYoN75oxCnRsci3JnnLO](https://zdoc-images.s3.us-west-2.amazonaws.com/grirbg4syon75oxcnrsci3jnnlo.png "GRIrbg4sYoN75oxCnRsci3JnnLO")

1. **Service settings** で、**Service name** にリージョンに対応する Zilliz Cloud VPC endpoint を入力し、**Verify service** をクリックします。 

    現在利用可能なクラウドリージョンは次の表のとおりです。お使いのクラウドリージョンが表にない場合は、support@zilliz.com までお問い合わせください。

    | AWS Region | Location | Zilliz Cloud VPC endpoint |
    | --- | --- | --- |
    | us-west-2 | Oregon | `com.amazonaws.vpce.us-west-2.vpce-svc-0654fb016640c364a` |
    | eu-central-1 | Frankfurt | `com.amazonaws.vpce.eu-central-1.vpce-svc-0d5ce1ec4decbc7df` |

    ![VYLlboU8fofvUPx6NYUcGztpn3s](https://zdoc-images.s3.us-west-2.amazonaws.com/vyllbou8fofvupx6nyucgztpn3s.png "VYLlboU8fofvUPx6NYUcGztpn3s")

1. **Network settings** で、[上で作成した VPC](./configure-vpc#step-1-create-vpc-and-resources) を選択し、**Enable DNS name** を選択します。

    ![DyH3b9kOro2wf6xGcsUcD2DbnVo](https://zdoc-images.s3.us-west-2.amazonaws.com/dyh3b9koro2wf6xgcsucd2dbnvo.png "DyH3b9kOro2wf6xGcsUcD2DbnVo")

1. **Subnet** で、[VPC と一緒に作成したプライベートサブネット](./configure-vpc#step-1-create-vpc-and-resources) を選択します。 

    ![IdcebwU1Ao4QffxGwYTceh9AnVe](https://zdoc-images.s3.us-west-2.amazonaws.com/idcebwu1ao4qffxgwytceh9anve.png "IdcebwU1Ao4QffxGwYTceh9AnVe")

1. **Security groups** で、[上で作成したセキュリティグループ](./configure-vpc#step-2-create-a-security-group) を選択します。

1. **Create endpoint** をクリックして上記の設定を保存します。

1. **Endpoints** リストで作成した VPC endpoint ID をクリックし、その詳細を表示します。

    ![KhRBbAbSAoU2X0xdnMtc0Gmunvf](https://zdoc-images.s3.us-west-2.amazonaws.com/khrbbabsaou2x0xdnmtc0gmunvf.png "KhRBbAbSAoU2X0xdnMtc0Gmunvf")

1. **Private DNS names** の値が `*.aws-{region}.byoc.cloud.zilliz.com` に似ているか確認します。 

    1. その場合は、**Endpoint ID** をコピーして Zilliz Cloud コンソールに貼り付けます。 

        ![BUejbgXWJoXi5jxDmZnc7Ogdnah](https://zdoc-images.s3.us-west-2.amazonaws.com/buejbgxwjoxi5jxdmznc7ogdnah.png "BUejbgXWJoXi5jxDmZnc7Ogdnah")

    1. そうでない場合は、設定を確認し、必要な変更を行ってください。

</Procedures>

### ステップ 4: VPC 情報を Zilliz Cloud に送信する\{#step-4-submit-vpc-information-to-zilliz-cloud}

AWS で上記の手順を完了したら、Zilliz Cloud に戻り、**Network settings** に VPC ID、サブネット ID、セキュリティグループ ID、およびオプションの VPC endpoint ID を入力し、**Next** をクリックしてプロジェクト全体のデプロイプロセスの概要を表示します。すべてが想定どおりに設定されている場合は、**Deploy** をクリックしてプロセスを開始します。

![VDXYbAfS2oQ04YxcMs0cEETbn2c](https://zdoc-images.s3.us-west-2.amazonaws.com/vdxybafs2oq04yxcms0ceetbn2c.png "VDXYbAfS2oQ04YxcMs0cEETbn2c")

