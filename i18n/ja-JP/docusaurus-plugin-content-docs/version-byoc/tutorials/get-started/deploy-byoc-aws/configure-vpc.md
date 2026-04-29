---
title: "AWS でカスタマー管理型 VPC を構成する | BYOC"
slug: /configure-vpc
sidebar_key: configure-vpc
sidebar_label: "AWS でカスタマー管理型 VPC を構成する"
beta: CONTACT SALES
notebook: FALSE
description: "Zilliz Cloud の Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、独自の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。カスタマー管理型 VPC 内で Zilliz Cloud プロジェクトを実行することで、ネットワーク構成をより細かく制御でき、組織に求められる特定のクラウドセキュリティおよびガバナンス基準を満たすことが可能になります。| BYOC"
type: origin
token: U3mEwtr42i7GJsk25nzcc4KonUc
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - aws
  - vpc
  - セキュリティグループ
  - VPC エンドポイント
  - サブネット
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS 上でカスタマー管理型 VPC を構成する

Zilliz Cloud の Bring-Your-Own-Cloud (BYOC) ソリューションを使用すると、ご自身の Virtual プライベート Cloud (VPC) 内にプロジェクトを設定できます。カスタマー管理型 VPC 内で実行される Zilliz Cloud プロジェクトにより、ネットワーク構成をより細かく制御できるようになり、組織に求められる特定のクラウドセキュリティおよびガバナンス基準を満たすことが可能になります。

このページでは、これらの要件を満たすカスタマー管理型 VPC で Zilliz Cloud BYOC プロジェクトをホストするために必要な最小要件を一覧で示します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud の営業担当者</a>までお問い合わせください。</p>

</Admonition>

## VPC の要件\{#vpc-requirements}

Zilliz Cloud プロジェクトをホストするには、VPC がこのセクションに記載された要件を満たしている必要があります。既存の VPC を BYOC プロジェクトに使用する場合は、VPC がこれらの要件を満たしていることを確認してください。

**要件**

- [VPC リージョン](./configure-vpc#vpc-regions)

- [VPC IP アドレス範囲](./configure-vpc#vpc-ip-address-ranges)

- [サブネット](./configure-vpc#subnets)

- [DNS サポート](./configure-vpc#dns-support)

- [NAT ゲートウェイ](./configure-vpc#nat-gateway)

- [セキュリティグループ](./configure-vpc#security-group)

- [VPC エンドポイント](./configure-vpc#vpc-endpoint)

### VPC リージョン\{#vpc-regions}

以下の表は、Zilliz Cloud BYOC ソリューションがサポートする AWS クラウドリージョンの一覧です。Zilliz Cloud コンソールにお使いのクラウドリージョンが表示されない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p>AWS リージョン</p></th>
     <th><p>ロケーション</p></th>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>Oregon</p></td>
   </tr>
   <tr>
     <td><p>eu-central-1</p></td>
     <td><p>Frankfurt</p></td>
   </tr>
</table>

### VPC IP アドレス範囲\{#vpc-ip-address-ranges}

Zilliz Cloud では、VPC の IPv4 CIDR 設定で **/16** のネットマスクを使用することを推奨しています。これにより、CIDR ブロックから 1 つのパブリックサブネットと 3 つのプライベートサブネットを作成できます。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud は現在、IPv4 CIDR ブロックのみをサポートしています。</p>

</Admonition>

### サブネット\{#subnets}

Zilliz Cloud プロジェクトには、1 つのパブリックサブネットと 3 つのプライベートサブネットが必要です。各プライベートサブネットは異なるアベイラビリティーゾーンに配置する必要があります。

パブリックサブネットは NAT ゲートウェイをホストし、ネットマスクは **/24** です。各プライベートサブネットのネットマスクは **/18** であり、EKS クラスター内での Application Load Balancer (ALB) Ingress ルーティングの使用を許可するため、`kubernetes.io/role/internal-elb=1` というタグを付与する必要があります。

EKS クラスター内のポッドに対して ALB がアプリケーショントラフィックおよび HTTP トラフィックをどのようにルーティングするかについては、[この記事](https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html) を参照してください。

### DNS サポート\{#dns-support}

VPC では、DNS ホスト名と DNS 解決を有効にする必要があります。

### NAT ゲートウェイ\{#nat-gateway}

Zilliz Cloud は、プライベートサブネット内のリソースがインターネットに到達できるように、パブリックサブネットに単一の NAT ゲートウェイを設定します。ただし、外部サービスからプライベートサブネット内のリソースへ接続を開始することはできません。

### セキュリティグループ\{#security-group}

インバウンドルールではポート 443 を開放する必要があります。セキュリティグループの作成方法については、[手順 2: セキュリティグループの作成](./configure-vpc#step-2-create-a-security-group) を参照してください。

### VPC エンドポイント\{#vpc-endpoint}

VPC エンドポイントはオプションであり、BYOC クラスター用にプライベートエンドポイントを構成する必要がある場合に使用されます。セキュリティグループの作成方法については、[手順 3: (オプション) VPC エンドポイントの作成](./configure-vpc#step-3-optional-create-a-vpc-endpoint) を参照してください。

## 手順\{#procedure}

AWS コンソールを使用して VPC および関連リソースを作成できます。 alternatively、Zilliz Cloud が提供する Terraform スクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト用のインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### 手順 1: VPC およびリソースの作成\{#step-1-create-vpc-and-resources}

AWS コンソールで、[VPC の要件](./configure-vpc#vpc-requirements) に記載されている VPC および関連リソースを作成できます。

<Procedures>

1. AWS の VPC ダッシュボードに移動します。

1. 右上隅のリージョンドロップダウンでクラウドリージョンを確認します。これを Zilliz Cloud プロジェクトと同じリージョンに変更します。

1. **VPC の作成** ボタンをクリックします。

1. **VPC 設定** で、以下のスナップショットに示すように設定します。

    ![create-aws-vpc-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/create-aws-vpc-byoc.png "create-aws-vpc-byoc")

    1. **VPC など** をクリックします。**名前タグの自動生成** で、プロジェクトの名前を入力します。

    1. **IPv4 CIDR ブロック** で、ネットマスクが **/16** であることを確認します。

    1. **アベイラビリティーゾーン (AZ) 数** で、**3** をクリックします。**AZ のカスタマイズ** を展開して、利用可能なアベイラビリティーゾーンを確認できます。

    1. **パブリックサブネット数** で、**3** をクリックします。これらのサブネットは、このエディターで NAT ゲートウェイを有効にするために必要です。

    1. **プライベートサブネット数** で、**3** をクリックします。これらのサブネットは Zilliz Cloud BYOC プロジェクトに必要です。

    1. **サブネット CIDR ブロックのカスタマイズ** を展開し、各パブリックサブネットのネットワークマスクが **/24**（例：**10.0.0.0/24**、**10.0.16.0/24**、**10.0.32.0/24**）であり、各プライベートサブネットのネットワークマスクが **/18**（例：**10.0.64.0/18**、**10.0.128.0/18**、**10.0.192.0/18**）であることを確認します。

    1. **NAT ゲートウェイ** で、**1 つの AZ 内** をクリックします。

    1. **DNS オプション** で、両方のオプションが選択されていることを確認します。

    1. **追加タグ** で、**新しいタグを追加** をクリックします。**キー** を `Vendor` に、**値** を `zilliz-byoc` に設定します。

1. **VPC の作成** をクリックします。

1. VPC が作成されたら、詳細を下にスクロールして **VPC を表示** をクリックします。

1. **詳細** セクションで VPC ID をコピーし、Zilliz Cloud に貼り付けます。

    ![Rkj2bzxw0ocgLzxE63AcJ0VEnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rkj2bzxw0ocglzxe63acj0venhe.png "Rkj2bzxw0ocgLzxE63AcJ0VEnHe")

1. **リソースマップ** セクションで、各プライベートサブネットの末尾にある外部リンクアイコンをクリックして、その詳細を表示します。

    ![VecQbx7epoBqABx8vKOcaIS7nDd](https://zdoc-images.s3.us-west-2.amazonaws.com/vecqbx7epobqabx8vkocais7ndd.png "VecQbx7epoBqABx8vKOcaIS7nDd")

1. **サブネットの詳細** ページで、サブネット ID をコピーします。

    ![GPimbEY2Aoz5UtxUCxkcqrAYnjc](https://zdoc-images.s3.us-west-2.amazonaws.com/gpimbey2aoz5utxucxkcqraynjc.png "GPimbEY2Aoz5UtxUCxkcqrAYnjc")

1. 次に、**タグの管理** をクリックします。表示されたページで、**新しいタグを追加** をクリックし、新しいタグリストエントリの **キー** を `kubernetes.io/role/internal-elb` に、**値** を `1` に設定します。次に、**保存** をクリックします。

    ![HZdBb4d4QoLEUzxrkxpcqro4nTe](https://zdoc-images.s3.us-west-2.amazonaws.com/hzdbb4d4qoleuzxrkxpcqro4nte.png "HZdBb4d4QoLEUzxrkxpcqro4nTe")

</Procedures>

### 手順 2: セキュリティグループの作成\{#step-2-create-a-security-group}

VPC 内のセキュリティグループは、インバウンドおよびアウトバウンドトラフィックを制御することで AWS リソースを保護し、EC2 インスタンス用の仮想ファイアウォールとして機能します。セキュリティグループは次のように作成できます。

<Procedures>

1. AWS の VPC ダッシュボードに移動します。

1. 左側のナビゲーションペインで **セキュリティ** > **セキュリティグループ** を探し、右ペインの右上隅にある **セキュリティグループの作成** をクリックします。

1. **セキュリティグループ名** と **説明** を設定し、VPC ドロップダウンリストから以前作成した VPC を選択します。

    ![W6n9b4BRVoVi8PxgrLUcajOtnSc](https://zdoc-images.s3.us-west-2.amazonaws.com/w6n9b4brvovi8pxgrlucajotnsc.png "W6n9b4BRVoVi8PxgrLUcajOtnSc")

1. **インバウンドルール** セクションで **ルールの追加** をクリックし、インバウンドルールを作成します。

1. **送信元** で **任意の場所 -IPv4** を選択するか、**送信元** ドロップダウンの右側にあるテキストボックスにアクセスを許可する CIDR ブロックを入力します。

    ![Z6SObL7FYofXBuxk46WcuRsbnLb](https://zdoc-images.s3.us-west-2.amazonaws.com/z6sobl7fyofxbuxk46wcursbnlb.png "Z6SObL7FYofXBuxk46WcuRsbnLb")

1. レコードを追加し、**タイプ** で **HTTPS** を、**送信先** で **任意の場所 -IPv4** を選択するか、**送信先** ドロップダウンの右側にあるテキストボックスにアクセスを許可する CIDR ブロックを入力します。

    ![N0B8bIiXdobTjUxp1AVc76Xcnsc](https://zdoc-images.s3.us-west-2.amazonaws.com/n0b8biixdobtjuxp1avc76xcnsc.png "N0B8bIiXdobTjUxp1AVc76Xcnsc")

1. **タグ** セクションで、以下のスクリーンショットに示すようにキーと値のペアを追加します。

    ![FlaPbHes2oLjZ8xO1X9cppYTnyc](https://zdoc-images.s3.us-west-2.amazonaws.com/flapbhes2oljz8xo1x9cppytnyc.png "FlaPbHes2oLjZ8xO1X9cppYTnyc")

1. **セキュリティグループの作成** をクリックして、セキュリティグループを保存します。

1. セキュリティグループ ID をコピーし、Zilliz Cloud に貼り付けます。

    ![KMuWbhLTVoiyCjx1HXjcGERunZd](https://zdoc-images.s3.us-west-2.amazonaws.com/kmuwbhltvoiycjx1hxjcgerunzd.png "KMuWbhLTVoiyCjx1HXjcGERunZd")

</Procedures>

### 手順 3: (オプション) VPC エンドポイントの作成\{#step-3-optional-create-a-vpc-endpoint}

VPC エンドポイントは、安全なクラスター接続のリレーを保証し、Zilliz Cloud REST API へのプライベート呼び出しを可能にします。AWS 管理コンソールで VPC エンドポイントを管理する方法については、AWS 管理コンソールの [AWS 記事「VPC エンドポイントの作成」](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html) を参照するか、以下の手順に従ってください。

<Admonition type="info" icon="📘" title="Notes">

<p>このセクションで作成する VPC エンドポイントは、AWS プライベートLink を設定するために使用されます。VPC エンドポイントの準備が整ったら、ホストゾーンを作成し、いくつかの DNS レコードを追加する必要があります。詳細については、<a href="./setup-a-private-link-aws">プライベートLink の設定 (AWS)</a> を参照してください。</p>

</Admonition>

<Procedures>

1. AWS の **VPC ダッシュボード** に移動します。

1. 左側のナビゲーションペインで **プライベートLink および Lattice** > **エンドポイント** を探し、右ペインの右上隅にある **エンドポイントの作成** をクリックします。

1. **名前タグ** を設定するか、空白のままにして AWS に自動生成させます。**タイプ** として、**NLB および GWLB を使用するエンドポイントサービス** を選択します。

    ![GRIrbg4sYoN75oxCnRsci3JnnLO](https://zdoc-images.s3.us-west-2.amazonaws.com/grirbg4syon75oxcnrsci3jnnlo.png "GRIrbg4sYoN75oxCnRsci3JnnLO")

1. **サービス設定** で、**サービス名** にお使いのリージョンの Zilliz Cloud VPC エンドポイントを入力し、**サービスの確認** をクリックします。

    以下の表は、現在利用可能なクラウドリージョンの一覧です。お使いのクラウドリージョンが表に記載されていない場合は、support@zilliz.com までお問い合わせください。

    <table>
       <tr>
         <th><p>AWS リージョン</p></th>
         <th><p>ロケーション</p></th>
         <th><p>Zilliz Cloud VPC エンドポイント</p></th>
       </tr>
       <tr>
         <td><p>us-west-2</p></td>
         <td><p>Oregon</p></td>
         <td><p><code>com.amazonaws.vpce.us-west-2.vpce-svc-0654fb016640c364a</code></p></td>
       </tr>
       <tr>
         <td><p>eu-central-1</p></td>
         <td><p>Frankfurt</p></td>
         <td><p><code>com.amazonaws.vpce.eu-central-1.vpce-svc-0d5ce1ec4decbc7df</code></p></td>
       </tr>
    </table>

    ![VYLlboU8fofvUPx6NYUcGztpn3s](https://zdoc-images.s3.us-west-2.amazonaws.com/vyllbou8fofvupx6nyucgztpn3s.png "VYLlboU8fofvUPx6NYUcGztpn3s")

1. **ネットワーク設定** で、[上記で作成した VPC](./configure-vpc#step-1-create-vpc-and-resources) を選択し、**DNS 名の有効化** を選択します。

    ![DyH3b9kOro2wf6xGcsUcD2DbnVo](https://zdoc-images.s3.us-west-2.amazonaws.com/dyh3b9koro2wf6xgcsucd2dbnvo.png "DyH3b9kOro2wf6xGcsUcD2DbnVo")

1. **サブネット** で、[VPC と一緒に作成したプライベートサブネット](./configure-vpc#step-1-create-vpc-and-resources) を選択します。

    ![IdcebwU1Ao4QffxGwYTceh9AnVe](https://zdoc-images.s3.us-west-2.amazonaws.com/idcebwu1ao4qffxgwytceh9anve.png "IdcebwU1Ao4QffxGwYTceh9AnVe")

1. **セキュリティグループ** で、[上記で作成したセキュリティグループ](./configure-vpc#step-2-create-a-security-group) を選択します。

1. **エンドポイントの作成** をクリックして、上記の設定を保存します。

1. **エンドポイント** リストで作成した VPC エンドポイント ID をクリックして、その詳細を表示します。

    ![KhRBbAbSAoU2X0xdnMtc0Gmunvf](https://zdoc-images.s3.us-west-2.amazonaws.com/khrbbabsaou2x0xdnmtc0gmunvf.png "KhRBbAbSAoU2X0xdnMtc0Gmunvf")

1. **プライベート DNS 名** の値が `*.aws-{region}.byoc.cloud.zilliz.com` と類似しているか確認します。

    1. そうであれば、**エンドポイント ID** をコピーし、Zilliz Cloud コンソールに貼り付けます。

        ![BUejbgXWJoXi5jxDmZnc7Ogdnah](https://zdoc-images.s3.us-west-2.amazonaws.com/buejbgxwjoxi5jxdmznc7ogdnah.png "BUejbgXWJoXi5jxDmZnc7Ogdnah")

    1. そうでない場合は、設定を確認して必要に応じて変更します。

</Procedures>

### 手順 4: VPC 情報を Zilliz Cloud に送信する\{#step-4-submit-vpc-information-to-zilliz-cloud}

AWS 上で上記の手順を完了したら、Zilliz Cloud に戻り、**ネットワーク設定** に VPC ID、サブネット ID、セキュリティグループ ID、およびオプションの VPC エンドポイント ID を入力して、**次へ** をクリックし、プロジェクトデプロイメントプロセス全体の概要を表示します。すべてが期待通りに構成されている場合は、**デプロイ** をクリックしてプロセスを開始します。

![VDXYbAfS2oQ04YxcMs0cEETbn2c](https://zdoc-images.s3.us-west-2.amazonaws.com/vdxybafs2oq04yxcms0ceetbn2c.png "VDXYbAfS2oQ04YxcMs0cEETbn2c")

