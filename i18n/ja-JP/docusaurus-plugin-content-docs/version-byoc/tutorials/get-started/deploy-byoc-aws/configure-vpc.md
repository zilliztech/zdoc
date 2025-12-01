---
title: "AWS 上の顧客管理 VPC の構成 | BYOC"
slug: /configure-vpc
sidebar_label: "AWS 上の顧客管理 VPC の構成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションにより、独自の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。顧客管理 VPC で実行される Zilliz Cloud プロジェクトでは、ネットワーク構成をより制御できるため、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。 | BYOC"
type: origin
token: U3mEwtr42i7GJsk25nzcc4KonUc
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
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database

---

import Admonition from '@theme/Admonition';


# AWS 上の顧客管理 VPC の構成

Zilliz Cloud Bring-Your-Own-Cloud (BYOC) ソリューションにより、独自の Virtual Private Cloud (VPC) 内にプロジェクトを設定できます。顧客管理 VPC で実行される Zilliz Cloud プロジェクトでは、ネットワーク構成をより制御できるため、組織が必要とする特定のクラウドセキュリティおよびガバナンス基準を満たすことができます。

このページでは、これらの要件を満たす顧客管理 VPC に Zilliz Cloud BYOC プロジェクトをホストするために必要な最小要件を列挙します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## VPC 要件\{#vpc-requirements}

BYOC プロジェクトをホストするには、VPC がこのセクションで列挙された要件を満たしている必要があります。既存の VPC を BYOC プロジェクトに使用することを検討している場合は、VPC がこれらの要件を満たしていることを確認してください。

**要件**

- [VPC リージョン](./configure-vpc#vpc-regions)

- [VPC IP アドレス範囲](./configure-vpc#vpc-ip-address-ranges)

- [サブネット](./configure-vpc#subnets)

- [DNS サポート](./configure-vpc#dns-support)

- [NAT ゲートウェイ](./configure-vpc#nat-gateway)

- [セキュリティグループ](./configure-vpc#security-group)

- [VPC エンドポイント](./configure-vpc#vpc-endpoint)

### VPC リージョン\{#vpc-regions}

以下の表は、Zilliz Cloud BYOC ソリューションがサポートする AWS クラウドリージョンを示しています。Zilliz Cloud コンソールでクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p>AWS リージョン</p></th>
     <th><p>場所</p></th>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>オレゴン</p></td>
   </tr>
   <tr>
     <td><p>eu-central-1</p></td>
     <td><p>フランクフルト</p></td>
   </tr>
</table>

### VPC IP アドレス範囲\{#vpc-ip-address-ranges}

Zilliz Cloud では、VPC の IPv4 CIDR 設定で **/16** ネットマスクを使用することを推奨します。これにより、CIDR ブロックからパブリックサブネット1つとプライベートサブネット3つを作成できます。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud は現在、IPv4 CIDR ブロックのみをサポートしています。</p>

</Admonition>

### サブネット\{#subnets}

Zilliz Cloud プロジェクトには、1つのパブリックサブネットと3つのプライベートサブネットが必要で、各プライベートサブネットは異なる可用性ゾーンに存在する必要があります。

パブリックサブネットには NAT ゲートウェイが配置され、ネットマスクは **/24** です。各プライベートサブネットのネットマスクは **/18** で、EKS クラスター内での Application Load Balancer (ALB) Ingress ルーティングを使用できるように、`kubernetes.io/role/internal-elb=1` のタグを付ける必要があります。

EKS クラスター内のポッドのアプリケーションおよび HTTP トラフィックを ALB がルーティングする方法の詳細については、[この記事](https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html) を参照してください。

### DNS サポート\{#dns-support}

VPC では DNS ホスト名と DNS 解決を有効にする必要があります。

### NAT ゲートウェイ\{#nat-gateway}

Zilliz Cloud はパブリックサブネットに単一の NAT ゲートウェイを設定し、プライベートサブネット内のリソースがインターネットにアクセスできるようにします。ただし、外部サービスはプライベートサブネット内のリソースとの接続を開始できません。

### セキュリティグループ\{#security-group}

イングレスルールではポート 443 を開く必要があります。セキュリティグループの作成方法の詳細については、[手順2: セキュリティグループを作成](./configure-vpc#step-2-create-a-security-group) を参照してください。

### VPC エンドポイント\{#vpc-endpoint}

VPC エンドポイントはオプションであり、BYOC クラスターのプライベートエンドポイントを構成する必要がある場合に使用されます。セキュリティグループの作成方法の詳細については、[手順3: (オプション) VPC エンドポイントを作成](./configure-vpc#step-3-optional-create-a-vpc-endpoint) を参照してください。

## 手順\{#procedure}

AWS コンソールを使用して VPC 及び関連リソースを作成できます。別の方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

### 手順1: VPC およびリソースを作成\{#step-1-create-vpc-and-resources}

AWS コンソールで、[VPC 要件](./configure-vpc#vpc-requirements) で列挙された VPC 及び関連リソースを作成できます。

1. AWS の VPC ダッシュボードに移動します。

1. 右上隅のリージョンドロップダウンでクラウドリージョンを確認します。Zilliz Cloud プロジェクトと一致するリージョンに変更します。

1. **VPC を作成** ボタンをクリックします。

1. **VPC 設定** で、以下のスナップショットに示すように設定します。

![create-aws-vpc-byoc](/img/create-aws-vpc-byoc.png)

1. **VPC を作成** をクリックします。

1. VPC が作成されたら、詳細を下にスクロールし、**VPC を表示** をクリックします。

1. **詳細** セクションで、VPC ID をコピーして Zilliz Cloud に戻します。

    ![Rkj2bzxw0ocgLzxE63AcJ0VEnHe](/img/Rkj2bzxw0ocgLzxE63AcJ0VEnHe.png)

1. **リソースマップ** セクションで、各プライベートサブネットの末尾にある外部リンクアイコンをクリックして、その詳細を表示します。

    ![VecQbx7epoBqABx8vKOcaIS7nDd](/img/VecQbx7epoBqABx8vKOcaIS7nDd.png)

1. **サブネット詳細** ページで、サブネット ID をコピーします。

    ![GPimbEY2Aoz5UtxUCxkcqrAYnjc](/img/GPimbEY2Aoz5UtxUCxkcqrAYnjc.png)

1. 次に **タグ管理** をクリックします。開いたページで **新規タグを追加** をクリックし、新しいタグリストエントリの **キー** を `kubernetes.io/role/internal-elb` に、**値** を `1` に設定します。次に **保存** をクリックします。

    ![HZdBb4d4QoLEUzxrkxpcqro4nTe](/img/HZdBb4d4QoLEUzxrkxpcqro4nTe.png)

### 手順2: セキュリティグループを作成\{#step-2-create-a-security-group}

VPC 内のセキュリティグループは、インバウンドおよびアウトバウンドトラフィックを制御することで AWS リソースを保護し、EC2 インスタンス用の仮想ファイアウォールとして機能します。以下のようにセキュリティグループを作成できます：

1. AWS の VPC ダッシュボードに移動します。

1. 左側のナビゲーションペインで **セキュリティ** > **セキュリティグループ** を探し、右ペインの右上隅にある **セキュリティグループを作成** をクリックします。

1. **セキュリティグループ名** と **説明** を設定し、VPC ドロップダウンリストから先ほど作成した VPC を選択します。

    ![W6n9b4BRVoVi8PxgrLUcajOtnSc](/img/W6n9b4BRVoVi8PxgrLUcajOtnSc.png)

1. **インバウンドルール** セクションで **ルールを追加** をクリックして、インバウンドルールを作成します。

1. **ソース** で **Anywhere-IPv4** を選択するか、**ソース** ドロップダウンの右側のテキストボックスにアクセスを許可する CIDR ブロックを入力します。

    ![Z6SObL7FYofXBuxk46WcuRsbnLb](/img/Z6SObL7FYofXBuxk46WcuRsbnLb.png)

1. レコードを追加し、**タイプ** で **HTTPS** を、**宛先** で **Anywhere-IPv4** を選択するか、**宛先** ドロップダウンの右側のテキストボックスにアクセスを許可する CIDR ブロックを入力します。

    ![N0B8bIiXdobTjUxp1AVc76Xcnsc](/img/N0B8bIiXdobTjUxp1AVc76Xcnsc.png)

1. **タグ** セクションで、以下のスクリーンショットに示すようにキーと値のペアを追加します。

    ![FlaPbHes2oLjZ8xO1X9cppYTnyc](/img/FlaPbHes2oLjZ8xO1X9cppYTnyc.png)

1. **セキュリティグループを作成** をクリックしてセキュリティグループを保存します。

1. セキュリティグループ ID を Zilliz Cloud に戻します。

    ![KMuWbhLTVoiyCjx1HXjcGERunZd](/img/KMuWbhLTVoiyCjx1HXjcGERunZd.png)

### 手順3: (オプション) VPC エンドポイントを作成\{#step-3-optional-create-a-vpc-endpoint}

VPC エンドポイントは、安全なクラスターコネクティビティリレーを保証し、Zilliz Cloud REST API へのプライベート呼び出しを可能にします。AWS マネジメントコンソールを使用した VPC エンドポイントの管理方法については、AWS マネジメントコンソールの [AWS 記事 VPC エンドポイントを作成](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html) を参照するか、以下の手順を使用してください：

<Admonition type="info" icon="📘" title="Notes">

<p>このセクションで作成された VPC エンドポイントは、AWS PrivateLink を設定するために使用されます。VPC エンドポイントの準備ができたら、ホストゾーンを作成し、いくつかの DNS レコードを追加する必要があります。詳細については、<a href="./setup-a-private-link-aws">PrivateLink を設定 (AWS)</a> を参照してください。</p>

</Admonition>

1. AWS の **VPC ダッシュボード** に移動します。

1. 左側のナビゲーションペインで **PrivateLink と Lattice** > **エンドポイント** を探し、右ペインの右上隅にある **エンドポイントを作成** をクリックします。

1. **名前タグ** を設定するか、空白のままにして AWS が自動生成できるようにします。**タイプ** では、**NLB および GWLB を使用するエンドポイントサービス** を選択します。

    ![GRIrbg4sYoN75oxCnRsci3JnnLO](/img/GRIrbg4sYoN75oxCnRsci3JnnLO.png)

1. **サービス設定** で、**サービス名** にリージョンの Zilliz Cloud VPC エンドポイントを入力し、**サービスを検証** をクリックします。

    以下の表は、現在利用可能なクラウドリージョンを示しています。お使いのクラウドリージョンが表にない場合は、support@zilliz.com までお問い合わせください。

    <table>
       <tr>
         <th><p>AWS リージョン</p></th>
         <th><p>場所</p></th>
         <th><p>Zilliz Cloud VPC エンドポイント</p></th>
       </tr>
       <tr>
         <td><p>us-west-2</p></td>
         <td><p>オレゴン</p></td>
         <td><p><code>com.amazonaws.vpce.us-west-2.vpce-svc-0654fb016640c364a</code></p></td>
       </tr>
       <tr>
         <td><p>eu-central-1</p></td>
         <td><p>フランクフルト</p></td>
         <td><p><code>com.amazonaws.vpce.eu-central-1.vpce-svc-0d5ce1ec4decbc7df</code></p></td>
       </tr>
    </table>

    ![VYLlboU8fofvUPx6NYUcGztpn3s](/img/VYLlboU8fofvUPx6NYUcGztpn3s.png)

1. **ネットワーク設定** で、[上記で作成された VPC](./configure-vpc#step-1-create-vpc-and-resources) を選択し、**DNS 名を有効化** を選択します。

    ![DyH3b9kOro2wf6xGcsUcD2DbnVo](/img/DyH3b9kOro2wf6xGcsUcD2DbnVo.png)

1. **サブネット** で、VPC と同時に作成された[プライベートサブネット](./configure-vpc#step-1-create-vpc-and-resources) を選択します。

    ![IdcebwU1Ao4QffxGwYTceh9AnVe](/img/IdcebwU1Ao4QffxGwYTceh9AnVe.png)

1. **セキュリティグループ** で、[上記で作成されたセキュリティグループ](./configure-vpc#step-2-create-a-security-group) を選択します。

1. **エンドポイントを作成** をクリックして、上記の設定を保存します。

1. **エンドポイント** リストの作成された VPC エンドポイント ID をクリックして、その詳細を表示します。

    ![KhRBbAbSAoU2X0xdnMtc0Gmunvf](/img/KhRBbAbSAoU2X0xdnMtc0Gmunvf.png)

1. **プライベートDNS名** の値が `*.aws-{region}.byoc.cloud.zilliz.com` に似ているかどうかを確認します。

    1. その場合、**エンドポイントID** をコピーして Zilliz Cloud コンソールに戻します。

        ![BUejbgXWJoXi5jxDmZnc7Ogdnah](/img/BUejbgXWJoXi5jxDmZnc7Ogdnah.png)

    1. そうでない場合は、設定を確認し、必要な変更を行ってください。

### 手順4: Zilliz Cloud に VPC 情報を送信\{#step-4-submit-vpc-information-to-zilliz-cloud}

AWS で上記の手順を完了したら、Zilliz Cloud に戻り、VPC ID、サブネット ID、セキュリティグループ ID、およびオプションの VPC エンドポイント ID を **ネットワーク設定** に入力し、**次へ** をクリックしてプロジェクト展開プロセス全体の概要を表示します。すべてが期待通りに構成されている場合は、**展開** をクリックしてプロセスを開始します。

![VDXYbAfS2oQ04YxcMs0cEETbn2c](/img/VDXYbAfS2oQ04YxcMs0cEETbn2c.png)
